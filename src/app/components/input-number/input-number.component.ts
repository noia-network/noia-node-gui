import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "input-number",
  templateUrl: "./input-number.component.html",
  styleUrls: ["./input-number.component.scss"]
})
export class InputNumberComponent implements OnInit {
  @Input() label: string
  @Input() value: string
  @Output() valueChange = new EventEmitter<string>()

  constructor () {}

  ngOnInit () {}

  onInputChange (event) {
    this.valueChange.emit(event.target.value)
  }
}
