import React, { useState } from "react";
import { connect, ConnectedProps, Connect } from "react-redux";
import styled from "styled-components";
import {
  ScrollView,
  SafeAreaView,
  StyleSheet,
  View,
  Image
} from "react-native";
import { NavigationScreenProps, NavigationEvents } from "react-navigation";
import BigNumber from "bignumber.js";

import { Button, T, H1, H2, Spacer, SwipeButton } from "../atoms";

import { tokensByIdSelector } from "../data/tokens/selectors";

import { formatFiatAmount } from "../utils/balance-utils";

import { Artifact, callContract } from "../utils/cashscript-utils";

import { getTokenImage } from "../utils/token-utils";

import {
  getKeypairSelector,
  activeAccountSelector
} from "../data/accounts/selectors";
import { utxosByAccountSelector } from "../data/utxos/selectors";
import { spotPricesSelector, currencySelector } from "../data/prices/selectors";

import { SLP } from "../utils/slp-sdk-utils";
import { FullState } from "../data/store";

const ScreenWrapper = styled(SafeAreaView)`
  height: 100%;
  padding: 0 16px;
`;
const IconArea = styled(View)`
  align-items: center;
  justify-content: center;
`;
const IconImage = styled(Image)`
  width: 64;
  height: 64;
  border-radius: 32;
  overflow: hidden;
`;

const ButtonsContainer = styled(View)`
  align-items: center;
`;

const ErrorHolder = styled(View)`
  margin: 0 16px;
  padding: 8px;
  background-color: ${props => props.theme.danger700};
  border-width: ${StyleSheet.hairlineWidth};
  border-radius: 3px;
  border-color: ${props => props.theme.danger300};
`;

type PropsFromParent = NavigationScreenProps & {
  navigation: {
    state?: {
      params: {
        artifactId: string;
        artifact: Artifact;
        fnName: string;
        params: Array<any>;
        spendAmount: number;
      };
    };
  };
};

const mapStateToProps = (state: FullState) => {
  const tokensById = tokensByIdSelector(state);
  const activeAccount = activeAccountSelector(state);
  const utxos = utxosByAccountSelector(
    state,
    activeAccount && activeAccount.address
  );
  const keypair = getKeypairSelector(state);
  const spotPrices = spotPricesSelector(state);
  const fiatCurrency = currencySelector(state);
  return {
    activeAccount,
    keypair,
    spotPrices,
    fiatCurrency,
    tokensById,
    utxos
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromParent & PropsFromRedux;

const ContractTxConfirmScreen = ({
  navigation,
  activeAccount,
  fiatCurrency,
  keypair,
  spotPrices
}: Props) => {
  const {
    artifactId,
    artifact,
    contractName,
    fnName,
    params,
    spendAmountSatoshis
  } = navigation.state && navigation.state.params;

  if (!artifactId || !activeAccount || !keypair) {
    navigation.goBack();
    return <View></View>;
  }

  const [sendError, setSendError] = useState<{
    message?: string;
    error?: string;
  } | null>(null);

  const [transactionState, setTransactionState] = useState("setup");

  const protocol = "bitcoincash";
  const artifactAddressStart = artifactId ? artifactId.slice(0, 5) : null;
  const artifactAddressMiddle = artifactId ? artifactId.slice(5, -6) : null;
  const artifactAddressEnd = artifactId ? artifactId.slice(-6) : null;

  const imageSource = getTokenImage("bch");

  const spendAmountBase = spendAmountSatoshis
    ? new BigNumber(spendAmountSatoshis).shiftedBy(-8)
    : new BigNumber(0);

  const BCHPrices = spotPrices["bch"];
  let BCHFiatAmount = 0;
  const fiatInfo = BCHPrices[fiatCurrency];
  const fiatRate = fiatInfo && fiatInfo.rate;
  if (fiatRate) {
    BCHFiatAmount = fiatRate * spendAmountBase.toNumber();
  }
  const fiatDisplay = formatFiatAmount(
    new BigNumber(BCHFiatAmount),
    fiatCurrency,
    "bch"
  );

  //   const imageSource = getTokenImage(tokenId);

  const signSendTransaction = async () => {
    try {
      const tx = await callContract(
        artifactId,
        artifact,
        fnName,
        params,
        spendAmountSatoshis
      );
      navigation.replace("ContractTxSuccess", {
        artifactId,
        contractName,
        fnName,
        spendAmountSatoshis,
        txId: tx.txid
      });
    } catch (error) {
      setTransactionState("setup");
      setSendError(error);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1
        }}
      >
        <Spacer small />
        <H1 center>
          {contractName} ({fnName})
        </H1>
        <Spacer small />
        {/* <IconArea>
          <IconImage source={imageSource} />
        </IconArea> */}

        <Spacer />
        <H2 center>Spending</H2>
        <Spacer small />
        <H2 center weight="bold">
          {spendAmountBase.toFormat() || "--"} bch
        </H2>
        {fiatDisplay && (
          <T center type="muted">
            {fiatDisplay}
          </T>
        )}
        <Spacer large />
        <H2 center>From Address</H2>
        <Spacer small />
        <T size="small" center>
          {protocol}:
        </T>
        <T center>
          <T weight="bold">{artifactAddressStart}</T>
          <T size="small">{artifactAddressMiddle}</T>
          <T weight="bold">{artifactAddressEnd}</T>
        </T>
        <Spacer small />
        {sendError && (
          <ErrorHolder>
            <T center type="danger">
              {sendError.message || sendError.error}
            </T>
          </ErrorHolder>
        )}
        <Spacer fill />
        <Spacer small />

        <ButtonsContainer>
          <SwipeButton
            swipeFn={() => signSendTransaction()}
            labelAction="To Send"
            labelRelease="Release to send"
            labelHalfway="Keep going"
            controlledState={
              transactionState === "signing" ? "pending" : undefined
            }
          />

          <Spacer />

          {transactionState !== "signing" && (
            <Button
              nature="cautionGhost"
              text="Cancel Transaction"
              onPress={() => navigation.goBack()}
            />
          )}
        </ButtonsContainer>
        <Spacer small />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default connector(ContractTxConfirmScreen);
