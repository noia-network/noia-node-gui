import { Component, Input, OnChanges, OnInit } from "@angular/core";

@Component({
  selector: "stat-progress",
  templateUrl: "./stat-progress.component.html",
  styleUrls: ["./stat-progress.component.scss"]
})
export class StatProgressComponent implements OnInit, OnChanges {
  @Input() bytesTotal: number
  @Input() bytesUsed: number
  @Input() label: string
  bytes: number
  units: string
  percentage: number

  constructor() {}

  refresh() {
    this.percentage = Math.round(this.bytesUsed / this.bytesTotal * 100)
    this.transformDataAndUnits()
  }

  ngOnInit() {
    this.refresh()
  }

  ngOnChanges() {
    this.refresh()
  }

  transformDataAndUnits() {
    const B = 1
    const kB = 1000 * B
    const MB = 1000 * kB
    const GB = 1000 * MB
    const TB = 1000 * GB
    if (this.bytesTotal <= kB) {
      this.units = "B"
      this.bytes = this.bytesTotal
    } else if (this.bytesTotal <= MB) {
      this.units = "kB"
      this.bytes = Math.round(this.bytesTotal / kB)
    } else if (this.bytesTotal <= GB) {
      this.units = "MB"
      this.bytes = Math.round(this.bytesTotal / MB)
    } else if (this.bytesTotal <= TB) {
      this.units = "GB"
      this.bytes = Math.round(this.bytesTotal / GB)
    } else {
      this.units = "TB"
      this.bytes = Math.round(this.bytesTotal / TB)
    }
  }
}
