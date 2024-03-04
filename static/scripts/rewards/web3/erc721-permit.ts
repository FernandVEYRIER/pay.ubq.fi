import { JsonRpcProvider, TransactionResponse } from "@ethersproject/providers";
import { ethers } from "ethers";
import { nftRewardAbi } from "../abis/nft-reward-abi";
import { app } from "../app-state";
import { renderTransaction } from "../render-transaction/render-transaction";
import { Erc721Permit } from "../render-transaction/tx-type";
import { claimButton, showLoader, toaster } from "../toaster";
import { connectWallet } from "./connect-wallet";
export function claimErc721PermitHandler(reward: Erc721Permit) {
  return async function claimButtonHandler() {
    const signer = await connectWallet();
    if (!signer) {
      return;
    }

    if ((await signer.getAddress()).toLowerCase() !== reward.request.beneficiary) {
      toaster.create("warning", `This NFT is not for you.`);
      return;
    }

    if (reward.permit.deadline.lt(Math.floor(Date.now() / 1000))) {
      toaster.create("error", `This NFT has expired.`);
      return;
    }

    const isRedeemed = await isNonceRedeemed(reward, app.provider);
    if (isRedeemed) {
      toaster.create("error", `This NFT has already been redeemed.`);
      return;
    }

    showLoader();
    try {
      const nftContract = new ethers.Contract(reward.permit.permitted.token, nftRewardAbi, signer);

      const tx: TransactionResponse = await nftContract.safeMint(reward.request, reward.signature);
      toaster.create("info", `Transaction sent. Waiting for confirmation...`);
      const receipt = await tx.wait();
      toaster.create("success", `Claim Complete.`);
      console.log(receipt.transactionHash); // @TODO: post to database

      claimButton.element.removeEventListener("click", claimButtonHandler);

      renderTransaction(app, true).catch((error) => {
        console.error(error);
        toaster.create("error", `Error rendering transaction: ${error.message}`);
      });
    } catch (error: unknown) {
      console.error(error);
      toaster.create("error", `Error claiming NFT: ${typeof error === "string" ? error : error.message ? error.message : "Unknown error"}`);
    }
  };
}

export async function isNonceRedeemed(reward: Erc721Permit, provider: JsonRpcProvider): Promise<boolean> {
  const nftContract = new ethers.Contract(reward.permit.permitted.token, nftRewardAbi, provider);
  return nftContract.nonceRedeemed(reward.request.nonce);
}
