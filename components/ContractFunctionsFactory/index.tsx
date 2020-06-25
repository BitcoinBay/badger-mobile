import P2pkhFunctionsFactory from "./P2pkh";
import SLPGenesisFunctionsFactory from "./SlpGenesis";
import SLPMintFunctionsFactory from "./SlpMint";
import SLPSendFunctionsFactory from "./SlpSend";
import Bip38FunctionsFactory from "./Bip38";

const ContractFunctionsFactory = (contractName: string, fnName: string) => {
  let functionsFactory;

  switch (contractName) {
    case "P2PKH":
      functionsFactory = P2pkhFunctionsFactory;
      break;
    case "SLPGenesis":
      functionsFactory = SLPGenesisFunctionsFactory;
      break;
    case "SLPMint":
      functionsFactory = SLPMintFunctionsFactory;
      break;
    case "SLPSend":
      functionsFactory = SLPSendFunctionsFactory;
      break;
    case "Bip38":
      functionsFactory = Bip38FunctionsFactory;
      break;
    default:
      return null
  }

  const built = functionsFactory.build(fnName);

  if (
    !built ||
    !built.InputsView ||
    !built.inputsValidate ||
    !built.defaultInputValues ||
    !built.options
  ) {
    return null;
  }

  return {
    InputsView: built.InputsView,
    inputsValidate: built.inputsValidate,
    defaultInputValues: built.defaultInputValues,
    // prevents Typescript from complaining about ts(2339)
    options: built.options as any
  };
};

export default ContractFunctionsFactory;
