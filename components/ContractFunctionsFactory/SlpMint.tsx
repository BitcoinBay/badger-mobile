import React from "react";
import styled from "styled-components";
import { StyleSheet, TextInput, View } from "react-native";
import BigNumber from "bignumber.js";

import { T, Spacer } from "../../atoms";
import { bchjs } from "../../utils/bch-js-utils";

const StyledTextInput = styled(TextInput)`
  border-color: ${props => props.theme.accent500};
  border-width: ${StyleSheet.hairlineWidth};
  border-radius: 3px;
  padding: 16px 8px;
`;

type Props = {
  inputValues: any;
  setInputValues: Function;
  address: string;
};

const ConstructorView = ({ inputValues }: Props) => {
  return (
    <View>
      <T>Your Public Key Hash</T>
      <Spacer tiny />
      <StyledTextInput editable={false} multiline value={inputValues.pkh} />
    </View>
  );
};

const constructorValidate = (inputValues: any) => {
  return {
    hasErrors: false,
    errorMessage: [],
    parsedParams: [Buffer.from(inputValues.pkh, "hex")]
  };
};

const defaultConstructorValues = (address: string) => ({
  pkh: bchjs.Address.toHash160(address)
});

const ReclaimView = ({ address }: Props) => {
  return (
    <View>
      <T>Your Public Key</T>
      <Spacer tiny />
      <StyledTextInput editable={false} multiline value={address} />
    </View>
  );
};

const reclaimValidate = () => {
  return {
    hasErrors: false,
    errorMessage: [],
    parsedParams: []
  };
};

const SlpMintView = ({ inputValues, setInputValues }: Props) => {
  return (
    <View>
      <T>Receiver</T>
      <Spacer tiny />
      <StyledTextInput
        editable
        multiline
        placeholder="simpleledger:"
        onChangeText={text =>
          setInputValues({ ...inputValues, receiveMint: text })
        }
        value={inputValues["receiveMint"]}
      />
      <Spacer tiny />
      <T>Token Id</T>
      <Spacer tiny />
      <StyledTextInput
        editable
        multiline
        onChangeText={text => setInputValues({ ...inputValues, tokenId: text })}
        value={inputValues["tokenId"]}
      />
      <Spacer tiny />
      <T>Minting Baton</T>
      <Spacer tiny />
      <StyledTextInput
        editable
        multiline
        onChangeText={text =>
          setInputValues({ ...inputValues, mintVout: text })
        }
        value={inputValues["mintVout"]}
      />
      <Spacer tiny />
      <T>Additional Supply</T>
      <Spacer tiny />
      <StyledTextInput
        editable
        multiline
        keyboardType="numeric"
        onChangeText={text =>
          setInputValues({ ...inputValues, additionalSupply: text })
        }
        value={inputValues["additionalSupply"]}
      />
    </View>
  );
};

const slpMintValidate = (inputValues: any) => {
  const { receiveMint, tokenId, mintVout, additionalSupply } = inputValues;
  const reMintVout = /[0-9A-Fa-f]{2}/g;
  const reTokenId = /[0-9A-Fa-f]{64}/g;
  let addressFormat = null;
  let hasErrors = false;
  let errorMessage: string[] = [];

  try {
    addressFormat = bchjs.Address.detectAddressFormat(receiveMint);
  } catch (e) {
    errorMessage = ["Invalid address, double check and try again."];
    hasErrors = true;
  }

  if (!["slpaddr"].includes(addressFormat)) {
    errorMessage = [
      "Can only send SLP tokens to Simpleledger addresses.  The to address should begin with 'simpleledger:'"
    ];
    hasErrors = true;
  }

  if (!tokenId) {
    errorMessage = ["Token Id cannot be empty"];
  }

  if (!reTokenId.test(tokenId)) {
    errorMessage = ["Invalid Token Id"];
    hasErrors = true;
  }

  if (mintVout && !reMintVout.test(mintVout)) {
    errorMessage = ["Invalid minting baton"];
    hasErrors = true;
  }

  if (isNaN(Number(additionalSupply))) {
    errorMessage = ["Additional Supply has to be a number"];
    hasErrors = true;
  } else {
    const bn = new BigNumber(additionalSupply);

    if (!bn.isInteger()) {
      errorMessage = ["Additional Supply cannot have fractions"];
      hasErrors = true;
    } else if (bn.isNegative()) {
      errorMessage = ["Additional Supply cannot be a negative number"];
      hasErrors = true;
    }
  }

  let additionalSupplyBuffer = new ArrayBuffer(8);
  new DataView(additionalSupplyBuffer).setBigUint64(
    0,
    BigInt(inputValues.additionalSupply)
  );

  const parsedParams = [
    Buffer.from(inputValues.receiveMint.replace("simpleledger:", ""), "hex"),
    Buffer.from(inputValues.tokenId, "hex"),
    inputValues.mintVout
      ? Buffer.from(inputValues.mintVout, "hex")
      : Buffer.alloc(1),
    Buffer.from(new Uint8Array(additionalSupplyBuffer))
  ];

  return {
    hasErrors,
    errorMessage,
    parsedParams
  };
};

const SLPMintFunctionsFactory = {
  build: (fnName: string) => {
    if (fnName === "Constructor") {
      return {
        InputsView: ConstructorView,
        inputsValidate: constructorValidate,
        defaultInputValues: defaultConstructorValues,
        options: {}
      };
    }

    if (fnName === "reclaim") {
      return {
        InputsView: ReclaimView,
        inputsValidate: reclaimValidate,
        defaultInputValues: () => ({}),
        options: {
          requiresPk: true,
          requiresSig: true
        }
      };
    }

    if (fnName === "SLPMint") {
      return {
        InputsView: SlpMintView,
        inputsValidate: slpMintValidate,
        defaultInputValues: () => ({
          receiveMint: "",
          tokenId: "",
          mintVout: "",
          additionalSupply: "100000"
        }),
        options: {
          requiresPk: true,
          requiresSig: true
        }
      };
    }
  }
};

export default SLPMintFunctionsFactory;
