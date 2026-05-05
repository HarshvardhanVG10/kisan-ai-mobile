import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { T } from '../constants/translations';
import { apiFetch } from '../constants/api';
import { AppContext } from '../App';
import LoadingSpinner from '../components/LoadingSpinner';
import RiskBadge from '../components/RiskBadge';
import UnavailableCard from '../components/UnavailableCard';

function conditionEmoji(condition) {
  if (!condition) return '🌤';
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('पाऊस')) return '🌧';
  if (c.includes('storm') || c.includes('thunder')) return '⛈';
  if (c.includes('cloud') || c.includes('ढग')) return '☁️';
  if (c.includes('clear') || c.includes('sunny') || c.includes('स्वच्छ')) return '☀️';
  if (c.includes('fog') || c.includes('धुके')) return '🌫';
  if (c.includes('wind') || c.includes('वारा')) return '💨';
  return '🌤';
}

function riskFromLevel(level) {
  if (!level) return 'green';
  const l = level.toLowerCase();
  if (l === 'high') return 'red';
  if (l === 'medium' || l === 'moderate') return 'yellow';
  return 'green';
}

function riskLabel(level, t) {
  if (!level) return t.riskLow;
  const l = level.toLowerCase();
  if (l === 'high') return t.riskHigh;
  if (l === 'medium' || l === 'moderate') return t.riskMed;
  return t.riskLow;
}

