import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { theme } from "../theme/colors";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import { authService, User } from "../services/api/auth";

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
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || "Salesman"}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="logout" size={20} color={theme.destructive} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.cardHeaderContent}>
              <CardTitle>Onboard New Company</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <Text style={styles.cardDescription}>
              Create a new broker company account and generate initial admin
              credentials.
            </Text>
            <Button
              title="Onboard Company"
              onPress={() => (navigation as any).navigate("OnboardCompany")}
              fullWidth
              style={styles.actionButton}
              leftIcon={
                <Icon name="plus" size={20} color={theme.primaryForeground} />
              }
            />
          </CardContent>
        </Card>

        <Card style={styles.infoCard}>
          <CardHeader>
            <View style={styles.cardHeaderContent}>
              <Icon name="information" size={24} color={theme.primary} />
              <CardTitle>Instructions</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <View style={styles.instructionItem}>
              <Icon name="check-circle" size={16} color={theme.success} />
              <Text style={styles.instructionText}>
                Fill in company and initial admin user details
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Icon name="check-circle" size={16} color={theme.success} />
              <Text style={styles.instructionText}>
                Share the generated credentials with the company
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Icon name="check-circle" size={16} color={theme.success} />
              <Text style={styles.instructionText}>
                Company can login using the provided credentials
              </Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  welcomeText: {
    fontSize: 14,
    color: theme.mutedForeground,
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.foreground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  cardHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.mutedForeground,
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 8,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: theme.foreground,
    lineHeight: 20,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: `${theme.destructive}20`,
  },
});
