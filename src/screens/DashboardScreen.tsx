import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowRight, Building2, KeyRound, LogOut, Share2 } from "lucide-react-native";
import Button from "../components/ui/Button";
import { theme } from "../theme/colors";
import { typography } from "../theme/typography";
import { radius } from "../theme/layout";
import { Card } from "../components/ui/Card";
import { authService, User } from "../services/api/auth";
import ScreenBackground from "../components/design/ScreenBackground";
import Avatar from "../components/design/Avatar";
import Eyebrow from "../components/design/Eyebrow";
import IconTile from "../components/design/IconTile";

const STEPS = [
  {
    icon: Building2,
    title: "Add company & admin",
    body: "Fill in the broker company and its first admin user.",
  },
  {
    icon: KeyRound,
    title: "Generate credentials",
    body: "We create a secure login for the company admin.",
  },
  {
    icon: Share2,
    title: "Share & go live",
    body: "Send the credentials — the team can sign in right away.",
  },
];

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = async () => {
    await authService.logout();
    // Navigation will be handled by AppNavigator
  };

  return (
    <ScreenBackground>
      <View style={styles.header}>
        <Avatar name={user?.name || "Salesman"} size={44} />
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name || "Salesman"}
          </Text>
        </View>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.7 }]}
          accessibilityLabel="Log out"
          hitSlop={6}
        >
          <LogOut size={18} color={theme.rose300} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.hero}>
          <Text style={styles.heroEyebrow}>New broker?</Text>
          <Text style={styles.heroTitle}>onboard a company.</Text>
          <Text style={styles.heroBody}>
            Create a broker account and generate admin credentials in under a minute.
          </Text>
          <Button
            title="Start onboarding"
            onPress={() => (navigation as any).navigate("OnboardCompany")}
            rightIcon={<ArrowRight size={16} color="#0D0D0D" strokeWidth={2.4} />}
            style={styles.heroCta}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(600)}>
          <Eyebrow label="How it works" style={styles.eyebrow} />
          <Card style={styles.stepsCard}>
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const last = idx === STEPS.length - 1;
              return (
                <View key={step.title} style={styles.stepRow}>
                  <View style={styles.stepRail}>
                    <IconTile tone="glass" size={40}>
                      <Icon size={18} color={theme.foreground} />
                    </IconTile>
                    {!last && <View style={styles.stepLine} />}
                  </View>
                  <View style={[styles.stepText, !last && { paddingBottom: 22 }]}>
                    <Text style={styles.stepIndex}>Step {idx + 1}</Text>
                    <Text style={typography.title}>{step.title}</Text>
                    <Text style={[typography.bodySm, { marginTop: 2 }]}>{step.body}</Text>
                  </View>
                </View>
              );
            })}
          </Card>
        </Animated.View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  welcomeText: {
    ...typography.bodySm,
  },
  userName: {
    ...typography.h2,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.destructiveTint,
    borderWidth: 1,
    borderColor: "rgba(244,63,94,0.2)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  hero: {
    paddingTop: 12,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
  },
  heroEyebrow: {
    ...typography.overline,
  },
  heroTitle: {
    ...typography.hero,
    fontSize: 40,
    lineHeight: 46,
    marginTop: 10,
  },
  heroBody: {
    ...typography.bodyMuted,
    marginTop: 10,
  },
  heroCta: {
    alignSelf: "flex-start",
    marginTop: 22,
  },
  heroCtaText: {
    ...typography.label,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
  },
  eyebrow: {
    marginTop: 28,
    marginBottom: 12,
  },
  stepsCard: {
    padding: 18,
  },
  stepRow: {
    flexDirection: "row",
    gap: 14,
  },
  stepRail: {
    alignItems: "center",
  },
  stepLine: {
    flex: 1,
    width: 1,
    marginVertical: 6,
    backgroundColor: theme.hairline,
  },
  stepText: {
    flex: 1,
    paddingTop: 2,
  },
  stepIndex: {
    ...typography.caption,
    color: theme.blue300,
    marginBottom: 2,
  },
});
