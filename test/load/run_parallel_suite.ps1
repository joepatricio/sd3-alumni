<#
.SYNOPSIS
    Unified Two-Phase Parallel Load & Endpoint Coverage Orchestrator (JMeter + Locust).

.DESCRIPTION
    Phase 1 (Fail-Fast Gate):
      Runs JMeter Setup + Full Endpoint Coverage & CRUD Matrix (0 load threads),
      verifying 0 failed requests and 0 HTTP 401 Unauthorized responses.

    Phase 2 (Parallel Execution):
      Runs JMeter Stepped Load (coverage disabled, randomized think-time, 1s HTML
      report granularity) concurrently in parallel with Locust Persona simulations.

    Phase 3 (Reporting):
      Generates docs/stress_test_report.xlsx via openpyxl and exports a multi-tab
      PDF (test/load/results/load_test_report.pdf) where each non-empty HTML tab
      occupies 1 full page with all collapsible graphs expanded.

.EXAMPLE
    .\test\load\run_parallel_suite.ps1 -DryRun
    .\test\load\run_parallel_suite.ps1 -Tiers 100,250,500,750,1000 -Duration 30 -LocustUsers 100
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [int[]]$Tiers,
    [int]$Duration = 0,
    [int]$RampUp = 0,
    [int]$LocustUsers = 0,
    [int]$LocustSpawnRate = 0,
    [int]$LocustDuration = 0,
    [int]$ThinkMinMs = 100,
    [int]$ThinkRangeMs = 400,
    [int]$GranularityMs = 1000,
    [string]$TargetUrl = "",
    [string]$DefaultPassword = "123456",
    [switch]$SkipExternalApis,
    [switch]$IncludeWritesInLoad,
    [switch]$SkipPdf,
    [string]$JMeterPath = ""
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path (Join-Path $ScriptDir "..\..")).Path
$ResultsDir = Join-Path $ScriptDir "results"
$ConfigPath = Join-Path $ScriptDir "config.json"

$RunJMeterScript = Join-Path $ScriptDir "run_jmeter.ps1"
$LocustFile = Join-Path $ScriptDir "locustfile.py"
$GenReportScript = Join-Path $ScriptDir "generate_report.py"
$ExportPdfScript = Join-Path $ScriptDir "export_reports_pdf.mjs"

foreach ($req in @($RunJMeterScript, $LocustFile, $GenReportScript)) {
    if (-not (Test-Path $req)) {
        throw "Required suite file missing: $req"
    }
}
if (-not $SkipPdf -and -not (Test-Path $ExportPdfScript)) {
    throw "Required PDF exporter missing: $ExportPdfScript"
}
if (-not (Test-Path $ResultsDir)) {
    New-Item -ItemType Directory -Path $ResultsDir -Force | Out-Null
}

# ==============================================================================
# Mandatory Python Virtual Environment Activation & Validation (.agents/python.md)
# ==============================================================================
$ActivateScript = Join-Path $RepoRoot "Scripts\Activate.ps1"
$ExpectedVenvPython = (Resolve-Path (Join-Path $RepoRoot "Scripts\python.exe")).Path

if (-not (Test-Path $ActivateScript)) {
    throw "Virtual environment activation script not found at $ActivateScript. Stopping without fallback."
}

Push-Location $RepoRoot
try {
    & $ActivateScript
    if (-not $env:VIRTUAL_ENV) {
        throw "Validation failed: `$env:VIRTUAL_ENV is not set after activating $ActivateScript."
    }
    $ResolvedVenv = (Resolve-Path $env:VIRTUAL_ENV).Path
    if ($ResolvedVenv -ne $RepoRoot) {
        throw "Validation failed: `$env:VIRTUAL_ENV ($ResolvedVenv) does not match expected venv root ($RepoRoot)."
    }
    $PythonCmd = Get-Command python -ErrorAction Stop
    $ResolvedPython = (Resolve-Path $PythonCmd.Source).Path
    if ($ResolvedPython -ne $ExpectedVenvPython) {
        throw "Validation failed: Get-Command python ($ResolvedPython) does not resolve to $ExpectedVenvPython."
    }
    & $ResolvedPython -c "import sys; assert sys.prefix != sys.base_prefix, f'prefix==base_prefix ({sys.prefix})'"
    if ($LASTEXITCODE -ne 0) {
        throw "Validation failed: Python reported sys.prefix == sys.base_prefix."
    }
    Write-Host "[+] Validated Python venv: $ResolvedPython" -ForegroundColor Green
}
catch {
    Pop-Location
    throw
}

