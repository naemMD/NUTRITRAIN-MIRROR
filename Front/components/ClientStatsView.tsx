import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import SimpleLineChart from './charts/SimpleLineChart';
import SimpleBarChart from './charts/SimpleBarChart';
import GroupedBarChart from './charts/GroupedBarChart';
import DonutChart, { formatMuscleLabel } from './charts/DonutChart';
import HorizontalDistribution from './charts/HorizontalDistribution';

interface ClientStatsViewProps {
  clientId: number;
}

const PERIODS = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
];

export default function ClientStatsView({ clientId }: ClientStatsViewProps) {
  const [period, setPeriod] = useState(30);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [period, clientId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/coaches/client-stats/${clientId}?period=${period}`);
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching client stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>No statistics available</Text>
      </View>
    );
  }

  const ws = stats.workout_stats;
  const ns = stats.nutrition_stats;

  // Build chart data
  const weeklyAttendanceData = (ws.weekly || []).map((w: any) => ({
    label: w.week_start.slice(5), // MM-DD
    value1: w.total || 0,
    value2: w.completed || 0,
  }));

  const MUSCLE_COLORS: Record<string, string> = {
    chest: '#e74c3c', back: '#3498DB', shoulders: '#f39c12', biceps: '#9b59b6',
    triceps: '#e67e22', quadriceps: '#2ecc71', hamstrings: '#1abc9c', calves: '#34495e',
    abs: '#e91e63', glutes: '#00bcd4', forearms: '#8bc34a', other: '#888',
  };

  const muscleSegments = Object.entries(ws.muscle_distribution || {})
    .sort((a, b) => b[1] as number - (a[1] as number))
    .map(([key, value]) => ({
      label: formatMuscleLabel(key),
      value: value as number,
      color: MUSCLE_COLORS[key.toLowerCase()] || '#888',
    }));

  const weeklyRatingData = (ws.weekly || [])
    .filter((w: any) => w.avg_rating > 0)
    .map((w: any) => ({
      label: w.week_start.slice(5),
      value: w.avg_rating,
    }));

  const difficultySegments = [
    { label: 'Too Easy', value: ws.difficulty_distribution?.too_easy || 0, color: '#2ecc71' },
    { label: 'Just Right', value: ws.difficulty_distribution?.just_right || 0, color: '#3498DB' },
    { label: 'Hard', value: ws.difficulty_distribution?.hard || 0, color: '#f39c12' },
    { label: 'Too Hard', value: ws.difficulty_distribution?.too_hard || 0, color: '#e74c3c' },
  ];

  const energySegments = [
    { label: 'Fresh', value: ws.energy_distribution?.fresh || 0, color: '#2ecc71' },
    { label: 'Normal', value: ws.energy_distribution?.normal || 0, color: '#3498DB' },
    { label: 'Tired', value: ws.energy_distribution?.tired || 0, color: '#f39c12' },
    { label: 'Exhausted', value: ws.energy_distribution?.exhausted || 0, color: '#e74c3c' },
  ];

  const dailyCaloriesData = (ns.daily || []).map((d: any) => ({
    label: d.date.slice(5),
    value: d.calories || 0,
  }));

  // Limit daily calories data points for readability
  const caloriesChartData = dailyCaloriesData.length > 30
    ? dailyCaloriesData.filter((_: any, i: number) => i % Math.ceil(dailyCaloriesData.length / 30) === 0)
    : dailyCaloriesData;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Period selector */}
      <View style={styles.periodRow}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p.value}
            style={[styles.periodPill, period === p.value && styles.periodPillActive]}
            onPress={() => setPeriod(p.value)}
          >
            <Text style={[styles.periodText, period === p.value && styles.periodTextActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{ws.completed > 0 ? (ws.completed / (period / 7)).toFixed(1) : '-'}</Text>
          <Text style={styles.kpiLabel}>Sessions/wk</Text>
        </View>
        <View style={styles.kpiCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.kpiValue}>{ws.avg_rating?.toFixed(1) || '-'}</Text>
            <Ionicons name="star" size={16} color="#f39c12" />
          </View>
          <Text style={styles.kpiLabel}>Avg Rating</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{ns.avg_daily_calories?.toFixed(0) || '-'}</Text>
          <Text style={styles.kpiLabel}>Avg Calories</Text>
        </View>
      </View>

      {/* Workout stats */}
      <View style={styles.statsRow}>
        <Text style={styles.statsDetail}>{ws.completed}/{ws.total} workouts completed</Text>
        <Text style={styles.statsDetail}>{ws.rated_count} rated</Text>
      </View>

      {/* Weekly Attendance + Muscle Distribution */}
      <View style={styles.dualRow}>
        {weeklyAttendanceData.length > 0 && (
          <View style={[styles.chartCard, styles.dualCard]}>
            <Text style={styles.chartTitle}>Weekly Attendance</Text>
            <GroupedBarChart data={weeklyAttendanceData} color1="#3498DB" color2="#2ecc71" label1="Planned" label2="Done" />
          </View>
        )}
        {muscleSegments.length > 0 && (
          <View style={[styles.chartCard, styles.dualCard]}>
            <Text style={styles.chartTitle}>Muscles Worked</Text>
            <DonutChart segments={muscleSegments} />
          </View>
        )}
      </View>

      {/* Avg Rating by Week */}
      {weeklyRatingData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Average Rating Over Time</Text>
          <SimpleLineChart data={weeklyRatingData} color="#f39c12" suffix="" />
        </View>
      )}

      {/* Difficulty Distribution */}
      {difficultySegments.some(s => s.value > 0) && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Perceived Difficulty</Text>
          <HorizontalDistribution segments={difficultySegments} />
        </View>
      )}

      {/* Energy Distribution */}
      {energySegments.some(s => s.value > 0) && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Energy Level</Text>
          <HorizontalDistribution segments={energySegments} />
        </View>
      )}

      {/* Daily Calories */}
      {caloriesChartData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Daily Calories</Text>
          <SimpleLineChart data={caloriesChartData} color="#3498DB" goalValue={ns.avg_daily_calories} goalColor="#e74c3c" goalLabel="Average" />
        </View>
      )}

      {/* Macros Averages */}
      {(ns.avg_proteins > 0 || ns.avg_carbs > 0 || ns.avg_fats > 0) && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Average Daily Macros</Text>
          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, { backgroundColor: '#e74c3c', height: Math.min(80, Math.max(20, (ns.avg_proteins / Math.max(ns.avg_proteins, ns.avg_carbs, ns.avg_fats, 1)) * 80)) }]} />
              <Text style={styles.macroValue}>{ns.avg_proteins?.toFixed(0)}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, { backgroundColor: '#f39c12', height: Math.min(80, Math.max(20, (ns.avg_carbs / Math.max(ns.avg_proteins, ns.avg_carbs, ns.avg_fats, 1)) * 80)) }]} />
              <Text style={styles.macroValue}>{ns.avg_carbs?.toFixed(0)}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, { backgroundColor: '#2ecc71', height: Math.min(80, Math.max(20, (ns.avg_fats / Math.max(ns.avg_proteins, ns.avg_carbs, ns.avg_fats, 1)) * 80)) }]} />
              <Text style={styles.macroValue}>{ns.avg_fats?.toFixed(0)}g</Text>
              <Text style={styles.macroLabel}>Fats</Text>
            </View>
          </View>
          <Text style={styles.macroDaysLogged}>{ns.days_logged} days logged</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#666', fontSize: 15 },

  periodRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 16 },
  periodPill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#232D3F' },
  periodPillActive: { backgroundColor: 'rgba(52, 152, 219, 0.2)', borderWidth: 1, borderColor: '#3498DB' },
  periodText: { color: '#888', fontSize: 14, fontWeight: '600' },
  periodTextActive: { color: '#3498DB' },

  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: '#232D3F', borderRadius: 14, padding: 16, alignItems: 'center' },
  kpiValue: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  kpiLabel: { color: '#888', fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 16 },
  statsDetail: { color: '#666', fontSize: 12 },

  chartCard: { backgroundColor: '#232D3F', borderRadius: 14, padding: 16, marginBottom: 14 },
  chartTitle: { color: 'white', fontSize: 15, fontWeight: 'bold', marginBottom: 14 },
  dualRow: { gap: 14, marginBottom: 0 },
  dualCard: { flex: 1 },

  macroRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingVertical: 10 },
  macroItem: { alignItems: 'center', gap: 6 },
  macroBar: { width: 40, borderRadius: 6 },
  macroValue: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  macroLabel: { color: '#888', fontSize: 11 },
  macroDaysLogged: { color: '#555', fontSize: 11, textAlign: 'center', marginTop: 10 },
});
