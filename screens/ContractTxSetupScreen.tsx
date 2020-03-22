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
import BigNumber from "bignumber.js";

import Ionicons from "react-native-vector-icons/Ionicons";

import { T, H1, H2, Button, Spacer, SwipeButton } from "../atoms";

import { updateTokensMeta } from "../data/tokens/actions";

import { getAddressSelector } from "../data/accounts/selectors";
import { balancesSelector, Balances } from "../data/selectors";
import { tokensByIdSelector } from "../data/tokens/selectors";
import { spotPricesSelector, currencySelector } from "../data/prices/selectors";
import { activeAccountSelector } from "../data/accounts/selectors";
import { utxosByAccountSelector } from "../data/utxos/selectors";

import {
  formatAmount,
  formatAmountInput,
  computeFiatAmount,
  formatFiatAmount
} from "../utils/balance-utils";
import { currencyDecimalMap } from "../utils/currency-utils";

import { SLP } from "../utils/slp-sdk-utils";
import { FullState } from "../data/store";

type PropsFromParent = NavigationScreenProps & {
  navigation: {
    state?: {
      params: {
        artifactId?: string | null;
        artifact?: string | null;
        functionIndex?: Number | null;
        functionName?: string | null;
      };
    };
  };
};

const mapStateToProps = (state: FullState) => {
  const address = getAddressSelector(state);
  const balances = balancesSelector(state, address);
  const tokensById = tokensByIdSelector(state);
  const spotPrices = spotPricesSelector(state);
  const fiatCurrency = currencySelector(state);
  const activeAccount = activeAccountSelector(state);
  const utxos = utxosByAccountSelector(
    state,
    activeAccount && activeAccount.address
  );
  return {
    address,
    tokensById,
    balances,
    spotPrices,
    fiatCurrency,
    utxos
  };
};