export default function WeatherScreen() {
  const { lang, district } = useContext(AppContext);
  const t = T[lang];
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await apiFetch(`/api/weather/${district}`);
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

  if (!data || data._error) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          <Text style={styles.title}>{t.weatherInfo}</Text>
          <UnavailableCard message={t.unavailable} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const forecast = data.forecast || data.daily_forecast || [];
  const advisories = data.advisories || data.weather_advisory || [];

  // soil_moisture may be a number or an object {current, level, irrigation_needed, advice_mr, advice_en}
  const soilRaw = data.soil_moisture;
  const soilMoisture = typeof soilRaw === 'object' && soilRaw !== null ? soilRaw.current : soilRaw;
  const soilAdvice = typeof soilRaw === 'object' && soilRaw !== null
    ? (lang === 'mr' ? soilRaw.advice_mr : soilRaw.advice_en)
    : null;
  const irrigationNeeded = typeof soilRaw === 'object' && soilRaw !== null
    ? soilRaw.irrigation_needed
    : (soilMoisture != null ? soilMoisture < 30 : false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Text style={styles.title}>{t.weatherInfo}</Text>
        <Text style={styles.subtitle}>{t.districts[district] || district}</Text>

        {/* Today summary */}
        <View style={styles.todayCard}>
          <View style={styles.todayRow}>
            <Text style={styles.todayEmoji}>{conditionEmoji(data.today_condition || data.condition)}</Text>
            <View style={styles.todayInfo}>
              <Text style={styles.todayCondition}>{data.today_condition || data.condition || (lang === 'mr' ? 'हवामान' : 'Weather')}</Text>
              {data.today_temp_max != null && (
                <Text style={styles.todayTemp}>
                  {data.today_temp_min != null ? `${data.today_temp_min}°` : ''} – {data.today_temp_max}°C
                </Text>
              )}
            </View>
            <RiskBadge
              color={riskFromLevel(data.risk_level)}
              label={riskLabel(data.risk_level, t)}
            />
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {soilMoisture != null && (
            <View style={styles.statCard}>
              <Ionicons name="water" size={20} color={Colors.blue700} />
              <Text style={styles.statVal}>{soilMoisture}%</Text>
              <Text style={styles.statLabel}>{t.soilMoisture}</Text>
              <View style={[styles.irrigateBadge, { backgroundColor: irrigationNeeded ? Colors.red100 : Colors.green100 }]}>
                <Text style={[styles.irrigateText, { color: irrigationNeeded ? Colors.red700 : Colors.green700 }]}>
                  {irrigationNeeded ? t.irrigate : t.noIrrigate}
                </Text>
              </View>
              {soilAdvice ? <Text style={[styles.irrigateText, { color: Colors.gray500, marginTop: 4 }]}>{soilAdvice}</Text> : null}
            </View>
          )}
          {data.rainfall_7d != null && (
            <View style={styles.statCard}>
              <Ionicons name="rainy" size={20} color={Colors.blue700} />
              <Text style={styles.statVal}>{data.rainfall_7d} mm</Text>
              <Text style={styles.statLabel}>{t.rainfall7d}</Text>
            </View>
          )}
          {data.evapotranspiration_today != null && (
            <View style={styles.statCard}>
              <Ionicons name="sunny" size={20} color='#f59e0b' />
              <Text style={styles.statVal}>{data.evapotranspiration_today} mm</Text>
              <Text style={styles.statLabel}>{lang === 'mr' ? 'बाष्पोत्सर्जन' : 'Evapotranspiration'}</Text>
            </View>
          )}
        </View>

        {/* 10-day forecast */}
        {forecast.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{lang === 'mr' ? '१० दिवसांचे हवामान' : '10-Day Forecast'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {forecast.slice(0, 10).map((day, i) => (
                <View key={i} style={styles.dayCard}>
                  <Text style={styles.dayLabel}>
                    {day.date
                      ? new Date(day.date).toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', { weekday: 'short', day: 'numeric' })
                      : `Day ${i + 1}`}
                  </Text>
                  <Text style={styles.dayEmoji}>{conditionEmoji(day.condition)}</Text>
                  {day.temp_max != null && (
                    <Text style={styles.dayTemp}>{day.temp_max}°C</Text>
                  )}
                  {day.rainfall != null && (
                    <Text style={styles.dayRain}>{day.rainfall}mm</Text>
                  )}
                  {day.risk_level && (
                    <View style={[styles.dayRisk, {
                      backgroundColor: day.risk_level === 'high' ? Colors.red100
                        : day.risk_level === 'medium' ? Colors.yellow100
                        : Colors.green100
                    }]}>
                      <Text style={[styles.dayRiskText, {
                        color: day.risk_level === 'high' ? Colors.red700
                          : day.risk_level === 'medium' ? Colors.yellow700
                          : Colors.green700
                      }]}>
                        {day.risk_level === 'high' ? '🔴' : day.risk_level === 'medium' ? '🟡' : '🟢'}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Advisories */}
        {advisories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{lang === 'mr' ? 'हवामान सल्ला' : 'Weather Advisory'}</Text>
            {advisories.map((adv, i) => (
              <View key={i} style={styles.advisoryRow}>
                <Ionicons name="alert-circle" size={16} color={Colors.yellow700} />
                <Text style={styles.advisoryText}>{typeof adv === 'string' ? adv : adv.message || adv.text || JSON.stringify(adv)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Single advisory string */}
        {data.advisory && !Array.isArray(data.advisory) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{lang === 'mr' ? 'हवामान सल्ला' : 'Weather Advisory'}</Text>
            <View style={styles.advisoryRow}>
              <Ionicons name="alert-circle" size={16} color={Colors.yellow700} />
              <Text style={styles.advisoryText}>{data.advisory}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.gray100 },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.gray700, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.gray500, marginBottom: 16 },
  todayCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  todayRow: { flexDirection: 'row', alignItems: 'center' },
  todayEmoji: { fontSize: 48, marginRight: 16 },
  todayInfo: { flex: 1 },
  todayCondition: { fontSize: 16, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  todayTemp: { fontSize: 28, fontWeight: '700', color: Colors.white },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statVal: { fontSize: 20, fontWeight: '700', color: Colors.gray700, marginTop: 6 },
  statLabel: { fontSize: 11, color: Colors.gray500, textAlign: 'center', marginTop: 2 },
  irrigateBadge: { marginTop: 6, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  irrigateText: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray700, marginBottom: 10 },
  dayCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  dayLabel: { fontSize: 11, color: Colors.gray500, marginBottom: 6, textAlign: 'center' },
  dayEmoji: { fontSize: 28, marginBottom: 4 },
  dayTemp: { fontSize: 14, fontWeight: '700', color: Colors.gray700 },
  dayRain: { fontSize: 11, color: Colors.blue700, marginTop: 2 },
  dayRisk: { marginTop: 6, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  dayRiskText: { fontSize: 12 },
  advisoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.yellow100,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  advisoryText: { flex: 1, fontSize: 14, color: Colors.yellow700, lineHeight: 20 },
});
