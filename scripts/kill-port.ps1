# Kill the process listening on the API port before starting the server.
# Used by: npm run start:clean

param(
    [int]$Port = $(if ($env:PORT) { [int]$env:PORT } else { 3001 })
)

$connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

if (-not $connections) {
    Write-Host "Port $Port is free."
    exit 0
}

$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($pid in $pids) {
    try {
        $proc = Get-Process -Id $pid -ErrorAction Stop
        Write-Host "Stopping $($proc.ProcessName) (PID $pid) on port $Port..."
        Stop-Process -Id $pid -Force -ErrorAction Stop
    } catch {
        Write-Warning "Could not stop PID $pid : $_"
    }
}

Write-Host "Port $Port cleared."
