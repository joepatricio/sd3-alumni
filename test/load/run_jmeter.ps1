<#
.SYNOPSIS
    Apache JMeter Load & Full API Endpoint Benchmark Coordinator for SD3 Alumni.

.DESCRIPTION
    Executes test/load/benchmark.jmx in non-GUI mode against the target server,
    parses the resulting JTL metrics (verifying 0 401 Unauthorized responses and
    full endpoint coverage), and exports test/load/results/jmeter_baseline.json.

.EXAMPLE
    .\test\load\run_jmeter.ps1 -DryRun
    .\test\load\run_jmeter.ps1 -Tiers 200,500,1000,1500,2000 -Duration 60 -HtmlReport
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [int[]]$Tiers,
    [int]$Duration = 0,
    [int]$RampUp = 0,
    [string]$TargetUrl = "",
    [string]$DefaultPassword = "123456",
    [switch]$SkipExternalApis,
    [switch]$IncludeWritesInLoad,
    [switch]$HtmlReport,
    [string]$JMeterPath = ""
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..\..")
$ConfigPath = Join-Path $ScriptDir "config.json"
$JmxPath = Join-Path $ScriptDir "benchmark.jmx"
$FixturePath = Join-Path $ScriptDir "fixture.png"
$ResultsDir = Join-Path $ScriptDir "results"

if (-not (Test-Path $JmxPath)) {
    throw "Missing JMX test plan at $JmxPath"
}
if (-not (Test-Path $ResultsDir)) {
    New-Item -ItemType Directory -Path $ResultsDir -Force | Out-Null
}

function Resolve-JMeterExecutable {
    param([string]$ExplicitPath)

    if ($ExplicitPath) {
        if (Test-Path $ExplicitPath) { return (Resolve-Path $ExplicitPath).Path }
        throw "Specified -JMeterPath not found: $ExplicitPath"
    }

    $cmd = Get-Command "jmeter.bat" -ErrorAction SilentlyContinue
    if (-not $cmd) { $cmd = Get-Command "jmeter" -ErrorAction SilentlyContinue }
    if ($cmd) { return $cmd.Source }

    if ($env:JMETER_HOME) {
        $cand = Join-Path $env:JMETER_HOME "bin\jmeter.bat"
        if (Test-Path $cand) { return $cand }
    }

    $searchRoots = @(
        (Join-Path $env:USERPROFILE "Downloads"),
        "C:\apache-jmeter",
        "C:\Program Files",
        "C:\tools"
    )
    foreach ($root in $searchRoots) {
        if (Test-Path $root) {
            $found = Get-ChildItem -Path $root -Directory -Filter "apache-jmeter*" -ErrorAction SilentlyContinue |
                Sort-Object Name -Descending |
                ForEach-Object { Join-Path $_.FullName "bin\jmeter.bat" } |
                Where-Object { Test-Path $_ } |
                Select-Object -First 1
            if ($found) { return $found }
        }
    }

    throw "Apache JMeter executable (jmeter.bat) not found. Install JMeter or pass -JMeterPath / set JMETER_HOME."
}

$JMeterExe = Resolve-JMeterExecutable -ExplicitPath $JMeterPath
Write-Host "[*] Using JMeter: $JMeterExe" -ForegroundColor Cyan

# Load config.json defaults
$Config = $null
if (Test-Path $ConfigPath) {
    $Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
}

if (-not $TargetUrl) {
    $TargetUrl = if ($Config -and $Config.baseUrl) { $Config.baseUrl } else { "https://najealp.top" }
}
$Uri = [System.Uri]$TargetUrl
$Proto = $Uri.Scheme
$TargetHost = $Uri.Host
$TargetPort = if ($Uri.IsDefaultPort) { "" } else { [string]$Uri.Port }

if (-not $Tiers -or $Tiers.Count -eq 0) {
    if ($DryRun) {
        $Tiers = @(10, 25)
    } elseif ($Config -and $Config.steppedTiers) {
        $Tiers = @($Config.steppedTiers)
    } else {
        $Tiers = @(200, 500, 1000, 1500, 2000)
    }
}

$EffectiveDuration = if ($Duration -gt 0) { $Duration } elseif ($DryRun) { 5 } elseif ($Config -and $Config.durationSeconds) { [int]$Config.durationSeconds } else { 60 }
$EffectiveRamp = if ($RampUp -gt 0) { $RampUp } elseif ($DryRun) { 2 } else { 10 }

# Pad tiers to 5 thread groups (0 threads skips a tier group)
$TierValues = @(0, 0, 0, 0, 0)
for ($i = 0; $i -lt [Math]::Min($Tiers.Count, 5); $i++) {
    $TierValues[$i] = [int]$Tiers[$i]
}

$JtlPath = Join-Path $ResultsDir "jmeter_results.jtl"
$LogPath = Join-Path $ResultsDir "jmeter.log"
$SummaryJsonPath = Join-Path $ResultsDir "jmeter_baseline.json"
$HtmlReportDir = Join-Path $ResultsDir "html_report"

