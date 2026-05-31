param(
    [switch]$SkipDb,
    [switch]$UseLocalBackend
)

$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$backendPath = Join-Path $root "back"
$frontendPath = Join-Path $root "front"
$jobs = @()
$backendMode = "local"
$dockerMysqlStarted = $false

function Write-Step {
    param([string]$Message)
    Write-Host "[PsiHub] $Message" -ForegroundColor Cyan
}

function Stop-DevJobs {
    param([array]$Jobs)

    foreach ($job in $Jobs) {
        if ($job.State -eq "Running") {
            Stop-Job -Job $job -ErrorAction SilentlyContinue
        }
        Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
    }
}

# Retorna o wrapper Maven correto para o sistema operacional atual.
function Get-MvnWrapper {
    param([string]$Path)
    if ($IsWindows -or $env:OS -eq "Windows_NT") {
        return Join-Path $Path "mvnw.cmd"
    }
    return Join-Path $Path "mvnw"
}

function Test-Jdk25 {
    $candidates = @()

    $javac = Get-Command javac -ErrorAction SilentlyContinue
    if ($javac) {
        $candidates += $javac.Source
    }

    if ($env:JAVA_HOME) {
        # Testa com e sem extensao .exe para compatibilidade cross-platform.
        foreach ($suffix in @("bin/javac", "bin\javac", "bin/javac.exe", "bin\javac.exe")) {
            $p = Join-Path $env:JAVA_HOME $suffix
            if (Test-Path $p) {
                $candidates += $p
                break
            }
        }
    }

    foreach ($candidate in ($candidates | Select-Object -Unique)) {
        $versionOutput = (& $candidate -version 2>&1 | Out-String).Trim()
        if ($versionOutput -match "javac\s+25(\.|$)") {
            return $true
        }
    }

    return $false
}

function Test-Docker {
    return [bool](Get-Command docker -ErrorAction SilentlyContinue)
}

function Test-DockerAccess {
    if (-not (Test-Docker)) {
        return $false
    }

    $nativeErrorPrefVar = Get-Variable -Name PSNativeCommandUseErrorActionPreference -Scope Global -ErrorAction SilentlyContinue
    $previousNativeErrorPref = $null

    try {
        # No PowerShell 7+, stderr nativo pode virar ErrorRecord quando ErrorActionPreference e Stop.
        # Desativa apenas para esta sonda para evitar abortar o script.
        if ($nativeErrorPrefVar) {
            $previousNativeErrorPref = $global:PSNativeCommandUseErrorActionPreference
            $global:PSNativeCommandUseErrorActionPreference = $false
        }

        docker ps 1>$null 2>$null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    } finally {
        if ($nativeErrorPrefVar) {
            $global:PSNativeCommandUseErrorActionPreference = $previousNativeErrorPref
        }
    }
}

# Verifica se node e npm estao disponiveis no PATH.
function Test-Node {
    return ([bool](Get-Command node -ErrorAction SilentlyContinue)) -and
           ([bool](Get-Command npm  -ErrorAction SilentlyContinue))
}

# Verifica se uma porta TCP local esta livre usando .NET (cross-platform).
function Test-PortFree {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    } catch {
        return $false
    }
}

# Aguarda o container psihub-mysql reportar status "healthy" via Docker healthcheck.
function Wait-MySQLHealthy {
    param([int]$TimeoutSeconds = 90)

    Write-Step "Aguardando MySQL ficar pronto (limite: ${TimeoutSeconds}s)..."

    $nativeErrorPrefVar = Get-Variable -Name PSNativeCommandUseErrorActionPreference -Scope Global -ErrorAction SilentlyContinue
    $previousNativeErrorPref = $null

    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        try {
            if ($nativeErrorPrefVar) {
                $previousNativeErrorPref = $global:PSNativeCommandUseErrorActionPreference
                $global:PSNativeCommandUseErrorActionPreference = $false
            }
            $status = (docker inspect --format='{{.State.Health.Status}}' psihub-mysql 2>$null | Out-String).Trim()
        } finally {
            if ($nativeErrorPrefVar) {
                $global:PSNativeCommandUseErrorActionPreference = $previousNativeErrorPref
            }
        }

        if ($status -eq "healthy") {
            Write-Host "[PsiHub] MySQL pronto." -ForegroundColor Green
            return
        }

        Start-Sleep -Seconds 3
        $elapsed += 3
    }

    throw "MySQL nao ficou saudavel em $TimeoutSeconds segundos. Verifique com: docker logs psihub-mysql"
}

