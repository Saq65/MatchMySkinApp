// OAuth Web Client ID from Google Cloud Console (Credentials → OAuth 2.0 Client IDs →
// the "Web application" client, NOT the Android/iOS one). This is a public identifier,
// safe to ship in the app — it's what the backend uses to verify the ID token audience.
// TODO: replace with your real Web Client ID once created in Google Cloud Console.
export const GOOGLE_WEB_CLIENT_ID = '312119558954-derfh7cdi4r0b5eem5a5kgcl9ufitrb3.apps.googleusercontent.com';

// iOS OAuth Client ID (Credentials → OAuth 2.0 Client IDs → the "iOS" client).
// Only needed for the iOS build; leave as-is if you're Android-only for now.
// TODO: replace with your real iOS Client ID once created in Google Cloud Console.
export const GOOGLE_IOS_CLIENT_ID = 'REPLACE_WITH_GOOGLE_IOS_CLIENT_ID.apps.googleusercontent.com';
