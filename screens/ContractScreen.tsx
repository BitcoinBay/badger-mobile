import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { ScrollView, SafeAreaView, View, Dimensions } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import QRCode from "react-native-qrcode-svg";

import { Button, T, H1, H2, Spacer } from "../atoms";

const ScreenCover = styled(View)`
  flex: 1;
  padding: 0 16px;
`;

const PrimaryHeaderWrapper = styled(View)`
  align-items: center;
  margin-top: 30px;
  margin-bottom: 30px;
`;

const SecondaryHeaderWrapper = styled(View)`
  margin-bottom: 20px;
`;

const StyledButton = styled(Button)`
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
`;

const Dropdown = styled(View)`
  border-top-width: 0;
  border: 1px solid ${props => props.theme.primary500};
  padding: 10px;
`;

const QRHolder = styled(View)`
  justify-content: center;
  align-items: center;
  padding: 0 16px;
  overflow: hidden;
  position: relative;
`;

type PropsFromParent = NavigationScreenProps & {
  navigation: {
    state?: {
      params: {
        artifactId: string;
      };
    };
  };
};

type Props = PropsFromParent;

const ContractScreen = ({ navigation }: Props) => {
  const { artifactId, artifact } = navigation.state.params;
  const { abi, contractName } = artifact;
  const totalWidth = Dimensions.get("window").width;
  const QRSize = totalWidth > 300 ? totalWidth * 0.6 : totalWidth * 0.7;

  const [qrOpen, setQrOpen] = useState(false);

  const [inputDropdownsToggled, setInputDropDownsToggled] = useState(
    abi.reduce(
      (accumulatorObj: object, currentFn: any) => ({
        ...accumulatorObj,
        [currentFn.name]: true
      }),
      {}
    )
  );

  return (
    <ScreenCover>
      <SafeAreaView
        style={{
          height: "100%"
        }}
      >
        <PrimaryHeaderWrapper>
          <H1>{contractName}</H1>
          <Spacer tiny />
          <Button
            nature="cautionGhost"
            onPress={() => setQrOpen(!qrOpen)}
            text={qrOpen ? "Close QR Code" : "Open QR Code"}
          />
          <Spacer tiny />
          {qrOpen && (
            <QRHolder>
              <QRCode
                value={artifactId}
                size={QRSize}
                color="black"
                backgroundColor="white"
              />
            </QRHolder>
          )}
          <Spacer tiny />
          <T size="xsmall">{artifactId}</T>
        </PrimaryHeaderWrapper>
        <SecondaryHeaderWrapper>
          <H2 type="muted">Functions</H2>
        </SecondaryHeaderWrapper>
        <ScrollView>
          {abi.map((fn: any, fnIndex: Number) => (
            <View key={fn.name} style={{ marginBottom: 10 }}>
              <StyledButton
                onPress={() =>
                  setInputDropDownsToggled({
                    ...inputDropdownsToggled,
                    [fn.name]: !inputDropdownsToggled[fn.name]
                  })
                }
                style={{ flexDirection: "row" }}
              >
                <T weight="bold" type="inverse" style={{ flexGrow: 1 }}>
                  {fn.name}
                </T>
                <FontAwesome
                  style={{ marginLeft: 5, marginRight: 5 }}
                  size={30}
                  color="#fff"
                  name={
                    inputDropdownsToggled[fn.name] ? "angle-up" : "angle-down"
                  }
                />
              </StyledButton>
              {inputDropdownsToggled[fn.name] && (
                <Dropdown>
                  <T weight="bold" type="muted2">
                    Inputs
                  </T>
                  {fn.inputs.map((input: any) => (
                    <View key={input.name}>
                      <Spacer tiny />
                      <T>
                        name: <T weight="bold">{input.name}</T>
                        {"  "}type: <T weight="bold">{input.type}</T>
                      </T>
                    </View>
                  ))}
                  <Spacer />
                  <Button
                    text="interact"
                    onPress={() =>
                      navigation.navigate("ContractTxSetup", {
                        artifactId,
                        fnIndex: fnIndex
                      })
                    }
                  />
                </Dropdown>
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ScreenCover>
  );
};

export default ContractScreen;