function Get-DockerAccessHelp {
    if ($IsWindows -or $env:OS -eq "Windows_NT") {
        return @"
Docker foi encontrado, mas sem acesso ao daemon.
No Windows, verifique:
    1) O Docker Desktop esta aberto e em execucao.
    2) O contexto padrao esta ativo:
         docker context use default
    3) Se necessario, reinicie o Docker Desktop e o terminal.
Como alternativa temporaria, execute o terminal como Administrador.
"@
    }

    $linuxUser = if ($env:USER) { $env:USER } else { "<seu-usuario>" }
    return @"
Docker foi encontrado, mas sem permissao para acessar o daemon.
No Linux, execute:
    sudo systemctl enable --now docker
    sudo usermod -aG docker $linuxUser
Depois, encerre e abra o terminal novamente (ou rode: newgrp docker).
Como alternativa temporaria, rode o script com sudo.
"@
}

function Invoke-CheckedCommand {
    param(
        [scriptblock]$Command,
        [string]$ErrorMessage
    )

    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw $ErrorMessage
    }
}

try {
    # ── Pre-flight ────────────────────────────────────────────────────────────

    if (-not (Test-Path (Join-Path $backendPath "mvnw.cmd"))) {
        throw "Backend nao encontrado em $backendPath"
    }

    if (-not (Test-Path (Join-Path $frontendPath "package.json"))) {
        throw "Frontend nao encontrado em $frontendPath"
    }

    if (-not (Test-Node)) {
        throw "Node.js/npm nao encontrado. Instale em https://nodejs.org e reabra o terminal."
    }

    if (-not (Test-PortFree -Port 8080)) {
        Write-Host "[PsiHub] AVISO: Porta 8080 ja esta em uso. O backend pode falhar ao iniciar." -ForegroundColor Yellow
    }
    if (-not (Test-PortFree -Port 5173)) {
        Write-Host "[PsiHub] AVISO: Porta 5173 ja esta em uso. O frontend pode falhar ao iniciar." -ForegroundColor Yellow
    }

    $dockerAvailable = Test-Docker

    # ── Banco de dados ────────────────────────────────────────────────────────

    if (-not $SkipDb) {
        if ($dockerAvailable -and -not (Test-DockerAccess)) {
            throw (Get-DockerAccessHelp)
        }

        if ($dockerAvailable) {
            Write-Step "Subindo MySQL com Docker Compose..."
            Push-Location $backendPath
            try {
                Invoke-CheckedCommand -Command { docker compose up -d mysql } -ErrorMessage "Falha ao subir o MySQL com Docker Compose."
            } finally {
                Pop-Location
            }
            $dockerMysqlStarted = $true
        } else {
            Write-Host "[PsiHub] Docker nao encontrado. Assumindo MySQL ja rodando em localhost:3306." -ForegroundColor Yellow
        }
    }

    # ── Backend ───────────────────────────────────────────────────────────────

    $hasJdk25 = Test-Jdk25
    $mvnWrapper = Get-MvnWrapper -Path $backendPath

    if ($UseLocalBackend -and -not $hasJdk25) {
        throw "JDK 25 nao encontrado. Instale/configure o JDK 25 ou rode sem -UseLocalBackend para usar Docker."
    }

    if ($hasJdk25 -or $UseLocalBackend) {
        $backendMode = "local"

        # Aguarda MySQL ficar saudavel antes de iniciar o backend localmente.
        if (-not $SkipDb -and $dockerMysqlStarted) {
            Wait-MySQLHealthy
        }

        Write-Step "Iniciando backend local em http://localhost:8080 (profile: dev)"
        $jobs += Start-Job -Name "backend" -ScriptBlock {
            param($Path, $MvnWrapper)
            Set-Location $Path
            # Ativa o profile 'dev': Flyway recria o schema se migrations foram editadas.
            $env:SPRING_PROFILES_ACTIVE = "dev"
            # Garante permissao de execucao no mvnw em sistemas Unix.
            if (-not ($IsWindows -or $env:OS -eq "Windows_NT")) {
                chmod +x $MvnWrapper
            }
            & $MvnWrapper spring-boot:run
        } -ArgumentList $backendPath, $mvnWrapper
    } elseif ($dockerAvailable) {
        if (-not (Test-DockerAccess)) {
            throw (Get-DockerAccessHelp)
        }

        # Valida .env antes de acionar o Docker Compose do backend (JWT_SECRET e obrigatorio).
        $envFile = Join-Path $backendPath ".env"
        if (-not (Test-Path $envFile)) {
            throw "Arquivo .env nao encontrado em $backendPath.`nCrie-o com pelo menos: JWT_SECRET=<segredo-com-32-ou-mais-caracteres>"
        }
        if (-not (Select-String -Path $envFile -Pattern "^\s*JWT_SECRET\s*=\s*\S" -Quiet)) {
            throw "JWT_SECRET nao esta definido no .env.`nAdicione: JWT_SECRET=<segredo-com-32-ou-mais-caracteres>"
        }

        $backendMode = "docker"
        Write-Host "[PsiHub] JDK 25 nao encontrado. Backend sera executado via Docker." -ForegroundColor Yellow
        Write-Step "Iniciando backend Docker em http://localhost:8080 (profile: dev)"
        Push-Location $backendPath
        try {
            # Passa o profile dev para o container via variavel de ambiente.
            $env:SPRING_PROFILES_ACTIVE = "dev"
            Invoke-CheckedCommand -Command { docker compose up -d --build backend } -ErrorMessage "Falha ao iniciar o backend Docker."
        } finally {
            Pop-Location
        }

        $jobs += Start-Job -Name "backend" -ScriptBlock {
            param($Path)
            Set-Location $Path
            docker compose logs -f backend
        } -ArgumentList $backendPath
    } else {
        throw "JDK 25 nao encontrado e Docker indisponivel. Instale o JDK 25 ou habilite Docker."
    }

    # ── Frontend ──────────────────────────────────────────────────────────────

    # Instala dependencias automaticamente em clones novos.
    if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
        Write-Step "node_modules ausente. Executando npm install..."
        Push-Location $frontendPath
        try {
            Invoke-CheckedCommand -Command { npm install } -ErrorMessage "Falha ao instalar dependencias do frontend."
        } finally {
            Pop-Location
        }
    }

    Write-Step "Iniciando frontend em http://localhost:5173"
    $jobs += Start-Job -Name "frontend" -ScriptBlock {
        param($Path)
        Set-Location $Path
        npm run dev
    } -ArgumentList $frontendPath

    Write-Host ""
    Write-Host "Aplicacao iniciando. Use Ctrl+C para encerrar backend e frontend." -ForegroundColor Green
    Write-Host ""

    # ── Loop principal ────────────────────────────────────────────────────────

    # [FIX 4] Rastreia quantas vezes o backend (Docker) falhou ao iniciar.
    # O job docker-compose-logs nunca muda de estado para "Failed" porque o
    # Compose reinicia o container — sem esse contador o loop seria infinito.
    $backendCrashCount = 0
    $maxBackendCrashes = 3

    while ($true) {
        foreach ($job in $jobs) {
            Receive-Job -Job $job -ErrorAction SilentlyContinue | ForEach-Object {
                $line = $_

                # [FIX 5] Destaca linhas de erro em vermelho para facilitar leitura.
                if ($line -match "\bERROR\b|Application run failed") {
                    Write-Host "[$($job.Name)] $line" -ForegroundColor Red

                    # [FIX 4 cont.] Detecta crash loop do backend Docker.
                    if ($job.Name -eq "backend" -and $line -match "Application run failed") {
                        $backendCrashCount++
                        if ($backendCrashCount -ge $maxBackendCrashes) {
                            throw "Backend falhou $backendCrashCount vezes. Corrija o erro acima e rode novamente."
                        }
                        Write-Host "[PsiHub] Backend falhou ($backendCrashCount/$maxBackendCrashes). Aguardando restart..." -ForegroundColor Yellow
                    }
                } elseif ($line -match "\bWARN\b") {
                    Write-Host "[$($job.Name)] $line" -ForegroundColor Yellow
                } else {
                    Write-Host "[$($job.Name)] $line"
                }
            }

            if ($job.State -eq "Failed") {
                $errLines = Receive-Job -Job $job -ErrorAction SilentlyContinue
                throw "O processo '$($job.Name)' falhou.`n$errLines"
            }
        }

        Start-Sleep -Milliseconds 500
    }
} finally {
    Write-Host ""
    Write-Step "Encerrando processos..."
    Stop-DevJobs -Jobs $jobs
    if ($backendMode -eq "docker") {
        Push-Location $backendPath
        try {
            docker compose stop backend | Out-Null
        } finally {
            Pop-Location
        }
    }
}
