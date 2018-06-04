import { Injectable, NgZone } from "@angular/core"
import { ipcRenderer } from "electron"
import { Subject } from "rxjs/Subject"
import { differenceInSeconds, differenceInHours, differenceInMinutes } from "date-fns"
import { ToastrService } from "ngx-toastr"

export enum NodeStatuses {
  stopped = "Connect",
  starting = "Connecting...",
  running = "Connected"
}

@Injectable()
export class NodeService {
  ipcRenderer: typeof ipcRenderer
  status: NodeStatuses = NodeStatuses.stopped
  timeConnected = "00:00:00"
  interval
  startedTime
  currentTime
  public nodeStatuses = NodeStatuses

  // Observable string sources
  private connectionsAnnouncedSource = new Subject<any>()
  private statusAnnouncedSource = new Subject<any>()
  private storageAnnouncedSource = new Subject<any>()
  private downloadSpeedAnnouncedSource = new Subject<any>()
  private downloadedAnnouncedSource = new Subject<any>()
  private uploadSpeedAnnouncedSource = new Subject<any>()
  private uploadedAnnouncedSource = new Subject<any>()
  private timeConnectedAnnouncedSource = new Subject<any>()
  private walletAnnouncedSource = new Subject<any>()
  private walletBalanceAnnouncedSource = new Subject<any>()
  private walletEthBalanceAnnouncedSource = new Subject<any>()

  // Observable string streams
  connectionsAnnounced$ = this.connectionsAnnouncedSource.asObservable()
  statusAnnounced$ = this.statusAnnouncedSource.asObservable()
  storageAnnounced$ = this.storageAnnouncedSource.asObservable()
  downloadSpeedAnnounced$ = this.downloadSpeedAnnouncedSource.asObservable()
  downloadedAnnounced$ = this.downloadedAnnouncedSource.asObservable()
  uploadSpeedAnnounced$ = this.uploadSpeedAnnouncedSource.asObservable()
  uploadedAnnounced$ = this.uploadedAnnouncedSource.asObservable()
  timeConnectedAnnounced$ = this.timeConnectedAnnouncedSource.asObservable()
  walletAnnounced$ = this.walletAnnouncedSource.asObservable()
  walletBalanceAnnounced$ = this.walletBalanceAnnouncedSource.asObservable()
  walletEthBalanceAnnounced$ = this.walletEthBalanceAnnouncedSource.asObservable()

  sslPrivateKey: string
  sslCrt: string
  sslCrtBundle: string

  private _storage = {
    total: 0,
    available: 0,
    used: 0
  }
  get storage() {
    return this._storage
  }
  set storage(value) {
    this._storage = value
  }

  public connections = 0
  public downloadSpeed = 0
  public downloaded = 0
  public uploadSpeed = 0
  public uploaded = 0

  private _storageDirectory: string
  get storageDirectory(): string {
    return this._storageDirectory
  }
  set storageDirectory(value: string) {
    this._storageDirectory = value
  }
  private _wsPort: string
  get wsPort(): string {
    return this._wsPort
  }
  set wsPort(value: string) {
    this._wsPort = value
  }

  public wallet = "loading..."
  public walletBalance = "loading..."
  public walletEthBalance = "loading..."

  constructor(
    private toastr: ToastrService,
    private zone: NgZone
  ) {
    this.announceStorage(this.storage)
    if (this.isElectron()) {
      this.ipcRenderer = window.require("electron").ipcRenderer
    }
    this.ipcRenderer.on("alertError", (sender, message) => {
      this.zone.run(() => {
        this.toastr.error(message)
      })
    })
    this.init()
  }

  isElectron = () => {
    return window && window.process && window.process.type
  }

  updateSettings (key, value) {
    if (key === "storage.dir") {
      this.storageDirectory = value
    }
    if (key === "sockets.ws.port") {
      this.wsPort = value
    }
    this.ipcRenderer.send("settingsUpdate", key, value)
  }

  setWallet (value) {
    this.wallet = value
    this.ipcRenderer.send("setWallet", this.wallet)
  }

  refreshBalance () {
    this.ipcRenderer.send("refreshBalance")
  }

