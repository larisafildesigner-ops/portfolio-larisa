param(
  [int]$Port = 4173,
  [string]$Root = "C:\Users\Professional\Documents\Codex\portfolio"
)

Add-Type -AssemblyName System.Web
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse('127.0.0.1'), $Port)
$listener.Start()
Write-Host "Serving $Root at http://127.0.0.1:$Port/"

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'
  '.js' = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg' = 'image/svg+xml'
  '.png' = 'image/png'
  '.jpg' = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.webp' = 'image/webp'
  '.ico' = 'image/x-icon'
}

function Send-Response($stream, [int]$statusCode, [string]$statusText, [byte[]]$body, [string]$contentType) {
  $header = "HTTP/1.1 $statusCode $statusText`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($headerBytes, 0, $headerBytes.Length)
  $stream.Write($body, 0, $body.Length)
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      while ($reader.Peek() -ge 0) {
        $line = $reader.ReadLine()
        if ([string]::IsNullOrEmpty($line)) { break }
      }

      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        $empty = [System.Text.Encoding]::UTF8.GetBytes('Bad request')
        Send-Response $stream 400 'Bad Request' $empty 'text/plain; charset=utf-8'
        continue
      }

      $parts = $requestLine.Split(' ')
      $rawPath = if ($parts.Length -ge 2) { $parts[1] } else { '/' }
      $absolutePath = [System.Web.HttpUtility]::UrlDecode(($rawPath.Split('?')[0]))
      if ([string]::IsNullOrWhiteSpace($absolutePath) -or $absolutePath -eq '/') {
        $absolutePath = '/index.html'
      }

      $localPath = Join-Path $Root ($absolutePath.TrimStart('/') -replace '/', '\\')
      if ((Test-Path $localPath) -and (Get-Item $localPath).PSIsContainer) {
        $localPath = Join-Path $localPath 'index.html'
      }

      if (-not (Test-Path $localPath)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes('Not found')
        Send-Response $stream 404 'Not Found' $body 'text/plain; charset=utf-8'
        continue
      }

      $ext = [System.IO.Path]::GetExtension($localPath).ToLowerInvariant()
      $contentType = $mime[$ext]
      if (-not $contentType) { $contentType = 'application/octet-stream' }
      $body = [System.IO.File]::ReadAllBytes($localPath)
      Send-Response $stream 200 'OK' $body $contentType
    } finally {
      if ($stream) { $stream.Dispose() }
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
