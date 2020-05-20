import React from "react";
import styled from "styled-components";
import { StyleSheet, TextInput, View } from "react-native";
import BigNumber from "bignumber.js";

import { T, Spacer } from "../../atoms";
import { SLP } from "../../utils/slp-sdk-utils";

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
  pkh: SLP.Address.cashToHash160(address)
});

const ReclaimView = ({ inputValues, setInputValues, address }: Props) => {
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

const SlpSendView = ({ inputValues, setInputValues, address }: Props) => {
  return (
    <View>
      <T>Your Public Key</T>
      <Spacer tiny />
      <StyledTextInput editable={false} multiline value={address} />
      <Spacer tiny />
      <T>Receiver</T>
      <Spacer tiny />
      <StyledTextInput
        editable
        multiline
        onChangeText={text =>
          setInputValues({ ...inputValues, SLPReceiver: text })
        }
        value={inputValues["SLPReceiver"]}
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
      <View>
        <View style={{ flexGrow: 1 }}>
          <Spacer tiny />
          <T>Send Amount</T>
          <Spacer tiny />
          <StyledTextInput
            editable
            multiline
            keyboardType="numeric"
            placeholder="simpleledger:"
            onChangeText={text =>
              setInputValues({ ...inputValues, sendSLPAmount: text })
            }
            value={inputValues["sendSLPAmount"]}
          />
        </View>
        <View style={{ flexGrow: 1 }}>
          <Spacer tiny />
          <T>Change Amount</T>
          <Spacer tiny />
          <StyledTextInput
            editable
            multiline
            keyboardType="numeric"
            placeholder="simpleledger:"
            onChangeText={text =>
              setInputValues({ ...inputValues, changeSLPAmount: text })
            }
            value={inputValues["changeSLPAmount"]}
          />
        </View>
      </View>
    </View>
  );
};

const slpSendValidate = (inputValues: any) => {
  let addressFormat = null;
  const reTokenId = /[0-9A-Fa-f]{64}/g;
  let hasErrors = false;
  let errorMessage: string[] = [];

  const { SLPReceiver, tokenId, sendSLPAmount, changeSLPAmount } = inputValues;
  try {
    addressFormat = SLP.Address.detectAddressFormat(SLPReceiver);
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

  if (isNaN(Number(sendSLPAmount))) {
    errorMessage = ["Additional Supply has to be a number"];
    hasErrors = true;
  } else {
    const bn = new BigNumber(sendSLPAmount);

    if (!bn.isInteger()) {
      errorMessage = ["Additional Supply cannot have fractions"];
      hasErrors = true;
    } else if (bn.isNegative()) {
      errorMessage = ["Additional Supply cannot be a negative number"];
      hasErrors = true;
    }
  }

  if (isNaN(Number(changeSLPAmount))) {
    errorMessage = ["Additional Supply has to be a number"];
    hasErrors = true;
  } else {
    const bn = new BigNumber(changeSLPAmount);

    if (!bn.isInteger()) {
      errorMessage = ["Additional Supply cannot have fractions"];
      hasErrors = true;
    } else if (bn.isNegative()) {
      errorMessage = ["Additional Supply cannot be a negative number"];
      hasErrors = true;
    }
  }

  let sendSLPAmountBuffer = new ArrayBuffer(8);
  new DataView(sendSLPAmountBuffer).setBigUint64(
    0,
    BigInt(inputValues.sendSLPAmount)
  );

  let changeSLPAmountBuffer = new ArrayBuffer(8);
  new DataView(changeSLPAmountBuffer).setBigUint64(
    0,
    BigInt(inputValues.changeSLPAmount)
  );

  const parsedParams = [
    Buffer.from(inputValues.SLPReceiver.replace("simpleledger:", ""), "hex"),
    Buffer.from(inputValues.tokenId, "hex"),
    Buffer.from(new Uint8Array(sendSLPAmountBuffer)),
    Buffer.from(new Uint8Array(changeSLPAmountBuffer))
  ];

  return {
    hasErrors,
    errorMessage,
    parsedParams
  };
};

const SLPSendFunctionsFactory = {
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

    if (fnName === "SLPSend") {
      return {
        InputsView: SlpSendView,
        inputsValidate: slpSendValidate,
        defaultInputValues: () => ({
          SLPReceiver: "",
          tokenId: "",
          sendSLPAmount: "1000",
          changeSLPAmount: "0"
        }),
        options: {
          requiresPk: true,
          requiresSig: true
        }
      };
    }
  }
};

export default SLPSendFunctionsFactory;
