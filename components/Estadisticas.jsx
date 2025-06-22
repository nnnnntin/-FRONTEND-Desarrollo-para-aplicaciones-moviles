import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const Estadisticas = ({ navigation }) => {
  const { datosUsuario, oficinasPropias } = useSelector(state => state.usuario);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const estadisticas = {
    ocupacion: '90%',
    ganancias: '$10,000 USD',
    resenas: '4.5',
    totalReservas: '430',
    reservasEsteMes: '45',
    promedioHoras: '5.5',
    oficinasActivas: oficinasPropias.length,
    clientesRecurrentes: '68%'
  };

  const chartData = [
    { sesiones: 5407, usuarios: 4295, mes: 'Ene' },
    { sesiones: 4890, usuarios: 3800, mes: 'Feb' },
    { sesiones: 5300, usuarios: 4100, mes: 'Mar' },
    { sesiones: 5600, usuarios: 4500, mes: 'Abr' },
    { sesiones: 3878, usuarios: 3200, mes: 'May' },
  ];

  const maxValue = Math.max(...chartData.map(d => Math.max(d.sesiones, d.usuarios)));

  const StatCard = ({ icon, title, value, color, subtext }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estadísticas</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Dashboard de {datosUsuario?.empresa || 'Tu Empresa'}
          </Text>
          <Text style={styles.periodText}>Período: Últimos 30 días</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="business"
            title="Ocupación"
            value={estadisticas.ocupacion}
            color="#4a90e2"
            subtext="Promedio mensual"
          />
          <StatCard
            icon="cash"
            title="Ganancias"
            value={estadisticas.ganancias}
            color="#27ae60"
            subtext="Este mes"
          />
          <StatCard
            icon="star"
            title="Reseñas"
            value={estadisticas.resenas + ' ★★★★★'}
            color="#f39c12"
            subtext="Promedio general"
          />
          <StatCard
            icon="calendar"
            title="Reservas"
            value={estadisticas.totalReservas}
            color="#9b59b6"
            subtext={`${estadisticas.reservasEsteMes} este mes`}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Website Overview</Text>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f39c12' }]} />
              <Text style={styles.legendText}>Sesiones</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3498db' }]} />
              <Text style={styles.legendText}>Usuarios</Text>
            </View>
          </View>

          <View style={styles.chart}>
            {chartData.map((data, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barsWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (data.sesiones / maxValue) * 150,
                        backgroundColor: '#f39c12',
                        marginRight: 4
                      }
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (data.usuarios / maxValue) * 150,
                        backgroundColor: '#3498db'
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.mes}</Text>
              </View>
            ))}
          </View>

          <View style={styles.chartValues}>
            <Text style={styles.chartValueText}>
              Sesiones: {chartData[chartData.length - 1].sesiones.toLocaleString()}
            </Text>
            <Text style={styles.chartValueText}>
              Usuarios: {chartData[chartData.length - 1].usuarios.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.additionalStats}>
          <View style={styles.additionalStatItem}>
            <Ionicons name="time" size={32} color="#3498db" />
            <Text style={styles.additionalStatValue}>{estadisticas.promedioHoras}h</Text>
            <Text style={styles.additionalStatLabel}>Promedio por reserva</Text>
          </View>

          <View style={styles.additionalStatItem}>
            <Ionicons name="business-outline" size={32} color="#e74c3c" />
            <Text style={styles.additionalStatValue}>{estadisticas.oficinasActivas}</Text>
            <Text style={styles.additionalStatLabel}>Oficinas activas</Text>
          </View>

          <View style={styles.additionalStatItem}>
            <Ionicons name="people" size={32} color="#2ecc71" />
            <Text style={styles.additionalStatValue}>{estadisticas.clientesRecurrentes}</Text>
            <Text style={styles.additionalStatLabel}>Clientes recurrentes</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  periodText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
    fontFamily: 'System',
  },
  statsGrid: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTitle: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
    marginLeft: 52,
  },
  statSubtext: {
    fontSize: 12,
    color: '#bdc3c7',
    marginTop: 4,
    marginLeft: 52,
    fontFamily: 'System',
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    fontFamily: 'System',
  },
  legendContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    paddingBottom: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
  },
  bar: {
    width: 20,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 8,
    fontFamily: 'System',
  },
  chartValues: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  chartValueText: {
    fontSize: 14,
    color: '#2c3e50',
    fontFamily: 'System',
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  additionalStatItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  additionalStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 10,
    fontFamily: 'System',
  },
  additionalStatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
    textAlign: 'center',
    fontFamily: 'System',
  },
  bottomSpacing: {
    height: 30,
  },
});

export default Estadisticas;