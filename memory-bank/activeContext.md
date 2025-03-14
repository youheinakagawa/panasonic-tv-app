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

## Next Steps
- [x] Implement more TV control functions (e.g., channel change, input selection).
- [ ] Add support for smart TV features.
- [x] Improve the user interface with more visual feedback.
- [x] Add keyboard shortcuts for remote control functions.
- [x] Expand remote control functionality with additional buttons.
- [ ] Add settings for customizing the application.
- [ ] Implement error handling and recovery for network issues.

## Active Decisions and Considerations
- [x] Using node-ssdp for UPnP device discovery instead of node-upnp, as node-upnp does not provide device discovery functionality.
- [x] Using SOAP requests to control the TV through DLNA/UPnP.
- [x] Using a simple HTML/CSS interface for the remote control, which can be improved in the future.
- [x] Using GitHub for version control.
- [x] Improved UPnP device discovery by using multiple search targets and increasing search time.
- [x] Enhanced error handling and user feedback for TV control operations.
- [x] Implemented additional TV control functions using Panasonic-specific DLNA extensions.
- [x] Added input switching functionality for TV, HDMI1, and HDMI2 sources.
- [x] Implemented keyboard shortcuts for easier remote control operation.
- [x] Using `/nrc/control_0` endpoint and `urn:panasonic-com:service:p00NetworkControl:1#X_SendKey` SOAP action for more reliable TV control.
- [x] Expanded remote control UI with direction keys, color buttons, and media control buttons for comprehensive TV control.
