import React from "react";
import styled from "styled-components";
import { ScrollView, SafeAreaView, View } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { connect, ConnectedProps } from "react-redux";

import { Button, T, H1, Spacer } from "../atoms";

import {
  activeArtifactIdSelector,
  getArtifactSelector,
  artifactsAllIdsSelector
} from "../data/artifacts/selectors";
import { getAddressSelector } from "../data/accounts/selectors";

import { getP2SHAddress } from "../data/artifacts/actions";
import { FullState } from "../data/store";

const ScreenCover = styled(View)`
  flex: 1;
  background-color: ${props => props.theme.primary500};
  padding: 0 16px;
`;

const TopArea = styled(View)``;

const BottomArea = styled(View)``;
const ReceiptArea = styled(View)`
  flex: 1;
  justify-content: center;
`;

const mapStateToProps = (state: FullState) => ({
  allArtifactIds: artifactsAllIdsSelector(state),
  address: getAddressSelector(state)
});

const mapDispatchToProps = { getP2SHAddress };

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux;

const ContractScreen = ({ address, getP2SHAddress, allArtifactIds }: Props) => {
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
          {allArtifactIds.map(artifactId => (
            <T center size="large">
              {artifactId}
            </T>
          ))}
          <Button onPress={() => createContract()} text="Create Contract" />
        </ScrollView>
      </SafeAreaView>
    </ScreenCover>
  );
};

export default connector(ContractScreen);
