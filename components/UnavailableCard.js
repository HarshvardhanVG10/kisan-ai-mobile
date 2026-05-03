import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

export default function UnavailableCard({ message }) {
  return (
    <View style={styles.card}>
      <Ionicons name="information-circle-outline" size={24} color={Colors.gray500} />
      <Text style={styles.text}>{message || 'माहिती उपलब्ध नाही / Data not available'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    margin: 8,
    flexDirection: 'row',
    gap: 10,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray500,
  },
});
