import React, { useState } from "react";
import styled from "styled-components";
import { ScrollView, SafeAreaView, View, Picker } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect, ConnectedProps } from "react-redux";
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogButton
} from "react-native-popup-dialog";

import { Button, T, H2, Spacer } from "../atoms";

import { compileContract } from "../utils/cashscript-utils";

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

const StyledDialogContent = styled(DialogContent)`
  align-items: center;
  padding-top: 5px;
`;

const StyledPicker = styled(Picker)`
  height: 50px;
  width: 150px;
`;

const StyledButton = styled(Button)`
  margin-top: 15px;
  margin-bottom: 30px;
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
  allArtifactIds,
  artifactsById,
  address,
  navigation
}: Props) => {
  const [showDialog, setShowDialog] = useState(false);
  const [createContractType, setCreateContractType] = useState("P2PKH");

  const createContract = () => {
    const contract = compileContract(createContractType);
    navigation.navigate("ContractCreation", {
      contractName: createContractType,
      address
    });
    setShowDialog(false);
  };

  return (
    <ScreenCover>
      <Dialog
        onDismiss={() => setShowDialog(false)}
        visible={showDialog}
        width={0.9}
        rounded
        dialogTitle={
          <DialogTitle
            title="Select a contract"
            style={{
              backgroundColor: "#F7F7F8"
            }}
            hasTitleBar={false}
            align="left"
          />
        }
        footer={
          <DialogFooter>
            <DialogButton
              text="CANCEL"
              bordered
              onPress={() => setShowDialog(false)}
              key="button-1"
            />
            <DialogButton
              text="OK"
              bordered
              onPress={createContract}
              key="button-2"
            />
          </DialogFooter>
        }
      >
        <StyledDialogContent>
          <StyledPicker
            selectedValue={createContractType}
            onValueChange={itemValue => setCreateContractType(itemValue)}
          >
            <Picker.Item label="P2PKH" value={"P2PKH"} />
            <Picker.Item label="SLPGenesis" value={"SLPGenesis"} />
            <Picker.Item label="SLPMint" value={"SLPMint"} />
            <Picker.Item label="SLPSend" value={"SLPSend"} />
            <Picker.Item label="Bip38" value={"Bip38"} />
          </StyledPicker>
        </StyledDialogContent>
      </Dialog>
      <SafeAreaView
        style={{
          height: "100%"
        }}
      >
        <HeaderWrapper>
          <H2>Your Contracts</H2>
        </HeaderWrapper>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1
          }}
        >
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
              <Spacer tiny />
            </View>
          ))}
          <Spacer />
        </ScrollView>
        <Spacer small />
        <Button
          onPress={() => setShowDialog(true)}
          text="Create Contract"
        />
        <Spacer tiny />
      </SafeAreaView>
    </ScreenCover>
  );
};

export default connector(ContractListScreen);
