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

function Test-Jdk25 {
    $candidates = @()
    $javac = Get-Command javac -ErrorAction SilentlyContinue
    if ($javac) {
        $candidates += $javac.Source
    }

    if ($env:JAVA_HOME) {
        $javaHomeJavac = Join-Path $env:JAVA_HOME "bin\javac.exe"
        if (Test-Path $javaHomeJavac) {
            $candidates += $javaHomeJavac
        }
    }

    foreach ($candidate in $candidates) {
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

    docker info 1>$null 2>$null
    return $LASTEXITCODE -eq 0
}

function Get-DockerAccessHelp {
    return @"
Docker foi encontrado, mas sem permissao para acessar o daemon.
No Linux, execute:
  sudo systemctl enable --now docker
  sudo usermod -aG docker $USER
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
    if (-not (Test-Path (Join-Path $backendPath "mvnw.cmd"))) {
        throw "Backend nao encontrado em $backendPath"
    }

    if (-not (Test-Path (Join-Path $frontendPath "package.json"))) {
        throw "Frontend nao encontrado em $frontendPath"
    }

    $dockerAvailable = Test-Docker

    if (-not $SkipDb) {
        if ($dockerAvailable -and -not (Test-DockerAccess)) {
            throw (Get-DockerAccessHelp)
        }

        if ($dockerAvailable) {
            Write-Step "Subindo MySQL com Docker Compose..."
            Push-Location $backendPath
            Invoke-CheckedCommand -Command { docker compose up -d mysql } -ErrorMessage "Falha ao subir o MySQL com Docker Compose."
            Pop-Location
        } else {
            Write-Host "[PsiHub] Docker nao encontrado. Vou assumir que o MySQL ja esta rodando em localhost:3306." -ForegroundColor Yellow
        }
    }

    $hasJdk25 = Test-Jdk25
    if ($UseLocalBackend -and -not $hasJdk25) {
        throw "JDK 25 nao encontrado. Instale/configure o JDK 25 ou rode sem -UseLocalBackend para usar Docker."
    }

    if ($hasJdk25 -or $UseLocalBackend) {
        $backendMode = "local"
        Write-Step "Iniciando backend local em http://localhost:8080"
        $jobs += Start-Job -Name "backend" -ScriptBlock {
            param($Path)
            Set-Location $Path
            .\mvnw.cmd spring-boot:run
        } -ArgumentList $backendPath
    } elseif ($dockerAvailable) {
        if (-not (Test-DockerAccess)) {
            throw (Get-DockerAccessHelp)
        }

        $backendMode = "docker"
        Write-Host "[PsiHub] JDK 25 nao encontrado. Backend sera executado via Docker." -ForegroundColor Yellow
        Write-Step "Iniciando backend Docker em http://localhost:8080"
        Push-Location $backendPath
        Invoke-CheckedCommand -Command { docker compose up -d --build backend } -ErrorMessage "Falha ao iniciar o backend Docker."
        Pop-Location

        $jobs += Start-Job -Name "backend" -ScriptBlock {
            param($Path)
            Set-Location $Path
            docker compose logs -f backend
        } -ArgumentList $backendPath
    } else {
        throw "JDK 25 nao encontrado e Docker indisponivel. Instale o JDK 25 ou habilite Docker."
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

    while ($true) {
        foreach ($job in $jobs) {
            Receive-Job -Job $job -ErrorAction SilentlyContinue | ForEach-Object {
                Write-Host "[$($job.Name)] $_"
            }

            if ($job.State -eq "Failed") {
                throw "O processo $($job.Name) falhou."
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
        docker compose stop backend | Out-Null
        Pop-Location
    }
}
