import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { View, ScrollView, SafeAreaView, Image } from "react-native";
import styled from "styled-components";
import _ from "lodash";
import BigNumber from "bignumber.js";
import { NavigationScreenProps } from "react-navigation";

import {
  getAddressSelector,
  getAddressSlpSelector
} from "../data/accounts/selectors";
import { tokensByIdSelector } from "../data/tokens/selectors";
import { spotPricesSelector, currencySelector } from "../data/prices/selectors";

import { updateUtxos } from "../data/utxos/actions";
import { updateTransactions } from "../data/transactions/actions";

import { Button, T, Spacer, H1, H2 } from "../atoms";

import { getTokenImage } from "../utils/token-utils";
import { formatFiatAmount } from "../utils/balance-utils";

import { SLP } from "../utils/slp-sdk-utils";
import { FullState } from "../data/store";

const ScreenCover = styled(View)`
  flex: 1;
  background-color: ${props => props.theme.primary500};
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

type PropsFromParent = NavigationScreenProps & {
  navigation: {
    state: {
      params: {
        txParams: any;
      };
    };
  };
};

const mapStateToProps = (state: FullState) => ({
  address: getAddressSelector(state),
  addressSlp: getAddressSlpSelector(state),
  tokensById: tokensByIdSelector(state),
  spotPrices: spotPricesSelector(state),
  fiatCurrency: currencySelector(state)
});

const mapDispatchToProps = {
  updateUtxos,
  updateTransactions
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromParent & PropsFromRedux;

const SendSuccessScreen = ({
  address,
  addressSlp,
  navigation,
  spotPrices,
  fiatCurrency,
  updateUtxos,
  updateTransactions
}: Props) => {
  const {
    artifactId,
    contractName,
    fnName,
    spendAmountSatoshis,
    txId
  } = navigation.state.params;

  // const tokenId = txParams.sendTokenData && txParams.sendTokenData.tokenId;

  useEffect(() => {
    // Slight delay so api returns updated info.  Otherwise gets updated in standard interval
    _.delay(() => updateUtxos(address, addressSlp), 1750);
    _.delay(() => updateTransactions(address, addressSlp), 2000);
  }, [address, addressSlp]);

  const protocol = "bitcoincash";
  const artifactAddressStart = artifactId ? artifactId.slice(0, 5) : null;
  const artifactAddressMiddle = artifactId ? artifactId.slice(5, -6) : null;
  const artifactAddressEnd = artifactId ? artifactId.slice(-6) : null;

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
          <Spacer />
          <H1 center type="inverse" weight="bold">
            Success!
          </H1>
          <Spacer small />
          {/* <IconArea>
            <IconImage source={imageSource} />
          </IconArea> */}
          <Spacer small />
          <H1 center>
            {contractName} ({fnName})
          </H1>
          <Spacer />
          <H2 center weight="bold" type="inverse">
            Sent
          </H2>
          <Spacer tiny />
          <H2 center weight="bold">
            {spendAmountBase.toFormat() || "--"} bch
          </H2>
          {fiatDisplay && (
            <T center type="muted">
              {fiatDisplay}
            </T>
          )}
          <Spacer large />
          <H2 center type="inverse" weight="bold">
            From
          </H2>
          <Spacer small />
          <T center type="inverse">
            {protocol}:
          </T>
          <T center type="inverse">
            <T
              style={{
                fontWeight: "bold"
              }}
              type="inverse"
            >
              {artifactAddressStart}
            </T>
            <T size="xsmall" type="inverse">
              {artifactAddressMiddle}
            </T>
            <T
              style={{
                fontWeight: "bold"
              }}
              type="inverse"
            >
              {artifactAddressEnd}
            </T>
          </T>
          <Spacer large />
          <H2 center type="inverse" weight="bold">
            Transaction ID
          </H2>
          <Spacer small />
          <T center type="inverse">
            {txId}
          </T>
          <Spacer fill />
          <Spacer small />
          <Button
            nature="inverse"
            style={{
              marginLeft: 7,
              marginRight: 7
            }}
            onPress={() => navigation.navigate("Home")}
            text="Finish"
          />
          <Spacer small />
        </ScrollView>
      </SafeAreaView>
    </ScreenCover>
  );
};

export default connector(SendSuccessScreen);
