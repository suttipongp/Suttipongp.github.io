$project = Split-Path -Parent $MyInvocation.MyCommand.Path
Start-Process (Join-Path $project "index.html")
