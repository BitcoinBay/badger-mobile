import React from "react";
import styled from "styled-components";
import { StyleSheet, TextInput, View } from "react-native";

import { DataSigner } from "../../utils/DataSigner";
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

const ConstructorView = ({ inputValues, setInputValues }: Props) => {
  return (
    <View>
      <T>Contract Password</T>
      <Spacer tiny />
      <StyledTextInput
        value={inputValues.userPWSig}
        secureTextEntry
        autoCompleteType="password"
        onChangeText={text =>
          setInputValues({ ...inputValues, userPWSig: text })
        }
      />
    </View>
  );
};

const constructorValidate = (inputValues: any, keypair: any) => {
  const dataSigner = new DataSigner(keypair)
  const pwd = dataSigner.createMessage(inputValues.userPWSig)

  return {
    hasErrors: false,
    errorMessage: [],
    parsedParams: [dataSigner.signMessage(pwd)]
  };
};

const defaultConstructorValues = () => ({
  userPWSig: ""
});

const SpendView = ({ inputValues, setInputValues, address }: Props) => {
  return (
    <View>
      <T>Your Public Key</T>
      <Spacer tiny />
      <StyledTextInput editable={false} multiline value={address} />
      <Spacer tiny />
      <T>Password</T>
      <Spacer tiny />
      <StyledTextInput
        value={inputValues.userPWSig}
        secureTextEntry
        autoCompleteType="password"
        onChangeText={text =>
          setInputValues({ ...inputValues, userPWSig: text })
        }
      />
    </View>
  );
};

const spendValidate = (inputValues: any) => {
  return {
    hasErrors: false,
    errorMessage: [],
    parsedParams: [Buffer.from(inputValues.userPWSig)]
  };
};

const defaultSpendValues = () => {
  return { userPWSig: "" };
};

const Bip38FunctionsFactory = {
  build: (fnName: string) => {
    if (fnName === "Constructor") {
      return {
        InputsView: ConstructorView,
        inputsValidate: constructorValidate,
        defaultInputValues: defaultConstructorValues,
        options: {}
      };
    }

    if (fnName === "spend") {
      return {
        InputsView: SpendView,
        inputsValidate: spendValidate,
        defaultInputValues: defaultSpendValues,
        options: {
          requiresPk: true,
          requiresSig: true,
          showAmountInput: true
        }
      };
    }
  }
};

export default Bip38FunctionsFactory;
