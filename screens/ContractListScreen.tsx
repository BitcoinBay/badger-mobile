import React from "react";
import styled from "styled-components";
import { ScrollView, SafeAreaView, View } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect, ConnectedProps } from "react-redux";

import { Button, T, H2, Spacer } from "../atoms";

import {
  artifactsAllIdsSelector,
  artifactsByIdSelector
} from "../data/artifacts/selectors";
import { getAddressSelector } from "../data/accounts/selectors";

import { getP2SHAddress } from "../data/artifacts/actions";
import { FullState } from "../data/store";

const ScreenCover = styled(View)`
  flex: 1;
  padding: 0 16px;
`;

const HeaderWrapper = styled(View)`
  margin-top: 30px;
  margin-bottom: 20px;
`;

const mapStateToProps = (state: FullState) => ({
  allArtifactIds: artifactsAllIdsSelector(state),
  artifactsById: artifactsByIdSelector(state),
  address: getAddressSelector(state)
});

const mapDispatchToProps = { getP2SHAddress };

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromParent = NavigationScreenProps;
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromParent & PropsFromRedux;

const ContractListScreen = ({
  address,
  getP2SHAddress,
  allArtifactIds,
  artifactsById,
  navigation
}: Props) => {
  const createContract = () => {
    getP2SHAddress(address);
  };

  return (
    <ScreenCover>
      <SafeAreaView
        style={{
          height: "100%"
        }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1
          }}
        >
          <HeaderWrapper>
            <H2>Your Contracts</H2>
          </HeaderWrapper>
          {allArtifactIds.map(artifactId => (
            <View key={artifactId}>
              <Button
                nature="ghost"
                onPress={() =>
                  navigation.navigate("ContractScreen", {
                    artifactId,
                    artifact: artifactsById[artifactId]
                  })
                }
              >
                <T type="primary" style={{ flexGrow: 1 }}>
                  {artifactsById[artifactId].contractName}
                </T>
                <T size="xsmall" type="muted2">
                  {artifactId}
                </T>
                <Spacer tiny />
                <Button
                  onPress={() =>
                    navigation.navigate("SendSetup", {
                      defaultToAddress: artifactId
                    })
                  }
                  text="Fund"
                />
              </Button>
            </View>
          ))}
          <Spacer />
          <Button onPress={() => createContract()} text="Create Contract" />
        </ScrollView>
      </SafeAreaView>
    </ScreenCover>
  );
};

export default connector(ContractListScreen);
