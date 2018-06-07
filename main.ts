import { BrowserWindow, app, ipcMain, screen, Menu } from "electron"
import * as path from "path";
import * as url from "url";
const Node = require("noia-node")
let node

let win, serve;
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
    Menu.setApplicationMenu(Menu.buildFromTemplate([
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
    ]));
  } else {
    win.setMenu(null)
  }

  if (serve) {
    require("electron-reload")(__dirname, {
     electron: require(`${__dirname}/node_modules/electron`)});
    win.loadURL("http://localhost:4200");
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, "dist/index.html"),
      protocol: "file:",
      slashes: true
    }));
  }

  // win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on("closed", () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", createWindow);

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
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

// Node

// TODO: refactor.

let speedInterval
let walletInterval
ipcMain.on("nodeInit", () => {
  console.log("[NODE]: initializing node...")
  node = new Node({
    userDataPath: app.getPath("userData")
  })

  // Temporarily set default public master address to minimise steps for user
  node.settings.update(node.settings.Options.masterAddress, "ws://csl-masters.noia.network:5565", "") // TODO: expose to settings
  ipcMain.on("settingsUpdate", (sender, key, value) => {
    node.settings.update(key, value)
  })
  win.webContents.send("settings", node.settings.get())
  if (node.settings.get(node.settings.Options.skipBlockchain)) {
    win.webContents.send("wallet", node.settings.get(node.settings.Options.walletAddress))
  } else {
    node.wallet._ready()
      .then(() => {
        _getBalance()
        win.webContents.send("wallet", node.wallet.address)
      })
      .catch((err: Error) => {
        console.log("failed to get wallet", err.message)
      })
  }
  walletInterval = setInterval(() => _getBalance(), 30 * 1000)
  function _getBalance () {
    node.getBalance().then(balance => {
      win.webContents.send("walletBalance", balance)
    })
    node.getEthBalance().then(ethBalance => {
      win.webContents.send("walletEthBalance", ethBalance)
    })
  }
  ipcMain.on("refreshBalance", () => {
    node.wallet._ready().then(() => {
      _getBalance()
    })
  })
  node.on("started", () => {
    console.log("[NODE]: started.")
    speedInterval = setInterval(() => {
      if (win && win.webContents)  {
        win.webContents.send("downloadSpeed", node.contentsClient.downloadSpeed)
      }
      if (win && win.webContents) {
        win.webContents.send("uploadSpeed", node.contentsClient.uploadSpeed)
      }
    }, 250)
  })
  node.master.on("connected", () => {
    win.webContents.send("nodeStarted")
    console.log("[NODE]: connected to master.")
  })
  node.master.on("closed", (info) => {
    if (info && info.code !== 1000) {
      if (info && info.code === 1002) {
        console.log(`[NODE]: connection with master closed, info =`, info)
        win.webContents.send("alertError", info.reason)
      } else {
        console.log(`[NODE]: connection with master closed, info =`, info)
        win.webContents.send("alertError", "Failed to connect to master")
      }
      nodeStop()
    } else {
      console.log(`[NODE]: connection with master closed, normal exit`)
    }
  })
  node.master.on("cache", (info) => {
    console.log(`[NODE][IN]: cache request, resource = ${info.source.url}`)
  })
  node.master.on("clear", (info) => {
    console.log(`[NODE][IN]: clear request, infoHashes = ${info.infoHashes}`)
  })
  node.master.on("seed", (info) => {
    console.log("[NODE][IN]: seed request.")
  })
  if (node.clientSockets.http) {
    node.clientSockets.http.on("listening", (info) => {
      console.log(`[NODE]: listening for HTTP requests on port ${info.port}.`)
    })
  }
  if (node.clientSockets.ws) {
    node.clientSockets.ws.on("listening", (info) => {
      console.log(`[NODE]: listening for ${info.ssl ? "WSS" : "WS"} requests on port ${info.port}.`)
    })
    node.clientSockets.ws.on("connections", count => {
      console.log(`[NODE]: WS Clients connections = ${count}`)
      win.webContents.send("connections", count)
    })
  }
  node.contentsClient.on("seeding", (infoHashes) => {
    console.log("[NODE]: seeding contents =", infoHashes)
    node.storageSpace.stats()
    .then((stats) => {
      console.log("[NODE]: Storage usage =", stats)
      win.webContents.send("winStorageInfo", stats)
    })
  })
  node.clientSockets.on("resourceSent", (info) => {
    // TODO: info.resource.url isn"t reliable, also seems like insufficient data is emited
    const client = `client ${info.ip}`
    const resource = `resource = ${info.resource.infoHash}`
    const resourceUrl = `url = ${info.resource.url}`
    const uploaded = `size = ${info.resource.size}`
    const uploadedMB = `size = ${info.resource.size / 1000 / 1000}`
    if (info.resource.url) {
      console.log(`[NODE]: HTTP sent to ${client} ${resource} ${uploadedMB} ${resourceUrl}`)
    } else {
      console.log(`[NODE]: WS sent to ${client} ${resource} ${uploadedMB}`)
    }
  })
  const totalTimeInterval = setInterval(() => {
    const totalTimeConnected = node.statistics.get(node.statistics.Options.totalTimeConnected)
    if (win && win.webContents) {
      win.webContents.send("timeConnected", totalTimeConnected)
    }
  }, 1 * 1000)
  win.webContents.send("downloaded", node.statistics.get(node.statistics.Options.totalDownloaded))
  node.contentsClient.on("downloaded", (downloaded) => {
    const totalDownloaded = node.statistics.get(node.statistics.Options.totalDownloaded)
    win.webContents.send("downloaded", totalDownloaded)
  })
  win.webContents.send("uploaded", node.statistics.get(node.statistics.Options.totalUploaded))
  node.contentsClient.on("uploaded", (uploaded) => {
    const totalUploaded = node.statistics.get(node.statistics.Options.totalUploaded)
    win.webContents.send("uploaded", totalUploaded)
  })
  node.on("destroyed", () => {
    console.log("[NODE]: stopped.")
  })
  node.on("error", (error) => {
    console.log("[NODE]: error =", error)
  })
  console.log("[NODE]: initialized.")
})

ipcMain.on("setWallet", (sender, wallet) => {
  node.setWallet(wallet)
})

ipcMain.on("nodeStart", (info) => {
  console.log("[NODE]: starting...")
  win.webContents.send("nodeStarting")
  node.start()
})

ipcMain.on("nodeMasterConnect", () => {
  console.log("[NODE]: connecting to master...")
  node.master.connect()
})

ipcMain.on("nodeStorageInfo", () => {
  node.storageSpace.stats()
    .then((stats) => {
      console.log("[NODE]: Storage usage =", stats)
      win.webContents.send("winStorageInfo", stats)
    })
})

ipcMain.on("nodeStop", () => {
  nodeStop()
})

function nodeStop () {
  win.webContents.send("nodeStopped")
  if (speedInterval) {
    clearInterval(speedInterval)
    speedInterval = null
  }

  console.log("[NODE]: stopping...")
  node.stop()
}
