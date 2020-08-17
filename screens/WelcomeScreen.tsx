import React from "react";
import { SafeAreaView, View, Image } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import styled from "styled-components";

import { T, H1, H2, Spacer, Button } from "../atoms";

import OPTNWelcome3 from "../assets/images/OPTNWelcome3.png";

const StyledWrapper = styled(SafeAreaView)`
  display: flex;
  flex: 1;
  align-items: center;
  margin: 0 16px;
`;

type Props = NavigationScreenProps & {};

const WelcomeScreen = ({ navigation }: Props) => {
  return (
    <StyledWrapper>
      <Spacer />
      <H1>OPTN Wallet</H1>
      <Spacer />
      <Image
        source={OPTNWelcome3}
        style={{
          width: 150,
          height: 150
        }}
      />
      <Spacer />
      <View
        style={{
          flex: 1
        }}
      >
        <H2
          style={{
            textAlign: "center"
          }}
        >
          A Fork of Badger Mobile Wallet
        </H2>
        <Spacer small />
        <T center>Bitcoin Cash (BCH) and Simple Token (SLP) wallet </T>
      </View>

      <View
        style={{
          flex: 1
        }}
      >
        <Button
          onPress={() => navigation.navigate("CreateWallet")}
          text="New Wallet"
        />
        <Spacer small />
        <Button
          onPress={() => navigation.navigate("RestoreFromBackup")}
          text="Restore Wallet"
        />
      </View>
    </StyledWrapper>
  );
};

export default WelcomeScreen;
