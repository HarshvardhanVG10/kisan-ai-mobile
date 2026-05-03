import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import RiskBadge from './RiskBadge';
import { fmt } from '../constants/api';
import { T } from '../constants/translations';

const colorToRisk = {
  green: 'green',
  yellow: 'yellow',
  red: 'red',
  blue: 'blue',
};

export default function CropCard({ crop, price, color = 'green', verdict, reason, onPress, lang = 'mr' }) {
  const t = T[lang];
  const cropName = t.cropNames[crop] || crop;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.cropName}>{cropName}</Text>
          {price != null && (
            <Text style={styles.price}>
              ₹{fmt(price)} <Text style={styles.unit}>{t.perQtl}</Text>
            </Text>
          )}
          {reason ? <Text style={styles.reason} numberOfLines={2}>{reason}</Text> : null}
        </View>
        <View style={styles.right}>
          <RiskBadge color={colorToRisk[color] || 'green'} label={verdict} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray700,
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.gray500,
  },
  reason: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
});
