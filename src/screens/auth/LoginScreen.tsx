import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { OTPWidget } from '@msg91comm/sendotp-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { exchangeMsg91Token } from '../../services/authApi';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

type Msg91Response = {
  type: 'success' | 'error';
  message?: string;
  'access-token'?: string;
  code?: number;
  invisibleVerified?: boolean;
};

type Step = 'phone' | 'otp';

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [reqId, setReqId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneValid = phoneDigits.length === 10;
  const otpValid = otpCode.length >= 4;

  const completeLogin = async (accessToken: string) => {
    const result = await exchangeMsg91Token(accessToken);
    login({ token: result.token, refreshToken: result.refresh_token, user: result.user });
    navigation.navigate('Main', { screen: 'Home' });
  };

  const handleGetOtp = async () => {
    if (!phoneValid || sending) return;
    setError(null);
    setSending(true);
    try {
      const response = (await OTPWidget.sendOTP({
        identifier: `91${phoneDigits}`,
      })) as Msg91Response;

      if (response?.type === 'success') {
        const token = response['access-token'];
        if (response.invisibleVerified || token) {
          await completeLogin(token || response.message || '');
          return;
        }
        if (response.message) {
          setReqId(response.message);
          setStep('otp');
          return;
        }
      }
      setError(response?.message || "Couldn't send OTP. Please try again.");
    } catch {
      setError("Couldn't send OTP. Check your connection.");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValid || !reqId || verifying) return;
    setError(null);
    setVerifying(true);
    try {
      const response = (await OTPWidget.verifyOTP({ reqId, otp: otpCode })) as Msg91Response;
      const token = response?.['access-token'];

      if (response?.type === 'success' && token) {
        await completeLogin(token);
        return;
      }
      setError(response?.message || 'Incorrect OTP. Please try again.');
    } catch {
      setError("Couldn't verify OTP. Check your connection.");
    } finally {
      setVerifying(false);
    }
  };

  const handleGoogle = () => {
    Alert.alert(
      'Google sign-in coming soon',
      "This needs a Google OAuth client to be set up first — it's not configured yet.",
    );
  };

  const goBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setError(null);
      return;
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {step === 'phone' ? 'CREATE PROFILE' : 'VERIFY OTP'}
            </Text>

            <View style={styles.avatar}>
              <Ionicons name="person" size={30} color={colors.tabInactive} />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {step === 'phone' ? (
              <>
                <Text style={styles.label}>Phone number</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.phonePrefix}>
                    <Text style={styles.phonePrefixText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter 10-digit mobile number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={10}
                    value={phoneDigits}
                    onChangeText={text => setPhoneDigits(text.replace(/\D/g, ''))}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.otpButton, !phoneValid && styles.otpButtonDisabled]}
                  onPress={handleGetOtp}
                  disabled={!phoneValid || sending}
                  activeOpacity={0.8}
                >
                  {sending ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text
                      style={[
                        styles.otpButtonText,
                        !phoneValid && styles.otpButtonTextDisabled,
                      ]}
                    >
                      Get OTP
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogle}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-google" size={18} color="#DB4437" />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>

                <View style={styles.trustRow}>
                  <Text style={styles.trustText}>Save Your Skin Profile</Text>
                  <Text style={styles.trustDivider}>|</Text>
                  <Text style={styles.trustText}>Save Wishlist</Text>
                  <Text style={styles.trustDivider}>|</Text>
                  <Text style={styles.trustText}>Get Price Drop Alert</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.label}>
                  Enter the code sent to +91 {phoneDigits}
                </Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="Enter OTP"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={text => setOtpCode(text.replace(/\D/g, ''))}
                  autoFocus
                />

                <TouchableOpacity
                  style={[styles.otpButton, !otpValid && styles.otpButtonDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={!otpValid || verifying}
                  activeOpacity={0.8}
                >
                  {verifying ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text
                      style={[styles.otpButtonText, !otpValid && styles.otpButtonTextDisabled]}
                    >
                      Verify
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleGetOtp} disabled={sending}>
                  <Text style={styles.resendText}>
                    {sending ? 'Resending…' : "Didn't get it? Resend OTP"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.lg,
    marginTop: spacing.sm,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  phonePrefix: {
    backgroundColor: colors.sage,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
  },
  phonePrefixText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  phoneInput: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  otpInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    letterSpacing: 4,
    textAlign: 'center',
    color: colors.text,
    marginBottom: spacing.md,
  },
  otpButton: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpButtonDisabled: {
    borderColor: colors.primarySoft,
  },
  otpButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  otpButtonTextDisabled: {
    color: colors.primarySoft,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingVertical: 14,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: 6,
  },
  trustText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  trustDivider: {
    fontSize: 11,
    color: colors.border,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: spacing.md,
  },
});
