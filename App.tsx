import GlobalOrderModal from '@app/components/GlobalOrderModal';
import BottomNavBar from '@app/navigation/BottomNavBar';
import { CartScreen, ProductDetailsScreen, CategoryProductsScreen } from '@app/screens';
import InvoiceScreen from '@app/screens/InvoiceScreen';
import { AppScreensParamsList } from '@app/types';
import { AppColors } from '@app/utils';

import {
  ManropeBold,
  ManropeMedium,
  ManropeRegular,
  ManropeSemiBold,
} from '@assets/fonts';

import { NavigationContainer } from '@react-navigation/native';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import { useFonts } from 'expo-font';
import React, { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


// 🔔 Register for Push Notifications
async function registerForPushNotifications() {
  let token;

  // 1. Android ke liye Notification Channel setup (Lazmi Step)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX, // Is se pop-up show hoga
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    try {
      // 2. Project ID jo aapki app.json mein hai
      const projectId = "c19f0cc5-0813-4142-8043-7f0f349e61ba"; 

      const response = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
      
      token = response.data;
      console.log("APK Token: ", token);

      // 3. Backend par bhejna
      await fetch('https://drshawarma.co.uk/wp-json/mobile/v1/register-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

    } catch (e) {
      console.log('Error getting token:', e);
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

function App(): React.ReactNode | null {
  const Stack = createNativeStackNavigator<AppScreensParamsList>();

  const [fontsLoaded] = useFonts({
    ManropeRegular,
    ManropeMedium,
    ManropeSemiBold,
    ManropeBold,
  });

 useEffect(() => {
    registerForPushNotifications();

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Foreground notification received");
      global.triggerOrderPopupFromPush = true; 
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification clicked!");
      global.triggerOrderPopupFromPush = true;

    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (!fontsLoaded) return null;

  const screensOptions: NativeStackNavigationOptions = {
    headerShown: false,
    orientation: 'portrait',
    contentStyle: { backgroundColor: AppColors.PureWhite },
    animation: 'slide_from_right',
  };

  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="BottomNavBar" component={BottomNavBar} options={screensOptions} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={screensOptions} />
        <Stack.Screen name="Cart" component={CartScreen} options={screensOptions} />
        <Stack.Screen name="CategoryProductsScreen" component={CategoryProductsScreen} options={screensOptions} />
        <Stack.Screen name="InvoiceScreen" component={InvoiceScreen} options={screensOptions} />
      </Stack.Navigator>

      <GlobalOrderModal />
      <Toast />
    </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