  init () {
    this.ipcRenderer.send("nodeInit")
    this.ipcRenderer.send("nodeStorageInfo")
    this.ipcRenderer.on("connections", (sender, connections) => {
      this.connections = connections
      this.announceConnections(connections)
    })
    this.ipcRenderer.on("wallet", (sender, wallet) => {
      this.wallet = wallet
      this.announceWallet(wallet)
    })
    this.ipcRenderer.on("walletBalance", (sender, walletBalance) => {
      this.walletBalance = walletBalance
      this.announceWalletBalance(walletBalance)
    })
    this.ipcRenderer.on("walletEthBalance", (sender, walletEthBalance) => {
      this.walletEthBalance = walletEthBalance
      this.announceWalletEthBalance(walletEthBalance)
    })
    this.ipcRenderer.on("winStorageInfo", (sender, storage) => {
      this.storage = storage
      this.announceStorage(storage)
    })
    this.ipcRenderer.on("uploaded", (sender, uploaded) => {
      this.uploaded = uploaded
      this.announceUploaded(this.uploaded)
    })
    this.ipcRenderer.on("uploadSpeed", (sender, uploadSpeed) => {
      this.uploadSpeed = uploadSpeed
      this.announceUploadSpeed(uploadSpeed)
    })
    this.ipcRenderer.on("timeConnected", (sender, timeConnected) => {
      this.updateTimeConnected(timeConnected)
    })
    this.ipcRenderer.on("downloaded", (sender, downloaded) => {
      this.downloaded = downloaded
      this.announceDownloaded(this.downloaded)
    })
    this.ipcRenderer.on("downloadSpeed", (sender, downloadSpeed) => {
      this.downloadSpeed = downloadSpeed
      this.announceDownloadSpeed(downloadSpeed)
    })
    this.ipcRenderer.on("settings", (sender, settings) => {
      this.wsPort = settings["sockets.ws.port"]
      this.storageDirectory = settings["storage.dir"]
      this.sslPrivateKey = settings["ssl.privateKeyPath"]
      this.sslCrt = settings["ssl.crtPath"]
      this.sslCrtBundle = settings["ssl.crtBundlePath"]
    })
    this.ipcRenderer.on("nodeStarted", () => {
      this.announceStatus(NodeStatuses.running)
    })
    this.ipcRenderer.on("nodeStarting", () => {
      this.announceStatus(NodeStatuses.starting)
    })
    this.ipcRenderer.on("nodeStopped", () => {
      this.announceDownloadSpeed(0)
      this.announceUploadSpeed(0)
      this.announceStatus(NodeStatuses.stopped)
    })
  }

  start () {
    this.ipcRenderer.send("nodeStart")
    // this.ipcRenderer.send("nodeMasterConnect")
  }

  // masterConnect () {
  //   this.ipcRenderer.send("nodeMasterConnect")
  // }

  storageInfo () {
    this.ipcRenderer.send("nodeStorageInfo")
  }

  stop () {
    this.ipcRenderer.send("nodeStop")
  }

  updateTimeConnected(timeInSeconds) {
    const seconds = timeInSeconds % 60 + ""
    const minutes = Math.floor(timeInSeconds / (60)) + ""
    const hours = Math.floor(timeInSeconds / (60 * 24)) + ""
    const secondsString = seconds.length === 1 ? `0${seconds}` : seconds
    const minutesString = minutes.length === 1 ? `0${minutes}` : minutes
    const hoursString = hours.length === 1 ? `0${hours}` : hours
    this.announceTimeConnected(`${hoursString}:${minutesString}:${secondsString}`)
  }

  announceConnections(connections: number) {
    this.connections = connections
    this.connectionsAnnouncedSource.next(connections)
  }
  announceWallet(wallet: string) {
    this.wallet = wallet
    this.walletAnnouncedSource.next(wallet)
  }
  announceWalletBalance(walletBalance: string) {
    this.walletBalance = walletBalance
    this.walletBalanceAnnouncedSource.next(walletBalance)
  }
  announceWalletEthBalance(walletEthBalance: string) {
    this.walletEthBalance = walletEthBalance
    this.walletEthBalanceAnnouncedSource.next(walletEthBalance)
  }
  announceStatus(status: NodeStatuses) {

    this.status = status
    this.statusAnnouncedSource.next(status)
  }
  announceTimeConnected(timeConnected: string) {
    this.timeConnected = timeConnected
    this.timeConnectedAnnouncedSource.next(timeConnected)
  }
  announceStorage(storage: any) {
    this.storageAnnouncedSource.next(storage)
  }
  announceDownloadSpeed(downloadSpeed: any) {
    this.downloadSpeedAnnouncedSource.next(downloadSpeed)
  }
  announceDownloaded(downloaded: any) {
    this.downloadedAnnouncedSource.next(downloaded)
  }
  announceUploaded(uploaded: any) {
    this.uploadedAnnouncedSource.next(uploaded)
  }
  announceUploadSpeed(uploadSpeed: any) {
    this.uploadSpeedAnnouncedSource.next(uploadSpeed)
  }
}
