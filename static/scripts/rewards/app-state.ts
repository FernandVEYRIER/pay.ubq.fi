import { JsonRpcProvider } from "@ethersproject/providers";
import { networkExplorers } from "./constants";
import { RewardPermit } from "./render-transaction/tx-type";

export class AppState {
  public claims: RewardPermit[] = [];
  private _provider!: JsonRpcProvider;
  private _currentIndex = 0;
  private _signer;

  get signer() {
    return this._signer;
  }

  set signer(value) {
    this._signer = value;
  }

  get networkId(): number | null {
    return this.reward?.networkId || null;
  }

  get provider(): JsonRpcProvider {
    return this._provider;
  }

  set provider(value: JsonRpcProvider) {
    this._provider = value;
  }

  get rewardIndex(): number {
    return this._currentIndex;
  }

  get reward(): RewardPermit {
    return this.rewardIndex < this.claims.length ? this.claims[this.rewardIndex] : this.claims[0];
  }

  get permitNetworkId() {
    return this.reward?.networkId;
  }

  get currentExplorerUrl(): string {
    if (!this.reward) {
      return "https://etherscan.io";
    }
    return networkExplorers[this.reward.networkId] || "https://etherscan.io";
  }

  nextPermit(): RewardPermit | null {
    this._currentIndex = Math.min(this.claims.length - 1, this.rewardIndex + 1);
    return this.reward;
  }

  previousPermit(): RewardPermit | null {
    this._currentIndex = Math.max(0, this._currentIndex - 1);
    return this.reward;
  }
}

export const app = new AppState();
