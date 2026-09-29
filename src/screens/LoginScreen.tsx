import React, { useState, useRef } from 'react';
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, User } from 'lucide-react-native';
import { theme } from '../theme/colors';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authService } from '../services/api/auth';
import { getUsernameError, getPasswordError } from '../utils/validation';
import { showToast } from '../utils/toast';

import { typography } from "../theme/typography";
import ScreenBackground from "../components/design/ScreenBackground";
import Eyebrow from "../components/design/Eyebrow";
import BrandLogo from "../components/design/BrandLogo";
export default function LoginScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  // Keep the focused field above the keyboard (the form sits at the bottom).
  const revealForm = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250);
  const [contentHeight, setContentHeight] = useState(0);
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
    <ScreenBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          // Feels like a fixed native screen: only scrolls if the content
          // genuinely overflows (small phones / keyboard open), never bounces.
          scrollEnabled={contentHeight > viewportHeight + 1}
          bounces={false}
          overScrollMode="never"
          onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
          onContentSizeChange={(_, h) => setContentHeight(h)}
        >
          <View style={styles.content}>
            <View>
              <Animated.View entering={FadeInDown.duration(600)} style={styles.brandRow}>
                <BrandLogo size={34} />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(80).duration(700)}>
                <Eyebrow label="Pylon Salesman" style={styles.eyebrow} />
                <Text style={styles.heroLine}>onboard</Text>
                <Text style={styles.heroLine}>brokers.</Text>
                <Text style={[styles.heroLine, styles.heroLineMuted]}>in minutes.</Text>
                <Text style={styles.heroSubtitle}>
                  Sign in to onboard companies and track your pipeline.
                </Text>
              </Animated.View>
            </View>

            <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.form}>
              <Input
                label="Username or email"
                onFocus={revealForm}
                placeholder="you@company.com"
                value={formData.username}
                onChangeText={value => handleInputChange('username', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                leftIcon={<User size={18} color={theme.textTertiary} />}
                error={errors.username}
                containerStyle={styles.inputContainer}
              />

              <Input
                label="Password"
                onFocus={revealForm}
                placeholder="••••••••"
                value={formData.password}
                onChangeText={value => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
                leftIcon={<Lock size={18} color={theme.textTertiary} />}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={10}
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={theme.textSecondary} />
                    ) : (
                      <Eye size={18} color={theme.textSecondary} />
                    )}
                  </TouchableOpacity>
                }
                error={errors.password}
                containerStyle={styles.inputContainer}
              />

              {errors.general && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={15} color={theme.destructive} />
                  <Text style={styles.errorText}>{errors.general}</Text>
                </View>
              )}

              <Button
                title={loading ? 'Signing in' : 'Sign in'}
                onPress={handleSubmit}
                disabled={loading}
                loading={loading}
                fullWidth
                size="lg"
                rightIcon={!loading ? <ArrowRight size={18} color="#0D0D0D" strokeWidth={2.4} /> : undefined}
                style={styles.submitButton}
              />

              <Text style={styles.footer}>
                © {new Date().getFullYear()} Dream to Buy Properties
              </Text>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    marginBottom: 44,
  },
  eyebrow: {
    marginBottom: 18,
  },
  heroLine: {
    ...typography.hero,
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -1,
  },
  heroLineMuted: {
    color: theme.textTertiary,
  },
  heroSubtitle: {
    ...typography.bodyMuted,
    marginTop: 16,
  },
  form: {
    marginTop: 32,
  },
  inputContainer: {
    marginBottom: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  errorText: {
    ...typography.bodySm,
    color: theme.destructive,
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
  },
  footer: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 20,
  },
});
