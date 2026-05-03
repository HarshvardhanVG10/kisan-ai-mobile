import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import { fmt } from '../constants/api';

export default function MSPBadge({ mspComparison, lang }) {
  if (!mspComparison) return null;

  if (!mspComparison.under_msp_scheme) {
    return (
      <View style={styles.notApplicable}>
        <Text style={styles.notApplicableText}>
          {lang === 'mr'
            ? 'हे पीक MSP योजनेत नाही (भाजीपाला)'
            : 'Not under MSP scheme (vegetable)'}
        </Text>
      </View>
    );
  }

  const isAbove = mspComparison.vs_msp === 'above';
  const theme = isAbove
    ? { bg: Colors.green100, text: Colors.green700 }
    : { bg: Colors.red100, text: Colors.red700 };

  const mspLabel = lang === 'mr' ? 'सरकारी हमीभाव (MSP)' : 'Minimum Support Price (MSP)';
  const aboveLabel = lang === 'mr' ? 'MSP पेक्षा जास्त' : 'Above MSP';
  const belowLabel = lang === 'mr' ? 'MSP पेक्षा कमी' : 'Below MSP';

  return (
    <View style={[styles.card, { backgroundColor: theme.bg }]}>
      <Text style={[styles.label, { color: theme.text }]}>{mspLabel}</Text>
      <Text style={[styles.value, { color: theme.text }]}>
        ₹{fmt(mspComparison.msp_price)} {lang === 'mr' ? 'प्रति क्विंटल' : 'per quintal'}
      </Text>
      <Text style={[styles.badge, { color: theme.text }]}>
        {isAbove ? '↑ ' + aboveLabel : '↓ ' + belowLabel}
        {mspComparison.difference != null
          ? ` (₹${fmt(Math.abs(mspComparison.difference))})`
          : ''}
      </Text>
      {mspComparison.advice ? (
        <Text style={[styles.advice, { color: theme.text }]}>{mspComparison.advice}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  badge: {
    fontSize: 14,
    fontWeight: '600',
  },
  advice: {
    fontSize: 13,
    marginTop: 6,
    fontStyle: 'italic',
  },
  notApplicable: {
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  notApplicableText: {
    color: Colors.gray500,
    fontSize: 13,
  },
});
