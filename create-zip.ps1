# PowerShellスクリプト: アプリケーションをZIPファイルに圧縮

# 出力ディレクトリの確認
$outputDir = "dist"
if (-not (Test-Path $outputDir)) {
    Write-Host "エラー: 出力ディレクトリが見つかりません: $outputDir"
    exit 1
}

# アプリケーションディレクトリの確認
$appDir = "dist\win-unpacked"
if (-not (Test-Path $appDir)) {
    Write-Host "エラー: アプリケーションディレクトリが見つかりません: $appDir"
    exit 1
}

# ZIPファイル名の設定
$zipFileName = "Panasonic-TV-Remote-Setup.zip"
$zipFilePath = Join-Path $outputDir $zipFileName

# 既存のZIPファイルを削除
if (Test-Path $zipFilePath) {
    Remove-Item $zipFilePath -Force
}

Write-Host "アプリケーションをZIPファイルに圧縮しています..."

# 一時ディレクトリの作成
$tempDir = "dist\temp-for-zip"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# アプリケーションファイルをコピー（debug.logを除く）
Write-Host "アプリケーションファイルをコピーしています..."
Get-ChildItem -Path $appDir -Recurse | Where-Object { $_.FullName -notlike "*debug.log" } | ForEach-Object {
    $targetPath = $_.FullName.Replace($appDir, $tempDir)
    
    if ($_.PSIsContainer) {
        # ディレクトリの場合
        if (-not (Test-Path $targetPath)) {
            New-Item -ItemType Directory -Path $targetPath | Out-Null
        }
    } else {
        # ファイルの場合
        $targetDir = Split-Path -Path $targetPath -Parent
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir | Out-Null
        }
        Copy-Item -Path $_.FullName -Destination $targetPath -Force
    }
}

# ZIPファイルの作成
Write-Host "ZIPファイルを作成しています..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipFilePath)

# 一時ディレクトリの削除
Remove-Item $tempDir -Recurse -Force

if (Test-Path $zipFilePath) {
    Write-Host "ZIPファイルの作成が完了しました: $zipFilePath"
} else {
    Write-Host "エラー: ZIPファイルの作成に失敗しました"
    exit 1
}
