import { BrowserWindow, app, ipcMain, screen, Menu, dialog, Tray } from "electron";
import * as path from "path";
import * as url from "url";
import Node from "@noia-network/node";

let isRestarting: boolean = false;
let win: BrowserWindow | undefined, serve;
let tray: Tray | undefined;
const args = process.argv.slice(1);
serve = args.some(val => val === "--serve");

try {
  require("dotenv").config();
} catch {
  console.log("asar");
}

function createWindow() {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;
  // width: size.width,
  // height: size.height
  // Create the browser window.
  win = new BrowserWindow({
    resizable: false,
    x: 0,
    y: 0,
    width: 726 + 8 - 2,
    height: 427 + 51 - 20 - 2,
    icon: path.join(__dirname, "src/assets/noia-icon.png")
  });

  if (process.platform === "darwin") {
    // Create our menu entries so that we can use MAC shortcuts
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: "Edit",
          submenu: [
            { role: "undo" },
            { role: "redo" },
            { type: "separator" },
            { role: "cut" },
            { role: "copy" },
            { role: "paste" },
            { role: "pasteandmatchstyle" },
            { role: "delete" },
            { role: "selectall" }
          ]
        }
      ])
    );
  } else {
    win.setMenu(null);
  }

  if (serve) {
    require("electron-reload")(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL("http://localhost:4200");
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, "dist/index.html"),
        protocol: "file:",
        slashes: true
      })
    );
  }

  // win.webContents.openDevTools()

  win.on("close", event => {
    if (process.platform === "win32" && !isRestarting) {
      event.preventDefault();

      if (win != null) {
        win.hide();
      }
    }
  });

  // Emitted when the window is closed.
  win.on("closed", async (event: Event) => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = undefined;

    if (node != null) {
      await node.stop();
      process.exit(0);
    }
  });
}

function createTray(): void {
  if (process.platform !== "win32") {
    return;
  }

  tray = new Tray(path.join(__dirname, "src/assets/noia-icon.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show/Hide",
      click: menuItem => {
        if (win == null) {
          return;
        }

        if (win.isVisible()) {
          win.hide();
        } else {
          win.show();
        }
      }
    },
    { type: "separator" },
    {
      label: "Quit",
      click: menuItem => {
        if (win != null) {
          console.log("Window closed from context menu.");
          win.destroy();
          win = undefined;
        }
      }
    }
  ]);
  tray.setToolTip("NOIA Network Node");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (win == null) {
      return;
    }

    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", () => {
    createWindow();
    createTray();
  });

  // Quit when all windows are closed.
  app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win == null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}

// Node

// TODO: refactor.

