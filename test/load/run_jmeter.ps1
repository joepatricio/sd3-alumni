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
    .\test\load\run_jmeter.ps1 -Tiers 100,250,500,750,1000 -SkipCoverage -AllReports
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
    [switch]$CoverageOnly,
    [switch]$SkipCoverage,
    [int]$ThinkMinMs = -1,
    [int]$ThinkRangeMs = -1,
    [int]$GranularityMs = 1000,
    [switch]$HtmlReport,
    [switch]$ExcelReport,
    [switch]$PdfReport,
    [switch]$AllReports,
    [string]$JMeterPath = "",
    [string]$JtlOutPath = "",
    [string]$LogOutPath = "",
    [string]$BaselineOutPath = "",
    [string]$HtmlReportOutDir = "",
    [string]$ExcelOutPath = "",
    [string]$PdfOutPath = ""
)

$ErrorActionPreference = "Stop"

if ($AllReports) {
    $HtmlReport = $true
    $ExcelReport = $true
    $PdfReport = $true
}
if ($PdfReport) {
    $HtmlReport = $true
}

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
        (Split-Path -Parent $RepoRoot),
        (Join-Path $env:USERPROFILE "Desktop\bin"),
        (Join-Path $env:USERPROFILE "Desktop"),
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

if ($CoverageOnly) {
    $Tiers = @(0)
}
elseif ($null -eq $Tiers -or $Tiers.Count -eq 0) {
    if ($DryRun) {
        $Tiers = @(10, 25)
    }
    elseif ($Config -and $Config.steppedTiers) {
        $Tiers = @($Config.steppedTiers)
    }
    else {
        $Tiers = @(200, 500, 1000, 1500, 2000)
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
elseif ($Config -and $Config.durationSeconds) {
    [int]$Config.durationSeconds
}
else {
    30
}
$EffectiveRamp = if ($RampUp -gt 0) {
    $RampUp
}
elseif ($DryRun) {
    2
}
elseif ($Config -and $Config.defaultRampUpSec) {
    [int]$Config.defaultRampUpSec
}
else {
    30
}
$EffectiveThinkMinMs = if ($ThinkMinMs -ge 0) {
    $ThinkMinMs
}
elseif ($DryRun) {
    100
}
elseif ($Config -and $null -ne $Config.defaultThinkMinMs) {
    [int]$Config.defaultThinkMinMs
}
else {
    1500
}
$EffectiveThinkRangeMs = if ($ThinkRangeMs -ge 0) {
    $ThinkRangeMs
}
elseif ($DryRun) {
    400
}
elseif ($Config -and $null -ne $Config.defaultThinkRangeMs) {
    [int]$Config.defaultThinkRangeMs
}
else {
    2500
}

# Pad tiers to 5 thread groups (0 threads skips a tier group)
$TierValues = @(0, 0, 0, 0, 0)
for ($i = 0; $i -lt [Math]::Min($Tiers.Count, 5); $i++) {
    $TierValues[$i] = [int]$Tiers[$i]
}

$JtlPath = if ($JtlOutPath) { $JtlOutPath } else { Join-Path $ResultsDir "jmeter_results.jtl" }
$LogPath = if ($LogOutPath) { $LogOutPath } else { Join-Path $ResultsDir "jmeter.log" }
$SummaryJsonPath = if ($BaselineOutPath) { $BaselineOutPath } else { Join-Path $ResultsDir "jmeter_baseline.json" }
$HtmlReportDir = if ($HtmlReportOutDir) { $HtmlReportOutDir } else { Join-Path $ResultsDir "html_report" }

$JtlParent = Split-Path -Parent $JtlPath
if ($JtlParent -and -not (Test-Path $JtlParent)) {
    New-Item -ItemType Directory -Path $JtlParent -Force | Out-Null
}
$SummaryParent = Split-Path -Parent $SummaryJsonPath
if ($SummaryParent -and -not (Test-Path $SummaryParent)) {
    New-Item -ItemType Directory -Path $SummaryParent -Force | Out-Null
}

$LoadJtlPath = Join-Path (Split-Path -Parent $JtlPath) (([System.IO.Path]::GetFileNameWithoutExtension($JtlPath)) + "_load.jtl")
$ReportLogPath = Join-Path (Split-Path -Parent $LogPath) (([System.IO.Path]::GetFileNameWithoutExtension($LogPath)) + "_report.log")

Remove-Item -ErrorAction SilentlyContinue $JtlPath, $LogPath, $LoadJtlPath, $ReportLogPath

$ExtApiVal = if ($SkipExternalApis) { "false" } else { "true" }
$WritesInLoadVal = if ($IncludeWritesInLoad) { "true" } else { "false" }
$RunCoverageVal = if ($SkipCoverage) { "false" } else { "true" }

Write-Host "[*] Target        : $TargetUrl" -ForegroundColor Gray
Write-Host "[*] Tiers (VUs)   : $($TierValues -join ', ')" -ForegroundColor Gray
Write-Host "[*] Tier Duration : ${EffectiveDuration}s (RampUp=${EffectiveRamp}s)" -ForegroundColor Gray
Write-Host "[*] Think Time    : ${EffectiveThinkMinMs}ms + rand(0..${EffectiveThinkRangeMs}ms) | Granularity: ${GranularityMs}ms" -ForegroundColor Gray
Write-Host "[*] RunCoverage   : $RunCoverageVal | External APIs: $ExtApiVal | WritesInLoad: $WritesInLoadVal" -ForegroundColor Gray

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
    "-JrunCoverage=$RunCoverageVal",
    "-JloadThinkMinMs=$EffectiveThinkMinMs",
    "-JloadThinkRangeMs=$EffectiveThinkRangeMs",
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

function Split-CsvLine {
    param([string]$Line)
    $fields = [System.Collections.Generic.List[string]]::new()
    if ($null -eq $Line) { return $fields }
    $sb = [System.Text.StringBuilder]::new()
    $inQuotes = $false
    for ($idx = 0; $idx -lt $Line.Length; $idx++) {
        $ch = $Line[$idx]
        if ($ch -eq '"') {
            if ($inQuotes -and ($idx + 1) -lt $Line.Length -and $Line[$idx + 1] -eq '"') {
                [void]$sb.Append('"')
                $idx++
            }
            else {
                $inQuotes = -not $inQuotes
            }
        }
        elseif ($ch -eq ',' -and -not $inQuotes) {
            [void]$fields.Add($sb.ToString())
            [void]$sb.Clear()
        }
        else {
            [void]$sb.Append($ch)
        }
    }
    [void]$fields.Add($sb.ToString())
    return $fields
}

$LoadRowsCount = 0
if ($HtmlReport) {
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    $sr = [System.IO.StreamReader]::new($JtlPath, $utf8NoBom)
    $sw = [System.IO.StreamWriter]::new($LoadJtlPath, $false, $utf8NoBom)
    try {
        $headerLine = $sr.ReadLine()
        if ($null -ne $headerLine) {
            $sw.WriteLine($headerLine)
            $headers = Split-CsvLine -Line $headerLine
            $threadIdx = -1
            for ($hi = 0; $hi -lt $headers.Count; $hi++) {
                if ($headers[$hi] -eq "threadName") { $threadIdx = $hi; break }
            }
            while ($null -ne ($rawLine = $sr.ReadLine())) {
                if ($threadIdx -ge 0) {
                    $cols = Split-CsvLine -Line $rawLine
                    if ($cols.Count -gt $threadIdx -and $cols[$threadIdx] -match "^Stepped Tier \d+") {
                        $sw.WriteLine($rawLine)
                        $LoadRowsCount++
                    }
                }
            }
        }
    }
    finally {
        $sw.Dispose()
        $sr.Dispose()
    }

    $ReportSourceJtl = if ($LoadRowsCount -gt 0) { $LoadJtlPath } else { $JtlPath }
    if (Test-Path $HtmlReportDir) {
        Remove-Item -Recurse -Force $HtmlReportDir
    }
    Write-Host "[*] Generating JMeter HTML Dashboard from $(Split-Path -Leaf $ReportSourceJtl) (granularity=${GranularityMs}ms)..." -ForegroundColor Cyan
    & $JMeterExe -g $ReportSourceJtl -o $HtmlReportDir -j $ReportLogPath "-Jjmeter.reportgenerator.overall_granularity=$GranularityMs"
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "JMeter HTML report generator exited with code $LASTEXITCODE"
    }
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
$LoadRows = [System.Collections.Generic.List[object]]::new()

foreach ($Row in $Rows) {
    $Code = $Row.responseCode
    $Ok = ($Row.success -eq "true")
    $Label = $Row.label
    $Thread = $Row.threadName

    if ($Code -eq "401") { $Total401++ }
    if ($Code -eq "403") { $Total403++ }
    if ($Code -match "^5\d\d$") { $Total5xx++ }
    if (-not $Ok) { $TotalFailed++ }

    # Categorize into Setup / Coverage / Tier
    $Bucket = if ($Thread -like "setUp*") {
        "Setup"
    }
    elseif ($Thread -like "Full Endpoint*") {
        "Coverage"
    }
    elseif ($Thread -match "^Stepped Tier (\d+)") {
        [void]$LoadRows.Add($Row)
        "Tier_$($Matches[1])"
    }
    else {
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

$SteppedTiersList = [System.Collections.Generic.List[object]]::new()
for ($ti = 1; $ti -le 5; $ti++) {
    $tKey = "Tier_$ti"
    if ($TierGroups.ContainsKey($tKey) -and $TierGroups[$tKey].Count -gt 0) {
        $Items = $TierGroups[$tKey]
        $Times = @($Items | ForEach-Object { [double]$_.elapsed } | Sort-Object)
        $ErrCount = @($Items | Where-Object { $_.success -ne "true" }).Count
        $MinTs = ($Items | ForEach-Object { [double]$_.timeStamp } | Measure-Object -Minimum).Minimum
        $MaxTs = ($Items | ForEach-Object { [double]$_.timeStamp + [double]$_.elapsed } | Measure-Object -Maximum).Maximum
        $SpanSec = [Math]::Max(0.1, ($MaxTs - $MinTs) / 1000.0)
        $TotalTierBytes = 0.0
        foreach ($It in $Items) { $TotalTierBytes += [double]$It.bytes }
        $Avg = if ($Times.Count -gt 0) { [Math]::Round((($Times | Measure-Object -Average).Average), 2) } else { 0 }
        $Mbps = [Math]::Round(($TotalTierBytes * 8.0) / ($SpanSec * 1000000.0), 2)
        $Conc = if ($TierValues[$ti - 1] -gt 0) { [int]$TierValues[$ti - 1] } else { [int]$ti }

        [void]$SteppedTiersList.Add([ordered]@{
                tier          = $ti
                concurrency   = $Conc
                durationSec   = [Math]::Round($SpanSec, 2)
                totalRequests = $Items.Count
                errorCount    = $ErrCount
                errorRate     = [Math]::Round(($ErrCount / [Math]::Max(1, $Items.Count)) * 100.0, 2)
                rps           = [Math]::Round($Items.Count / $SpanSec, 2)
                mbps          = $Mbps
                totalBytes    = [int64]$TotalTierBytes
                percentiles   = [ordered]@{
                    min = $Times[0]
                    avg = $Avg
                    p50 = Get-Percentile -Sorted $Times -Pct 50
                    p90 = Get-Percentile -Sorted $Times -Pct 90
                    p95 = Get-Percentile -Sorted $Times -Pct 95
                    p99 = Get-Percentile -Sorted $Times -Pct 99
                    max = $Times[$Times.Count - 1]
                }
            })
    }
}

$RankingSourceRows = if ($LoadRows.Count -gt 0) { $LoadRows } else { $Rows }
$RankingBuckets = @{}
foreach ($R in $RankingSourceRows) {
    $Lbl = $R.label
    if (-not $RankingBuckets.ContainsKey($Lbl)) {
        $RankingBuckets[$Lbl] = [System.Collections.ArrayList]::new()
    }
    [void]$RankingBuckets[$Lbl].Add($R)
}

$RouteRankList = [System.Collections.Generic.List[object]]::new()
foreach ($Lbl in ($RankingBuckets.Keys | Sort-Object)) {
    $Items = $RankingBuckets[$Lbl]
    $Times = @($Items | ForEach-Object { [double]$_.elapsed } | Sort-Object)
    $TotalTimeMs = 0.0
    $TotalBytes = 0.0
    $StatusBuckets = @{}
    $StatusCounts = [ordered]@{}
    foreach ($It in $Items) {
        $TotalTimeMs += [double]$It.elapsed
        $TotalBytes += [double]$It.bytes
        $CodeStr = if ($It.responseCode) { [string]$It.responseCode } else { "0" }
        if (-not $StatusBuckets.ContainsKey($CodeStr)) {
            $StatusBuckets[$CodeStr] = [System.Collections.ArrayList]::new()
            $StatusCounts[$CodeStr] = 0
        }
        [void]$StatusBuckets[$CodeStr].Add($It)
        $StatusCounts[$CodeStr]++
    }
    $Avg = if ($Times.Count -gt 0) { [Math]::Round($TotalTimeMs / $Times.Count, 2) } else { 0 }

    $Variances = [System.Collections.Generic.List[object]]::new()
    $SortedCodes = $StatusBuckets.Keys | Sort-Object { $StatusBuckets[$_].Count } -Descending | Select-Object -First 5
    foreach ($CodeStr in $SortedCodes) {
        $CodeItems = $StatusBuckets[$CodeStr]
        $CodeTimes = @($CodeItems | ForEach-Object { [double]$_.elapsed } | Sort-Object)
        $ParsedCode = 0
        [void][int]::TryParse($CodeStr, [ref]$ParsedCode)
        $ErrSample = ""
        if ($ParsedCode -ge 400 -or $ParsedCode -eq 0) {
            $FirstErr = $CodeItems | Where-Object { $_.failureMessage -or $_.responseMessage } | Select-Object -First 1
            if ($FirstErr) {
                if ($ParsedCode -eq 0 -and $FirstErr.responseMessage) {
                    $ErrSample = "$CodeStr ($($FirstErr.responseMessage))"
                }
                else {
                    $ErrSample = if ($FirstErr.failureMessage) { [string]$FirstErr.failureMessage } else { [string]$FirstErr.responseMessage }
                }
                if ($ErrSample -eq "" -and $CodeStr -ne "0") { $ErrSample = "HTTP $CodeStr" }
            }
        }
        [void]$Variances.Add([ordered]@{
                statusCode     = $ParsedCode
                count          = $CodeItems.Count
                percentage     = [Math]::Round(($CodeItems.Count / [Math]::Max(1, $Items.Count)) * 100.0, 2)
                minLatency     = $CodeTimes[0]
                medianLatency  = Get-Percentile -Sorted $CodeTimes -Pct 50
                slowestLatency = $CodeTimes[$CodeTimes.Count - 1]
                sampleError    = $ErrSample
            })
    }

    [void]$RouteRankList.Add([ordered]@{
            route        = $Lbl
            totalCalls   = $Items.Count
            totalBytes   = [int64]$TotalBytes
            totalTimeMs  = [Math]::Round($TotalTimeMs, 2)
            avgLatency   = $Avg
            minLatency   = $Times[0]
            p50Latency   = Get-Percentile -Sorted $Times -Pct 50
            p90Latency   = Get-Percentile -Sorted $Times -Pct 90
            p95Latency   = Get-Percentile -Sorted $Times -Pct 95
            p99Latency   = Get-Percentile -Sorted $Times -Pct 99
            maxLatency   = $Times[$Times.Count - 1]
            statusCounts = $StatusCounts
            topVariances = $Variances
        })
}

$MostTimeConsuming = [System.Collections.Generic.List[object]]::new()
foreach ($entry in ($RouteRankList | Sort-Object { $_.totalTimeMs } -Descending)) { [void]$MostTimeConsuming.Add($entry) }
$SlowestRoutes = [System.Collections.Generic.List[object]]::new()
foreach ($entry in ($RouteRankList | Sort-Object { $_.p95Latency } -Descending | Select-Object -First 15)) { [void]$SlowestRoutes.Add($entry) }
$MostTraffic = [System.Collections.Generic.List[object]]::new()
foreach ($entry in ($RouteRankList | Sort-Object { $_.totalBytes } -Descending | Select-Object -First 15)) { [void]$MostTraffic.Add($entry) }

$SummaryPayload = [ordered]@{
    timestamp       = (Get-Date).ToString("o")
    engine          = "apache-jmeter-5.6.3"
    engineLabel     = "Apache JMeter (Stepped Concurrency)"
    targetUrl       = $TargetUrl
    dryRun          = [bool]$DryRun
    runCoverage     = (-not [bool]$SkipCoverage)
    granularityMs   = $GranularityMs
    thinkMinMs      = $EffectiveThinkMinMs
    thinkRangeMs    = $EffectiveThinkRangeMs
    tiers           = $TierValues
    durationSeconds = $EffectiveDuration
    totalSamples    = $Rows.Count
    loadSamples     = $LoadRows.Count
    totalFailed     = $TotalFailed
    total401        = $Total401
    total403        = $Total403
    total5xx        = $Total5xx
    steppedTiers    = $SteppedTiersList
    rankings        = [ordered]@{
        mostTimeConsuming = $MostTimeConsuming
        slowestRoutes     = $SlowestRoutes
        mostTraffic       = $MostTraffic
    }
    tierBreakdown   = $TierSummary
    routeBreakdown  = $RouteSummary
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
function Resolve-VenvPython {
    param([string]$RootDir)

    $repoRootResolved = (Resolve-Path $RootDir).Path
    $activateScript = Join-Path $repoRootResolved "Scripts\Activate.ps1"
    $expectedVenvPython = Join-Path $repoRootResolved "Scripts\python.exe"
    if (-not (Test-Path $activateScript) -or -not (Test-Path $expectedVenvPython)) {
        throw "Virtual environment activation script or python.exe missing under $repoRootResolved. Stopping without fallback."
    }
    $expectedVenvPython = (Resolve-Path $expectedVenvPython).Path

    Push-Location $repoRootResolved
    try {
        & $activateScript
        if (-not $env:VIRTUAL_ENV) {
            throw "Validation failed: `$env:VIRTUAL_ENV is not set after activating $activateScript."
        }
        if ((Resolve-Path $env:VIRTUAL_ENV).Path -ne $repoRootResolved) {
            throw "Validation failed: `$env:VIRTUAL_ENV does not match $repoRootResolved."
        }
        $pyCmd = Get-Command python -ErrorAction Stop
        $resolvedPy = (Resolve-Path $pyCmd.Source).Path
        if ($resolvedPy -ne $expectedVenvPython) {
            throw "Validation failed: Get-Command python ($resolvedPy) does not resolve to $expectedVenvPython."
        }
        & $resolvedPy -c "import sys; assert sys.prefix != sys.base_prefix"
        if ($LASTEXITCODE -ne 0) {
            throw "Validation failed: Python reported sys.prefix == sys.base_prefix."
        }
        return $resolvedPy
    }
    finally {
        Pop-Location
    }
}

Write-Host "`n[*] Exported JSON summary: $SummaryJsonPath" -ForegroundColor Green
if ($HtmlReport) {
    Write-Host "[*] Exported HTML report : $HtmlReportDir\index.html" -ForegroundColor Green
}

if ($ExcelReport) {
    $GenReportScript = Join-Path $ScriptDir "generate_report.py"
    if (-not (Test-Path $GenReportScript)) {
        throw "Excel report generator not found: $GenReportScript"
    }
    $EffectiveExcelPath = if ($ExcelOutPath) { $ExcelOutPath } else { Join-Path $RepoRoot "docs\jmeter_stress_test_report.xlsx" }
    $VenvPython = Resolve-VenvPython -RootDir $RepoRoot
    Write-Host "[*] Generating JMeter-only Excel workbook..." -ForegroundColor Cyan
    & $VenvPython $GenReportScript --source jmeter --no-locust --baseline $SummaryJsonPath --out $EffectiveExcelPath
    if ($LASTEXITCODE -ne 0) {
        throw "JMeter Excel report generation failed with exit code $LASTEXITCODE"
    }
    Write-Host "[*] Exported Excel report: $EffectiveExcelPath" -ForegroundColor Green
}

if ($PdfReport) {
    $ExportPdfScript = Join-Path $ScriptDir "export_reports_pdf.mjs"
    if (-not (Test-Path $ExportPdfScript)) {
        throw "PDF exporter not found: $ExportPdfScript"
    }
    $PdfResultsDir = Split-Path -Parent $HtmlReportDir
    $EffectivePdfPath = if ($PdfOutPath) { $PdfOutPath } else { Join-Path $ResultsDir "jmeter_report.pdf" }
    Write-Host "[*] Exporting JMeter-only PDF report..." -ForegroundColor Cyan
    & node $ExportPdfScript --results-dir $PdfResultsDir --jmeter-only --out $EffectivePdfPath
    if ($LASTEXITCODE -ne 0) {
        throw "JMeter PDF export failed with exit code $LASTEXITCODE"
    }
    Write-Host "[*] Exported PDF report  : $EffectivePdfPath" -ForegroundColor Green
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

