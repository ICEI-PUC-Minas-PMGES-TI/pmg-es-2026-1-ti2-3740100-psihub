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

function Test-Jdk21 {
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
        if ($versionOutput -match "javac\s+21(\.|$)") {
            return $true
        }
    }

    return $false
}

function Test-Docker {
    return [bool](Get-Command docker -ErrorAction SilentlyContinue)
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
        if ($dockerAvailable) {
            Write-Step "Subindo MySQL com Docker Compose..."
            Push-Location $backendPath
            docker compose up -d mysql
            Pop-Location
        } else {
            Write-Host "[PsiHub] Docker nao encontrado. Vou assumir que o MySQL ja esta rodando em localhost:3306." -ForegroundColor Yellow
        }
    }

    $hasJdk21 = Test-Jdk21
    if ($UseLocalBackend -and -not $hasJdk21) {
        throw "JDK 21 nao encontrado. Instale/configure o JDK 21 ou rode sem -UseLocalBackend para usar Docker."
    }

    if ($hasJdk21 -or $UseLocalBackend) {
        $backendMode = "local"
        Write-Step "Iniciando backend local em http://localhost:8080"
        $jobs += Start-Job -Name "backend" -ScriptBlock {
            param($Path)
            Set-Location $Path
            .\mvnw.cmd spring-boot:run
        } -ArgumentList $backendPath
    } elseif ($dockerAvailable) {
        $backendMode = "docker"
        Write-Host "[PsiHub] JDK 21 nao encontrado. Backend sera executado via Docker." -ForegroundColor Yellow
        Write-Step "Iniciando backend Docker em http://localhost:8080"
        Push-Location $backendPath
        docker compose up -d --build backend
        Pop-Location

        $jobs += Start-Job -Name "backend" -ScriptBlock {
            param($Path)
            Set-Location $Path
            docker compose logs -f backend
        } -ArgumentList $backendPath
    } else {
        throw "JDK 21 nao encontrado e Docker indisponivel. Instale o JDK 21 ou habilite Docker."
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