let node: Node | undefined;
let speedInterval;
let walletInterval;
let autoReconnectInterval;
let secondsLeft;
let autoReconnect = true;
let nodeStatus = "stopped";
ipcMain.on("nodeInit", () => {
  if (win && win.webContents) {
    win.webContents.send("nodeStatus", nodeStatus);
    win.webContents.send("autoReconnect", autoReconnect);
  }
  if (node) {
    if (win && win.webContents) {
      updateWallet();
      updateSettings();
    }
    return;
  }

  console.log("[NODE]: initializing node...");
  node = new Node({
    userDataPath: app.getPath("userData")
  });

  updateSettings();
  updateWallet();
  refreshBalance();
  node.on("started", () => {
    console.log("[NODE]: started.");
    speedInterval = setInterval(() => {
      if (win && win.webContents) {
        win.webContents.send("downloadSpeed", node.contentsClient.downloadSpeed);
      }
      if (win && win.webContents) {
        win.webContents.send("uploadSpeed", node.contentsClient.uploadSpeed);
      }
    }, 250);
  });
  node.master.on("connected", () => {
    updateNodeStatus("running");
    console.log("[NODE]: connected to master.");
  });
  node.master.on("closed", info => {
    if (info && info.code !== 1000) {
      if (info && info.code === 1002) {
        console.log(`[NODE]: connection with master closed, info =`, info);
        if (win && win.webContents) {
          win.webContents.send("alertError", info.reason);
        }
      }
      checkInternet(isConnected => {
        const isConnectedPrefix = isConnected ? "" : "No internet connection, please connect to the internet. ";
        console.log(`[NODE]: connection with master closed, info =`, info);
        if (win && win.webContents) {
          win.webContents.send("autoReconnect", autoReconnect);
        }
        const seconds = 60;
        if (autoReconnect) {
          secondsLeft = seconds;
          if (autoReconnectInterval) {
            clearTimeout(autoReconnectInterval);
          }

          autoReconnectInterval = setInterval(() => {
            secondsLeft -= 1;
            if (secondsLeft <= 0) {
              nodeStart();
            }
            updateNodeStatus("reconnecting", secondsLeft);
          }, 1 * 1000);
        }
        const autoReconnectPostfix = autoReconnect ? `, will try to reconnect in  ${seconds} seconds` : "";
        if (win && win.webContents) {
          win.webContents.send("alertError", `${isConnectedPrefix}Failed to connect to master${autoReconnectPostfix}`);
        }
      });
      node.stop();
    } else {
      console.log(`[NODE]: connection with master closed, normal exit`);
    }
  });
  ipcMain.on("setAutoReconnect", (sender, isAutoReconnect) => {
    autoReconnect = isAutoReconnect;
  });
  node.master.on("cache", info => {
    console.log(`[NODE][IN]: cache request, resource = ${info.source.url}`);
  });
  node.master.on("clear", info => {
    console.log(`[NODE][IN]: clear request, infoHashes = ${info.infoHashes}`);
  });
  node.master.on("seed", info => {
    console.log("[NODE][IN]: seed request.");
  });
  if (node.clientSockets.http) {
    node.clientSockets.http.on("listening", info => {
      console.log(`[NODE]: listening for HTTP requests on port ${info.port}.`);
    });
  }
  if (node.clientSockets.ws) {
    node.clientSockets.ws.on("listening", info => {
      console.log(`[NODE]: listening for ${info.ssl ? "WSS" : "WS"} requests on port ${info.port}.`);
    });
    node.clientSockets.ws.on("connections", count => {
      console.log(`[NODE]: WS Clients connections = ${count}`);
      if (win && win.webContents) {
        win.webContents.send("connections", count);
      }
    });
  }
  node.contentsClient.on("seeding", infoHashes => {
    console.log("[NODE]: seeding contents =", infoHashes);
    node.storageSpace.stats().then(stats => {
      console.log("[NODE]: Storage usage =", stats);
      if (win && win.webContents) {
        win.webContents.send("winStorageInfo", stats);
      }
    });
  });
  node.clientSockets.on("resourceSent", info => {
    // TODO: info.resource.url isn"t reliable, also seems like insufficient data is emited
    const client = `client ${info.ip}`;
    const resource = `resource = ${info.resource.infoHash}`;
    const resourceUrl = `url = ${info.resource.url}`;
    const uploaded = `size = ${info.resource.size}`;
    const uploadedMB = `size = ${info.resource.size / 1000 / 1000}`;
    if (info.resource.url) {
      console.log(`[NODE]: HTTP sent to ${client} ${resource} ${uploadedMB} ${resourceUrl}`);
    } else {
      console.log(`[NODE]: WS sent to ${client} ${resource} ${uploadedMB}`);
    }
  });
  const totalTimeInterval = setInterval(() => {
    const totalTimeConnected = node.statistics.get(node.statistics.Options.totalTimeConnected);
    if (win && win.webContents) {
      win.webContents.send("timeConnected", totalTimeConnected);
    }
  }, 1 * 1000);
  if (win && win.webContents) {
    win.webContents.send("downloaded", node.statistics.get(node.statistics.Options.totalDownloaded));
  }
  node.contentsClient.on("downloaded", downloaded => {
    const totalDownloaded = node.statistics.get(node.statistics.Options.totalDownloaded);
    if (win && win.webContents) {
      win.webContents.send("downloaded", totalDownloaded);
    }
  });
  if (win && win.webContents) {
    win.webContents.send("uploaded", node.statistics.get(node.statistics.Options.totalUploaded));
  }
  node.contentsClient.on("uploaded", uploaded => {
    const totalUploaded = node.statistics.get(node.statistics.Options.totalUploaded);
    if (win && win.webContents) {
      win.webContents.send("uploaded", totalUploaded);
    }
  });
  node.on("destroyed", () => {
    console.log("[NODE]: stopped.");
  });
  node.on("stopped", () => {
    console.log("[NODE]: stopping...");
    updateNodeStatus("stopped");
    if (speedInterval) {
      clearInterval(speedInterval);
      speedInterval = null;
    }
  });
  node.on("error", error => {
    const errorPrefix = "Error has occured:";
    if (win && win.webContents) {
      if (error.code === "EADDRINUSE") {
        const errorMessage = `${error.port} is already in use. Please choose another port.`;
        win.webContents.send("alertError", `${errorPrefix} ${errorMessage}`);
      } else {
        win.webContents.send("alertError", `${errorPrefix} ${error.message}`);
      }
    }
    console.log("[NODE]: error =", error);
  });
  console.log("[NODE]: initialized.");
});

