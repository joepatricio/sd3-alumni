# High-Concurrency Load Test Coordinator
# Complies with .agents/python.md virtual environment enforcement

param(
    [switch]$DryRun,
    [string]$Tiers = "",
    [int]$Duration = 0,
    [string]$TargetUrl = "https://najealp.top",
    [switch]$SkipNode,
    [switch]$SkipLocust
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)
Set-Location $projectRoot

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  SD3 ALUMNI HIGH-CONCURRENCY STRESS TEST COORDINATOR" -ForegroundColor Cyan
Write-Host "  Target: $TargetUrl" -ForegroundColor Cyan
Write-Host "  Mode:   $(if ($DryRun) { 'DRY RUN' } else { 'FULL BENCHMARK' })" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# 1. Mandatory Python Virtual Environment Validation (.agents/python.md)
# ------------------------------------------------------------------------------
Write-Host "`n[*] Validating Python Virtual Environment..." -ForegroundColor Yellow
$activateScript = Join-Path $projectRoot "Scripts\Activate.ps1"
if (-not (Test-Path $activateScript)) {
    Write-Error "Activation script not found at $activateScript"
    exit 1
}

. $activateScript

if (-not $env:VIRTUAL_ENV) {
    Write-Error "VIRTUAL_ENV is not set after activation."
    exit 1
}

$pyCmd = (Get-Command python).Source
$expectedPy = Join-Path $projectRoot "Scripts\python.exe"
if ($pyCmd -ne $expectedPy) {
    Write-Error "Python does not resolve to virtual environment interpreter: $pyCmd vs $expectedPy"
    exit 1
}

$venvCheck = python -c "import sys; print(sys.prefix != sys.base_prefix)"
if ($venvCheck.Trim() -ne "True") {
    Write-Error "Python reports sys.prefix == sys.base_prefix (not in venv)."
    exit 1
}
Write-Host "[+] Virtual environment validated: $env:VIRTUAL_ENV" -ForegroundColor Green

# ------------------------------------------------------------------------------
# 2. Phase 1: Node.js High-Concurrency Benchmark
# ------------------------------------------------------------------------------
if (-not $SkipNode) {
    Write-Host "`n[*] PHASE 1: Running Node.js High-Concurrency Benchmark..." -ForegroundColor Yellow
    $nodeArgs = @("test/load/node_benchmark.js", "--url=$TargetUrl")
    if ($DryRun) {
        $nodeArgs += "--dry-run"
    }
    else {
        if ($Tiers) { $nodeArgs += "--tiers=$Tiers" }
        if ($Duration -gt 0) { $nodeArgs += "--duration=$Duration" }
    }

    node @nodeArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Node benchmark exited with code $LASTEXITCODE"
        exit $LASTEXITCODE
    }
}
else {
    Write-Host "`n[-] Skipping Node.js Benchmark (--SkipNode specified)." -ForegroundColor Gray
}

# ------------------------------------------------------------------------------
# 3. Phase 2: Locust Realistic User Persona Simulation
# ------------------------------------------------------------------------------
if (-not $SkipLocust) {
    Write-Host "`n[*] PHASE 2: Running Locust Real-World Persona Simulation..." -ForegroundColor Yellow
    $locustUsers = if ($DryRun) { 20 } else { 200 }
    $spawnRate = if ($DryRun) { 5 } else { 20 }
    $locustTime = if ($DryRun) { "15s" } else { "60s" }

    locust -f "test/load/locustfile.py" `
        --headless `
        -u $locustUsers `
        -r $spawnRate `
        --run-time $locustTime `
        --host $TargetUrl `
        --exit-code-on-error 0

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Locust exited with code $LASTEXITCODE"
        exit $LASTEXITCODE
    }
}
else {
    Write-Host "`n[-] Skipping Locust Simulation (--SkipLocust specified)." -ForegroundColor Gray
}

# ------------------------------------------------------------------------------
# 4. Phase 3: Compile Excel Sustainability Report
# ------------------------------------------------------------------------------
Write-Host "`n[*] PHASE 3: Compiling 5-Tab Excel Report (openpyxl)..." -ForegroundColor Yellow
python "test/load/generate_report.py"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Report generator exited with code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "`n================================================================" -ForegroundColor Green
Write-Host "  STRESS TEST COMPLETE!" -ForegroundColor Green
Write-Host "  Report saved to: docs/stress_test_report.xlsx" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green