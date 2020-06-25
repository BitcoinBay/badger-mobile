import { createStackNavigator } from "react-navigation";
import ContractTxSetupScreen from "../screens/ContractTxSetupScreen";
import ContractTxConfirmScreen from "../screens/ContractTxConfirmScreen";
import ContractTxSuccessScreen from "../screens/ContractTxSuccessScreen";
import { spaceBadger as theme } from "../themes/spaceBadger";

const ContractTxStack = createStackNavigator(
  {
    ContractTxSetup: {
      screen: ContractTxSetupScreen,
      navigationOptions: {
        header: null
      }
    },
    ContractTxConfirm: {
      screen: ContractTxConfirmScreen,
      navigationOptions: {
        header: null
      }
    },
    ContractTxSuccess: {
      screen: ContractTxSuccessScreen,
      navigationOptions: {
        header: null
      }
    }
  },
  {
    initialRouteName: "ContractTxSetup",
    headerLayoutPreset: "center",
    defaultNavigationOptions: {
      headerBackTitleStyle: {
        color: theme.primary500
      },
      headerTintColor: theme.primary500,
      headerTitleStyle: {
        color: theme.fg100
      }
    }
  }
);

export default ContractTxStack;
