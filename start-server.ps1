    $Listener.Start()
} catch {
    # If 5000 is occupied, try 5050
    $Port = 5050
    $Url = "http://${HostIP}:${Port}/"
    $Listener = New-Object System.Net.HttpListener
    $Listener.Prefixes.Add($Url)
    $Listener.Start()
}
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  CampusTech One Digital Ecosystem Local Server Started!  " -ForegroundColor Green
Write-Host "  Access URL: $Url" -ForegroundColor Yellow
Write-Host "  Root Directory: $Folder" -ForegroundColor Gray
Write-Host "  Press Ctrl+C to terminate the server." -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Cyan
# Launch default browser
Start-Process $Url
while ($Listener.IsListening) {
    try {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response
        $RawPath = $Request.Url.LocalPath
        if ($RawPath -eq "/" -or $RawPath -eq "") {
            $RawPath = "/index.html"
        }
        $FilePath = Join-Path $Folder ($RawPath.TrimStart('/').Replace('/', '\'))
        if (Test-Path $FilePath -PathType Leaf) {
            $Extension = [System.IO.Path]::GetExtension($FilePath).ToLower()
            $ContentType = $MimeTypes[$Extension]
            if (-not $ContentType) { $ContentType = "application/octet-stream" }
            $Response.ContentType = $ContentType
            $Response.Headers.Add("Access-Control-Allow-Origin", "*")
            $Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
            $Buffer = [System.IO.File]::ReadAllBytes($FilePath)
            $Response.ContentLength64 = $Buffer.Length
            $Response.OutputStream.Write($Buffer, 0, $Buffer.Length)
        } else {
            $Response.StatusCode = 404
            $Buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $RawPath")
            $Response.ContentLength64 = $Buffer.Length
            $Response.OutputStream.Write($Buffer, 0, $Buffer.Length)
        }
        $Response.OutputStream.Close()
    } catch {
        # Catch and continue on client abort
    }
}
