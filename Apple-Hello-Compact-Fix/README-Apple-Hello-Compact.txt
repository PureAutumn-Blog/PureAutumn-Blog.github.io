Apple Hello 星尘动画：紧凑字形补丁

安装前请先将 ZIP 完整解压。
在解压目录中打开 PowerShell，执行：

powershell -ExecutionPolicy Bypass -File ".\Install-Apple-Hello-Compact-Update.ps1"

安装脚本会将现有 static\js\apple-stardust-intro.js 备份到桌面，再仅替换这个 JS 文件。
此次调整：
- 不再水平拉伸 hello，整体更紧凑。
- 将文字向上移动。
- 将副标题改为独立定位并向下拉开，减少重叠。
- 保留星辰白色汇聚后渐变为彩色的动画。

安装后启动本地 Hugo 预览并按 Ctrl+F5 检查。
