import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { UtilsService } from "../../providers/utils.service";

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

  constructor(private utilsService: UtilsService) {}

  ngOnInit() {
    const transformedBytes = this.utilsService.transformDataAndUnits(this.bytes);
    this.bytesTransformed = transformedBytes.bytes;
    this.units = transformedBytes.units;
  }

  ngOnChanges() {
    const transformedBytes = this.utilsService.transformDataAndUnits(this.bytes);
    this.bytesTransformed = transformedBytes.bytes;
    this.units = transformedBytes.units;
  }
}
