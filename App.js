import React, { createContext, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const AppContext = createContext({ lang: 'mr', district: 'Nashik' });

const Tab = createBottomTabNavigator();

function Screen({ name }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>{name}</Text>
    </View>
  );
}

export default function App() {
  const [lang, setLang] = useState('mr');
  const [district, setDistrict] = useState('Nashik');

  return (
    <AppContext.Provider value={{ lang, setLang, district, setDistrict }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator>
            <Tab.Screen name="Home" children={() => <Screen name="Home" />} />
            <Tab.Screen name="Grow" children={() => <Screen name="Grow" />} />
            <Tab.Screen name="Prices" children={() => <Screen name="Prices" />} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  text: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32' },
});
