# Tech Context

## Technologies Used
- [x] Electron: A framework for building cross-platform desktop applications using web technologies.
- [x] Node.js: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- [x] HTML/CSS/JavaScript: Web technologies used for the user interface.
- [x] UPnP/DLNA: Protocols for discovering and controlling devices on a local network.

## Development Setup
- [x] Node.js and npm installed.
- [x] Electron installed as a dependency.
- [x] node-ssdp installed for UPnP device discovery.
- [x] node-upnp installed for UPnP device control.
- [x] electron-builder installed for packaging the application.
- [x] PowerShell scripts for creating distribution packages.

## Technical Constraints
- [x] The application requires a local network connection to discover and control TVs.
- [x] The application requires Node.js and Electron to run.
- [x] The application requires UPnP/DLNA support on TVs.
- [x] The application is limited to controlling TVs that support the Panasonic DLNA extensions.
- [x] The standalone application requires proper dependency management for node-ssdp and node-upnp modules.
- [x] Distribution can be done via ZIP file or by running the application with helper batch files.

## Dependencies
- [x] electron: ^35.0.1 (devDependency)
- [x] node-upnp: ^1.3.0
- [x] node-ssdp: ^4.0.1
- [x] electron-builder: ^25.1.8 (devDependency)
