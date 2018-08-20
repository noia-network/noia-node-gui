import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "input-checkbox",
  templateUrl: "./input-checkbox.component.html",
  styleUrls: ["./input-checkbox.component.scss"]
})
export class InputCheckboxComponent implements OnInit {
  @Input()
  label: string;
  @Input()
  value: boolean;
  @Output()
  valueChange = new EventEmitter<boolean>();

  public disabled: boolean = false;

  constructor() {}

  ngOnInit() {}

  onInputChange(event) {
    this.valueChange.emit(event.currentTarget.checked);
  }
}
