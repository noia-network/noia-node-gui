import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "metric-string",
  templateUrl: "./metric-string.component.html",
  styleUrls: ["./metric-string.component.scss"]
})
export class MetricStringComponent implements OnInit  {
  @Input() value: string
  @Input() label: string

  constructor() { }

  ngOnInit() {
  }
}
