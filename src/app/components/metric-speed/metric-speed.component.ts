import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges, ViewChild } from "@angular/core";

@Component({
  selector: "metric-speed",
  templateUrl: "./metric-speed.component.html",
  styleUrls: ["./metric-speed.component.scss"]
})
export class MetricSpeedComponent implements OnChanges, OnInit, AfterViewInit  {
  @Input() speed: number // Bps
  @Input() label: string
  @ViewChild("gaugeArrow") gaugeArrow
  units: string;
  speedTransformed: string
  maxSpeed: number
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
    const kBps = 1000
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
    if (!this.maxSpeed || this.maxSpeed < this.speed) {
      this.maxSpeed = this.speed
    }
  }

  rotateArrow() {
    let ratio = this.speed / this.maxSpeed
    if (ratio > 1) {
      ratio = 1
    }
    this.setArrowRotation(Math.round(240 * ratio))
  }
}
