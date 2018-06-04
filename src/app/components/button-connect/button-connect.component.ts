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

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    const status: SimpleChange = changes.status;
    this.status = status.currentValue
  }
}
