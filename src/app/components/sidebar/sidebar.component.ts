import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"]
})
export class SidebarComponent implements OnInit {
  url

  constructor(router: Router) {
    this.url = router.url
  }

  ngOnInit() {
  }


}
