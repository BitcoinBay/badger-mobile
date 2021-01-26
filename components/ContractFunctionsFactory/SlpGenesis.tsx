import React from "react";
import styled from "styled-components";
import { StyleSheet, TextInput, View } from "react-native";
import BigNumber from "bignumber.js";

import { bchjs } from "../../utils/bch-js-utils";
import { T, Spacer } from "../../atoms";

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

const SlpGenesisView = ({ inputValues, setInputValues }: Props) => {
  return (
    <View>
      <T>Ticker Symbol</T>
      <Spacer tiny />
      <StyledTextInput
        editable
        multiline
        placeholder="ABC-DE"
        value={inputValues["ticker"]}
        onChangeText={text => {
          setInputValues({ ...inputValues, ticker: text });
        }}
      />
      <Spacer tiny />
      <T>Token Name</T>
      <Spacer tiny />
      <StyledTextInput
        editable
        multiline
        onChangeText={text => setInputValues({ ...inputValues, name: text })}
        value={inputValues["name"]}
      />
      <Spacer tiny />
      <T>URL</T>
      <Spacer tiny />
      <StyledTextInput
        editable
        multiline
        placeholder="Optional"
        onChangeText={text => setInputValues({ ...inputValues, url: text })}
        value={inputValues["url"]}
      />
      <Spacer tiny />
      <View style={{ flexDirection: "row" }}>
        <View style={{ flexGrow: 1 }}>
          <T>Decimals</T>
          <Spacer tiny />
          <StyledTextInput
            editable
            multiline
            keyboardType="numeric"
            onChangeText={text =>
              setInputValues({ ...inputValues, decimal: text })
            }
            value={inputValues["decimal"]}
          />
        </View>
        <View style={{ flexGrow: 1 }}>
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
        </View>
      </View>
      <Spacer tiny />
      <T>Initial Supply</T>
      <Spacer tiny />
      <StyledTextInput
        editable
        multiline
        keyboardType="numeric"
        onChangeText={text =>
          setInputValues({ ...inputValues, initialSupply: text })
        }
        value={inputValues["initialSupply"]}
      />
    </View>
  );
};

const slpGenesisValidate = (inputValues: any) => {
  const { ticker, name, decimal, mintVout, initialSupply } = inputValues;
  const reMintVout = /[0-9A-Fa-f]{2}/g;
  let hasErrors = false;
  let errorMessage: string[] = [];
  if (!ticker) {
    errorMessage = ["Ticker symbol cannot be empty"];
    hasErrors = true;
  }

  if (!name) {
    errorMessage = ["Token name cannot be empty"];
    hasErrors = true;
  }

  if (isNaN(Number(decimal))) {
    errorMessage = ["Number of decimals has to be a number between 0 and 255"];
    hasErrors = true;
  } else {
    const bn = new BigNumber(decimal);
    if (!bn.isInteger()) {
      errorMessage = ["Number of decimals cannot have fractions"];
      hasErrors = true;
    } else if (bn.lt(0) || bn.gt(255)) {
      errorMessage = [
        "Number of decimals has to be a number between 0 and 255"
      ];
      hasErrors = true;
    }
  }

  if (mintVout && !reMintVout.test(mintVout)) {
    errorMessage = ["Invalid minting baton"];
    hasErrors = true;
  }

  if (isNaN(Number(initialSupply))) {
    errorMessage = ["Additional Supply has to be a number"];
    hasErrors = true;
  } else {
    const bn = new BigNumber(initialSupply);

    if (!bn.isInteger()) {
      errorMessage = ["Additional Supply cannot have fractions"];
      hasErrors = true;
    } else if (bn.isNegative()) {
      errorMessage = ["Additional Supply cannot be a negative number"];
      hasErrors = true;
    }
  }

  let decimalBuffer = new ArrayBuffer(1);
  new DataView(decimalBuffer).setUint8(0, Number(inputValues.decimal));
  let initialSupplyBuffer = new ArrayBuffer(8);
  new DataView(initialSupplyBuffer).setBigUint64(0, inputValues.initialSupply);

  const parsedParams = [
    Buffer.from(inputValues.ticker),
    Buffer.from(inputValues.name),
    Buffer.from(inputValues.url),
    Buffer.alloc(32),
    Buffer.from(new Uint8Array(decimalBuffer)),
    inputValues.mintVout
      ? Buffer.from(inputValues.mintVout, "hex")
      : Buffer.alloc(1),
    Buffer.from(new Uint8Array(initialSupplyBuffer))
  ];

  return {
    hasErrors,
    errorMessage,
    parsedParams
  };
};

const SLPGenesisFunctionsFactory = {
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

    if (fnName === "SLPGenesis") {
      return {
        InputsView: SlpGenesisView,
        inputsValidate: slpGenesisValidate,
        defaultInputValues: () => ({
          ticker: "",
          name: "",
          url: "",
          hash: "0x00",
          decimal: "8",
          mintVout: "",
          initialSupply: "1000000"
        }),
        options: {
          requiresPk: true,
          requiresSig: true
        }
      };
    }
  }
};

export default SLPGenesisFunctionsFactory;
