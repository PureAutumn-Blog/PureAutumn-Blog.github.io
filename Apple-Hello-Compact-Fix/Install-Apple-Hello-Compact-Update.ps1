$ErrorActionPreference = 'Stop'

$ProjectRoot = 'C:\Users\ray13\Desktop\myblog'
$Target = Join-Path $ProjectRoot 'static\js\apple-stardust-intro.js'
$Source = Join-Path $PSScriptRoot 'apple-stardust-intro.js'

if (-not (Test-Path -LiteralPath $ProjectRoot -PathType Container)) {
    throw "项目目录不存在：$ProjectRoot。请确认项目目录后再运行。"
}
if (-not (Test-Path -LiteralPath $Target -PathType Leaf)) {
    throw "没有找到现有脚本：$Target。为避免创建错误路径，脚本已停止。"
}
if (-not (Test-Path -LiteralPath $Source -PathType Leaf)) {
    throw "安装包中缺少 apple-stardust-intro.js。请先解压完整 ZIP，再运行此脚本。"
}

$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$BackupDir = Join-Path ([Environment]::GetFolderPath('Desktop')) "myblog-backup-apple-hello-compact-$Stamp"
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
Copy-Item -LiteralPath $Target -Destination (Join-Path $BackupDir 'apple-stardust-intro.js')

# Only replace the stardust intro JavaScript. The main CSS, layouts, KaTeX and framework stay untouched.
Copy-Item -LiteralPath $Source -Destination $Target -Force

Write-Host ''
Write-Host 'Apple Hello 紧凑字形补丁已安装。' -ForegroundColor Green
Write-Host '已缩窄横向字形，并将副标题固定到更低的位置，避免与 hello 重叠。'
Write-Host "原脚本备份：$BackupDir\apple-stardust-intro.js"
Write-Host '本次只替换 static\js\apple-stardust-intro.js，其余文件未修改。'
Write-Host '请在本地 Hugo 预览中按 Ctrl+F5 检查。'