ipcMain.on("setWallet", (sender, wallet) => {
  node.setWallet(wallet);
});

ipcMain.on("nodeStart", info => {
  nodeStart();
});

ipcMain.on("nodeMasterConnect", () => {
  console.log("[NODE]: connecting to master...");
  // TODO: Fix any.
  (node as any).master.connect();
});

ipcMain.on("nodeStorageInfo", () => {
  node.storageSpace.stats().then(stats => {
    console.log("[NODE]: Storage usage =", stats);
    if (win && win.webContents) {
      win.webContents.send("winStorageInfo", stats);
    }
  });
});

ipcMain.on("nodeStop", () => {
  node.stop();
});

ipcMain.on("restartApp", () => {
  isRestarting = true;
  app.relaunch();
  app.quit();
});

function nodeStart() {
  if (autoReconnectInterval) {
    clearInterval(autoReconnectInterval);
  }
  console.log("[NODE]: starting...");
  updateNodeStatus("starting");
  node.start();
}

function updateNodeStatus(status, seconds?: number) {
  nodeStatus = status;
  if (win && win.webContents) {
    win.webContents.send("nodeStatus", nodeStatus, seconds);
  }
}

function updateSettings() {
  // Temporarily set default public master address to minimise steps for user
  node.settings.update(node.settings.Options.masterAddress, "ws://csl-masters.noia.network:5565", ""); // TODO: expose to settings
  ipcMain.on("settingsUpdate", (sender, key, value) => {
    node.settings.update(key, value);
  });
  if (win && win.webContents) {
    // TODO: Fix any
    win.webContents.send("settings", (node as any).settings.get());
  }
}

function updateWallet() {
  if (node.settings.get(node.settings.Options.skipBlockchain)) {
    if (win && win.webContents) {
      win.webContents.send("wallet", node.settings.get(node.settings.Options.walletAddress));
    }
  } else {
    node.wallet
      ._ready()
      .then(() => {
        _getBalance();
        if (win && win.webContents) {
          win.webContents.send("wallet", node.wallet.address);
        }
      })
      .catch((err: Error) => {
        console.log("failed to get wallet", err.message);
      });
  }
}

function refreshBalance() {
  walletInterval = setInterval(() => _getBalance(), 30 * 1000);
  ipcMain.on("refreshBalance", () => {
    node.wallet._ready().then(() => {
      _getBalance();
    });
  });
}

function _getBalance() {
  node.getBalance().then(balance => {
    if (win && win.webContents) {
      win.webContents.send("walletBalance", balance);
    }
  });
  node.getEthBalance().then(ethBalance => {
    if (win && win.webContents) {
      win.webContents.send("walletEthBalance", ethBalance);
    }
  });
}

function checkInternet(cb) {
  require("dns").lookupService("8.8.8.8", 53, err => {
    if (err && ["ENOTFOUND", "EAI_AGAIN"].includes(err.code)) {
      cb(false);
    } else {
      cb(true);
    }
  });
}
