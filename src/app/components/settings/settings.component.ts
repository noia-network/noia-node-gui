import { Component, OnInit, Input } from "@angular/core";
import { NodeService } from "../../providers/node.service"
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-home",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"]
})
export class SettingsComponent implements OnInit {
  settings = {
    port: this.node.wsPort,
    storageDir: this.node.storageDirectory,
    sslPrivateKey: this.node.sslPrivateKey,
    sslCrt: this.node.sslCrt,
    sslCrtBundle: this.node.sslCrtBundle
  }

  settingsChanged: boolean;

  constructor (
    public node: NodeService,
    private toastr: ToastrService
  ) {
    this.node.settingsChanged.subscribe((settingsChanged: boolean) => {
      this.settingsChanged = settingsChanged
    })
  }

  ngOnInit () {}

  onSave () {
    this.node.updateSettings("sockets.ws.port", this.settings.port)
    this.node.updateSettings("storage.dir", this.settings.storageDir)
    this.node.updateSettings("ssl.privateKeyPath", this.settings.sslPrivateKey)
    this.node.updateSettings("ssl.crtPath", this.settings.sslCrt)
    this.node.updateSettings("ssl.crtBundlePath", this.settings.sslCrtBundle)
    this.toastr.warning("Please restart application for changes to take effect")
    this.node.enableRestart()
  }

  onRestart () {
    this.node.restart()
  }

  onPortCheck () {
    window.require("electron").shell.openExternal(`https://www.yougetsignal.com/tools/open-ports`)
  }
}
