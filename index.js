import { registerRootComponent } from 'expo';
import { enableScreens } from 'react-native-screens';
import { Alert } from 'react-native';

enableScreens();

// Catch any unhandled JS errors and show them on screen
const originalHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  Alert.alert(
    'App Error',
    `${isFatal ? 'FATAL: ' : ''}${error?.message || String(error)}`,
    [{ text: 'OK' }]
  );
  originalHandler(error, isFatal);
});

import App from './App';

registerRootComponent(App);
