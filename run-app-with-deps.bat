@echo off
echo Panasonic TV Remote を起動しています...
cd /d "%~dp0"

set APP_DIR=dist\win-unpacked\resources\app
set NODE_MODULES_DIR=%APP_DIR%\node_modules

if not exist "dist\win-unpacked\Panasonic TV Remote.exe" (
    echo エラー: アプリケーションが見つかりません。
    echo パス: dist\win-unpacked\Panasonic TV Remote.exe
    pause
    exit /b 1
)

if not exist "%APP_DIR%" (
    echo エラー: アプリケーションディレクトリが見つかりません。
    echo パス: %APP_DIR%
    pause
    exit /b 1
)

if not exist "node_modules\node-ssdp" (
    echo エラー: node-ssdp モジュールが見つかりません。
    echo npm install を実行して依存関係をインストールしてください。
    pause
    exit /b 1
)

if not exist "node_modules\node-upnp" (
    echo エラー: node-upnp モジュールが見つかりません。
    echo npm install を実行して依存関係をインストールしてください。
    pause
    exit /b 1
)

if not exist "%NODE_MODULES_DIR%" (
    echo 依存関係をコピーしています...
    mkdir "%NODE_MODULES_DIR%"
    
    echo node-ssdp をコピーしています...
    xcopy /E /I /Y "node_modules\node-ssdp" "%NODE_MODULES_DIR%\node-ssdp"
    
    echo node-upnp をコピーしています...
    xcopy /E /I /Y "node_modules\node-upnp" "%NODE_MODULES_DIR%\node-upnp"
    
    echo 依存関係のコピーが完了しました。
)

echo アプリケーションを起動しています...
start "" "dist\win-unpacked\Panasonic TV Remote.exe"
echo アプリケーションが起動しました。
