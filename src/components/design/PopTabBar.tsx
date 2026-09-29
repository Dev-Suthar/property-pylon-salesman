import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  Building2,
  CalendarClock,
  Circle,
  Handshake,
  History,
  LayoutGrid,
  LucideIcon,
  Users,
} from "lucide-react-native";
import { theme } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import { select } from "../../utils/haptics";

const ICONS: Record<string, LucideIcon> = {
  Dashboard: LayoutGrid,
  Properties: Building2,
  Sellers: Handshake,
  Customers: Users,
  Visits: CalendarClock,
  CompanyHistory: History,
};

const LABELS: Record<string, string> = {
  Dashboard: "Home",
  CompanyHistory: "History",
};

function TabItem({
  label,
  Icon,
  focused,
  onPress,
  onLongPress,
}: {
  label: string;
  Icon: LucideIcon;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const active = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    active.value = withSpring(focused ? 1 : 0, { damping: 18, stiffness: 260 });
  }, [focused, active]);

  const indicator = useAnimatedStyle(() => ({
    opacity: active.value,
    transform: [{ scaleX: 0.4 + active.value * 0.6 }],
  }));
  const iconWrap = useAnimatedStyle(() => ({
    transform: [{ translateY: -active.value * 1.5 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={label}
      style={styles.item}
      hitSlop={4}
    >
      <Animated.View style={[styles.indicator, indicator]} />
      <Animated.View style={iconWrap}>
        <Icon
          size={21}
          color={focused ? theme.foreground : "rgba(255,255,255,0.4)"}
          strokeWidth={focused ? 2.2 : 1.7}
        />
      </Animated.View>
      <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** CRED-style tab bar: flat black, top hairline, white active indicator. */
export default function PopTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const label =
          (typeof options.tabBarLabel === "string" && options.tabBarLabel) ||
          LABELS[route.name] ||
          options.title ||
          route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            select();
            navigation.navigate(route.name as never);
          }
        };

        return (
          <TabItem
            key={route.key}
            label={label}
            Icon={ICONS[route.name] ?? Circle}
            focused={focused}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: theme.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.14)",
    paddingTop: 8,
    paddingBottom: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingTop: 4,
  },
  indicator: {
    position: "absolute",
    top: -8,
    width: 22,
    height: 2,
    backgroundColor: theme.foreground,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.4)",
  },
  labelActive: {
    color: theme.foreground,
  },
});
