# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
# ChatMe

## Testing

Use Node 22.23.3 (`.nvmrc`) and npm (verified with 10.9.9). Install the locked dependencies with `npm ci --ignore-scripts`. The app uses Expo 57.0.31, React 19.2.3, and React Native 0.86.3. Jest 29 uses the SDK 57 `jest-expo` preset, and React Native Testing Library 14 uses `test-renderer` 1.2.0 for React 19.2.

| Command | What it runs |
| --- | --- |
| `npm test` | Jest unit and component tests in `tests/` |
| `npm test -- ChatInputBar.test.tsx` | The composer interaction suite |
| `npm run test:watch` | Jest watch mode |
| `npm run test:coverage` | Jest coverage for app source |
| `npm run test:ci` | Jest in non-interactive mode |
| `npm run test:reliability` | Existing session, messaging, and media regression tests |
| `npm run verify` | ESLint, TypeScript, both test suites, and Android, iOS, and web bundle exports |

Run `npm run verify` before pushing. The GitHub Verify workflow runs the same command on pull requests and pushes to `dev`. The composer tests use the real chat input and safe-area provider with mocked audio and storage. For live backend and device checks, see [the reliability review](docs/reliability-review.md).

### extras
On Emulator -> Android to switch from Dark to light Mode
adb shell cmd uimode night yes (no)
