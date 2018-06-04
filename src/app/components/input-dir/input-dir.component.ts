import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
// const { dialog } = window.require("electron").remote
// const { dialog } = window.require("electron").remote

@Component({
  selector: "input-dir",
  templateUrl: "./input-dir.component.html",
  styleUrls: ["./input-dir.component.scss"]
})
export class InputDirComponent implements OnInit {
  @Input() label: string
  @Input() callback: Function
  @Input() value: string
  @Output() valueChange = new EventEmitter<string>()

  constructor (private chRef: ChangeDetectorRef) { }

  ngOnInit () {}

  dirSelect () {
    const { dialog } = window.require("electron").remote
    dialog.showOpenDialog({
      properties: ["openDirectory"]
    }, (directories) => {
      if (directories.length) {
        this.value = directories[0]
        this.valueChange.emit(directories[0])
        this.chRef.detectChanges()
      }
    })
  }
}
