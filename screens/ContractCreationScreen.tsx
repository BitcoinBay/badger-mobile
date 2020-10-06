import React, { useState, ReactComponentElement } from "react";
import styled from "styled-components";
import { ScrollView, SafeAreaView, View } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect, ConnectedProps } from "react-redux";

import { H1, Button, Spacer, T } from "../atoms";

import ContractFunctionsFactory from "../components/ContractFunctionsFactory";

import { getP2SHAddress } from "../data/artifacts/actions";

import {
  getAddressSelector,
  bchKeypairByAccountSelector
} from "../data/accounts/selectors";

import { FullState } from "../data/store";

const ScreenCover = styled(View)`
  flex: 1;
  padding: 0 16px;
`;

const TitleRow = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ErrorContainer = styled(View)`
  border-color: ${props => props.theme.danger500};
  border-width: 1px;
  border-radius: 3px;
  padding: 8px;
  background-color: ${props => props.theme.danger700};
`;

const mapStateToProps = (state: FullState) => {
  const address = getAddressSelector(state);
  const bchKeypair = bchKeypairByAccountSelector(state, address);

  return { address, bchKeypair };
};

const mapDispatchToProps = {
  getP2SHAddress
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromParent = NavigationScreenProps & {
  navigation: {
    state?: {
      params: {
        artifactId: string;
      };
    };
  };
};

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromParent & PropsFromRedux;

const ContractCreationScreen = ({
  navigation,
  bchKeypair,
  getP2SHAddress
}: Props) => {
  const { contractName, address } = navigation.state.params;

  const contractPieces = ContractFunctionsFactory(contractName, "Constructor");

  if (!contractPieces) {
    navigation.goBack();
    return <View></View>;
  }

  const { InputsView, inputsValidate, defaultInputValues } = contractPieces;

  const [inputValues, setInputValues] = useState(defaultInputValues(address));
  const [errors, setErrors] = useState<string[]>([] as string[]);

  const createContract = () => {
    //      console.log(bchKeypair)
    const { hasErrors, errorMessage, parsedParams } = inputsValidate(
      inputValues,
      bchKeypair
    );

    if (hasErrors) {
      setErrors(errorMessage);
    } else {
      getP2SHAddress(contractName, parsedParams);
      navigation.goBack();
    }
  };

  return (
    <ScreenCover>
      <SafeAreaView
        style={{
          height: "100%"
        }}
      >
        <TitleRow>
          <H1>{contractName}</H1>
        </TitleRow>

        {errors.length > 0 && (
          <>
            <ErrorContainer>
              {errors.map(error => (
                <T size="small" type="danger" center key={error}>
                  {error}
                </T>
              ))}
            </ErrorContainer>
            <Spacer small />
          </>
        )}

        <InputsView
          address={address}
          inputValues={inputValues}
          setInputValues={setInputValues}
        />
        <Spacer fill />
        <Button onPress={createContract} text="Create" />
      </SafeAreaView>
    </ScreenCover>
  );
};

export default connector(ContractCreationScreen);
