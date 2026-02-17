import React from "react";
import { StatusBar, Platform, StyleSheet, ViewStyle, View } from "react-native";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../theme/colors";

interface CustomSafeAreaViewProps extends Omit<SafeAreaViewProps, "style"> {
  style?: ViewStyle;
  children: React.ReactNode;
  statusBarStyle?: "light-content" | "dark-content" | "default";
  statusBarHidden?: boolean;
}

export default function CustomSafeAreaView({
  children,
  style,
  statusBarStyle = "light-content",
  statusBarHidden = false,
  edges = ["top", "bottom"],
  ...props
}: CustomSafeAreaViewProps) {
  const insets = useSafeAreaInsets();

  if (Platform.OS === "android") {
    // On Android, use View with paddingTop instead of SafeAreaView
    const edgesArray = Array.isArray(edges) ? edges : [];
    const androidStyle: ViewStyle = {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: statusBarHidden ? 0 : StatusBar.currentHeight || 0,
      paddingBottom: edgesArray.includes("bottom") ? insets.bottom : 0,
    };

    return (
      <>
        <StatusBar
          barStyle={statusBarStyle}
          translucent={true}
          backgroundColor="transparent"
          hidden={statusBarHidden}
        />
        <View style={[androidStyle, style]} {...props}>
          {children}
        </View>
      </>
    );
  }

  // On iOS, use SafeAreaView
  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        translucent={false}
        backgroundColor="transparent"
        hidden={statusBarHidden}
      />
      <SafeAreaView style={[styles.container, style]} edges={edges} {...props}>
        {children}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
});
