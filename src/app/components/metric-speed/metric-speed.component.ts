import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges, ViewChild } from "@angular/core";

@Component({
  selector: "metric-speed",
  templateUrl: "./metric-speed.component.html",
  styleUrls: ["./metric-speed.component.scss"]
})
export class MetricSpeedComponent implements OnChanges, OnInit, AfterViewInit  {
  @Input() speed: number
  @Input() label: string
  @ViewChild("gaugeArrow") gaugeArrow
  units: string;
  speedTransformed: string
  constructor() { }

  ngOnInit() {
    this.transformSpeedAndUnits()
  }

  ngOnChanges(changes: SimpleChanges) {
    const speed: SimpleChange = changes.speed;
    if (speed.previousValue !== speed.currentValue) {
      this.transformSpeedAndUnits()
      this.rotateArrow()
    }
  }

  ngAfterViewInit() {
    this.setArrowRotation(0)
  }

  setArrowRotation(deg) {
    const arrowEl = this.gaugeArrow.nativeElement
    arrowEl.style.transform = `rotate(${deg}deg)`
  }

  transformSpeedAndUnits() {
    const precision = 0
    const b = 1
    const B = 8 * b
    const kBps = 1000 * B
    const MBps = 1000 * kBps
    if (this.speed <= kBps) {
      this.units = "Bps"
      this.speedTransformed = this.speed.toFixed(precision)
    } else if (this.speed <= MBps) {
      this.units = "kBps"
      this.speedTransformed = Math.round(this.speed / kBps).toFixed(precision)
    } else {
      this.units = "MBps"
      this.speedTransformed = Math.round(this.speed / MBps).toFixed(precision)
    }
  }

  rotateArrow() {
    const max = 8 * 1000 * 1000 * 8
    let ratio = this.speed / max
    if (ratio > 1) {
      ratio = 1
    }
    this.setArrowRotation(Math.round(240 * ratio))
  }
}
