import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, SafeAreaView,
  Modal, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { T } from '../constants/translations';
import { apiFetch, fmt } from '../constants/api';
import { AppContext } from '../App';
import LoadingSpinner from '../components/LoadingSpinner';
import CropCard from '../components/CropCard';
import UnavailableCard from '../components/UnavailableCard';

const CROPS = ['Onion', 'Tomato', 'Potato', 'Wheat', 'Rice', 'Soybean', 'Cotton', 'Maize', 'Garlic', 'Chilli'];

function sellColor(verdict) {
  if (!verdict) return 'green';
  const v = verdict.toLowerCase();
  if (v.includes('now') || v.includes('आत्ता')) return 'green';
  if (v.includes('soon') || v.includes('लवकर')) return 'yellow';
  if (v.includes('wait') || v.includes('थांबा')) return 'blue';
  return 'green';
}

function sellVerdict(data, t) {
  if (!data || !data.verdict) return t.sellNow;
  const v = data.verdict.toLowerCase();
  if (v === 'sell_now' || v === 'sell now') return t.sellNow;
  if (v === 'sell_soon' || v === 'sell soon') return t.sellSoon;
  if (v === 'wait' || v === 'hold') return t.waitSell;
  return data.verdict;
}

export default function SellScreen() {
  const { lang, district } = useContext(AppContext);
  const t = T[lang];
  const [trends, setTrends] = useState({});
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    const [weatherData, ...trendResults] = await Promise.all([
      apiFetch(`/api/weather/${district}`),
      ...CROPS.map(crop => apiFetch(`/api/trends/${crop}?district=${district}`).then(d => [crop, d])),
    ]);
    setWeather(weatherData);
    setTrends(Object.fromEntries(trendResults));
    setLoading(false);
    setRefreshing(false);
  }, [district]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) return <LoadingSpinner text={t.loading} />;

  const selectedData = selected ? trends[selected] : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Text style={styles.title}>{t.whenToSell}</Text>

        {/* Soil moisture card */}
        {weather && !weather._error && weather.soil_moisture != null && (
          <View style={styles.soilCard}>
            <View style={styles.soilRow}>
              <Ionicons name="water" size={22} color={Colors.blue700} />
              <View style={styles.soilInfo}>
                <Text style={styles.soilLabel}>{t.soilMoisture}</Text>
                <Text style={styles.soilVal}>{weather.soil_moisture}%</Text>
              </View>
              <View style={[styles.irrigateBadge, { backgroundColor: weather.soil_moisture < 30 ? Colors.red100 : Colors.green100 }]}>
                <Text style={[styles.irrigateText, { color: weather.soil_moisture < 30 ? Colors.red700 : Colors.green700 }]}>
                  {weather.soil_moisture < 30 ? t.irrigate : t.noIrrigate}
                </Text>
              </View>
            </View>
          </View>
        )}

        {CROPS.map((crop) => {
          const data = trends[crop];
          if (!data || data._error) {
            return (
              <View key={crop} style={styles.unavailRow}>
                <Text style={styles.unavailCrop}>{t.cropNames[crop] || crop}</Text>
                <Text style={styles.unavailMsg}>{t.unavailable}</Text>
              </View>
            );
          }
          const verdict = sellVerdict(data, t);
          const color = sellColor(verdict);
          return (
            <CropCard
              key={crop}
              crop={crop}
              price={data.current_price}
              color={color}
              verdict={verdict}
              reason={data.reason || data.summary || ''}
              lang={lang}
              onPress={() => setSelected(crop)}
            />
          );
        })}
      </ScrollView>

      {/* Trend detail modal */}
      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selected ? (t.cropNames[selected] || selected) : ''}
            </Text>
          </View>

          {selectedData && !selectedData._error ? (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.verdictBox}>
                <Text style={styles.verdictText}>{sellVerdict(selectedData, t)}</Text>
              </View>

              {/* Price range */}
              {(selectedData.forecast_min != null || selectedData.price_range) && (
                <View style={styles.rangeCard}>
                  <Text style={styles.rangeLabel}>
                    {lang === 'mr' ? 'अपेक्षित भाव' : 'Expected Price Range'}
                  </Text>
                  <Text style={styles.rangeVal}>
                    ₹{fmt(selectedData.forecast_min || (selectedData.price_range && selectedData.price_range.min) || 0)}
                    {' – '}
                    ₹{fmt(selectedData.forecast_max || (selectedData.price_range && selectedData.price_range.max) || 0)}
                  </Text>
                  <Text style={styles.rangeUnit}>{t.perQtl}</Text>
                </View>
              )}

              {/* Current price */}
              {selectedData.current_price != null && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{lang === 'mr' ? 'सध्याचा भाव' : 'Current Price'}</Text>
                  <Text style={styles.infoVal}>₹{fmt(selectedData.current_price)} / qtl</Text>
                </View>
              )}

              {/* Trend direction */}
              {selectedData.trend && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{lang === 'mr' ? 'बाजार ट्रेंड' : 'Market Trend'}</Text>
                  <Text style={[styles.infoVal, { color: selectedData.trend === 'up' ? Colors.green700 : selectedData.trend === 'down' ? Colors.red700 : Colors.gray700 }]}>
                    {selectedData.trend === 'up' ? '↑ ' : selectedData.trend === 'down' ? '↓ ' : '→ '}
                    {selectedData.trend}
                  </Text>
                </View>
              )}

              {/* Reason */}
              {(selectedData.reason || selectedData.summary) && (
                <View style={styles.reasonBox}>
                  <Text style={styles.reasonText}>{selectedData.reason || selectedData.summary}</Text>
                </View>
              )}

              {/* Weekly forecast */}
              {selectedData.weekly_forecast && selectedData.weekly_forecast.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{lang === 'mr' ? 'आठवड्याचा अंदाज' : 'Weekly Forecast'}</Text>
                  {selectedData.weekly_forecast.map((wf, i) => (
                    <View key={i} style={styles.wfRow}>
                      <Text style={styles.wfDay}>{wf.day || wf.date || `Day ${i + 1}`}</Text>
                      <Text style={styles.wfPrice}>₹{fmt(wf.price || wf.predicted_price || 0)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.modalContent}>
              <UnavailableCard message={t.unavailable} />
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.gray100 },
  content: { paddingTop: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.gray700, paddingHorizontal: 16, marginBottom: 12 },
  soilCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  soilRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  soilInfo: { flex: 1 },
  soilLabel: { fontSize: 12, color: Colors.gray500 },
  soilVal: { fontSize: 22, fontWeight: '700', color: Colors.blue700 },
  irrigateBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  irrigateText: { fontSize: 11, fontWeight: '600' },
  unavailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  unavailCrop: { fontSize: 14, color: Colors.gray700, fontWeight: '600' },
  unavailMsg: { fontSize: 13, color: Colors.gray500 },
  modalSafe: { flex: 1, backgroundColor: Colors.white },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray300,
  },
  backBtn: { padding: 4, marginRight: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray700 },
  modalContent: { padding: 16, paddingBottom: 40 },
  verdictBox: {
    backgroundColor: Colors.pale,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  verdictText: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  rangeCard: {
    backgroundColor: Colors.green100,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  rangeLabel: { fontSize: 13, color: Colors.green700, marginBottom: 6 },
  rangeVal: { fontSize: 26, fontWeight: '700', color: Colors.green700 },
  rangeUnit: { fontSize: 12, color: Colors.green700, marginTop: 2 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  infoLabel: { fontSize: 14, color: Colors.gray500 },
  infoVal: { fontSize: 15, fontWeight: '700', color: Colors.gray700 },
  reasonBox: {
    backgroundColor: Colors.blue100,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  reasonText: { fontSize: 14, color: Colors.blue700, lineHeight: 20 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray700, marginBottom: 10 },
  wfRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  wfDay: { fontSize: 14, color: Colors.gray700 },
  wfPrice: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});
