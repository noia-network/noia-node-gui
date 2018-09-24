export const enum NodeSettingsKeys {
    StatisticsPath = "statisticsPath",
    StorageDir = "storage.dir",
    StorageSize = "storage.size",
    Domain = "domain",
    Ssl = "ssl",
    SslPrivateKeyPath = "ssl.privateKeyPath",
    SslCrtPath = "ssl.crtPath",
    SslCrtBundlePath = "ssl.crtBundlePath",
    PublicIp = "publicIp",
    NatPmp = "natPmp",
    Http = "sockets.http",
    HttpIp = "sockets.http.ip",
    HttpPort = "sockets.http.port",
    Ws = "sockets.ws",
    WsIp = "sockets.ws.ip",
    WsPort = "sockets.ws.port",
    Wrtc = "sockets.wrtc",
    WrtcControlPort = "sockets.wrtc.control.port",
    WrtcControlIp = "sockets.wrtc.control.ip",
    WrtcDataPort = "sockets.wrtc.data.port",
    WrtcDataIp = "sockets.wrtc.data.ip",
    WalletAddress = "wallet.address",
    WalletMnemonic = "wallet.mnemonic",
    WalletProviderUrl = "wallet.providerUrl",
    Client = "client",
    MasterAddress = "masterAddress",
    WhitelistMasters = "whitelist.masters",
    Controller = "controller",
    ControllerIp = "controller.ip",
    ControllerPort = "controller.port",
    SkipBlockchain = "skipBlockchain"
}

export const enum GuiSettingsKeys {
    MinimizeToTray = "gui.minimizeToTray",
    AutoReconnect = "gui.autoReconnect"
}
