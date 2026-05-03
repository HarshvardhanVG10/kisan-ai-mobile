import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Colors from '../constants/colors';
import { T } from '../constants/translations';
import { apiFetch } from '../constants/api';
import { AppContext } from '../App';
import LoadingSpinner from '../components/LoadingSpinner';
import UnavailableCard from '../components/UnavailableCard';

const SEASONS = ['Kharif', 'Rabi', 'Zaid'];
const MEDALS = ['🥇', '🥈', '🥉'];

export default function GrowScreen() {
  const { lang, district } = useContext(AppContext);
  const t = T[lang];
  const [season, setSeason] = useState('Kharif');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await apiFetch(`/api/recommend?district=${district}&season=${season}`);
    setData(res);
    setLoading(false);
    setRefreshing(false);
  }, [district, season]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const recommended = data && !data._error
    ? (data.recommended || data.crops || []).slice(0, 3)
    : [];
  const avoid = data && !data._error
    ? (data.avoid || data.avoid_crops || [])
    : [];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Season tabs */}
      <View style={styles.tabRow}>
        {SEASONS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.tab, season === s && styles.tabActive]}
            onPress={() => setSeason(s)}
          >
            <Text style={[styles.tabText, season === s && styles.tabTextActive]}>
              {t.seasons[s] || s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingSpinner text={t.loading} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          <Text style={styles.title}>{t.whatToGrow}</Text>
          <Text style={styles.subtitle}>{t.districts[district] || district} · {t.seasons[season] || season}</Text>

          {recommended.length === 0 && avoid.length === 0 ? (
            <UnavailableCard message={t.unavailable} />
          ) : null}

          {/* Recommended crops */}
          {recommended.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.recommended}</Text>
              {recommended.map((item, i) => {
                const cropKey = typeof item === 'string' ? item : item.crop;
                const reasons = typeof item === 'object' ? (item.reasons || item.reason_list || []) : [];
                const score = typeof item === 'object' ? item.score : null;
                return (
                  <View key={cropKey || i} style={styles.recCard}>
                    <View style={styles.recHeader}>
                      <Text style={styles.medal}>{MEDALS[i] || '✅'}</Text>
                      <Text style={styles.recCropName}>{t.cropNames[cropKey] || cropKey}</Text>
                      {score != null && (
                        <View style={styles.scoreBadge}>
                          <Text style={styles.scoreText}>{typeof score === 'number' ? score.toFixed(1) : score}</Text>
                        </View>
                      )}
                    </View>
                    {reasons.length > 0 && (
                      <View style={styles.reasonList}>
                        {reasons.map((r, j) => (
                          <View key={j} style={styles.reasonRow}>
                            <Text style={styles.reasonBullet}>✓</Text>
                            <Text style={styles.reasonText}>{r}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {typeof item === 'object' && item.expected_profit != null && (
                      <View style={styles.profitRow}>
                        <Text style={styles.profitLabel}>{lang === 'mr' ? 'अपेक्षित नफा' : 'Expected Profit'}</Text>
                        <Text style={styles.profitVal}>₹{Math.round(item.expected_profit).toLocaleString('en-IN')}</Text>
                      </View>
                    )}
                    <View style={styles.growBadge}>
                      <Text style={styles.growBadgeText}>{t.growIt}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Avoid crops */}
          {avoid.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitleRed}>{t.avoid}</Text>
              {avoid.map((item, i) => {
                const cropKey = typeof item === 'string' ? item : item.crop;
                const reason = typeof item === 'object' ? (item.reason || item.summary || '') : '';
                return (
                  <View key={cropKey || i} style={styles.avoidCard}>
                    <View style={styles.avoidHeader}>
                      <Text style={styles.avoidIcon}>❌</Text>
                      <Text style={styles.avoidCropName}>{t.cropNames[cropKey] || cropKey}</Text>
                    </View>
                    {reason ? <Text style={styles.avoidReason}>{reason}</Text> : null}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.gray100 },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray300,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: Colors.gray100,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray500,
  },
  tabTextActive: {
    color: Colors.white,
  },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.gray700, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.gray500, marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.green700, marginBottom: 10 },
  sectionTitleRed: { fontSize: 16, fontWeight: '700', color: Colors.red700, marginBottom: 10 },
  recCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medal: { fontSize: 22, marginRight: 10 },
  recCropName: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.primary },
  scoreBadge: {
    backgroundColor: Colors.pale,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scoreText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  reasonList: { marginBottom: 8 },
  reasonRow: { flexDirection: 'row', marginBottom: 4 },
  reasonBullet: { fontSize: 13, color: Colors.green700, marginRight: 6 },
  reasonText: { flex: 1, fontSize: 13, color: Colors.gray700, lineHeight: 18 },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.pale,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  profitLabel: { fontSize: 13, color: Colors.gray700 },
  profitVal: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  growBadge: {
    backgroundColor: Colors.green100,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  growBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.green700 },
  avoidCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.red700,
  },
  avoidHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  avoidIcon: { fontSize: 16, marginRight: 8 },
  avoidCropName: { fontSize: 16, fontWeight: '700', color: Colors.red700 },
  avoidReason: { fontSize: 13, color: Colors.gray500, lineHeight: 18 },
});
