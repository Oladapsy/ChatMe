import React, { ReactNode } from "react";
import { StyleSheet, ViewStyle, StyleProp, StatusBar } from "react-native";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";

interface MySafeAreaViewProps extends SafeAreaViewProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  color?: string;
}

const MySafeAreaView: React.FC<MySafeAreaViewProps> = ({
  children,
  style,
  color,
  ...props
}) => {
  return (
    <SafeAreaView
      style={[styles.container, style, color && { backgroundColor: color }]}
      {...props}
    >
      <StatusBar barStyle="default" />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default MySafeAreaView;
