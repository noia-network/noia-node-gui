import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppConfig } from "../../app.config";

@Component({
  selector: "sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"]
})
export class SidebarComponent implements OnInit {
  url
  nodeVersion: string;

  constructor(router: Router) {
    this.url = router.url
    this.nodeVersion = AppConfig.version;
  }

  ngOnInit() {
  }


}
