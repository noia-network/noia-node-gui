import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { NodeService } from "../../providers/node.service"
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-home",
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.scss"]
})
export class WalletComponent implements OnInit, OnDestroy {
  wallet = this.node.wallet
  walletBalance = this.node.walletBalance
  walletEthBalance = this.node.walletEthBalance

  private walletSubscription
  private walletBalanceSubscription
  private walletEthBalanceSubscription

  constructor (
    private chRef: ChangeDetectorRef,
    public node: NodeService,
    private toastr: ToastrService
  ) {
    this.wallet = node.wallet
    this.walletSubscription = this.node.walletAnnounced$.subscribe(wallet => {
      this.wallet = wallet
      this.chRef.detectChanges()
    })
    this.walletBalance = node.walletBalance
    this.walletBalanceSubscription = this.node.walletBalanceAnnounced$.subscribe(walletBalance => {
      this.walletBalance = walletBalance
      this.chRef.detectChanges()
    })
    this.walletEthBalance = node.walletEthBalance
    this.walletEthBalanceSubscription = this.node.walletEthBalanceAnnounced$.subscribe(walletEthBalance => {
      this.walletEthBalance = walletEthBalance
      this.chRef.detectChanges()
    })
  }

  ngOnDestroy() {
    this.walletSubscription.unsubscribe()
    this.walletBalanceSubscription.unsubscribe()
  }

  ngOnInit () {}

  onSave () {
    if (this.wallet.length !== 42) {
      return this.toastr.error("Not valid wallet")
    }
    this.node.setWallet(this.wallet)
    this.node.refreshBalance()
    this.toastr.success("Wallet updated")
  }

  onEtherscan () {
    window.require("electron").shell.openExternal(`https://ropsten.etherscan.io/address/${this.wallet}#tokentxns`)
  }
}
