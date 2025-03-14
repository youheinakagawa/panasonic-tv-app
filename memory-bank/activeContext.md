# Active Context

## Current Work Focus
- [x] Implementing UPnP device discovery to find Panasonic TVs on the local network.
- [x] Creating a user interface for the remote control.
- [x] Setting up the IPC communication between the main process and renderer process.
- [x] Implementing basic TV control using DLNA/UPnP.

## Recent Changes
- [x] Created the basic Electron application structure.
- [x] Implemented UPnP device discovery using node-ssdp.
- [x] Created a user interface for the TV list and remote control.
- [x] Set up IPC communication for TV discovery and control.
- [x] Implemented TV power and volume control using DLNA/UPnP.
- [x] Added detailed TV information display.
- [x] Created a GitHub repository for the project.
- [x] Improved TV command sending method using Panasonic-specific endpoints.
- [x] Enhanced remote control UI with additional buttons (direction keys, color buttons, media controls).
- [x] Modified keyboard controls to use modifiers for different functions (Shift+上下 for channel, Ctrl+上下 for volume).
- [x] Added additional app buttons (VIERA Tools, VIERA Connect, VIERA Link, VOD, Game).
- [x] Removed Netflix and YouTube buttons that were causing errors.
- [x] Added XML logging to files for detailed analysis of TV capabilities.
- [x] Added detection and support for お部屋ジャンプリンク feature.
- [x] Added additional app buttons based on XML analysis (ブラウザ, メディアプレーヤー, テレビメニュー, お気に入り).
- [x] Added function key shortcuts for app launching (F1-F5).
- [x] Made remote control UI responsive for better display on different screen sizes.
- [x] Added BackSpaceキー support for Back button functionality.
- [x] Added HDMI3 and HDMI4 input buttons with corresponding keyboard shortcuts.
- [x] Updated HDMI input commands to use direct commands (NRC_HDMI1-ONOFF, etc.) instead of generic input switching.
- [x] Added electron-builder for packaging the application as a standalone executable.
- [x] Created a Windows installer for easy distribution and installation.
- [x] Added a README.md file with installation and usage instructions.
- [x] Created batch files to help run the application with the correct dependencies.
- [x] Fixed dependency issues with the standalone application.
- [x] Created PowerShell script to package the application as a ZIP file.
- [x] Added error handling to batch files for better user experience.
- [x] Updated README.md with instructions for using the ZIP file.

## Next Steps
- [x] Implement more TV control functions (e.g., channel change, input selection).
- [ ] Add support for smart TV features.
- [x] Improve the user interface with more visual feedback.
- [x] Add keyboard shortcuts for remote control functions.
- [x] Expand remote control functionality with additional buttons.
- [ ] Add settings for customizing the application.
- [ ] Implement error handling and recovery for network issues.
- [ ] Analyze XML logs to discover more TV capabilities and app information.
- [x] Add git exclusion for logs directory to avoid committing large XML files.
- [ ] Create builds for other platforms (macOS, Linux).

## Active Decisions and Considerations
- [x] Using node-ssdp for UPnP device discovery instead of node-upnp, as node-upnp does not provide device discovery functionality.
- [x] Using SOAP requests to control the TV through DLNA/UPnP.
- [x] Using a responsive HTML/CSS interface for the remote control to work well on different screen sizes.
- [x] Using GitHub for version control.
- [x] Improved UPnP device discovery by using multiple search targets and increasing search time.
- [x] Enhanced error handling and user feedback for TV control operations.
- [x] Implemented additional TV control functions using Panasonic-specific DLNA extensions.
- [x] Added input switching functionality for TV, HDMI1, HDMI2, HDMI3, and HDMI4 sources.
- [x] Implemented keyboard shortcuts for easier remote control operation.
- [x] Using `/nrc/control_0` endpoint and `urn:panasonic-com:service:p00NetworkControl:1#X_SendKey` SOAP action for more reliable TV control.
- [x] Expanded remote control UI with direction keys, color buttons, and media control buttons for comprehensive TV control.
- [x] Modified keyboard controls to use modifiers (Shift, Ctrl) for different functions to improve usability.
- [x] Added app buttons for accessing smart TV features (Apps, VIERA Tools, etc.).
- [x] Saving XML responses to log files for detailed analysis of TV capabilities.
- [x] Added detection and support for お部屋ジャンプリンク feature using NRC_DIGA_CTL-ONOFF command.
- [x] Added function key shortcuts (F1-F5) for quick access to apps and features.
- [x] Organized app buttons into categories for better usability.
- [x] Confirmed that メディアプレーヤー uses the Dボタン (NRC_DATA-ONOFF) command.
- [x] Analyzed XML logs to identify TV capabilities and supported commands.
- [x] Added logs/ directory to .gitignore to prevent committing large XML files.
- [x] Using electron-builder for packaging the application as a standalone executable with an installer.
- [x] Configured the build to exclude logs and memory-bank directories from the packaged application.
- [x] Created a README.md file with comprehensive installation and usage instructions in Japanese.
