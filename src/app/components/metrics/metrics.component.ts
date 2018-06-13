import {
  ChangeDetectorRef,
  Component, OnInit, Input,
  // OnChanges, SimpleChanges, SimpleChange,
  OnDestroy
} from "@angular/core";
import { NodeService, NodeStatuses } from "../../providers/node.service"

@Component({
  selector: "metrics",
  templateUrl: "./metrics.component.html",
  styleUrls: ["./metrics.component.scss"]
})
export class MetricsComponent implements OnInit, OnDestroy  {
  @Input() toggleStatus: Function
  @Input() status: NodeStatuses
  autoReconnect = true
  timeConnected: string
  downloadSpeed: number
  uploadSpeed: number
  connections: number
  private downloadSpeedSubscription
  private uploadSpeedSubscription
  private timeConnectedSubscription
  private connectionsSubscription

  constructor(
    private chRef: ChangeDetectorRef,
    public node: NodeService
  ) {
    this.downloadSpeed = this.node.downloadSpeed
    this.downloadSpeedSubscription = this.node.downloadSpeedAnnounced$.subscribe(downloadSpeed => {
      this.downloadSpeed = downloadSpeed
      this.chRef.detectChanges()
    })
    this.uploadSpeed = this.node.uploadSpeed
    this.uploadSpeedSubscription = this.node.uploadSpeedAnnounced$.subscribe(uploadSpeed => {
      this.uploadSpeed = uploadSpeed
      this.chRef.detectChanges()
    })
    this.timeConnected = this.node.timeConnected
    this.timeConnectedSubscription = this.node.timeConnectedAnnounced$.subscribe(timeConnected => {
      this.timeConnected = timeConnected
      this.chRef.detectChanges()
    })
    this.connections = this.node.connections
    this.connectionsSubscription = this.node.connectionsAnnounced$.subscribe(connections => {
      this.connections = connections
      this.chRef.detectChanges()
    })
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.downloadSpeedSubscription.unsubscribe();
    this.uploadSpeedSubscription.unsubscribe();
    this.timeConnectedSubscription.unsubscribe();
    this.connectionsSubscription.unsubscribe();
  }

  onBtnClick() {
    this.toggleStatus()
  }

  toggleAutoReconnect() {
    // console.trace("")
    console.log(this.node.autoReconnect, !this.node.autoReconnect)
    this.node.autoReconnect = !this.node.autoReconnect
  }
}
