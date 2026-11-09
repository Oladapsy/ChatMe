# Push notifications

The app registers Expo tokens with `PUT /v1/me/push-devices/{installationId}` and unregisters with `DELETE` on the same path. Installation UUID and notification preference persist in SecureStore. The UUID is random and is retained across logins, not derived from hardware. Registration is repeated for each login, foreground return and native push-token change. Refreshing access tokens does not create another installation.

## Configure the development build

1. Link this app to your Expo account/project (`npx eas-cli@latest init`). This creates the real `expo.extra.eas.projectId` in app.json. Do not use a placeholder UUID.
2. Android: create a Firebase project and register Android package `com.cryptotechcoder.ChatMe`. Download google-services.json, place it in the project, and set `expo.android.googleServicesFile` in app.json to its path. Configure the Firebase FCM v1 service-account credential in Expo/EAS credentials. Keep the private service-account key out of Git and app bundles.
3. iOS: configure APNs credentials for `com.cryptotechcoder.ChatMe` using your Apple developer account and EAS credentials.
4. The development profile in eas.json is already configured with `developmentClient: true` and `distribution: "internal"`. Build the desired platform with `npx eas-cli@latest build --profile development --platform android` (or ios). Local native builds are also supported.
5. Install the build and start Metro with `npx expo start --dev-client`.
6. Sign in, unlock your PIN if enabled, and turn on Settings → Notification. Registration asks for notification permission only after this explicit action. Expo Go skips registration and explains the development-build requirement if the switch is used.

The expo-notifications plugin is already configured. Native config/credential changes require rebuilding the app.

## Backend payload

Tap navigation currently expects `data.conversationId` as a string. Confirm this field with the backend developer; only the registration API contract has been supplied. The sender should use the registered Expo token, normal title/body, `sound: "default"`, and `channelId: "messages"` on Android. A notification does not replace durable REST message history.

Example Expo push message (sent by the backend):

```json
{
  "to": "ExpoPushToken[device-token]",
  "title": "New message",
  "body": "You have a new message",
  "sound": "default",
  "channelId": "messages",
  "data": { "conversationId": "conversation-uuid" }
}
```

The app refreshes conversation/message caches on receipt, suppresses foreground banners for the current chat and while PIN-locked, and defers tap navigation until authentication, profile completion and PIN unlock. OS-displayed background notifications are controlled by the server payload and system notification-preview preferences; the PIN does not conceal an already displayed system notification.

## Verify

- Enable notifications and confirm PUT succeeds with an Expo token, not a native FCM/APNs token.
- Send a test through Expo's push tool, then send a real message from another account with the receiving app backgrounded.
- Tap while running and after closing the app; unlock PIN and confirm the right chat opens.
- Disable notifications, confirm DELETE succeeds, and ensure the backend stops sending to the installation.
- Log out, log back in, and confirm registration occurs again if permission and preference allow it.
- Test denied/revoked permissions and server 503 (push disabled).

Registration retries on foreground return and token changes after temporary failures. Server-side logout must revoke the login family and its push registrations if the device is offline during logout. The backend must process Expo push receipts and remove tokens reported as DeviceNotRegistered.

References: https://docs.expo.dev/versions/v57.0.0/sdk/notifications/ and https://docs.expo.dev/push-notifications/push-notifications-setup/
