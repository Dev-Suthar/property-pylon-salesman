import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import AppNavigator from "./src/navigation/AppNavigator";
import NetworkLoggerButton from "./src/components/NetworkLoggerButton";
import CustomSafeAreaView from "./src/components/CustomSafeAreaView";

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AutocompleteDropdownContextProvider>
          <CustomSafeAreaView edges={["top", "bottom"]}>
            <AppNavigator />
            <NetworkLoggerButton />
            <Toast />
          </CustomSafeAreaView>
        </AutocompleteDropdownContextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