Remove-Item -ErrorAction SilentlyContinue $JtlPath, $LogPath

$ExtApiVal = if ($SkipExternalApis) { "false" } else { "true" }
$WritesInLoadVal = if ($IncludeWritesInLoad) { "true" } else { "false" }

Write-Host "[*] Target        : $TargetUrl" -ForegroundColor Gray
Write-Host "[*] Tiers (VUs)   : $($TierValues -join ', ')" -ForegroundColor Gray
Write-Host "[*] Tier Duration : ${EffectiveDuration}s (RampUp=${EffectiveRamp}s)" -ForegroundColor Gray
Write-Host "[*] External APIs : $ExtApiVal | WritesInLoad: $WritesInLoadVal" -ForegroundColor Gray

$JMeterArgs = @(
    "-n",
    "-t", $JmxPath,
    "-l", $JtlPath,
    "-j", $LogPath,
    "-Jprotocol=$Proto",
    "-Jhost=$TargetHost",
    "-Jport=$TargetPort",
    "-JconfigPath=$ConfigPath",
    "-JfixturePath=$FixturePath",
    "-JdefaultPassword=$DefaultPassword",
    "-JcoverageThreads=1",
    "-Jtier1Threads=$($TierValues[0])",
    "-Jtier2Threads=$($TierValues[1])",
    "-Jtier3Threads=$($TierValues[2])",
    "-Jtier4Threads=$($TierValues[3])",
    "-Jtier5Threads=$($TierValues[4])",
    "-JtierDuration=$EffectiveDuration",
    "-JtierRampUp=$EffectiveRamp",
    "-JincludeExternalApis=$ExtApiVal",
    "-JincludeWritesInLoad=$WritesInLoadVal"
)

if ($HtmlReport) {
    if (Test-Path $HtmlReportDir) {
        Remove-Item -Recurse -Force $HtmlReportDir
    }
    $JMeterArgs += @("-e", "-o", $HtmlReportDir)
}

Write-Host "`n[*] Running Apache JMeter test suite..." -ForegroundColor Yellow
& $JMeterExe @JMeterArgs
$JMeterExit = $LASTEXITCODE

if ($JMeterExit -ne 0) {
    Write-Warning "JMeter exited with non-zero code $JMeterExit"
}

if (-not (Test-Path $JtlPath)) {
    throw "Expected JTL output not found at $JtlPath"
}

function Get-Percentile {
    param([double[]]$Sorted, [double]$Pct)
    if (-not $Sorted -or $Sorted.Count -eq 0) { return 0 }
    $idx = [int][Math]::Ceiling(($Pct / 100.0) * $Sorted.Count) - 1
    if ($idx -lt 0) { $idx = 0 }
    if ($idx -ge $Sorted.Count) { $idx = $Sorted.Count - 1 }
    return [Math]::Round($Sorted[$idx], 2)
}

$Rows = @(Import-Csv -Path $JtlPath)
if ($Rows.Count -eq 0) {
    throw "JTL file $JtlPath contains 0 samples."
}

$Total401 = 0
$Total403 = 0
$Total5xx = 0
$TotalFailed = 0

$RouteGroups = @{}
$TierGroups = @{}

foreach ($Row in $Rows) {
    $Code = $Row.responseCode
    $Ok = ($Row.success -eq "true")
    $Label = $Row.label
    $Thread = $Row.threadName
    $Elapsed = [double]$Row.elapsed
    $Bytes = [double]$Row.bytes

    if ($Code -eq "401") { $Total401++ }
    if ($Code -eq "403") { $Total403++ }
    if ($Code -match "^5\d\d$") { $Total5xx++ }
    if (-not $Ok) { $TotalFailed++ }

    # Categorize into Setup / Coverage / Tier
    $Bucket = if ($Thread -like "setUp*") {
        "Setup"
    } elseif ($Thread -like "Full Endpoint*") {
        "Coverage"
    } elseif ($Thread -match "^Stepped Tier (\d+)") {
        "Tier_$($Matches[1])"
    } else {
        "Other"
    }

    if (-not $TierGroups.ContainsKey($Bucket)) {
        $TierGroups[$Bucket] = [System.Collections.ArrayList]::new()
    }
    [void]$TierGroups[$Bucket].Add($Row)

    if (-not $RouteGroups.ContainsKey($Label)) {
        $RouteGroups[$Label] = [System.Collections.ArrayList]::new()
    }
    [void]$RouteGroups[$Label].Add($Row)
}

