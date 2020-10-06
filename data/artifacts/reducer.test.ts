import { bchjs } from "../../utils/bch-js-utils";
import artifactsReducer, { initialState } from "./reducer";
import {
  getArtifactStart,
  getArtifactSuccess,
  getArtifactFail,
  getP2SHAddress
} from "./actions";

import { deriveP2SH } from "../../utils/cashscript-utils";

describe("artifacts::reducer", () => {
  it("should return the initial state", () => {
    expect(
      artifactsReducer(undefined, { type: "__init", payload: null })
    ).toEqual(initialState);
  });

  describe("get artifact - start", () => {
    it("should start getting artifact by doing nothing", () => {
      const stateBefore = initialState;
      const stateAfter = artifactsReducer(stateBefore, getArtifactStart());

      const expectedState = initialState;
      expect(stateAfter).toEqual(expectedState);
    });
  });

  describe("get artifact - start", () => {
    it("should handle failing to get artifact", () => {
      const stateBefore = initialState;
      const stateAfter = artifactsReducer(stateBefore, getArtifactFail());

      const expectedState = initialState;
      expect(stateAfter).toEqual(expectedState);
    });
  });
  /*
  describe("get artifact - success", () => {
    it("should get and store new artifact", async () => {
      const rootSeed = await bchjs.Mnemonic.toSeed("mnemonic");
      const hdNode = bchjs.HDNode.fromSeed(rootSeed, "mainnet");
      const account = bchjs.HDNode.derivePath(hdNode, "m/1")
      const alice = bchjs.HDNode.toKeyPair(account);
      const alicePk = bchjs.ECPair.toPublicKey(alice);
      const alicePkh = bchjs.Crypto.hash160(alicePk);

      const stateBefore = initialState;

      const { artifact } = deriveP2SH("P2PKH", alicePkh);
//      console.log(Object.keys(artifact.networks.mainnet)[0]);
      const P2SHAddr = Object.keys(artifact.networks.mainnet);
      const address = P2SHAddr[0];

      const expectedState = {
        ...initialState,
        byId: {
          ...initialState.byId,
          [address]: artifact
        },
        allIds: [address],
        activeId: address
      };

      const stateAfterOnce = artifactsReducer(
        stateBefore,
        getArtifactSuccess(artifact)
      );
      expect(stateAfterOnce).toEqual(expectedState);
      const stateAfterTwice = artifactsReducer(
        stateAfterOnce,
        getP2SHAddress(testAddr)
      );
      expect(stateAfterTwice).toEqual(expectedState);
    });
  });
  */
});
