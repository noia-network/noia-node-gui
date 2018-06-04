import { Component, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { NodeService } from "../../providers/node.service"

@Component({
  selector: "stats",
  templateUrl: "./stats.component.html",
  styleUrls: ["./stats.component.scss"]
})
export class StatsComponent implements OnDestroy {
  storage: any = {
    total: 0,
    used: 0,
    available: 0
  }
  data: any = {
    uploaded: 0,
    downloaded: 0
  }
  private storageSubscription
  private downloadedSubscription
  private uploadedSubscription

  constructor(
    private chRef: ChangeDetectorRef,
    public node: NodeService
  ) {
    this.storage = node.storage
    this.storageSubscription = this.node.storageAnnounced$.subscribe(storage => {
      this.storage = storage
      this.chRef.detectChanges()
    })
    this.data.downloaded = node.downloaded
    this.downloadedSubscription = this.node.downloadedAnnounced$.subscribe(downloaded => {
      this.data.downloaded = downloaded
      this.chRef.detectChanges()
    })
    this.data.uploaded = node.uploaded
    this.uploadedSubscription = this.node.uploadedAnnounced$.subscribe(uploaded => {
      this.data.uploaded = uploaded
      this.chRef.detectChanges()
    })
  }

  ngOnDestroy() {
    this.storageSubscription.unsubscribe();
    this.downloadedSubscription.unsubscribe();
    this.uploadedSubscription.unsubscribe();
  }
}
