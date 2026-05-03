import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, SafeAreaView,
  Modal, TouchableOpacity,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { T } from '../constants/translations';
import { apiFetch, fmt } from '../constants/api';
import { AppContext } from '../App';
import LoadingSpinner from '../components/LoadingSpinner';
import CropCard from '../components/CropCard';
import RiskBadge from '../components/RiskBadge';
import MSPBadge from '../components/MSPBadge';

const CROPS = ['Onion', 'Tomato', 'Potato', 'Wheat', 'Rice', 'Soybean', 'Cotton', 'Maize', 'Garlic', 'Chilli'];

function riskColor(level) {
  if (!level) return 'green';
  const l = level.toLowerCase();
  if (l === 'high') return 'red';
  if (l === 'medium') return 'yellow';
  return 'green';
}

function riskLabel(level, t) {
  if (!level) return t.riskLow;
  const l = level.toLowerCase();
  if (l === 'high') return t.riskHigh;
  if (l === 'medium') return t.riskMed;
  return t.riskLow;
}

export default function RiskScreen() {
  const { lang, district } = useContext(AppContext);
  const t = T[lang];
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    const entries = await Promise.all(
      CROPS.map(async (crop) => {
        const data = await apiFetch(`/api/risk/${crop}?district=${district}`);
        return [crop, data];
      })
    );
    setResults(Object.fromEntries(entries));
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

  const speak = (crop) => {
    const data = results[crop];
    if (!data || data._error) return;
    const cropName = t.cropNames[crop] || crop;
    const level = data.overall_risk || 'low';
    const text = lang === 'mr'
      ? `${cropName} साठी ${riskLabel(level, t)}. ${data.summary || ''}`
      : `Risk for ${cropName} is ${level}. ${data.summary || ''}`;
    Speech.speak(text, { language: lang === 'mr' ? 'mr-IN' : 'en-IN' });
  };

  if (loading) return <LoadingSpinner text={t.loading} />;

  const selectedData = selected ? results[selected] : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Text style={styles.title}>{t.checkRisk}</Text>
        <Text style={styles.subtitle}>{t.districts[district] || district}</Text>

        {CROPS.map((crop) => {
          const data = results[crop];
          if (!data || data._error) {
            return (
              <View key={crop} style={styles.unavailRow}>
                <Text style={styles.unavailCrop}>{t.cropNames[crop] || crop}</Text>
                <Text style={styles.unavailMsg}>{t.unavailable}</Text>
              </View>
            );
          }
          const color = riskColor(data.overall_risk);
          return (
            <CropCard
              key={crop}
              crop={crop}
              price={data.current_price}
              color={color}
              verdict={riskLabel(data.overall_risk, t)}
              reason={data.summary || ''}
              lang={lang}
              onPress={() => setSelected(crop)}
            />
          );
        })}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selected ? (t.cropNames[selected] || selected) : ''}
            </Text>
            {selected && (
              <TouchableOpacity onPress={() => speak(selected)} style={styles.speakBtn}>
                <Text style={styles.speakText}>{t.listenBtn}</Text>
              </TouchableOpacity>
            )}
          </View>

          {selectedData && !selectedData._error ? (
            <ScrollView contentContainerStyle={styles.modalContent}>
              {/* Overall risk */}
              <View style={styles.centeredBadge}>
                <RiskBadge
                  color={riskColor(selectedData.overall_risk)}
                  label={riskLabel(selectedData.overall_risk, t)}
                  size="large"
                />
              </View>

              {selectedData.summary ? (
                <Text style={styles.summaryText}>{selectedData.summary}</Text>
              ) : null}

              {/* MSP */}
              <MSPBadge mspComparison={selectedData.msp_comparison} lang={lang} />

              {/* District suitability */}
              {selectedData.district_suitability != null && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>{t.districtSuitability}</Text>
                  <Text style={styles.infoVal}>{selectedData.district_suitability}/10</Text>
                </View>
              )}

              {/* Risk breakdown */}
              {selectedData.risk_breakdown && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{lang === 'mr' ? 'धोका विश्लेषण' : 'Risk Breakdown'}</Text>
                  {Object.entries(selectedData.risk_breakdown).map(([key, val]) => (
                    <View key={key} style={styles.breakdownRow}>
                      <Text style={styles.breakdownKey}>{key.replace(/_/g, ' ')}</Text>
                      <View style={[styles.breakdownBar, { width: `${Math.min((val / 10) * 100, 100)}%`, backgroundColor: val > 6 ? Colors.red700 : val > 4 ? Colors.yellow700 : Colors.green700 }]} />
                      <Text style={styles.breakdownVal}>{typeof val === 'number' ? val.toFixed(1) : val}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Key insights */}
              {selectedData.key_insights && selectedData.key_insights.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{lang === 'mr' ? 'मुख्य माहिती' : 'Key Insights'}</Text>
                  {selectedData.key_insights.map((insight, i) => (
                    <View key={i} style={styles.insightRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.insightText}>{insight}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.modalContent}>
              <Text style={styles.unavailMsg}>{t.unavailable}</Text>
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
  title: { fontSize: 22, fontWeight: '700', color: Colors.gray700, paddingHorizontal: 16, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.gray500, paddingHorizontal: 16, marginBottom: 12 },
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
  modalTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.gray700 },
  speakBtn: {
    backgroundColor: Colors.pale,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  speakText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  modalContent: { padding: 16, paddingBottom: 40 },
  centeredBadge: { alignItems: 'center', marginVertical: 20 },
  summaryText: {
    fontSize: 15,
    color: Colors.gray700,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: Colors.pale,
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: { fontSize: 14, color: Colors.gray700 },
  infoVal: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray700, marginBottom: 10 },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownKey: {
    width: 120,
    fontSize: 12,
    color: Colors.gray700,
    textTransform: 'capitalize',
  },
  breakdownBar: {
    height: 8,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 8,
  },
  breakdownVal: {
    width: 32,
    fontSize: 12,
    color: Colors.gray500,
    textAlign: 'right',
  },
  insightRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: { fontSize: 16, color: Colors.primary, marginRight: 8 },
  insightText: { flex: 1, fontSize: 14, color: Colors.gray700, lineHeight: 20 },
});
