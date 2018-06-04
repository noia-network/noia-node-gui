import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

@Component({
  selector: "input-file",
  templateUrl: "./input-file.component.html",
  styleUrls: ["./input-file.component.scss"]
})
export class InputFileComponent implements OnInit {
  @Input() label: string
  @Input() callback: Function
  @Input() value: string
  @Output() valueChange = new EventEmitter<string>()

  constructor (private chRef: ChangeDetectorRef) { }

  ngOnInit () {}

  fileSelect () {
    const { dialog } = window.require("electron").remote
    dialog.showOpenDialog({
      properties: ["openFile"]
    }, (files) => {
      if (files.length) {
        this.value = files[0]
        this.valueChange.emit(files[0])
        this.chRef.detectChanges()
      }
    })
  }
}
