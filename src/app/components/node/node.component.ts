import { Component, OnInit, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { NodeService, NodeStatuses } from "../../providers/node.service"
// import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-home",
  templateUrl: "./node.component.html",
  styleUrls: ["./node.component.scss"]
})
export class NodeComponent implements OnInit, OnDestroy {
  public status: NodeStatuses
  private statusSubscription

  constructor (
    private chRef: ChangeDetectorRef,
    public node: NodeService,
    // private toastr: ToastrService
  ) {
    this.status = this.node.status
    this.statusSubscription = this.node.statusAnnounced$.subscribe(status => {
      this.status = status
      this.chRef.detectChanges()
    })
  }

  toggleStatus = (function () {
    if (this.status === NodeStatuses.stopped || this.status === NodeStatuses.reconnecting) {
      this.node.start()
    } else if (this.status === NodeStatuses.running) {
      this.node.stop()
    }
  }).bind(this)

  ngOnInit () {}

  ngOnDestroy() {
    this.statusSubscription.unsubscribe()
  }
}
