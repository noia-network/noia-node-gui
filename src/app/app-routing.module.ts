import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { NodeComponent } from './components/node/node.component'
import { SettingsComponent } from './components/settings/settings.component'
import { WalletComponent } from './components/wallet/wallet.component'

const routes: Routes = [
    { path: '', redirectTo: '/node', pathMatch: 'full' },
    { path: 'node', component: NodeComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'wallet', component: WalletComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
