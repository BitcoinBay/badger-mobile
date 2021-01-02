import { useMemo } from "react";
// import { SLP } from "../utils/slp-sdk-utils";
import { bchjs } from "../utils/bch-js-utils";

const useSimpleledgerFormat = (address: string) => {
  const addressSimpleledger = useMemo(() => {
    return bchjs.SLP.Address.toSLPAddress(address);
  }, [address]);

  return addressSimpleledger;
};

export default useSimpleledgerFormat;
