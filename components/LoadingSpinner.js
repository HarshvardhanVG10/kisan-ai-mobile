import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export default function LoadingSpinner({ text }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.gray500,
  },
});
