import "zone.js/dist/zone-mix";
import "reflect-metadata";
import "../polyfills";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { HttpClientModule, HttpClient } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";

// NG Translate
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { ElectronService } from "./providers/electron.service";
import { NodeService } from "./providers/node.service";

import { WebviewDirective } from "./directives/webview.directive";

import { AppComponent } from "./app.component";
import { ButtonConnectComponent } from "./components/button-connect/button-connect.component";
import { InputDirComponent } from "./components/input-dir/input-dir.component";
import { InputFileComponent } from "./components/input-file/input-file.component";
import { InputNumberComponent } from "./components/input-number/input-number.component";
import { InputStringComponent } from "./components/input-string/input-string.component";
import { MetricSpeedComponent } from "./components/metric-speed/metric-speed.component";
import { MetricStringComponent } from "./components/metric-string/metric-string.component";
import { MetricsComponent } from "./components/metrics/metrics.component";
import { NodeComponent } from "./components/node/node.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { StatDataComponent } from "./components/stat-data/stat-data.component";
import { StatProgressComponent } from "./components/stat-progress/stat-progress.component";
import { StatsComponent } from "./components/stats/stats.component";
import { WalletComponent } from "./components/wallet/wallet.component";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ToastrModule } from "ngx-toastr";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    ButtonConnectComponent,
    InputDirComponent,
    InputFileComponent,
    InputNumberComponent,
    InputStringComponent,
    MetricSpeedComponent,
    MetricStringComponent,
    MetricsComponent,
    NodeComponent,
    SettingsComponent,
    SidebarComponent,
    StatDataComponent,
    StatProgressComponent,
    StatsComponent,
    WalletComponent,
    WebviewDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: "toast-top-center"
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  providers: [ElectronService, NodeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
