# System Patterns

## System Architecture
- [x] The application is built using Electron, which combines Chromium and Node.js to create desktop applications using web technologies.
- [x] The application consists of a main process and a renderer process.
- [x] The main process handles UPnP/DLNA communication with TVs.
- [x] The renderer process handles the user interface.

## Key Technical Decisions
- [x] Use Electron for cross-platform desktop application development.
- [x] Use UPnP/DLNA for TV discovery and control.
- [x] Use IPC (Inter-Process Communication) for communication between the main process and renderer process.
- [x] Use HTML, CSS, and JavaScript for the user interface.

## Design Patterns
- [x] Event-driven architecture: The application uses events to communicate between processes.
- [x] Observer pattern: The main process observes UPnP events and notifies the renderer process.
- [x] Command pattern: The application sends commands to TVs.

## Component Relationships
- [x] Main Process: Handles UPnP/DLNA communication with TVs.
  - [x] UPnP Client: Discovers TVs on the local network.
  - [x] TV Controller: Sends commands to TVs.
- [x] Renderer Process: Handles the user interface.
  - [x] TV List: Displays a list of discovered TVs.
  - [x] Remote Control: Provides a user interface for controlling TVs.
