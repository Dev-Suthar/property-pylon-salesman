import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Clipboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CreateCompanyResponse } from '../services/api/companies';
import { showToast } from '../utils/toast';

export default function CompanyDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { data } = (route.params as any) || {};

  if (!data || !data.company) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No company data available</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const isExistingCompany = data.isExistingCompany || false;
  const companyData = data as CreateCompanyResponse & { isExistingCompany?: boolean };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      // @ts-ignore - Clipboard is available in React Native
      Clipboard.setString(text);
      showToast.success(`${label} copied to clipboard`);
    } catch (error) {
      showToast.error('Failed to copy to clipboard');
    }
  };

  const shareCredentials = async () => {
    const message = `Company Onboarding Complete

Company Details:
Name: ${companyData.company.name}
Email: ${companyData.company.email}
Phone: ${companyData.company.phone || 'N/A'}

Admin User Credentials:
Email: ${companyData.initial_user.email}
Password: ${companyData.initial_user.password}

Please share these credentials securely with the company.`;

    try {
      await Share.open({
        message,
        title: 'Company Onboarding Credentials',
      });
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        showToast.error('Failed to share credentials');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isExistingCompany ? 'Company Details' : 'Company Created'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {!isExistingCompany && (
          <View style={styles.successContainer}>
            <Icon name="check-circle" size={64} color={theme.success} />
            <Text style={styles.successTitle}>Company Onboarded Successfully!</Text>
            <Text style={styles.successSubtitle}>
              Share the credentials below with the company
            </Text>
          </View>
        )}

        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.cardHeaderContent}>
              <Icon name="office-building" size={20} color={theme.primary} />
              <CardTitle>Company Details</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Company Name:</Text>
              <Text style={styles.detailValue}>{companyData.company.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Company Email:</Text>
              <Text style={styles.detailValue}>{companyData.company.email}</Text>
            </View>
            {companyData.company.phone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <View style={styles.copyableRow}>
                  <Text style={styles.detailValue}>{companyData.company.phone}</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(companyData.company.phone || '', 'Phone')}
                  >
                    <Icon name="content-copy" size={20} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {companyData.company.address && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>{companyData.company.address}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Company ID:</Text>
              <View style={styles.copyableRow}>
                <Text style={styles.detailValueSmall}>{companyData.company.id}</Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(companyData.company.id, 'Company ID')}
                >
                  <Icon name="content-copy" size={20} color={theme.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <View style={[
                styles.statusBadge,
                companyData.company.is_active ? styles.statusBadgeActive : styles.statusBadgeInactive,
              ]}>
                <View style={[
                  styles.statusDot,
                  companyData.company.is_active ? styles.statusDotActive : styles.statusDotInactive,
                ]} />
                <Text style={[
                  styles.statusText,
                  companyData.company.is_active ? styles.statusTextActive : styles.statusTextInactive,
                ]}>
                  {companyData.company.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {!isExistingCompany && companyData.initial_user && (
          <>
            <Card style={styles.card}>
              <CardHeader>
                <View style={styles.cardHeaderContent}>
                  <Icon name="account-key" size={20} color={theme.primary} />
                  <CardTitle>Admin User Credentials</CardTitle>
                </View>
              </CardHeader>
              <CardContent>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{companyData.initial_user.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <View style={styles.copyableRow}>
                    <Text style={styles.detailValue}>{companyData.initial_user.email}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        copyToClipboard(companyData.initial_user.email, 'Email')
                      }
                    >
                      <Icon name="content-copy" size={20} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Password:</Text>
                  <View style={styles.copyableRow}>
                    <Text style={styles.detailValuePassword}>
                      {companyData.initial_user.password}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        copyToClipboard(companyData.initial_user.password, 'Password')
                      }
                    >
                      <Icon name="content-copy" size={20} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </CardContent>
            </Card>

            <Card style={styles.infoCard}>
              <CardContent>
                <View style={styles.infoRow}>
                  <Icon name="information" size={20} color={theme.warning} />
                  <Text style={styles.infoText}>
                    Please share these credentials securely with the company. The admin user
                    can login using the email and password provided.
                  </Text>
                </View>
              </CardContent>
            </Card>

            <Button
              title="Share Credentials"
              onPress={shareCredentials}
              fullWidth
              style={styles.shareButton}
              leftIcon={<Icon name="share" size={20} color={theme.primaryForeground} />}
            />
          </>
        )}

        <Button
          title={isExistingCompany ? 'Back to History' : 'Back to Dashboard'}
          onPress={() => navigation.goBack()}
          variant="outline"
          fullWidth
          style={styles.backButton}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.foreground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.foreground,
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: theme.mutedForeground,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: `${theme.warning}15`,
    borderColor: `${theme.warning}40`,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.mutedForeground,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.foreground,
  },
  detailValueSmall: {
    fontSize: 14,
    color: theme.foreground,
    flex: 1,
  },
  detailValuePassword: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
    fontFamily: 'monospace',
  },
  copyableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.foreground,
    lineHeight: 20,
  },
  shareButton: {
    marginTop: 8,
    marginBottom: 12,
  },
  backButton: {
    marginBottom: 32,
  },
  errorText: {
    fontSize: 16,
    color: theme.destructive,
    textAlign: 'center',
    margin: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusBadgeActive: {
    backgroundColor: `${theme.success}15`,
    borderWidth: 1,
    borderColor: `${theme.success}40`,
  },
  statusBadgeInactive: {
    backgroundColor: `${theme.mutedForeground}15`,
    borderWidth: 1,
    borderColor: `${theme.mutedForeground}30`,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotActive: {
    backgroundColor: theme.success,
  },
  statusDotInactive: {
    backgroundColor: theme.mutedForeground,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: theme.success,
  },
  statusTextInactive: {
    color: theme.mutedForeground,
  },
});

