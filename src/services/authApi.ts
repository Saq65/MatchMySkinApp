import { apiRequest } from './apiClient';
import type { AuthUser } from './authSession';

type VerifyOtpResponse = {
  success: boolean;
  token: string;
  refresh_token: string;
  user: AuthUser;
  is_new_user: boolean;
};

// Exchanges an MSG91-verified access token for a real Supabase session —
// the backend does the MSG91 double-check + Supabase user upsert/session mint.
export async function exchangeMsg91Token(accessToken: string): Promise<VerifyOtpResponse> {
  return apiRequest<VerifyOtpResponse>('/auth/verify-otp', {
    method: 'POST',
    body: { accessToken },
  });
}
