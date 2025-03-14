@echo off
echo Panasonic TV Remote を起動しています...
cd /d "%~dp0"
if exist "dist\win-unpacked\Panasonic TV Remote.exe" (
    start "" "dist\win-unpacked\Panasonic TV Remote.exe"
) else (
    echo エラー: アプリケーションが見つかりません。
    echo パス: dist\win-unpacked\Panasonic TV Remote.exe
    pause
)
