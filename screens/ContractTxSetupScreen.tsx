import React, { useState, useEffect, useMemo, useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";
import styled from "styled-components";
import {
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

import {
  formatAmount,
  formatAmountInput,
  computeFiatAmount,
  formatFiatAmount
} from "../utils/balance-utils";
import { getTokenImage } from "../utils/token-utils";
import { currencyDecimalMap } from "../utils/currency-utils";
import { getContractBalance } from "../utils/cashscript-utils";

import { SLP } from "../utils/slp-sdk-utils";
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

const defaultInputValues = {
  P2PKH: {
    spend: null
  },
  SLPWallet: {
    reclaim: null,
    SLPGenesis: {
      ticker: "",
      name: "",
      url: "",
      hash: "0x00",
      decimal: "8",
      mintVout: "",
      initialSupply: "1000000"
    },
    SLPMint: {
      receiveMint: "",
      tokenId: "",
      mintVout: "",
      additionalSupply: "100000"
    },
    SLPSend: {
      SLPReceiver: "",
      tokenId: "",
      sendSLPAmount: "1000",
      changeSLPAmount: "0"
    }
  }
};

const ContractTxSetupScreen = ({
  navigation,
  address,
  bchKeypair,
  balances,
  utxos,
  spotPrices,
  fiatCurrency,
  artifacts,
  callArtifact
}: Props) => {
  const { artifactId, fnIndex } = navigation.state.params;
  const artifact = artifacts[artifactId ? artifactId : ""];
  const { contractName, abi } = artifact;
  const { name: fnName, inputs: fnInputs } = abi[fnIndex ? fnIndex : 0];

  const [spendAmount, setSpendAmount] = useState("");
  const [spendAmountFiat, setSpendAmountFiat] = useState("0");
  const [spendAmountCrypto, setSpendAmountCrypto] = useState("0");
  const [amountType, setAmountType] = useState("crypto");
  const [contractBalanceCrypto, setContractBalanceCrypto] = useState(
    new BigNumber("0")
  );
  const [isTxSigned, setIsTxSigned] = useState(false);
  const [errors, setErrors] = useState<string[]>([] as string[]);
  const [showSignatureOverlay, setShowSignatureOverlay] = useState(false);

  const [inputValues, setInputValues] = useState(
    defaultInputValues[contractName][fnName]
  );

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

  const contractBalanceDisplay = useMemo(() => {
    return formatAmount(contractBalanceCrypto, coinDecimals);
  }, [contractBalanceCrypto, coinDecimals]);

  const requiresSig = useMemo(() => {
    return fnInputs.reduce(
      (hasSig: boolean, functionInput) =>
        hasSig || functionInput.type === "sig",
      false
    );
  }, [fnInputs]);

  const inputsWithoutSig = useMemo(() => {
    return fnInputs.filter(functionInput => functionInput.type !== "sig");
  }, [fnInputs]);

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
    let hasErrors = false;

    const spendAmountSatoshis = new BigNumber(spendAmountCrypto).shiftedBy(
      coinDecimals
    );
    if (
      (fnName === "spend" && !contractBalanceCrypto) ||
      spendAmountSatoshis.gt(contractBalanceCrypto)
    ) {
      setErrors(["Cannot spend more funds than are available"]);
      hasErrors = true;
    }

    if (fnName === "SLPGenesis") {
      const { ticker, name, decimal, mintVout, initialSupply } = inputValues;
      const re = /[0-9A-Fa-f]{2}/g;

      if (!ticker) {
        setErrors(["Ticker symbol cannot be empty"]);
        hasErrors = true;
      }

      if (!name) {
        setErrors(["Token name cannot be empty"]);
        hasErrors = true;
      }

      if (isNaN(decimal)) {
        setErrors(["Number of decimals has to be a number between 0 and 255"]);
        hasErrors = true;
      } else {
        const bn = new BigNumber(decimal);
        if (!bn.isInteger()) {
          setErrors(["Number of decimals cannot have fractions"]);
          hasErrors = true;
        } else if (bn.lt(0) || bn.gt(255)) {
          setErrors([
            "Number of decimals has to be a number between 0 and 255"
          ]);
          hasErrors = true;
        }
      }

      if (mintVout && !re.test(mintVout)) {
        setErrors(["Invalid minting baton"]);
        hasErrors = true;
      }
      console.log(initialSupply);
      if (isNaN(initialSupply)) {
        setErrors(["Additional Supply has to be a number"]);
        hasErrors = true;
      } else {
        const bn = new BigNumber(initialSupply);

        if (!bn.isInteger()) {
          setErrors(["Additional Supply cannot have fractions"]);
          hasErrors = true;
        } else if (bn.isNegative()) {
          setErrors(["Additional Supply cannot be a negative number"]);
          hasErrors = true;
        }
      }
    }

    if (!hasErrors) {
      if (requiresSig && !isTxSigned) {
        setShowSignatureOverlay(true);
      } else {
        let params;

        if (fnName === "spend" || fnName === "reclaim") {
          params = [SLP.ECPair.toPublicKey(bchKeypair), new Sig(bchKeypair)];
        }

        if (fnName === "SLPGenesis") {
          let decimalBuffer = new ArrayBuffer(1);
          new DataView(decimalBuffer).setUint8(0, inputValues.decimal);
          let initialSupplyBuffer = new ArrayBuffer(8);
          new DataView(initialSupplyBuffer).setBigUint64(
            0,
            inputValues.initialSupply
          );

          params = [
            SLP.ECPair.toPublicKey(bchKeypair),
            new Sig(bchKeypair),
            Buffer.from(inputValues.ticker),
            Buffer.from(inputValues.name),
            Buffer.from(inputValues.url),
            Buffer.alloc(32),
            Buffer.from(new Uint8Array(decimalBuffer)),
            inputValues.mintVout
              ? Buffer.from(inputValues.mintVout, "hex")
              : Buffer.alloc(1),
            Buffer.from(new Uint8Array(initialSupplyBuffer))
          ];
        }

        callArtifact(
          artifactId,
          artifact,
          fnName,
          params,
          spendAmountSatoshis.toNumber()
        );
      }
    }
  }, [
    address,
    artifactId,
    artifact,
    isTxSigned,
    availableFunds,
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
    if (
      (contractName === "P2PKH" && fnName === "spend") ||
      (contractName === "SLPWallet" && fnName === "reclaim")
    ) {
      return (
        <View>
          <T>Your Public Key</T>
          <Spacer tiny />
          <StyledTextInput editable={false} multiline value={address} />
        </View>
      );
    } else if (contractName === "SLPWallet") {
      if (fnName === "SLPGenesis") {
        return (
          <View>
            <T>Ticker Symbol</T>
            <Spacer tiny />
            <StyledTextInput
              editable
              multiline
              placeholder="ABC-DE"
              value={inputValues["ticker"]}
              onChangeText={text => {
                setInputValues({ ...inputValues, ticker: text });
              }}
            />
            <Spacer tiny />
            <T>Token Name</T>
            <Spacer tiny />
            <StyledTextInput
              editable
              multiline
              onChangeText={text =>
                setInputValues({ ...inputValues, name: text })
              }
              value={inputValues["name"]}
            />
            <Spacer tiny />
            <T>URL</T>
            <Spacer tiny />
            <StyledTextInput
              editable
              multiline
              placeholder="Optional"
              onChangeText={text =>
                setInputValues({ ...inputValues, url: text })
              }
              value={inputValues["url"]}
            />
            <Spacer tiny />
            <View style={{ flexDirection: "row" }}>
              <View style={{ flexGrow: 1 }}>
                <T>Decimals</T>
                <Spacer tiny />
                <StyledTextInput
                  editable
                  multiline
                  keyboardType="numeric"
                  onChangeText={text =>
                    setInputValues({ ...inputValues, decimal: text })
                  }
                  value={inputValues["decimal"]}
                />
              </View>
              <View style={{ flexGrow: 1 }}>
                <T>Minting Baton</T>
                <Spacer tiny />
                <StyledTextInput
                  editable
                  multiline
                  placeholder="0x0000"
                  onChangeText={text =>
                    setInputValues({ ...inputValues, mintVout: text })
                  }
                  value={inputValues["mintVout"]}
                />
              </View>
            </View>
            <Spacer tiny />
            <T>Initial Supply</T>
            <Spacer tiny />
            <StyledTextInput
              editable
              multiline
              keyboardType="numeric"
              onChangeText={text =>
                setInputValues({ ...inputValues, initialSupply: text })
              }
              value={inputValues["initialSupply"]}
            />
          </View>
        );
      }

      if (fnName === "SLPMint") {
        return (
          <View>
            <T>Receiver</T>
            <Spacer tiny />
            <StyledTextInput
              editable
              multiline
              onChangeText={text =>
                setInputValues({ ...inputValues, receiveMint: text })
              }
              value={inputValues["receiveMint"]}
            />
            <T>Token Id</T>
            <Spacer tiny />
            <StyledTextInput
              editable
              multiline
              onChangeText={text =>
                setInputValues({ ...inputValues, tokenId: text })
              }
              value={inputValues["tokenId"]}
            />
            <T>Minting Baton</T>
            <Spacer tiny />
            <StyledTextInput
              editable
              multiline
              onChangeText={text =>
                setInputValues({ ...inputValues, mintVout: text })
              }
              value={inputValues["mintVout"]}
            />
            <T>Additional Supply</T>
            <Spacer tiny />
            <StyledTextInput
              editable
              multiline
              keyboardType="numeric"
              onChangeText={text =>
                setInputValues({ ...inputValues, additionalSupply: text })
              }
              value={inputValues["additionalSupply"]}
            />
          </View>
        );
      }

      if (fnName === "SLPSend") {
        return (
          <View>
            <T>Your Public Key</T>
            <Spacer tiny />
            <StyledTextInput editable={false} multiline value={address} />
            <T>Receiver</T>
            <Spacer tiny />
            <StyledTextInput
              editable
              multiline
              onChangeText={text =>
                setInputValues({ ...inputValues, SLPReceiver: text })
              }
              value={inputValues["SLPReceiver"]}
            />
            <T>Token Id</T>
            <Spacer tiny />
            <StyledTextInput
              editable
              multiline
              onChangeText={text =>
                setInputValues({ ...inputValues, tokenId: text })
              }
              value={inputValues["tokenId"]}
            />
            <View>
              <View style={{ flexGrow: 1 }}>
                <T>Send Amount</T>
                <Spacer tiny />
                <StyledTextInput
                  editable
                  multiline
                  keyboardType="numeric"
                  onChangeText={text =>
                    setInputValues({ ...inputValues, sendSLPAmount: text })
                  }
                  value={inputValues["sendSLPAmount"]}
                />
              </View>
              <View style={{ flexGrow: 1 }}>
                <T>Change Amount</T>
                <Spacer tiny />
                <StyledTextInput
                  editable
                  multiline
                  keyboardType="numeric"
                  onChangeText={text =>
                    setInputValues({ ...inputValues, changeSLPAmount: text })
                  }
                  value={inputValues["changeSLPAmount"]}
                />
              </View>
            </View>
          </View>
        );
      }
    }
  }, [contractName, fnInputs, inputValues]);

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
            <H2 center>This transanction requires a signiture</H2>
            <Spacer />
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
            {contractName === "P2PKH" && (
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
            {requiresSig && !isTxSigned && (
              <Button onPress={goNextStep} text="Next Step" />
            )}
            {!requiresSig ||
              (isTxSigned && isTxSigned && (
                <Button onPress={goNextStep} text="Send" />
              ))}
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
