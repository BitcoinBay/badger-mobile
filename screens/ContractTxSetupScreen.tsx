import React, { useState, useEffect, useMemo, useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";
import styled from "styled-components";
import {
  Clipboard,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from "react-native";
import { Header, NavigationScreenProps } from "react-navigation";
import _ from "lodash";
import BigNumber from "bignumber.js";
import { Sig } from "cashscript";

import QRCodeScanner from "react-native-qrcode-scanner";
import Ionicons from "react-native-vector-icons/Ionicons";

import { T, H1, H2, Button, Spacer, SwipeButton } from "../atoms";

import { callArtifact } from "../data/artifacts/actions";

import {
  getAddressSelector,
  bchKeypairByAccountSelector
} from "../data/accounts/selectors";
import { balancesSelector } from "../data/selectors";
import { spotPricesSelector, currencySelector } from "../data/prices/selectors";
import { activeAccountSelector } from "../data/accounts/selectors";
import { utxosByAccountSelector } from "../data/utxos/selectors";
import { artifactsByIdSelector } from "../data/artifacts/selectors";

import ContractFunctionsFactory from "../components/ContractFunctionsFactory";

import {
  formatAmount,
  formatAmountInput,
  computeFiatAmount,
  formatFiatAmount
} from "../utils/balance-utils";
import { getTokenImage } from "../utils/token-utils";
import { currencyDecimalMap } from "../utils/currency-utils";
import { getContractBalance } from "../utils/cashscript-utils";

// import { SLP } from "../utils/slp-sdk-utils";
import { bchjs } from "../utils/bch-js-utils";
import { FullState } from "../data/store";

type PropsFromParent = NavigationScreenProps & {
  navigation: {
    state?: {
      params: {
        artifactId?: string;
        fnIndex?: number;
      };
    };
  };
};

const mapStateToProps = (state: FullState) => {
  const address = getAddressSelector(state);
  const bchKeypair = bchKeypairByAccountSelector(state, address);
  const balances = balancesSelector(state, address);
  const spotPrices = spotPricesSelector(state);
  const fiatCurrency = currencySelector(state);
  const activeAccount = activeAccountSelector(state);
  const utxos = utxosByAccountSelector(
    state,
    activeAccount && activeAccount.address
  );
  const artifacts = artifactsByIdSelector(state);
  return {
    address,
    bchKeypair,
    balances,
    spotPrices,
    fiatCurrency,
    utxos,
    artifacts
  };
};

const mapDispatchToProps = {
  callArtifact
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromParent & PropsFromRedux;

const StyledTextInputAmount = styled(TextInput)`
  border-color: ${props => props.theme.accent500};
  border-right-width: ${StyleSheet.hairlineWidth};
  border-bottom-width: ${StyleSheet.hairlineWidth};
  border-top-width: ${StyleSheet.hairlineWidth};
  border-bottom-right-radius: 3px;
  border-top-right-radius: 3px;
  padding: 16px 8px;
  flex: 1;
  color: ${props => props.theme.fg100};
`;

const AmountLabel = styled(View)`
  padding: 0 8px;
  align-items: center;
  justify-content: center;
  border-left-width: ${StyleSheet.hairlineWidth};
  border-top-width: ${StyleSheet.hairlineWidth};
  border-bottom-width: ${StyleSheet.hairlineWidth};
  border-bottom-left-radius: 3px;
  border-top-left-radius: 3px;
  border-color: ${props => props.theme.accent500};
`;

const ScreenWrapper = styled(View)`
  position: relative;
  flex: 1;
`;

const TitleRow = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const StyledButton = styled(Button)`
  align-items: center;
  flex-direction: row;
`;

const ButtonArea = styled(View)`
  flex-direction: row;
  justify-content: space-between;
`;

const ActionButtonArea = styled(View)`
  align-items: center;
`;

const AmountButtonArea = styled(View)`
  flex-direction: row;
  justify-content: space-between;
`;

const AmountRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const AmountInputRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
`;

const QROverlayScreen = styled(View)`
  position: absolute;
  padding: 0 16px;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: ${Dimensions.get("window").width}px;
  height: ${Dimensions.get("window").height}px;
  z-index: 1;
  background-color: ${props => props.theme.bg900};
`;

const IconArea = styled(View)`
  align-items: center;
  justify-content: center;
  margin-right: 8px;
`;
const IconImage = styled(Image)`
  width: 64;
  height: 64;
  border-radius: 32;
  overflow: hidden;
`;

const ErrorContainer = styled(View)`
  border-color: ${props => props.theme.danger500};
  border-width: 1px;
  border-radius: 3px;
  padding: 8px;
  background-color: ${props => props.theme.danger700};
`;

const ContractTxSetupScreen = ({
  navigation,
  address,
  bchKeypair,
  balances,
  utxos,
  spotPrices,
  fiatCurrency,
  artifacts
}: Props) => {
  const {
    artifactId,
    fnIndex,
    tokenId,
    uriAddress,
    uriAmount,
    uriError
  } = (navigation.state && navigation.state.params) || {
    artifactId: null,
    fnIndex: null,
    tokenId: null,
    uriAddress: null,
    uriAmount: null,
    uriError: null
  };
  const artifact = artifacts[artifactId ? artifactId : ""];
  const { contractName, abi } = artifact;
  const { name: fnName, inputs: fnInputs } = abi[fnIndex ? fnIndex : 0];

  const contractPieces = ContractFunctionsFactory(contractName, fnName);

  if (!contractPieces) {
    navigation.goBack();
    return <View></View>;
  }

  const {
    InputsView,
    inputsValidate,
    defaultInputValues,
    options
  } = contractPieces;

  const [qrOpen, setQrOpen] = useState(false);
  const [toAddress, setToAddress] = useState("");

  const [spendAmount, setSpendAmount] = useState("0");
  const [spendAmountFiat, setSpendAmountFiat] = useState("0");
  const [spendAmountCrypto, setSpendAmountCrypto] = useState("0");
  const [amountType, setAmountType] = useState("crypto");
  const [contractBalanceCrypto, setContractBalanceCrypto] = useState(
    new BigNumber("0")
  );
  const [errors, setErrors] = useState<string[]>([] as string[]);

  const [inputValues, setInputValues] = useState(defaultInputValues(address));

  if (!artifactId || typeof fnIndex !== "number") {
    navigation.goBack();
    return <View></View>;
  }

  useEffect(() => {
    const getBalance = async () => {
      if (artifactId) {
        const contractBalance = await getContractBalance(artifactId, artifact);
        setContractBalanceCrypto(new BigNumber(contractBalance));
      }
    };

    getBalance();
  }, []);

  const availableAmount = useMemo(() => {
    let result = new BigNumber(0);

    const spendableUTXOS = utxos.filter(utxo => utxo.spendable);
    const allUTXOFee = bchjs.BitcoinCash.getByteCount(
      {
        P2PKH: spendableUTXOS.length
      },
      {
        P2PKH: 2
      }
    );
    // Available = total satoshis - fee for including all UTXO
    const availableRaw = balances.satoshisAvailable.minus(allUTXOFee);

    if (availableRaw.lte(0)) {
      result = new BigNumber(0);
    } else {
      result = availableRaw;
    }

    if (!result) {
      result = new BigNumber(0);
    }

    return result;
  }, [balances.slpTokens, balances.satoshisAvailable, utxos]);

  const coinDecimals = useMemo(() => {
    return 8;
  }, []);

  const availableFunds = useMemo(() => {
    if (coinDecimals == null) {
      return null;
    }
    return availableAmount.shiftedBy(-1 * coinDecimals);
  }, [availableAmount, coinDecimals]);

  const availableFundsDisplay = useMemo(() => {
    return formatAmount(availableAmount, coinDecimals);
  }, [availableAmount, coinDecimals]);

  const contractBalanceDisplay = useMemo(() => {
    return formatAmount(contractBalanceCrypto, coinDecimals);
  }, [contractBalanceCrypto, coinDecimals]);

  const fiatAmountTotal = useMemo(() => {
    return computeFiatAmount(availableAmount, spotPrices, fiatCurrency, "bch");
  }, [availableAmount, fiatCurrency, spotPrices]);

  const fiatDisplayTotal = formatFiatAmount(
    fiatAmountTotal,
    fiatCurrency,
    "bch"
  );

  const fiatContractBalance = useMemo(() => {
    if (!contractBalanceCrypto) return null;
    return computeFiatAmount(
      contractBalanceCrypto,
      spotPrices,
      fiatCurrency,
      "bch"
    );
  }, [contractBalanceCrypto, fiatCurrency, spotPrices]);

  const fiatContractBalanceDisplay = formatFiatAmount(
    fiatContractBalance,
    fiatCurrency,
    "bch"
  );

  const fiatRate = useMemo(() => {
    return (
      spotPrices["bch"][fiatCurrency] && spotPrices["bch"][fiatCurrency].rate
    );
  }, [spotPrices, fiatCurrency]);

  const imageSource = useMemo(() => getTokenImage(), []);

  const toggleAmountType = useCallback(() => {
    setAmountType(amountType === "crypto" ? "fiat" : "crypto");
  }, [amountType]);

  const goNextStep = useCallback(() => {
    const spendAmountSatoshis = new BigNumber(spendAmountCrypto).shiftedBy(
      coinDecimals
    );
    let params = [];
    const { hasErrors, errorMessage, parsedParams } = inputsValidate(
      inputValues,
      bchKeypair
    );

    if (
      !contractBalanceCrypto ||
      spendAmountSatoshis.gt(contractBalanceCrypto)
    ) {
      setErrors(["Cannot spend more funds than are available"]);
      return;
    }

    if (options.showAmountInput && spendAmountSatoshis.lt(546)) {
      setErrors(["There is a dust limit of 546 satoshis"]);
      return;
    }

    if (hasErrors) {
      setErrors(errorMessage);
    } else {
      if (options.requiresPk) {
        params.push(bchjs.ECPair.toPublicKey(bchKeypair));
      }

      if (options.requiresSig) {
        params.push(new Sig(bchKeypair));
      }

      params = params.concat(parsedParams);

      navigation.navigate("ContractTxConfirm", {
        address,
        artifactId,
        artifact,
        contractName,
        fnName,
        params,
        spendAmountSatoshis: options.showAmountInput
          ? spendAmountSatoshis.toNumber()
          : 546
      });
    }
  }, [
    address,
    artifactId,
    artifact,
    availableFunds,
    fnIndex,
    spendAmount,
    spendAmountCrypto
  ]);

  useEffect(() => {
    const spendAmountNumber = parseFloat(spendAmount);

    if (amountType === "crypto") {
      setSpendAmountFiat(
        fiatRate
          ? (fiatRate * (spendAmountNumber || 0)).toFixed(
              currencyDecimalMap[fiatCurrency]
            )
          : "0"
      );
      setSpendAmountCrypto(spendAmount);
    }

    if (amountType === "fiat") {
      setSpendAmountFiat(
        (spendAmountNumber || 0).toFixed(currencyDecimalMap[fiatCurrency])
      );
      setSpendAmountCrypto(
        fiatRate && spendAmountNumber
          ? (spendAmountNumber / fiatRate).toFixed(8)
          : "0"
      );
    }
  }, [amountType, fiatRate, fiatCurrency, spendAmount]);

  // Parse out address and any other relevant data
  const parseQr = useCallback(
    (
      qrData: string
    ): {
      address: string;
      amount?: string | null;
      tokenId?: string | null;
      parseError?: string | null;
    } | null => {
      let address = null;
      let amount = null;
      let uriTokenId = null;
      let parseError = null;
      let amounts = [] as { tokenId?: string; paramAmount: string }[];

      let quitEarly = false;

      const parts = qrData.split("?");
      address = parts[0];
      const parameters = parts[1];

      if (parameters) {
        const parameterParts = parameters.split("&");
        parameterParts.forEach(async param => {
          const [name, value] = param.split("=");

          if (name === "r") {
            // BIP70 detected, go to BIP70 flow
            setToAddress("");
            quitEarly = true;
            navigation.navigate("Bip70Confirm", {
              paymentURL: value
            });
          }

          if (name.startsWith("amount")) {
            // Parse request amount from URI
            let currTokenId;
            let currAmount;

            if (value.includes("-")) {
              [currAmount, currTokenId] = value.split("-");
            } else {
              currAmount = value;
            }

            amounts.push({
              tokenId: currTokenId,
              paramAmount: currAmount
            });
          }
        });
      }

      if (amounts.length > 1) {
        parseError =
          "OPTN Wallet currently only supports sending one coin or token at a time.  The URI is requesting multiple coins.";
      } else if (amounts.length === 1) {
        const target = amounts[0];
        uriTokenId = target.tokenId;
        amount = target.paramAmount;
      }

      if (quitEarly) {
        return null;
      }

      return {
        address,
        amount,
        parseError,
        tokenId: uriTokenId
      };
    },
    [navigation]
  );
  const handleAddressData = useCallback(
    (parsedData: AddressData) => {
      setErrors([]);

      // Verify the type matches the screen we are on.
      if (parsedData.tokenId && parsedData.tokenId !== tokenId) {
        setErrors([
          "Sending different coin or token than selected, go to the target coin screen and try again"
        ]);
        return;
      }

      parsedData.parseError && setErrors([parsedData.parseError]);
      // If there's an amount, set the type to crypto
      parsedData.amount && setAmountType("crypto");

      console.log(parsedData);

      if (parsedData.address) {
        try {
          bchjs.SLP.Address.isCashAddress(parsedData.address) ||
            bchjs.SLP.Address.isSLPAddress(parsedData.address);
        } catch (e) {
          setErrors([e.message]);
        }

        setToAddress(parsedData.address);
      }
      parsedData.amount && setSendAmount(parsedData.amount);
    },
    [tokenId]
  );

  const spendAmountFiatFormatted = useMemo(() => {
    return formatFiatAmount(
      new BigNumber(spendAmountFiat),
      fiatCurrency,
      "bch"
    );
  }, [fiatCurrency, spendAmountFiat]);

  const spendAmountCryptoFormatted = useMemo(() => {
    if (spendAmountCrypto.length) {
      return new BigNumber(spendAmountCrypto).toFormat();
    }
    return "0";
  }, [spendAmountCrypto]);

  const getInputElems = useMemo(() => {
    return (
      <InputsView
        address={address}
        inputValues={inputValues}
        setInputValues={setInputValues}
      />
    );
  }, [contractName, fnInputs, inputValues]);

  return (
    <SafeAreaView
      style={{
        // padding 16 for each side
        flex: 1
      }}
    >
      <ScreenWrapper>
        {qrOpen && (
          <QROverlayScreen>
            <Spacer small />
            <H2 center>Scan QR Code</H2>
            <Spacer small />

            <View
              style={{
                height: Dimensions.get("window").width - 12
              }}
            >
              <QRCodeScanner
                cameraProps={{
                  ratio: "1:1",
                  captureAudio: false
                }}
                fadeIn={false}
                onRead={e => {
                  const qrData = e.data;
                  const parsedData = parseQr(qrData);

                  if (parsedData) {
                    handleAddressData(parsedData);
                  }

                  setQrOpen(false);
                }}
                cameraStyle={{
                  height: Dimensions.get("window").width - 32,
                  width: Dimensions.get("window").width - 32
                }}
              />
            </View>
            <Spacer />
            <Button
              nature="cautionGhost"
              onPress={() => setQrOpen(false)}
              text="Cancel Scan"
            />
          </QROverlayScreen>
        )}
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingRight: 16,
            paddingLeft: 16
          }}
        >
          <KeyboardAvoidingView
            behavior="position"
            keyboardVerticalOffset={Header.HEIGHT + 20}
          >
            <Spacer small />

            <TitleRow>
              <H1>
                {contractName} ({fnName})
              </H1>
            </TitleRow>
            <IconArea>
              <IconImage source={imageSource} />
            </IconArea>
            <Spacer small />
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
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View>
                <T center>Your Balance (BCH)</T>
                <H2 center>{availableFundsDisplay}</H2>

                {fiatDisplayTotal && (
                  <T center type="muted">
                    {fiatDisplayTotal}
                  </T>
                )}
              </View>
              <Spacer />
              <View>
                <T center>Contract Balance (BCH)</T>
                <H2 center>{contractBalanceDisplay}</H2>

                {fiatContractBalanceDisplay && (
                  <T center type="muted">
                    {fiatContractBalanceDisplay}
                  </T>
                )}
              </View>
            </View>
            <Spacer />

            {getInputElems}

            <Spacer tiny />
            <ButtonArea>
              <StyledButton
                nature="ghost"
                onPress={async () => {
                  const content = await Clipboard.getString();
                  const parsedData = parseQr(content);

                  if (parsedData) {
                    handleAddressData(parsedData);
                  }
                }}
              >
                <T center spacing="loose" type="primary" size="small">
                  <Ionicons name="ios-clipboard" size={18} /> Paste
                </T>
              </StyledButton>
              <StyledButton
                nature="ghost"
                text="Scan QR"
                onPress={() => setQrOpen(true)}
              >
                <T center spacing="loose" type="primary" size="small">
                  <Ionicons name="ios-qr-scanner" size={18} /> Scan QR
                </T>
              </StyledButton>
            </ButtonArea>
            <Spacer />

            {options.showAmountInput && (
              <>
                <Spacer />
                <AmountRow>
                  <T>Spend Amount:</T>
                  <View>
                    <T size="small" monospace right>
                      {spendAmountCryptoFormatted || "0"}
                    </T>
                    <T size="small" monospace right>
                      {spendAmountFiatFormatted}
                    </T>
                  </View>
                </AmountRow>
                <Spacer tiny />
                <AmountInputRow>
                  <AmountLabel>
                    <T type="muted2" weight="bold">
                      {amountType === "crypto"
                        ? "BCH"
                        : fiatCurrency.toUpperCase()}
                    </T>
                  </AmountLabel>
                  <StyledTextInputAmount
                    keyboardType="numeric"
                    editable
                    placeholder="0.0"
                    autoCompleteType="off"
                    autoCorrect={false}
                    autoCapitalize="none"
                    value={spendAmount}
                    onChangeText={text => {
                      setErrors([]);

                      if (amountType === "crypto") {
                        coinDecimals != null &&
                          setSpendAmount(formatAmountInput(text, coinDecimals));
                      } else if (amountType === "fiat") {
                        setSpendAmount(
                          formatAmountInput(
                            text,
                            currencyDecimalMap[fiatCurrency]
                          )
                        );
                      }
                    }}
                  />
                </AmountInputRow>
                <Spacer tiny />
                <AmountButtonArea>
                  <StyledButton nature="ghost" onPress={toggleAmountType}>
                    <T center spacing="loose" type="primary" size="small">
                      <Ionicons name="ios-swap" size={18} />{" "}
                      {amountType === "crypto"
                        ? fiatCurrency.toUpperCase()
                        : "BCH"}
                    </T>
                  </StyledButton>

                  <StyledButton
                    nature="ghost"
                    onPress={() => {
                      setSpendAmount(
                        amountType === "crypto"
                          ? `${contractBalanceDisplay}`
                          : `${fiatContractBalance}`
                      );
                      setErrors([]);
                    }}
                  >
                    <T center spacing="loose" type="primary" size="small">
                      <Ionicons name="ios-color-wand" size={18} /> Spend Max
                    </T>
                  </StyledButton>
                </AmountButtonArea>
                <Spacer small />
              </>
            )}
          </KeyboardAvoidingView>
          <Spacer fill />
          <Spacer small />
          <ActionButtonArea>
            <Button onPress={goNextStep} text="Send" />
            <Spacer small />
            <Button
              nature="cautionGhost"
              onPress={() => navigation.navigate("Home")}
              text="Cancel"
            />
          </ActionButtonArea>
          <Spacer />
        </ScrollView>
      </ScreenWrapper>
    </SafeAreaView>
  );
};

export default connector(ContractTxSetupScreen);
