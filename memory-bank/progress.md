# Progress

## What Works
- [x] UPnP device discovery: The application can discover Panasonic TVs on the local network.
- [x] TV list: The application displays a list of discovered TVs with detailed information.
- [x] Remote control UI: The application provides a responsive user interface for controlling TVs.
- [x] IPC communication: The main process and renderer process can communicate with each other.
- [x] Basic TV control: The application can control TV power and volume using DLNA/UPnP.
- [x] Enhanced TV control: The application can control TV channels, menu navigation, and input numbers.
- [x] Input switching: The application can switch between TV, HDMI1, HDMI2, HDMI3, and HDMI4 input sources.
- [x] Keyboard shortcuts: The application supports keyboard shortcuts for remote control functions.
- [x] Improved error handling: The application provides better error messages and feedback.
- [x] Optimized command sending: Using Panasonic-specific endpoints and SOAP actions for reliable control.
- [x] Comprehensive remote control: Added direction keys, color buttons, and media control buttons.
- [x] Enhanced keyboard controls: Modified to use modifiers (Shift, Ctrl) for different functions.
- [x] App buttons: Added buttons for accessing smart TV features (Apps, VIERA Tools, etc.).
- [x] XML logging: Added logging of XML responses to files for detailed analysis.
- [x] お部屋ジャンプリンク support: Added detection and button for お部屋ジャンプリンク feature.
- [x] Additional app buttons: Added buttons for ブラウザ, メディアプレーヤー, テレビメニュー, お気に入り.
- [x] Function key shortcuts: Added F1-F5 shortcuts for quick access to apps and features.
- [x] BackSpaceキー support: Added BackSpaceキー as an alternative to ESCキー for Back button functionality.
- [x] Standalone application: The application can be built as a standalone executable with an installer.
- [x] Documentation: Added a README.md file with installation and usage instructions.
- [x] Dependency management: Created batch files to help run the application with the correct dependencies.
- [x] Distribution: Created PowerShell script to package the application as a ZIP file for easy distribution.
- [x] Error handling: Added error handling to batch files for better user experience.

## What's Left to Build
- [ ] Smart TV features: The application needs to support more smart TV features.
- [ ] Settings: The application needs to provide settings for customization.
- [ ] Cross-platform testing: The application needs to be tested on different platforms.
- [ ] Network error recovery: The application needs to handle network errors and reconnect automatically.
- [ ] App list analysis: Analyze XML logs to discover more TV capabilities and app information.

## Current Status
- [x] The application can discover Panasonic TVs on the local network with improved search capabilities.
- [x] The application provides a responsive user interface for controlling TVs with better feedback.
- [x] The application can control TV power, volume, channels, menu navigation, and input sources.
- [x] The application supports keyboard shortcuts for easier operation.
- [x] The application provides better error handling and user feedback.
- [x] The application uses optimized command sending methods for Panasonic TVs.
- [x] The remote control UI has been expanded with additional buttons for comprehensive TV control.
- [x] Keyboard controls have been enhanced to use modifiers for different functions.
- [x] App buttons have been added for accessing smart TV features.
- [x] XML responses are logged to files for detailed analysis.
- [x] お部屋ジャンプリンク feature is detected and supported with a dedicated button.
- [x] Additional app buttons have been added based on XML analysis.
- [x] Function key shortcuts have been added for quick access to apps and features.
- [x] HDMI input switching has been improved with direct commands and additional HDMI3/HDMI4 support.
- [x] メディアプレーヤー has been confirmed to use the Dボタン (NRC_DATA-ONOFF) command.
- [x] The application can be built as a standalone executable with an installer for easy distribution.
- [x] Documentation has been added with installation and usage instructions.
- [x] Batch files have been created to help run the application with the correct dependencies.
- [x] A PowerShell script has been created to package the application as a ZIP file for easy distribution.
- [x] Error handling has been added to batch files for better user experience.
- [ ] The application needs to implement more smart TV features and settings.

## Known Issues
- [x] The application may not discover all TVs on the local network, but search has been improved.
- [x] The application may not work on all platforms.
- [x] Some TV models may not support all the implemented DLNA/UPnP commands.
- [x] Network errors may cause the application to fail without proper recovery.
- [x] Some app buttons may not work on all TV models due to differences in supported commands.
- [x] The unpacked application may have dependency issues when run directly; use the provided batch files or installer.