$RouteSummary = [ordered]@{}
foreach ($Label in ($RouteGroups.Keys | Sort-Object)) {
    $Items = $RouteGroups[$Label]
    $Times = @($Items | ForEach-Object { [double]$_.elapsed } | Sort-Object)
    $StatusCounts = [ordered]@{}
    $ErrCount = 0
    $TotalBytes = 0.0
    foreach ($It in $Items) {
        $C = $It.responseCode
        if (-not $StatusCounts.Contains($C)) { $StatusCounts[$C] = 0 }
        $StatusCounts[$C]++
        if ($It.success -ne "true") { $ErrCount++ }
        $TotalBytes += [double]$It.bytes
    }
    $Avg = if ($Times.Count -gt 0) { [Math]::Round((($Times | Measure-Object -Average).Average), 2) } else { 0 }
    $RouteSummary[$Label] = [ordered]@{
        requests    = $Items.Count
        errors      = $ErrCount
        errorRate   = [Math]::Round(($ErrCount / [Math]::Max(1, $Items.Count)) * 100.0, 2)
        statusCodes = $StatusCounts
        minMs       = $Times[0]
        avgMs       = $Avg
        p50Ms       = Get-Percentile -Sorted $Times -Pct 50
        p95Ms       = Get-Percentile -Sorted $Times -Pct 95
        p99Ms       = Get-Percentile -Sorted $Times -Pct 99
        maxMs       = $Times[$Times.Count - 1]
        totalBytes  = [int64]$TotalBytes
    }
}

$TierSummary = [ordered]@{}
foreach ($Bucket in ($TierGroups.Keys | Sort-Object)) {
    $Items = $TierGroups[$Bucket]
    $Times = @($Items | ForEach-Object { [double]$_.elapsed } | Sort-Object)
    $ErrCount = @($Items | Where-Object { $_.success -ne "true" }).Count
    $Code401 = @($Items | Where-Object { $_.responseCode -eq "401" }).Count
    $MinTs = ($Items | ForEach-Object { [double]$_.timeStamp } | Measure-Object -Minimum).Minimum
    $MaxTs = ($Items | ForEach-Object { [double]$_.timeStamp + [double]$_.elapsed } | Measure-Object -Maximum).Maximum
    $SpanSec = [Math]::Max(0.1, ($MaxTs - $MinTs) / 1000.0)
    $Avg = if ($Times.Count -gt 0) { [Math]::Round((($Times | Measure-Object -Average).Average), 2) } else { 0 }

    $TierSummary[$Bucket] = [ordered]@{
        requests  = $Items.Count
        errors    = $ErrCount
        count401  = $Code401
        errorRate = [Math]::Round(($ErrCount / [Math]::Max(1, $Items.Count)) * 100.0, 2)
        rps       = [Math]::Round($Items.Count / $SpanSec, 2)
        avgMs     = $Avg
        p50Ms     = Get-Percentile -Sorted $Times -Pct 50
        p95Ms     = Get-Percentile -Sorted $Times -Pct 95
        p99Ms     = Get-Percentile -Sorted $Times -Pct 99
        maxMs     = $Times[$Times.Count - 1]
    }
}

$SummaryPayload = [ordered]@{
    timestamp        = (Get-Date).ToString("o")
    engine           = "apache-jmeter-5.6.3"
    targetUrl        = $TargetUrl
    dryRun           = [bool]$DryRun
    tiers            = $TierValues
    durationSeconds  = $EffectiveDuration
    totalSamples     = $Rows.Count
    totalFailed      = $TotalFailed
    total401         = $Total401
    total403         = $Total403
    total5xx         = $Total5xx
    tierBreakdown    = $TierSummary
    routeBreakdown   = $RouteSummary
}

$SummaryPayload | ConvertTo-Json -Depth 8 | Set-Content -Path $SummaryJsonPath -Encoding UTF8

Write-Host "`n================ JMETER SUITE SUMMARY ================" -ForegroundColor Cyan
Write-Host ("Total Samples  : {0}" -f $Rows.Count)
Write-Host ("Total Failures : {0} (401={1}, 403={2}, 5xx={3})" -f $TotalFailed, $Total401, $Total403, $Total5xx) -ForegroundColor $(if ($TotalFailed -eq 0) { "Green" } else { "Red" })
Write-Host "`n--- Tier Breakdown ---" -ForegroundColor Yellow
foreach ($Key in $TierSummary.Keys) {
    $T = $TierSummary[$Key]
    Write-Host ("{0,-12} | Reqs: {1,6} | Errs: {2,4} (401={3}) | RPS: {4,7} | p50: {5,6}ms | p95: {6,6}ms | p99: {7,6}ms" -f `
        $Key, $T.requests, $T.errors, $T.count401, $T.rps, $T.p50Ms, $T.p95Ms, $T.p99Ms)
}
Write-Host "`n[*] Exported JSON summary: $SummaryJsonPath" -ForegroundColor Green
if ($HtmlReport) {
    Write-Host "[*] Exported HTML report : $HtmlReportDir\index.html" -ForegroundColor Green
}

if ($Total401 -gt 0) {
    Write-Error "FAIL: Observed $Total401 HTTP 401 Unauthorized response(s)! Auth/token verification did not protect all requests."
    exit 2
}
if ($TotalFailed -gt 0 -or $JMeterExit -ne 0) {
    Write-Warning "Completed with $TotalFailed failed sampler(s). Inspect $SummaryJsonPath and $JtlPath for details."
    exit 1
}

exit 0