try {
    # Load config.json defaults
    $Config = $null
    if (Test-Path $ConfigPath) {
        $Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
    }

    if (-not $TargetUrl) {
        $TargetUrl = if ($Config -and $Config.baseUrl) { [string]$Config.baseUrl } else { "https://najealp.top" }
    }

    if (-not $Tiers -or $Tiers.Count -eq 0) {
        if ($DryRun) {
            $Tiers = @(10, 25)
        }
        elseif ($Config -and $Config.steppedTiers) {
            $Tiers = @($Config.steppedTiers | ForEach-Object { [int]$_ })
        }
        else {
            $Tiers = @(100, 250, 500, 750, 1000)
        }
    }

    $EffectiveDuration = if ($Duration -gt 0) {
        $Duration
    }
    elseif ($DryRun) {
        if ($Config -and $Config.dryRunTierDurationSec) { [int]$Config.dryRunTierDurationSec } else { 10 }
    }
    elseif ($Config -and $Config.defaultTierDurationSec) {
        [int]$Config.defaultTierDurationSec
    }
    else {
        30
    }

    $EffectiveRamp = if ($RampUp -gt 0) { $RampUp } elseif ($DryRun) { 2 } else { 10 }
    $EffectiveLocustUsers = if ($LocustUsers -gt 0) { $LocustUsers } elseif ($DryRun) { 20 } else { 100 }
    $EffectiveLocustSpawn = if ($LocustSpawnRate -gt 0) { $LocustSpawnRate } elseif ($DryRun) { 5 } else { 10 }

    $ActiveTierCount = @($Tiers | Where-Object { $_ -gt 0 }).Count
    if ($ActiveTierCount -lt 1) {
        throw "At least one stepped tier must have > 0 VUs."
    }
    $EffectiveLocustDuration = if ($LocustDuration -gt 0) {
        $LocustDuration
    }
    else {
        [Math]::Max(15, ($ActiveTierCount * $EffectiveDuration) + 4)
    }

    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host "  SD3 ALUMNI PARALLEL LOAD & ENDPOINT COVERAGE SUITE" -ForegroundColor Cyan
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host ("  Target          : {0}" -f $TargetUrl) -ForegroundColor White
    Write-Host ("  Mode            : {0}" -f $(if ($DryRun) { "DryRun" } else { "Full" })) -ForegroundColor White
    Write-Host ("  JMeter Tiers    : [{0}] x {1}s (Ramp={2}s, Think={3}..{4}ms)" -f ($Tiers -join ", "), $EffectiveDuration, $EffectiveRamp, $ThinkMinMs, ($ThinkMinMs + $ThinkRangeMs)) -ForegroundColor White
    Write-Host ("  Locust Personas : {0} VUs (spawn {1}/s) x {2}s" -f $EffectiveLocustUsers, $EffectiveLocustSpawn, $EffectiveLocustDuration) -ForegroundColor White
    Write-Host "=================================================================`n" -ForegroundColor Cyan

    # Clean stale telemetry/report files before running
    $CovJtlPath = Join-Path $ResultsDir "jmeter_coverage.jtl"
    $CovLogPath = Join-Path $ResultsDir "jmeter_coverage.log"
    $CovBaselinePath = Join-Path $ResultsDir "jmeter_coverage_baseline.json"
    $LoadBaselinePath = Join-Path $ResultsDir "jmeter_baseline.json"
    $LocustMetricsPath = Join-Path $ResultsDir "locust_metrics.json"
    $LocustHtmlPath = Join-Path $ResultsDir "locust_report.html"
    $LocustOutLog = Join-Path $ResultsDir "locust_phase2.stdout.log"
    $LocustErrLog = Join-Path $ResultsDir "locust_phase2.stderr.log"
    $LocustInFile = Join-Path $ResultsDir "locust_phase2.stdin.tmp"
    $PdfOutPath = Join-Path $ResultsDir "load_test_report.pdf"
    $HtmlReportDir = Join-Path $ResultsDir "html_report"

    Remove-Item -ErrorAction SilentlyContinue `
        $CovJtlPath, $CovLogPath, $CovBaselinePath, $LoadBaselinePath, `
        $LocustMetricsPath, $LocustHtmlPath, $LocustOutLog, $LocustErrLog, $LocustInFile, $PdfOutPath
    if (Test-Path $HtmlReportDir) {
        Remove-Item -Recurse -Force $HtmlReportDir
    }

    # ==========================================================================
    # PHASE 1: JMeter Full Endpoint Coverage & Auth Gate (Fail-Fast)
    # ==========================================================================
    Write-Host "[PHASE 1] Executing JMeter Setup + Full Endpoint Coverage Gate..." -ForegroundColor Yellow

    $Phase1Args = @{
        CoverageOnly    = $true
        Tiers           = @(0)
        Duration        = 5
        RampUp          = 1
        TargetUrl       = $TargetUrl
        DefaultPassword = $DefaultPassword
        JtlOutPath      = $CovJtlPath
        LogOutPath      = $CovLogPath
        BaselineOutPath = $CovBaselinePath
    }
    if ($SkipExternalApis) { $Phase1Args["SkipExternalApis"] = $true }
    if ($JMeterPath) { $Phase1Args["JMeterPath"] = $JMeterPath }

    & $RunJMeterScript @Phase1Args
    $Phase1Exit = $LASTEXITCODE

    if (-not (Test-Path $CovBaselinePath)) {
        throw "Phase 1 Coverage Gate failed to produce $CovBaselinePath"
    }
    $CovJson = Get-Content $CovBaselinePath -Raw | ConvertFrom-Json

    if ($Phase1Exit -ne 0 -or $CovJson.total401 -gt 0 -or $CovJson.totalFailed -gt 0 -or $CovJson.totalSamples -eq 0) {
        Write-Host "`n[!] PHASE 1 COVERAGE GATE FAILED — Aborting before Phase 2 Load!" -ForegroundColor Red
        if ($CovJson.routeBreakdown) {
            foreach ($prop in $CovJson.routeBreakdown.PSObject.Properties) {
                if ($prop.Value.errors -gt 0) {
                    Write-Host ("    FAIL Route: {0} (errors={1}, codes={2})" -f $prop.Name, $prop.Value.errors, ($prop.Value.statusCodes | ConvertTo-Json -Compress)) -ForegroundColor Red
                }
            }
        }
        exit $(if ($CovJson.total401 -gt 0) { 2 } else { 1 })
    }

    Write-Host ("[+] Phase 1 Coverage Gate PASSED: {0} samples, 0 failures, 0 HTTP 401." -f $CovJson.totalSamples) -ForegroundColor Green

    # ==========================================================================
    # PHASE 2: Parallel JMeter Stepped Load + Locust Personas
    # ==========================================================================
    Write-Host "`n[PHASE 2] Launching JMeter Stepped Load + Locust Personas in PARALLEL..." -ForegroundColor Yellow

    $LocustCliArgs = @(
        "-m", "locust",
        "-f", $LocustFile,
        "--headless",
        "-u", "$EffectiveLocustUsers",
        "-r", "$EffectiveLocustSpawn",
        "-t", "${EffectiveLocustDuration}s",
        "--host", $TargetUrl,
        "--html", $LocustHtmlPath,
        "--exit-code-on-error", "0"
    )

    [System.IO.File]::WriteAllBytes($LocustInFile, [byte[]]@())

    $LocustProc = Start-Process `
        -FilePath $ResolvedPython `
        -ArgumentList $LocustCliArgs `
        -WorkingDirectory $RepoRoot `
        -PassThru `
        -NoNewWindow `
        -RedirectStandardInput $LocustInFile `
        -RedirectStandardOutput $LocustOutLog `
        -RedirectStandardError $LocustErrLog

    Write-Host ("[+] Started Locust (PID={0}) -> logs: {1}" -f $LocustProc.Id, $LocustOutLog) -ForegroundColor Cyan

    $Phase2JMeterArgs = @{
        Tiers           = $Tiers
        Duration        = $EffectiveDuration
        RampUp          = $EffectiveRamp
        TargetUrl       = $TargetUrl
        DefaultPassword = $DefaultPassword
        SkipCoverage    = $true
        ThinkMinMs      = $ThinkMinMs
        ThinkRangeMs    = $ThinkRangeMs
        GranularityMs   = $GranularityMs
        HtmlReport      = $true
        BaselineOutPath = $LoadBaselinePath
    }
    if ($DryRun) { $Phase2JMeterArgs["DryRun"] = $true }
    if ($SkipExternalApis) { $Phase2JMeterArgs["SkipExternalApis"] = $true }
    if ($IncludeWritesInLoad) { $Phase2JMeterArgs["IncludeWritesInLoad"] = $true }
    if ($JMeterPath) { $Phase2JMeterArgs["JMeterPath"] = $JMeterPath }

    $JMeterExit = 0
    try {
        & $RunJMeterScript @Phase2JMeterArgs
        $JMeterExit = $LASTEXITCODE
    }
    finally {
        if ($LocustProc -and -not $LocustProc.HasExited) {
            Write-Host "`n[*] Waiting for parallel Locust simulation (PID=$($LocustProc.Id)) to complete & cleanup..." -ForegroundColor Cyan
            $LocustProc.WaitForExit()
        }
    }

    $LocustExit = if ($LocustProc) { $LocustProc.ExitCode } else { 1 }
    Write-Host "[*] Locust exited with code $LocustExit" -ForegroundColor Gray

    if (Test-Path $LocustOutLog) {
        Write-Host "`n--- Locust Tail Output ---" -ForegroundColor DarkCyan
        Get-Content $LocustOutLog -Tail 30 | ForEach-Object { Write-Host $_ }
    }
    if ((Test-Path $LocustErrLog) -and ((Get-Item $LocustErrLog).Length -gt 0)) {
        Write-Host "`n--- Locust Stderr Tail ---" -ForegroundColor DarkYellow
        Get-Content $LocustErrLog -Tail 20 | ForEach-Object { Write-Host $_ }
    }

    if (-not (Test-Path $LoadBaselinePath)) {
        throw "Phase 2 JMeter failed to produce $LoadBaselinePath"
    }
    $LoadJson = Get-Content $LoadBaselinePath -Raw | ConvertFrom-Json

    if (-not (Test-Path $LocustMetricsPath)) {
        throw "Phase 2 Locust failed to produce $LocustMetricsPath (exit=$LocustExit)"
    }
    $LocustJson = Get-Content $LocustMetricsPath -Raw | ConvertFrom-Json

    $Locust401 = if ($LocustJson.summary) { [int]$LocustJson.summary.count401 } else { 0 }
    $LocustErrs = if ($LocustJson.summary) { [int]$LocustJson.summary.totalErrors } else { 0 }
    $LocustCalls = if ($LocustJson.summary) { [int]$LocustJson.summary.totalCalls } else { 0 }
    $LocustExcs = if ($LocustJson.summary -and $null -ne $LocustJson.summary.exceptionsCount) { [int]$LocustJson.summary.exceptionsCount } else { 0 }
    $LocustSetupErr = if ($LocustJson.summary -and $LocustJson.summary.setupError) { [string]$LocustJson.summary.setupError } else { "" }

    Remove-Item -ErrorAction SilentlyContinue $LocustInFile

    if ($LocustSetupErr) {
        throw "FAIL: Locust setup failed in Phase 2: $LocustSetupErr"
    }

    if ($LoadJson.total401 -gt 0 -or $Locust401 -gt 0) {
        throw "FAIL: HTTP 401 Unauthorized observed in Phase 2! JMeter401=$($LoadJson.total401), Locust401=$Locust401"
    }

    # ==========================================================================
    # PHASE 3: Generate Excel Report + Combined Multi-Tab PDF
    # ==========================================================================
    Write-Host "`n[PHASE 3] Generating Excel & Combined PDF Reports..." -ForegroundColor Yellow

    & $ResolvedPython $GenReportScript --source jmeter --baseline $LoadBaselinePath --locust $LocustMetricsPath
    if ($LASTEXITCODE -ne 0) {
        throw "Excel report generation failed with exit code $LASTEXITCODE"
    }

    if (-not $SkipPdf) {
        node $ExportPdfScript --results-dir $ResultsDir --out $PdfOutPath
        if ($LASTEXITCODE -ne 0) {
            throw "PDF export failed with exit code $LASTEXITCODE"
        }
    }

    Write-Host "`n================ PARALLEL SUITE COMPLETE ================" -ForegroundColor Green
    Write-Host ("Phase 1 Coverage : {0} samples | Errs: {1} | 401: {2}" -f $CovJson.totalSamples, $CovJson.totalFailed, $CovJson.total401)
    Write-Host ("Phase 2 JMeter   : {0} total ({1} load) | Errs: {2} | 401: {3}" -f $LoadJson.totalSamples, $LoadJson.loadSamples, $LoadJson.totalFailed, $LoadJson.total401)
    Write-Host ("Phase 2 Locust   : {0} calls | Errs: {1} (5xx: {2}, Exc: {3}) | 401: {4}" -f $LocustCalls, $LocustErrs, $LocustJson.summary.count5xx, $LocustExcs, $Locust401)
    Write-Host ("Excel Report     : {0}" -f (Join-Path $RepoRoot "docs\stress_test_report.xlsx"))
    Write-Host ("JMeter HTML      : {0}" -f (Join-Path $HtmlReportDir "index.html"))
    Write-Host ("Locust HTML      : {0}" -f $LocustHtmlPath)
    if (-not $SkipPdf) {
        Write-Host ("Combined PDF     : {0}" -f $PdfOutPath)
    }

    if ($JMeterExit -ne 0 -or $LoadJson.totalFailed -gt 0 -or $LocustExit -ne 0 -or $LocustErrs -gt 0 -or $LocustExcs -gt 0) {
        Write-Warning "Suite finished with non-zero failures/exceptions (JMeterFailed=$($LoadJson.totalFailed), LocustErrors=$LocustErrs, LocustExceptions=$LocustExcs). Review reports."
        exit 1
    }
    exit 0
}
finally {
    Pop-Location
}

