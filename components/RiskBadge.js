import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

const colorMap = {
  green: { bg: Colors.green100, text: Colors.green700 },
  yellow: { bg: Colors.yellow100, text: Colors.yellow700 },
  red: { bg: Colors.red100, text: Colors.red700 },
  blue: { bg: Colors.blue100, text: Colors.blue700 },
};

export default function RiskBadge({ color = 'green', label, size = 'normal' }) {
  const theme = colorMap[color] || colorMap.green;
  const isLarge = size === 'large';

  return (
    <View style={[styles.pill, { backgroundColor: theme.bg }, isLarge && styles.pillLarge]}>
      <Text style={[styles.text, { color: theme.text }, isLarge && styles.textLarge]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pillLarge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textLarge: {
    fontSize: 18,
    fontWeight: '700',
  },
});
