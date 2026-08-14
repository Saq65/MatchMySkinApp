// Type-only stand-in for @msg91comm/sendotp-react-native, wired up via the
// tsconfig "paths" remap below. The package ships raw, type-broken .ts as its
// "main" entry (no build step, no separate .d.ts), which drags its own type
// errors into any project that imports it — an ambient `declare module`
// doesn't help here because TS prefers a real resolvable file over an
// ambient one. Metro/Babel don't read tsconfig paths, so this only affects
// `tsc`; the actual bundled code still comes from the real package.
export type OTPWidgetResponse = {
  type: 'success' | 'error';
  message?: string;
  'access-token'?: string;
  code?: number;
  invisibleVerified?: boolean;
};

export declare class OTPWidget {
  static initializeWidget(widgetId: string, tokenAuth: string): Promise<void>;
  static sendOTP(body: { identifier: string }): Promise<OTPWidgetResponse>;
  static verifyOTP(body: { reqId: string; otp: string }): Promise<OTPWidgetResponse>;
  static retryOTP(body: {
    reqId: string;
    retryChannel?: number;
  }): Promise<OTPWidgetResponse>;
  static getWidgetProcess(): Promise<unknown>;
}
