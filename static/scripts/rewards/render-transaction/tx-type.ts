import { StaticDecode, Type as T } from "@sinclair/typebox";
import { BigNumber } from "ethers";

const bigNumberT = T.Transform(T.Union([T.RegExp(/^\d+$/), T.Number()]))
  .Decode((value) => BigNumber.from(value))
  .Encode((value) => value.toString());

// const networkIdT = T.Transform(T.Union([T.RegExp(/^0x\d+$/), T.Number()]))
//   .Decode(value => (typeof value === "number" ? "0x" + value.toString(16) : value))
//   .Encode(value => value);

const networkIdT = T.Number();

const addressT = T.Transform(T.RegExp(/^0x[a-fA-F0-9]{40}$/))
  .Decode((value) => value.toLowerCase())
  .Encode((value) => value);

const signatureT = T.Transform(T.RegExp(/^0x[a-fA-F0-9]+$/))
  .Decode((value) => value.toLowerCase())
  .Encode((value) => value);

const erc20PermitT = T.Object({
  type: T.Literal("erc20-permit"),
  permit: T.Object({
    permitted: T.Object({
      token: addressT,
      amount: bigNumberT,
    }),
    nonce: bigNumberT,
    deadline: bigNumberT,
  }),
  transferDetails: T.Object({
    to: addressT,
    requestedAmount: bigNumberT,
  }),
  owner: addressT,
  signature: signatureT,
  networkId: T.Number(),
});

export type Erc20Permit = StaticDecode<typeof erc20PermitT>;

const erc721PermitT = T.Object({
  type: T.Literal("erc721-permit"),
  permit: T.Object({
    permitted: T.Object({
      token: addressT,
      amount: bigNumberT,
    }),
    nonce: bigNumberT,
    deadline: bigNumberT,
  }),
  transferDetails: T.Object({
    to: addressT,
    requestedAmount: bigNumberT,
  }),
  owner: addressT,
  signature: signatureT,
  networkId: networkIdT,
  nftMetadata: T.Object({
    GITHUB_ORGANIZATION_NAME: T.String(),
    GITHUB_REPOSITORY_NAME: T.String(),
    GITHUB_ISSUE_ID: T.String(),
    GITHUB_USERNAME: T.String(),
    GITHUB_CONTRIBUTION_TYPE: T.String(),
  }),
  request: T.Object({
    beneficiary: addressT,
    deadline: bigNumberT,
    keys: T.Array(T.String()),
    nonce: bigNumberT,
    values: T.Array(T.String()),
  }),
});

export type Erc721Permit = StaticDecode<typeof erc721PermitT>;

export const claimTxT = T.Union([erc20PermitT, erc721PermitT]);

export type RewardPermit = StaticDecode<typeof claimTxT>;
