import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authService } from '../services/api/auth';
import { getUsernameError, getPasswordError } from '../utils/validation';
import { showToast } from '../utils/toast';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    general?: string;
  }>({});

  const handleSubmit = async () => {
    const usernameError = getUsernameError(formData.username);
    const passwordError = getPasswordError(formData.password);

    if (usernameError || passwordError) {
      setErrors({
        username: usernameError,
        password: passwordError,
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Normalize username/email to lowercase to avoid case sensitivity issues
      // Trim whitespace and convert to lowercase for email-like inputs
      const trimmedUsername = formData.username.trim();
      const normalizedUsername = trimmedUsername.includes('@') 
        ? trimmedUsername.toLowerCase() 
        : trimmedUsername;

      const loginCredentials = {
        username: normalizedUsername,
        password: formData.password,
      };

      if (__DEV__) {
        console.log('[LoginScreen] Attempting login with:', {
          originalUsername: formData.username,
          normalizedUsername: loginCredentials.username,
          passwordLength: loginCredentials.password.length,
        });
      }

      const response = await authService.login(loginCredentials);

      if (response) {
        showToast.success('Login successful!');
        // Navigation will be handled by AppNavigator
      } else {
        const errorMessage = 'Login failed. Please check your credentials.';
        showToast.error(errorMessage);
        setErrors({ general: errorMessage });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      showToast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Icon name="office-building" size={32} color={theme.primaryForeground} />
            </View>
            <Text style={styles.brandTitle}>Pylon Salesman</Text>
            <Text style={styles.brandSubtitle}>Company Onboarding System</Text>
          </View>

          <Card style={styles.loginCard}>
            <CardHeader>
              <CardTitle>
                <Text style={styles.cardTitleText}>Welcome Back</Text>
              </CardTitle>
              <Text style={styles.cardSubtitle}>
                Sign in to your account to continue
              </Text>
            </CardHeader>
            <CardContent>
              <Input
                label="Username or Email"
                placeholder="Enter your email or username"
                value={formData.username}
                onChangeText={value => handleInputChange('username', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={
                  <Icon name="account" size={16} color={theme.mutedForeground} />
                }
                error={errors.username}
                containerStyle={styles.inputContainer}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={value => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={<Icon name="lock" size={16} color={theme.mutedForeground} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Icon
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={16}
                      color={theme.mutedForeground}
                    />
                  </TouchableOpacity>
                }
                error={errors.password}
                containerStyle={styles.inputContainer}
              />

              {errors.general && (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={16} color={theme.destructive} />
                  <Text style={styles.errorText}>{errors.general}</Text>
                </View>
              )}

              <Button
                title={loading ? 'Signing In...' : 'Sign In'}
                onPress={handleSubmit}
                disabled={loading}
                fullWidth
                style={styles.submitButton}
              />
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.foreground,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 14,
    color: theme.mutedForeground,
  },
  loginCard: {
    marginBottom: 24,
  },
  cardTitleText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.foreground,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: theme.mutedForeground,
    textAlign: 'center',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.destructive}20`,
    borderWidth: 1,
    borderColor: `${theme.destructive}40`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: theme.destructive,
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
  },
});

