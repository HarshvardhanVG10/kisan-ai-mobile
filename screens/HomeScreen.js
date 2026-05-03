import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, FlatList, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { T } from '../constants/translations';
import { apiFetch } from '../constants/api';
import { AppContext } from '../App';

const DISTRICTS = ['Nashik', 'Pune', 'Nagpur', 'Solapur', 'Aurangabad', 'Kolhapur', 'Satara', 'Ahmednagar', 'Latur', 'Jalgaon'];

export default function HomeScreen({ navigation }) {
  const { lang, district, setDistrict } = useContext(AppContext);
  const t = T[lang];
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    apiFetch(`/api/weather/${district}`).then(data => {
      if (!data._error) setWeather(data);
    });
  }, [district]);

  const highRisk = weather && weather.risk_level === 'high';

  const actions = [
    { label: t.whatToGrow, icon: 'leaf', tab: 'Grow', color: Colors.primary },
    { label: t.whenToSell, icon: 'cash', tab: 'Sell', color: Colors.secondary },
    { label: t.checkRisk, icon: 'warning', tab: 'Risk', color: '#e07b39' },
    { label: t.todayPrices, icon: 'bar-chart', tab: 'Prices', color: Colors.blue700 },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header greeting */}
        <View style={styles.headerBox}>
          <Text style={styles.tagline}>{t.tagline}</Text>
        </View>

        {/* District Picker */}
        <TouchableOpacity style={styles.districtRow} onPress={() => setShowDistrictPicker(true)}>
          <Ionicons name="location" size={18} color={Colors.primary} />
          <Text style={styles.districtLabel}>{t.district}: </Text>
          <Text style={styles.districtValue}>{t.districts[district] || district}</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.primary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        {/* Weather alert banner */}
        {highRisk && (
          <View style={styles.alertBanner}>
            <Ionicons name="thunderstorm" size={20} color={Colors.red700} />
            <Text style={styles.alertText}>
              {lang === 'mr' ? 'आज हवामान धोकादायक आहे!' : 'High weather risk today!'}
              {weather.advisory ? '  ' + weather.advisory : ''}
            </Text>
          </View>
        )}

        {/* Action Grid */}
        <View style={styles.grid}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.tab}
              style={[styles.actionCard, { borderLeftColor: action.color }]}
              onPress={() => navigation.navigate(action.tab)}
              activeOpacity={0.85}
            >
              <View style={[styles.iconCircle, { backgroundColor: action.color + '22' }]}>
                <Ionicons name={action.icon} size={28} color={action.color} />
              </View>
              <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Live data banner */}
        <View style={styles.liveBanner}>
          <Ionicons name="radio" size={14} color={Colors.white} />
          <Text style={styles.liveText}>{t.liveData}</Text>
        </View>

        {/* Weather quick info */}
        {weather && !weather._error && (
          <View style={styles.weatherCard}>
            <Text style={styles.weatherTitle}>{t.weatherInfo}</Text>
            <View style={styles.weatherRow}>
              {weather.today_temp_max != null && (
                <View style={styles.weatherStat}>
                  <Text style={styles.weatherStatVal}>{weather.today_temp_max}°C</Text>
                  <Text style={styles.weatherStatLabel}>{lang === 'mr' ? 'कमाल तापमान' : 'Max Temp'}</Text>
                </View>
              )}
              {weather.soil_moisture != null && (
                <View style={styles.weatherStat}>
                  <Text style={styles.weatherStatVal}>{weather.soil_moisture}%</Text>
                  <Text style={styles.weatherStatLabel}>{t.soilMoisture}</Text>
                </View>
              )}
              {weather.rainfall_7d != null && (
                <View style={styles.weatherStat}>
                  <Text style={styles.weatherStatVal}>{weather.rainfall_7d} mm</Text>
                  <Text style={styles.weatherStatLabel}>{t.rainfall7d}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* District picker modal */}
      <Modal visible={showDistrictPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t.district} {lang === 'mr' ? 'निवडा' : 'Select'}</Text>
            <FlatList
              data={DISTRICTS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.districtItem, district === item && styles.districtItemActive]}
                  onPress={() => { setDistrict(item); setShowDistrictPicker(false); }}
                >
                  <Text style={[styles.districtItemText, district === item && styles.districtItemTextActive]}>
                    {t.districts[item] || item}
                  </Text>
                  {district === item && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDistrictPicker(false)}>
              <Text style={styles.cancelText}>{lang === 'mr' ? 'रद्द करा' : 'Cancel'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.pale },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  headerBox: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  tagline: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  districtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  districtLabel: {
    fontSize: 14,
    color: Colors.gray500,
    marginLeft: 6,
  },
  districtValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.red100,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  alertText: {
    flex: 1,
    color: Colors.red700,
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    gap: 8,
    justifyContent: 'center',
  },
  liveText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  weatherCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray700,
    marginBottom: 12,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherStat: {
    alignItems: 'center',
  },
  weatherStatVal: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  weatherStatLabel: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray700,
    marginBottom: 16,
    textAlign: 'center',
  },
  districtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  districtItemActive: {
    backgroundColor: Colors.pale,
  },
  districtItemText: {
    fontSize: 16,
    color: Colors.gray700,
  },
  districtItemTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  cancelBtn: {
    marginTop: 12,
    padding: 14,
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: Colors.gray500,
    fontWeight: '600',
  },
});
