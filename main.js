const { app, BrowserWindow, ipcMain } = require('electron');
const { Client } = require('node-ssdp');
const http = require('http');
const { URL } = require('url');

// Helper function to extract service URLs from device description XML
function extractServiceURL(xml, serviceType) {
  // Find the service section for the specified service type
  const serviceTypeRegex = new RegExp(`<serviceType>[^<]*${serviceType}[^<]*</serviceType>[\\s\\S]*?<controlURL>([^<]+)</controlURL>`, 'i');
  const match = xml.match(serviceTypeRegex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

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

// Global variables to store discovered devices
let devices = [];
let uniqueDevices = new Map(); // Map to store unique devices by IP address

app.whenReady().then(() => {
  const win = createWindow();

  ipcMain.on('search-tv', () => {
    const client = new Client();
    devices = []; // Reset devices list
    uniqueDevices.clear(); // Clear unique devices map

    client.on('response', (headers, statusCode, rinfo) => {
      console.log('Got a response to an m-search:', headers);
      
      // Log more detailed information for debugging
      if (headers.SERVER) {
        console.log('SERVER header:', headers.SERVER);
      }
      if (headers.LOCATION) {
        console.log('LOCATION header:', headers.LOCATION);
      }
      if (headers.USN) {
        console.log('USN header:', headers.USN);
      }
      
      // Check if it's a Panasonic TV
      if (headers.SERVER && headers.SERVER.includes('Panasonic')) {
        const device = {
          location: headers.LOCATION,
          server: headers.SERVER,
          usn: headers.USN,
          ip: rinfo.address,
          port: rinfo.port
        };
        
        // Skip processing if we already have a device with this IP that has a Panasonic-specific service
        // and this device doesn't have a Panasonic-specific service
        const existingDevice = uniqueDevices.get(device.ip);
        const hasPanasonicService = headers.USN && headers.USN.includes('panasonic-com');
        
        if (existingDevice && existingDevice.hasPanasonicService && !hasPanasonicService) {
          return;
        }
        
        // Store this device's Panasonic service status
        device.hasPanasonicService = hasPanasonicService;
        
        // Get device details
        http.get(headers.LOCATION, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              // Log the full XML response for debugging
              console.log('Device description XML:', data);
              
              // Extract device information from XML
              const friendlyNameMatch = data.match(/<friendlyName>([^<]+)<\/friendlyName>/);
              const manufacturerMatch = data.match(/<manufacturer>([^<]+)<\/manufacturer>/);
              const modelNameMatch = data.match(/<modelName>([^<]+)<\/modelName>/);
              const modelNumberMatch = data.match(/<modelNumber>([^<]+)<\/modelNumber>/);
              const deviceTypeMatch = data.match(/<deviceType>([^<]+)<\/deviceType>/);
              
              // Extract service information
              const serviceTypeMatch = data.match(/<serviceType>([^<]+)<\/serviceType>/g);
              const serviceIdMatch = data.match(/<serviceId>([^<]+)<\/serviceId>/g);
              const controlURLMatch = data.match(/<controlURL>([^<]+)<\/controlURL>/g);
              
              if (serviceTypeMatch) {
                console.log('Service Types:', serviceTypeMatch);
              }
              if (serviceIdMatch) {
                console.log('Service IDs:', serviceIdMatch);
              }
              if (controlURLMatch) {
                console.log('Control URLs:', controlURLMatch);
              }
              
              // Extract service URLs from control URLs
              const avTransportControlURL = extractServiceURL(data, 'AVTransport');
              const renderingControlURL = extractServiceURL(data, 'RenderingControl');
              
              if (avTransportControlURL) {
                console.log('AVTransport Control URL:', avTransportControlURL);
                device.avTransportControlURL = avTransportControlURL;
              }
              if (renderingControlURL) {
                console.log('RenderingControl URL:', renderingControlURL);
                device.renderingControlURL = renderingControlURL;
              }
              
              if (friendlyNameMatch) {
                device.friendlyName = friendlyNameMatch[1];
              }
              if (manufacturerMatch) {
                device.manufacturer = manufacturerMatch[1];
              }
              if (modelNameMatch) {
                device.modelName = modelNameMatch[1];
              }
              if (modelNumberMatch) {
                device.modelNumber = modelNumberMatch[1];
              }
              if (deviceTypeMatch) {
                device.deviceType = deviceTypeMatch[1];
              }
              
              // Store in our unique devices map, prioritizing devices with Panasonic-specific services
              uniqueDevices.set(device.ip, device);
              
              // Don't send updates yet, we'll send the final list after search completes
            } catch (error) {
              console.error('Error parsing device details:', error);
              // Store in our unique devices map
              uniqueDevices.set(device.ip, device);
              // Don't send updates yet
            }
          });
        }).on('error', (error) => {
          console.error('Error getting device details:', error);
          // Store in our unique devices map
          uniqueDevices.set(device.ip, device);
          // Don't send updates yet
        });
      }
    });

    // Search for UPnP devices with multiple search targets to increase discovery chances
    client.search('urn:schemas-upnp-org:device:MediaRenderer:1');
    client.search('urn:schemas-upnp-org:service:AVTransport:1');
    client.search('urn:schemas-upnp-org:service:RenderingControl:1');
    client.search('ssdp:all');  // Try to discover all devices

    // Log the search start
    console.log('Searching for UPnP devices...');
    win.webContents.send('search-status', { status: 'searching', message: 'Searching for UPnP devices...' });

    // Stop searching after 10 seconds (increased from 5 seconds)
    setTimeout(() => {
      client.stop();
      console.log('UPnP device search completed');
      
      // Convert our map of unique devices to an array
      devices = Array.from(uniqueDevices.values());
      
      // Filter devices to prioritize those with p00RemoteController deviceType
      // or MediaRenderer deviceType for control
      const controlDevices = devices.filter(device => 
        device.deviceType === 'urn:panasonic-com:device:p00RemoteController:1' || 
        device.deviceType === 'urn:schemas-upnp-org:device:MediaRenderer:1'
      );
      
      // If we have control devices, only show those
      const devicesToShow = controlDevices.length > 0 ? controlDevices : devices;
      
      // If no devices were found, send a message
      if (devicesToShow.length === 0) {
        win.webContents.send('search-status', { 
          status: 'no-devices', 
          message: 'No Panasonic TVs found. Please ensure your TV is powered on and connected to the same network.' 
        });
      } else {
        win.webContents.send('search-status', { 
          status: 'completed', 
          message: `Found ${devicesToShow.length} Panasonic TV(s)` 
        });
        
        // Send the filtered devices list to the renderer process
        win.webContents.send('tv-found', devicesToShow);
      }
    }, 10000);
  });

  // Panasonic TV key event mapping
  const keyEventMap = {
    // Power
    '⏻': 'NRC_POWER-ONOFF',
    
    // Navigation
    'Menu': 'NRC_MENU-ONOFF',
    'Home': 'NRC_INTERNET-ONOFF', // VIERA connect
    'Back': 'NRC_RETURN-ONOFF',
    
    // Volume
    '+': 'NRC_VOLUP-ONOFF',
    '-': 'NRC_VOLDOWN-ONOFF',
    
    // Channel
    'channel-up': 'NRC_CH_UP-ONOFF',
    'channel-down': 'NRC_CH_DOWN-ONOFF',
    
    // Numbers
    '0': 'NRC_D0-ONOFF',
    '1': 'NRC_D1-ONOFF',
    '2': 'NRC_D2-ONOFF',
    '3': 'NRC_D3-ONOFF',
    '4': 'NRC_D4-ONOFF',
    '5': 'NRC_D5-ONOFF',
    '6': 'NRC_D6-ONOFF',
    '7': 'NRC_D7-ONOFF',
    '8': 'NRC_D8-ONOFF',
    '9': 'NRC_D9-ONOFF',
    
    // Input
    'TV': 'NRC_TV-ONOFF',
    'input-tv': 'NRC_TV-ONOFF',
    'HDMI1': 'NRC_CHG_INPUT-ONOFF', // 入力切替、HDMI1は別途選択が必要かも
    'input-hdmi1': 'NRC_CHG_INPUT-ONOFF',
    'HDMI2': 'NRC_CHG_INPUT-ONOFF', // 入力切替、HDMI2は別途選択が必要かも
    'input-hdmi2': 'NRC_CHG_INPUT-ONOFF',
    
    // Direction
    'up': 'NRC_UP-ONOFF',
    'down': 'NRC_DOWN-ONOFF',
    'left': 'NRC_LEFT-ONOFF',
    'right': 'NRC_RIGHT-ONOFF',
    'enter': 'NRC_ENTER-ONOFF',
    
    // Color buttons
    'red': 'NRC_RED-ONOFF',
    'green': 'NRC_GREEN-ONOFF',
    'yellow': 'NRC_YELLOW-ONOFF',
    'blue': 'NRC_BLUE-ONOFF',
    
    // Other
    'info': 'NRC_INFO-ONOFF',
    'guide': 'NRC_EPG-ONOFF',
    'text': 'NRC_TEXT-ONOFF',
    'subtitles': 'NRC_STTL-ONOFF',
    'mute': 'NRC_MUTE-ONOFF',
    
    // Media control
    'play': 'NRC_PLAY-ONOFF',
    'pause': 'NRC_PAUSE-ONOFF',
    'stop': 'NRC_STOP-ONOFF',
    'rewind': 'NRC_REW-ONOFF',
    'forward': 'NRC_FF-ONOFF',
    'prev': 'NRC_SKIP_PREV-ONOFF',
    'next': 'NRC_SKIP_NEXT-ONOFF',
    'record': 'NRC_REC-ONOFF'
  };

  // Handle TV remote control commands
  ipcMain.on('tv-command', (event, { ip, port, command, avTransportControlURL, renderingControlURL }) => {
    console.log(`Sending command ${command} to TV at ${ip}:${port}`);
    
    // Check if IP is valid
    if (!ip) {
      win.webContents.send('tv-command-result', {
        success: false,
        command,
        message: 'Invalid TV IP address'
      });
      return;
    }
    
    // Always use port 55000 for Panasonic TVs
    const validPort = '55000';
    
    // Log the command details for debugging
    console.log(`Command details - IP: ${ip}, Port: ${validPort}, Command: ${command}`);
    
    // Get the key event for the command
    const keyEvent = keyEventMap[command];
    
    if (!keyEvent) {
      console.log(`Command ${command} not mapped to a key event`);
      win.webContents.send('tv-command-result', {
        success: false,
        command,
        message: `Command ${command} not supported. This will be added in a future update.`
      });
      return;
    }
    
    // Define control URL
    const controlUrl = `http://${ip}:${validPort}/nrc/control_0`;
    
    // Log the control URL for debugging
    console.log(`Control URL: ${controlUrl}, Key Event: ${keyEvent}`);
    
    // Create SOAP request
    const soapAction = '"urn:panasonic-com:service:p00NetworkControl:1#X_SendKey"';
    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <s:Body>
          <u:X_SendKey xmlns:u="urn:panasonic-com:service:p00NetworkControl:1">
            <X_KeyEvent>${keyEvent}</X_KeyEvent>
          </u:X_SendKey>
        </s:Body>
      </s:Envelope>`;
    
    // Send SOAP request
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset="utf-8"',
        'SOAPAction': soapAction
      }
    };
    
    const req = http.request(controlUrl, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        win.webContents.send('tv-command-result', {
          success: res.statusCode === 200,
          command,
          message: res.statusCode === 200 ? 
            `Command ${command} sent successfully` : 
            `Error sending command: ${res.statusCode}`
        });
      });
    });
    
    req.on('error', (error) => {
      console.error('Error sending command:', error);
      win.webContents.send('tv-command-result', {
        success: false,
        command,
        message: `Error sending command: ${error.message}`
      });
    });
    
    req.write(soapBody);
    req.end();
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
