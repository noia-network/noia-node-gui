import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { UtilsService } from "../../providers/utils.service";

@Component({
  selector: "stat-progress",
  templateUrl: "./stat-progress.component.html",
  styleUrls: ["./stat-progress.component.scss"]
})
export class StatProgressComponent implements OnInit, OnChanges {
  @Input() bytesTotal: number
  @Input() bytesUsed: number
  @Input() label: string
  bytesUsedTransformed: number
  bytesTotalTransformed: number
  unitsUsed: string
  unitsTotal: string
  percentage: number

  constructor(private utilsService: UtilsService) {}

  refresh() {
    const percentage = this.bytesUsed / this.bytesTotal * 100;    
    this.percentage = Math.round(percentage > 100 ? 100 : percentage);
    const transformedUsedBytes = this.utilsService.transformDataAndUnits(this.bytesUsed);
    this.bytesUsedTransformed = transformedUsedBytes.bytes;
    this.unitsUsed = transformedUsedBytes.units;

    const transformedTotalBytes = this.utilsService.transformDataAndUnits(this.bytesTotal);
    this.bytesTotalTransformed = transformedTotalBytes.bytes;
    this.unitsTotal = transformedTotalBytes.units;
  }

  ngOnInit() {
    this.refresh()
  }

  ngOnChanges() {
    this.refresh()
  }
}
