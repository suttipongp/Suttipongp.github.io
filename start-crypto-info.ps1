$project = Split-Path -Parent $MyInvocation.MyCommand.Path
Start-Process (Join-Path $project "crypto-info\index.html")
