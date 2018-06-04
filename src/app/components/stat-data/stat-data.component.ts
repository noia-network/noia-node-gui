import { Component, Input, OnChanges, OnInit } from "@angular/core";

@Component({
  selector: "stat-data",
  templateUrl: "./stat-data.component.html",
  styleUrls: ["./stat-data.component.scss"]
})
export class StatDataComponent implements OnInit, OnChanges {
  @Input() bytes: number;
  @Input() label: string;
  units: string;
  bytesTransformed: number;

  constructor() {}

  ngOnInit() {
    this.transformDataAndUnits()
  }

  ngOnChanges() {
    this.transformDataAndUnits()
  }

  transformDataAndUnits() {
    const B = 1
    const kB = 1000 * B
    const MB = 1000 * kB
    const TB = 1000 * MB
    if (this.bytes <= kB) {
      this.units = "B"
      this.bytesTransformed = this.bytes
    } else if (this.bytes < MB) {
      this.units = "kB"
      this.bytesTransformed = Math.round(this.bytes / kB)
    } else if (this.bytes < TB) {
      this.units = "MB"
      this.bytesTransformed = Math.round(this.bytes / MB)
    } else {
      this.bytesTransformed = Math.round(this.bytes / TB)
      this.units = "TB"
    }
  }
}
