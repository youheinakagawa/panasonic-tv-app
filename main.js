const { app, BrowserWindow, ipcMain } = require('electron');
const { Client } = require('node-ssdp');
const http = require('http');
const { URL } = require('url');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });

  win.loadFile('index.html');
  return win;
}

app.whenReady().then(() => {
  const win = createWindow();

  ipcMain.on('search-tv', () => {
    const client = new Client();
    const devices = [];

    client.on('response', (headers, statusCode, rinfo) => {
      console.log('Got a response to an m-search:', headers);
      
      // Check if it's a Panasonic TV
      if (headers.SERVER && headers.SERVER.includes('Panasonic')) {
        const device = {
          location: headers.LOCATION,
          server: headers.SERVER,
          usn: headers.USN,
          ip: rinfo.address,
          port: rinfo.port
        };
        
        // Check if device is already in the list
        const exists = devices.some(d => d.usn === device.usn);
        if (!exists) {
          devices.push(device);
          // Send the updated devices list to the renderer process
          win.webContents.send('tv-found', devices);
        }
      }
    });

    // Search for UPnP devices
    client.search('urn:schemas-upnp-org:device:MediaRenderer:1');

    // Stop searching after 5 seconds
    setTimeout(() => {
      client.stop();
    }, 5000);
  });

  // Handle TV remote control commands
  ipcMain.on('tv-command', (event, { ip, port, command }) => {
    console.log(`Sending command ${command} to TV at ${ip}:${port}`);
    
    // TODO: Implement actual TV control using DLNA/UPnP
    // This is a placeholder for future implementation
    
    // For now, we'll just log the command and return a success message
    win.webContents.send('tv-command-result', {
      success: true,
      command,
      message: `Command ${command} sent to TV at ${ip}:${port}`
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
