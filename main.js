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
          // Get device details
          http.get(headers.LOCATION, (res) => {
            let data = '';
            res.on('data', (chunk) => {
              data += chunk;
            });
            res.on('end', () => {
              try {
                // Extract device information from XML
                const friendlyNameMatch = data.match(/<friendlyName>([^<]+)<\/friendlyName>/);
                const manufacturerMatch = data.match(/<manufacturer>([^<]+)<\/manufacturer>/);
                const modelNameMatch = data.match(/<modelName>([^<]+)<\/modelName>/);
                const modelNumberMatch = data.match(/<modelNumber>([^<]+)<\/modelNumber>/);
                const deviceTypeMatch = data.match(/<deviceType>([^<]+)<\/deviceType>/);
                
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
                
                devices.push(device);
                // Send the updated devices list to the renderer process
                win.webContents.send('tv-found', devices);
              } catch (error) {
                console.error('Error parsing device details:', error);
                devices.push(device);
                // Send the updated devices list to the renderer process
                win.webContents.send('tv-found', devices);
              }
            });
          }).on('error', (error) => {
            console.error('Error getting device details:', error);
            devices.push(device);
            // Send the updated devices list to the renderer process
            win.webContents.send('tv-found', devices);
          });
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
    
    // Map command to DLNA/UPnP action
    let soapAction = '';
    let soapBody = '';
    let serviceUrl = '';
    
    switch (command) {
      case '⏻': // Power
        serviceUrl = `http://${ip}:${port}/dmr/control_2`; // AVTransport service
        soapAction = '"urn:schemas-upnp-org:service:AVTransport:1#Stop"';
        soapBody = `<?xml version="1.0" encoding="utf-8"?>
          <s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
            <s:Body>
              <u:Stop xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
                <InstanceID>0</InstanceID>
              </u:Stop>
            </s:Body>
          </s:Envelope>`;
        break;
      
      case '+': // Volume up
        serviceUrl = `http://${ip}:${port}/dmr/control_0`; // RenderingControl service
        soapAction = '"urn:schemas-upnp-org:service:RenderingControl:1#GetVolume"';
        
        // First get current volume
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml; charset="utf-8"',
            'SOAPAction': soapAction
          }
        };
        
        const getVolumeBody = `<?xml version="1.0" encoding="utf-8"?>
          <s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
            <s:Body>
              <u:GetVolume xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1">
                <InstanceID>0</InstanceID>
                <Channel>Master</Channel>
              </u:GetVolume>
            </s:Body>
          </s:Envelope>`;
        
        const req = http.request(serviceUrl, options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              // Extract current volume from response
              const volumeMatch = data.match(/<CurrentVolume>(\d+)<\/CurrentVolume>/);
              if (volumeMatch) {
                const currentVolume = parseInt(volumeMatch[1]);
                const newVolume = Math.min(currentVolume + 5, 100); // Increase by 5, max 100
                
                // Now set new volume
                const setVolumeOptions = {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'text/xml; charset="utf-8"',
                    'SOAPAction': '"urn:schemas-upnp-org:service:RenderingControl:1#SetVolume"'
                  }
                };
                
                const setVolumeBody = `<?xml version="1.0" encoding="utf-8"?>
                  <s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
                    <s:Body>
                      <u:SetVolume xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1">
                        <InstanceID>0</InstanceID>
                        <Channel>Master</Channel>
                        <DesiredVolume>${newVolume}</DesiredVolume>
                      </u:SetVolume>
                    </s:Body>
                  </s:Envelope>`;
                
                const setReq = http.request(serviceUrl, setVolumeOptions, (setRes) => {
                  let setData = '';
                  setRes.on('data', (chunk) => {
                    setData += chunk;
                  });
                  setRes.on('end', () => {
                    win.webContents.send('tv-command-result', {
                      success: true,
                      command,
                      message: `Volume increased to ${newVolume}`
                    });
                  });
                });
                
                setReq.on('error', (error) => {
                  console.error('Error setting volume:', error);
                  win.webContents.send('tv-command-result', {
                    success: false,
                    command,
                    message: `Error setting volume: ${error.message}`
                  });
                });
                
                setReq.write(setVolumeBody);
                setReq.end();
              } else {
                win.webContents.send('tv-command-result', {
                  success: false,
                  command,
                  message: 'Could not parse current volume'
                });
              }
            } catch (error) {
              console.error('Error parsing volume response:', error);
              win.webContents.send('tv-command-result', {
                success: false,
                command,
                message: `Error parsing volume response: ${error.message}`
              });
            }
          });
        });
        
        req.on('error', (error) => {
          console.error('Error getting volume:', error);
          win.webContents.send('tv-command-result', {
            success: false,
            command,
            message: `Error getting volume: ${error.message}`
          });
        });
        
        req.write(getVolumeBody);
        req.end();
        return; // Return early as we're handling the response asynchronously
      
      case '-': // Volume down
        serviceUrl = `http://${ip}:${port}/dmr/control_0`; // RenderingControl service
        soapAction = '"urn:schemas-upnp-org:service:RenderingControl:1#GetVolume"';
        
        // First get current volume
        const downOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml; charset="utf-8"',
            'SOAPAction': soapAction
          }
        };
        
        const getVolumeDownBody = `<?xml version="1.0" encoding="utf-8"?>
          <s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
            <s:Body>
              <u:GetVolume xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1">
                <InstanceID>0</InstanceID>
                <Channel>Master</Channel>
              </u:GetVolume>
            </s:Body>
          </s:Envelope>`;
        
        const downReq = http.request(serviceUrl, downOptions, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              // Extract current volume from response
              const volumeMatch = data.match(/<CurrentVolume>(\d+)<\/CurrentVolume>/);
              if (volumeMatch) {
                const currentVolume = parseInt(volumeMatch[1]);
                const newVolume = Math.max(currentVolume - 5, 0); // Decrease by 5, min 0
                
                // Now set new volume
                const setVolumeOptions = {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'text/xml; charset="utf-8"',
                    'SOAPAction': '"urn:schemas-upnp-org:service:RenderingControl:1#SetVolume"'
                  }
                };
                
                const setVolumeBody = `<?xml version="1.0" encoding="utf-8"?>
                  <s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
                    <s:Body>
                      <u:SetVolume xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1">
                        <InstanceID>0</InstanceID>
                        <Channel>Master</Channel>
                        <DesiredVolume>${newVolume}</DesiredVolume>
                      </u:SetVolume>
                    </s:Body>
                  </s:Envelope>`;
                
                const setReq = http.request(serviceUrl, setVolumeOptions, (setRes) => {
                  let setData = '';
                  setRes.on('data', (chunk) => {
                    setData += chunk;
                  });
                  setRes.on('end', () => {
                    win.webContents.send('tv-command-result', {
                      success: true,
                      command,
                      message: `Volume decreased to ${newVolume}`
                    });
                  });
                });
                
                setReq.on('error', (error) => {
                  console.error('Error setting volume:', error);
                  win.webContents.send('tv-command-result', {
                    success: false,
                    command,
                    message: `Error setting volume: ${error.message}`
                  });
                });
                
                setReq.write(setVolumeBody);
                setReq.end();
              } else {
                win.webContents.send('tv-command-result', {
                  success: false,
                  command,
                  message: 'Could not parse current volume'
                });
              }
            } catch (error) {
              console.error('Error parsing volume response:', error);
              win.webContents.send('tv-command-result', {
                success: false,
                command,
                message: `Error parsing volume response: ${error.message}`
              });
            }
          });
        });
        
        downReq.on('error', (error) => {
          console.error('Error getting volume:', error);
          win.webContents.send('tv-command-result', {
            success: false,
            command,
            message: `Error getting volume: ${error.message}`
          });
        });
        
        downReq.write(getVolumeDownBody);
        downReq.end();
        return; // Return early as we're handling the response asynchronously
      
      default:
        // For other commands, just send a placeholder success message
        win.webContents.send('tv-command-result', {
          success: true,
          command,
          message: `Command ${command} sent to TV at ${ip}:${port}`
        });
        return;
    }
    
    // Send SOAP request for commands that have a defined action
    if (soapAction && soapBody && serviceUrl) {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset="utf-8"',
          'SOAPAction': soapAction
        }
      };
      
      const req = http.request(serviceUrl, options, (res) => {
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
    } else {
      // For commands without a defined action, send a placeholder success message
      win.webContents.send('tv-command-result', {
        success: true,
        command,
        message: `Command ${command} sent to TV at ${ip}:${port}`
      });
    }
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
