import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  NgZone
} from "@angular/core";
import { clipboard } from "electron";
import { NodeService } from "../../providers/node.service";

@Component({
  selector: "input-string",
  templateUrl: "./input-string.component.html",
  styleUrls: ["./input-string.component.scss"]
})
export class InputStringComponent implements OnInit {
  @Input() label: string;
  @Input() disabled: boolean;
  @Input() value: string;
  @Input() placeholder: string;
  @Output() valueChange = new EventEmitter<string>();

  constructor(private zone: NgZone) {}

  ngOnInit() {}

  onInputChange(event) {
    this.value = event.target.value.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    this.valueChange.emit(this.value);
  }

  onPaste() {
    const { clipboard } = window.require('electron');
    this.value = clipboard.readText();
  }
}