const mapDispatchToProps = {
  updateTokensMeta
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromParent & PropsFromRedux;

type ContractFunctionInput = {
  name: string;
  type: string;
};

const StyledTextInput = styled(TextInput)`
  border-color: ${props => props.theme.accent500};
  border-width: ${StyleSheet.hairlineWidth};
  border-radius: 3px;
  padding: 16px 8px;
`;

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

const SignTransactionOverlay = styled(View)`
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
  tokensById,
  balances,
  utxos,
  spotPrices,
  fiatCurrency
}: Props) => {
  const [sendAmount, setSendAmount] = useState("");
  const [sendAmountFiat, setSendAmountFiat] = useState("0");
  const [sendAmountCrypto, setSendAmountCrypto] = useState("0");
  const [amountType, setAmountType] = useState("crypto");

  const [errors, setErrors] = useState<string[]>([] as string[]);
  const [showSignatureOverlay, setShowSignatureOverlay] = useState(false);

  const {
    artifactId,
    contractName,
    artifact,
    fnIndex,
    fnName,
    fnInputs
  } = navigation.state.params;

  // Create default input values to store in inputValues state
  const getDefaultInputValues = (functionInputs: ContractFunctionInput[]) => {
    return functionInputs.reduce(
      (
        defaultFunctionInputs: { [index: string]: any },
        functionInput: ContractFunctionInput
      ) => {
        if (functionInput.type === "pubkey") {
          return { ...defaultFunctionInputs, [functionInput.name]: address };
        } else {
          return defaultFunctionInputs;
        }
      },
      {}
    );
  };

  const [inputValues, setInputValues] = useState(
    getDefaultInputValues(fnInputs)
  );
  const [isTxSigned, setIsTxSigned] = useState(false);

  const availableAmount = useMemo(() => {
    let result = new BigNumber(0);

    const spendableUTXOS = utxos.filter(utxo => utxo.spendable);
    const allUTXOFee = SLP.BitcoinCash.getByteCount(
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

  const getReadableInputType = (type: string) => {
    if (type === "pubkey") {
      return "public key";
    }
  };

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

  const requiresSig = useMemo(() => {
    return fnInputs.reduce(
      (hasSig: boolean, input: ContractFunctionInput) =>
        hasSig || input.type === "sig",
      false
    );
  }, [fnInputs]);

  const inputsWithoutSig = useMemo(() => {
    return fnInputs.filter(
      (input: ContractFunctionInput) => input.type !== "sig"
    );
  }, [fnInputs]);

  const fiatAmountTotal = useMemo(() => {
    return computeFiatAmount(availableAmount, spotPrices, fiatCurrency, "bch");
  }, [availableAmount, fiatCurrency, spotPrices]);

  const fiatRate = useMemo(() => {
    return (
      spotPrices["bch"][fiatCurrency] && spotPrices["bch"][fiatCurrency].rate
    );
  }, [spotPrices, fiatCurrency]);

  const toggleAmountType = useCallback(() => {
    setAmountType(amountType === "crypto" ? "fiat" : "crypto");
  }, [amountType]);

  const goNextStep = useCallback(() => {
    let hasErrors = false;

    if (!availableFunds || new BigNumber(sendAmountCrypto).gt(availableFunds)) {
      setErrors(["Cannot send more funds than are available"]);
      hasErrors = true;
    }

    // Check if inputs are correct
    fnInputs.forEach(
      (functionInput: ContractFunctionInput) => {
        const inputValue: any = inputValues[functionInput.name];
        switch (functionInput.type) {
          case "pubkey":
            if(!SLP.Address.isCashAddress(inputValue)) {
              setErrors([`Invalid address provided to ${functionInput.name}`]);
              hasErrors = true;
            }
            break;
          default:
            hasErrors = false;
            break;
        }
      }
    );

    if (!hasErrors && requiresSig && !isTxSigned) {
      setShowSignatureOverlay(true);
    } else {
      console.log("Do transaction submit");
    }
  }, [availableFunds, navigation, sendAmount, sendAmountCrypto]);

  useEffect(() => {
    const sendAmountNumber = parseFloat(sendAmount);

    if (amountType === "crypto") {
      setSendAmountFiat(
        fiatRate
          ? (fiatRate * (sendAmountNumber || 0)).toFixed(
              currencyDecimalMap[fiatCurrency]
            )
          : "0"
      );
      setSendAmountCrypto(sendAmount);
    }

    if (amountType === "fiat") {
      setSendAmountFiat(
        (sendAmountNumber || 0).toFixed(currencyDecimalMap[fiatCurrency])
      );
      setSendAmountCrypto(
        fiatRate && sendAmountNumber
          ? (sendAmountNumber / fiatRate).toFixed(8)
          : "0"
      );
    }
  }, [amountType, fiatRate, fiatCurrency, sendAmount]);

  const sendAmountFiatFormatted = useMemo(() => {
    return formatFiatAmount(new BigNumber(sendAmountFiat), fiatCurrency, "bch");
  }, [fiatCurrency, sendAmountFiat]);

  const sendAmountCryptoFormatted = useMemo(() => {
    if (sendAmountCrypto.length) {
      return new BigNumber(sendAmountCrypto).toFormat();
    }
    return "0";
  }, [sendAmountCrypto]);

  return (
    <SafeAreaView
      style={{
        // padding 16 for each side
        flex: 1
      }}
    >
      <ScreenWrapper>
        {showSignatureOverlay && (
          <SignTransactionOverlay>
            <Spacer small />
            <H2 center>This transanction requires a signiture</H2>
            <View>
              <SwipeButton
                swipeFn={() => {
                  setIsTxSigned(true);
                  setShowSignatureOverlay(false);
                }}
                labelAction="To sign"
                labelRelease="Swipe to sign"
                labelHalfway="Keep going"
              />
              <Spacer />
              <Button
                nature="cautionGhost"
                onPress={() => setShowSignatureOverlay(false)}
                text="Cancel Signing"
              />
            </View>
          </SignTransactionOverlay>
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
            <H2 center>{availableFundsDisplay}</H2>
            {inputsWithoutSig.map((functionInput: ContractFunctionInput) => (
              <View key={functionInput.name}>
                <Spacer small />
                <T>
                  {functionInput.name} (
                  {getReadableInputType(functionInput.type)}):
                </T>
                <Spacer tiny />
                <View>
                  {functionInput.type === "pubkey" && (
                    <StyledTextInput
                      editable={false}
                      multiline
                      value={address}
                    />
                  )}
                </View>
              </View>
            ))}
            <Spacer />
            <AmountRow>
              <T>Amount:</T>
              <View>
                <T size="small" monospace right>
                  {sendAmountCryptoFormatted || "0"}
                </T>
                <T size="small" monospace right>
                  {sendAmountFiatFormatted}
                </T>
              </View>
            </AmountRow>
            <Spacer tiny />
            <AmountInputRow>
              <AmountLabel>
                <T type="muted2" weight="bold">
                  {amountType === "crypto" ? "BCH" : fiatCurrency.toUpperCase()}
                </T>
              </AmountLabel>
              <StyledTextInputAmount
                keyboardType="numeric"
                editable
                placeholder="0.0"
                autoCompleteType="off"
                autoCorrect={false}
                autoCapitalize="none"
                value={sendAmount}
                onChangeText={text => {
                  setErrors([]);

                  if (amountType === "crypto") {
                    coinDecimals != null &&
                      setSendAmount(formatAmountInput(text, coinDecimals));
                  } else if (amountType === "fiat") {
                    setSendAmount(
                      formatAmountInput(text, currencyDecimalMap[fiatCurrency])
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
                  setSendAmount(
                    amountType === "crypto"
                      ? `${availableFunds}`
                      : `${fiatAmountTotal}`
                  );
                  setErrors([]);
                }}
              >
                <T center spacing="loose" type="primary" size="small">
                  <Ionicons name="ios-color-wand" size={18} /> Send Max
                </T>
              </StyledButton>
            </AmountButtonArea>
            <Spacer small />
          </KeyboardAvoidingView>
          <Spacer fill />
          <Spacer small />
          <ActionButtonArea>
            {requiresSig && !isTxSigned && <Button onPress={goNextStep} text="Next Step" />}
            {!requiresSig || isTxSigned && <Button onPress={goNextStep} text="Send" />}
            <Spacer small />
            <Button
              nature="cautionGhost"
              onPress={() => navigation.goBack()}
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
