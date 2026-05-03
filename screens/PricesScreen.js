import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, SafeAreaView,
} from 'react-native';
import Colors from '../constants/colors';
import { T } from '../constants/translations';
import { apiFetch, fmt } from '../constants/api';
import { AppContext } from '../App';
import LoadingSpinner from '../components/LoadingSpinner';
import UnavailableCard from '../components/UnavailableCard';

export default function PricesScreen() {
  const { lang, district } = useContext(AppContext);
  const t = T[lang];
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await apiFetch(`/api/crops?district=${district}`);
    setData(res);
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

  const crops = Array.isArray(data) ? data : (data && Array.isArray(data.crops) ? data.crops : []);
  const liveCrops = crops.filter(c => c.source === 'live' || c.price != null);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t.todayPrices}</Text>
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>{t.liveData}</Text>
          </View>
        </View>

        {liveCrops.length === 0 ? (
          <UnavailableCard message={t.unavailable} />
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>{lang === 'mr' ? 'पीक' : 'Crop'}</Text>
              <Text style={[styles.th, { flex: 2 }]}>{lang === 'mr' ? 'बाजार' : 'Market'}</Text>
              <Text style={[styles.th, { flex: 2, textAlign: 'right' }]}>{lang === 'mr' ? 'भाव (₹/क्विंटल)' : 'Price (₹/qtl)'}</Text>
            </View>
            {liveCrops.map((crop, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                <Text style={[styles.td, { flex: 2, fontWeight: '600', color: Colors.primary }]}>
                  {(t.cropNames[crop.crop] || crop.crop)}
                </Text>
                <Text style={[styles.td, { flex: 2 }]} numberOfLines={1}>
                  {crop.market || crop.district || district}
                </Text>
                <View style={{ flex: 2, alignItems: 'flex-end' }}>
                  <Text style={styles.priceVal}>₹{fmt(crop.price)}</Text>
                  <Text style={styles.perKg}>≈ ₹{Math.round(crop.price / 100)}/kg</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {crops.filter(c => c.source !== 'live' && c.price == null).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{lang === 'mr' ? 'इतर पिके' : 'Other crops'}</Text>
            {crops
              .filter(c => c.source !== 'live' && c.price == null)
              .map((crop, i) => (
                <View key={i} style={styles.unavailRow}>
                  <Text style={styles.unavailCrop}>{t.cropNames[crop.crop] || crop.crop}</Text>
                  <Text style={styles.unavailMsg}>{t.unavailable}</Text>
                </View>
              ))
            }
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.gray100 },
  content: { padding: 16, paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.gray700,
  },
  liveBadge: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  table: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    padding: 12,
  },
  th: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  tableRowAlt: {
    backgroundColor: Colors.pale,
  },
  td: {
    fontSize: 13,
    color: Colors.gray700,
  },
  priceVal: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  perKg: {
    fontSize: 11,
    color: Colors.gray500,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray700,
    marginBottom: 8,
  },
  unavailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  unavailCrop: {
    fontSize: 14,
    color: Colors.gray700,
  },
  unavailMsg: {
    fontSize: 13,
    color: Colors.gray500,
  },
});
