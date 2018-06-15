import {
  Component, OnInit, Input,
  OnChanges, SimpleChanges, SimpleChange
} from "@angular/core"
import { NodeStatuses } from "../../providers/node.service"

@Component({
  selector: "button-connect",
  templateUrl: "./button-connect.component.html",
  styleUrls: ["./button-connect.component.scss"]
})
export class ButtonConnectComponent implements OnInit, OnChanges  {
  @Input() status: NodeStatuses
  @Input() statuses = NodeStatuses
  @Input() autoReconnectSeconds

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    const status: SimpleChange = changes.status
    if (status) {
      this.status = status.currentValue
    }
    const autoReconnectSeconds: SimpleChange = changes.autoReconnectSeconds
    if (autoReconnectSeconds) {
      this.autoReconnectSeconds = autoReconnectSeconds.currentValue
    }
  }
}
