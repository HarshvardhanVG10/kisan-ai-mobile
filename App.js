import React, { createContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import Colors from './constants/colors';
import { T } from './constants/translations';

import HomeScreen from './screens/HomeScreen';
import GrowScreen from './screens/GrowScreen';
import SellScreen from './screens/SellScreen';
import RiskScreen from './screens/RiskScreen';
import PricesScreen from './screens/PricesScreen';
import WeatherScreen from './screens/WeatherScreen';

export const AppContext = createContext({
  lang: 'mr',
  setLang: () => {},
  district: 'Nashik',
  setDistrict: () => {},
});

const Tab = createBottomTabNavigator();

function HeaderRight({ lang, setLang }) {
  return (
    <View style={styles.headerBtns}>
      <TouchableOpacity
        style={[styles.langBtn, lang === 'mr' && styles.langBtnActive]}
        onPress={() => setLang('mr')}
      >
        <Text style={[styles.langBtnText, lang === 'mr' && styles.langBtnTextActive]}>मराठी</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
        onPress={() => setLang('en')}
      >
        <Text style={[styles.langBtnText, lang === 'en' && styles.langBtnTextActive]}>EN</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const [lang, setLang] = useState('mr');
  const [district, setDistrict] = useState('Nashik');

  const t = T[lang];

  const tabIcons = {
    Home: { focused: 'home', unfocused: 'home-outline' },
    Grow: { focused: 'leaf', unfocused: 'leaf-outline' },
    Sell: { focused: 'cash', unfocused: 'cash-outline' },
    Risk: { focused: 'warning', unfocused: 'warning-outline' },
    Prices: { focused: 'bar-chart', unfocused: 'bar-chart-outline' },
    Weather: { focused: 'partly-sunny', unfocused: 'partly-sunny-outline' },
  };

  const tabLabels = {
    Home: t.home,
    Grow: t.grow,
    Sell: t.sell,
    Risk: t.risk,
    Prices: t.prices,
    Weather: t.weather,
  };

  const screenOptions = ({ route, navigation }) => ({
    headerStyle: { backgroundColor: Colors.primary },
    headerTintColor: Colors.white,
    headerTitleStyle: { fontWeight: '700', fontSize: 18 },
    headerTitle: t.appName,
    headerRight: () => (
      <HeaderRight lang={lang} setLang={setLang} />
    ),
    tabBarActiveTintColor: Colors.primary,
    tabBarInactiveTintColor: Colors.gray500,
    tabBarStyle: {
      backgroundColor: Colors.white,
      borderTopColor: Colors.gray300,
      height: 60,
      paddingBottom: 8,
      paddingTop: 4,
    },
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '600',
    },
    tabBarIcon: ({ focused, color, size }) => {
      const icons = tabIcons[route.name];
      const iconName = focused ? icons.focused : icons.unfocused;
      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarLabel: tabLabels[route.name] || route.name,
  });

  return (
    <AppContext.Provider value={{ lang, setLang, district, setDistrict }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <Tab.Navigator screenOptions={screenOptions}>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Grow" component={GrowScreen} />
            <Tab.Screen name="Sell" component={SellScreen} />
            <Tab.Screen name="Risk" component={RiskScreen} />
            <Tab.Screen name="Prices" component={PricesScreen} />
            <Tab.Screen name="Weather" component={WeatherScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  headerBtns: {
    flexDirection: 'row',
    marginRight: 12,
    gap: 6,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  langBtnActive: {
    backgroundColor: Colors.white,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  langBtnTextActive: {
    color: Colors.primary,
  },
});
