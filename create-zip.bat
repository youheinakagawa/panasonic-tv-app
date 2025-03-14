@echo off
echo Panasonic TV Remote のZIPパッケージを作成しています...
powershell -ExecutionPolicy Bypass -File create-zip.ps1
if %ERRORLEVEL% NEQ 0 (
    echo エラー: ZIPファイルの作成に失敗しました。
    pause
    exit /b 1
)
echo ZIPファイルの作成が完了しました: dist\Panasonic-TV-Remote-Setup.zip
pause
