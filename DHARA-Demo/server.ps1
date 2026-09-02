# DHARA Local Server — No dependencies required
# Uses .NET HttpListener (built into every Windows since Vista)

$port = 4200
$root = Join-Path $PSScriptRoot "browser"

# Find a free port if 4200 is in use
while ($true) {
    try {
        $listener = New-Object System.Net.Sockets.TcpClient
        $listener.Connect("127.0.0.1", $port)
        $listener.Close()
        $port++
    } catch {
        break
    }
}

$prefix = "http://localhost:$port/"

# MIME type map
$mimeTypes = @{
    ".html" = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
    ".eot"  = "application/vnd.ms-fontobject"
    ".map"  = "application/json"
}

# Start HTTP listener
$http = New-Object System.Net.HttpListener
$http.Prefixes.Add($prefix)
$http.Start()

Write-Host ""
Write-Host "  DHARA is running at: $prefix" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host ""

# Open browser
Start-Process $prefix

# Serve requests
try {
    while ($http.IsListening) {
        $context = $http.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") { $localPath = "/index.html" }

        $filePath = Join-Path $root ($localPath -replace "/", "\")

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            
            $response.ContentType = $contentType
            $buffer = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            # SPA fallback: serve index.html for Angular routes
            $indexPath = Join-Path $root "index.html"
            $response.ContentType = "text/html"
            $buffer = [System.IO.File]::ReadAllBytes($indexPath)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }

        $response.Close()
    }
} finally {
    $http.Stop()
    $http.Close()
}
