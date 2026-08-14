import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

// Roopsee has no separate signup flow — the same phone-OTP verification on
// LoginScreen creates the account on first use (see is_new_user in
// /api/auth/verify-otp), so this just hands off to it.
export function SignupScreen({ navigation }: Props) {
  useEffect(() => {
    navigation.replace('Login');
  }, [navigation]);

  return null;
}
