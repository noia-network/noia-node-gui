import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "input-string",
  templateUrl: "./input-string.component.html",
  styleUrls: ["./input-string.component.scss"]
})
export class InputStringComponent implements OnInit {
  @Input() label: string
  @Input() disabled: boolean
  @Input() value: string
  @Output() valueChange = new EventEmitter<string>()

  constructor () {}

  ngOnInit () {}

  onInputChange (event) {
    this.valueChange.emit(event.target.value)
  }
}
