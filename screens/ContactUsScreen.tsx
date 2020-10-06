import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Linking,
  TouchableOpacity
} from "react-native";
import { NavigationScreenProps } from "react-navigation";
import styled from "styled-components";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";

import { T, Spacer } from "../atoms";

const ScreenWrapper = styled(ScrollView)`
  padding: 7px 16px;
`;

type Props = NavigationScreenProps & {};

const ContactUsScreen = (props: Props) => {
  return (
    <SafeAreaView
      style={{
        height: "100%"
      }}
    >
      <ScreenWrapper
        contentContainerStyle={{
          flexGrow: 1
        }}
      >
        <Spacer />
        <T center>We hope you are enjoying OPTN Wallet</T>
        <Spacer small />
        <T center>
          If you wish to give feedback, ask a question, or contact us for
          another reason, get in touch with the team through electronic mail or
          Telegram
        </T>
        <Spacer large />
        <T center>
          <Ionicons name="ios-mail" size={22} /> Email
        </T>
        <Spacer tiny />
        <TouchableOpacity
          onPress={() =>
            Linking.openURL("mailto:info@bitcoinbay.ca?subject=OPTN Wallet")
          }
        >
          <T center size="large">
            info@bitcoinbay.ca
          </T>
        </TouchableOpacity>
        <Spacer />
        <T center>
          <FontAwesome name="telegram" size={22} /> Telegram
        </T>
        <Spacer tiny />
        <TouchableOpacity
          onPress={() =>
            Linking.openURL("https://t.me/joinchat/Ig0qehn6gq215dzUKMp2xg")
          }
        >
          <T center size="large">
            OPTN Wallet Group
          </T>
        </TouchableOpacity>
        <Spacer />
      </ScreenWrapper>
    </SafeAreaView>
  );
};

export default ContactUsScreen;
