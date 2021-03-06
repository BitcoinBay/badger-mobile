//import { Crypto } from "bitbox-sdk";
import { bchjs } from "./bch-js-utils";
import { ECPair } from "../data/accounts/reducer";

export class DataSigner {
  constructor(public keypair: ECPair) {}

  createMessage(password: string): Buffer {
    return Buffer.from(password, "utf8");
  }
  /*
  createMessage(blockHeight: number, bchUsdPrice: number): Buffer {
    const lhs: Buffer = Buffer.alloc(4, 0);
    const rhs: Buffer = Buffer.alloc(4, 0);
    new Script().encodeNumber(blockHeight).copy(lhs);
    new Script().encodeNumber(bchUsdPrice).copy(rhs);
    return Buffer.concat([lhs, rhs]);
  }
*/
  signMessage(message: Buffer): Buffer {
    return this.keypair.sign(bchjs.Crypto.sha256(message)).toDER();
  }
}
