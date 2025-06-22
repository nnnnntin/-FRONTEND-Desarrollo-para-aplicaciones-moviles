import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const GananciasProveedor = ({ navigation }) => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');

  const resumenGanancias = {
    totalMes: 2850,
    totalSemana: 680,
    serviciosCompletados: 18,
    calificacionPromedio: 4.8,
    proximoPago: '25/06/2025'
  };

  const serviciosRecientes = [
    {
      id: 1,
      servicio: 'Limpieza profunda',
      espacio: 'Oficina Skyview',
      fecha: '15/06/2025',
      monto: 150,
      estado: 'pagado'
    },
    {
      id: 2,
      servicio: 'Mantenimiento AC',
      espacio: 'Sala Premium',
      fecha: '14/06/2025',
      monto: 200,
      estado: 'pagado'
    },
    {
      id: 3,
      servicio: 'Limpieza regular',
      espacio: 'Oficina Centro',
      fecha: '13/06/2025',
      monto: 80,
      estado: 'pendiente'
    },
    {
      id: 4,
      servicio: 'Reparación eléctrica',
      espacio: 'Espacio Coworking',
      fecha: '12/06/2025',
      monto: 250,
      estado: 'pagado'
    }
  ];

  const handleGoBack = () => {
    navigation.goBack();
  };

  const calcularTotal = (periodo) => {
    switch (periodo) {
      case 'semana': return resumenGanancias.totalSemana;
      case 'mes': return resumenGanancias.totalMes;
      case 'año': return resumenGanancias.totalMes * 12;
      default: return 0;
    }
  };

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
        <Text style={styles.headerTitle}>Mis ganancias</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenTitulo}>Resumen de ganancias</Text>

          <View style={styles.periodosContainer}>
            {['semana', 'mes', 'año'].map((periodo) => (
              <TouchableOpacity
                key={periodo}
                style={[
                  styles.periodoButton,
                  periodoSeleccionado === periodo && styles.periodoButtonActive
                ]}
                onPress={() => setPeriodoSeleccionado(periodo)}
              >
                <Text style={[
                  styles.periodoText,
                  periodoSeleccionado === periodo && styles.periodoTextActive
                ]}>
                  {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.montoContainer}>
            <Text style={styles.montoLabel}>Total {periodoSeleccionado}</Text>
            <Text style={styles.montoValor}>${calcularTotal(periodoSeleccionado)}</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="briefcase" size={24} color="#4a90e2" />
              <Text style={styles.statValor}>{resumenGanancias.serviciosCompletados}</Text>
              <Text style={styles.statLabel}>Servicios</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={24} color="#f39c12" />
              <Text style={styles.statValor}>{resumenGanancias.calificacionPromedio}</Text>
              <Text style={styles.statLabel}>Calificación</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={24} color="#27ae60" />
              <Text style={styles.statValor}>{resumenGanancias.proximoPago}</Text>
              <Text style={styles.statLabel}>Próximo pago</Text>
            </View>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Servicios recientes</Text>

          {serviciosRecientes.map((servicio) => (
            <View key={servicio.id} style={styles.servicioCard}>
              <View style={styles.servicioInfo}>
                <Text style={styles.servicioNombre}>{servicio.servicio}</Text>
                <Text style={styles.servicioEspacio}>{servicio.espacio}</Text>
                <Text style={styles.servicioFecha}>{servicio.fecha}</Text>
              </View>
              <View style={styles.servicioMonto}>
                <Text style={styles.montoTexto}>${servicio.monto}</Text>
                <View style={[
                  styles.estadoBadge,
                  { backgroundColor: servicio.estado === 'pagado' ? '#27ae60' : '#f39c12' }
                ]}>
                  <Text style={styles.estadoTexto}>
                    {servicio.estado.charAt(0).toUpperCase() + servicio.estado.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.retirarButton}>
          <Ionicons name="cash" size={24} color="#fff" />
          <Text style={styles.retirarButtonText}>Retirar fondos</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3498db" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitulo}>Información sobre pagos</Text>
            <Text style={styles.infoTexto}>
              Los pagos se procesan automáticamente cada 15 días.
              Puedes retirar tus fondos en cualquier momento con un mínimo de $100.
            </Text>
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
  resumenCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resumenTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    fontFamily: 'System',
  },
  periodosContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  periodoButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodoButtonActive: {
    backgroundColor: '#4a90e2',
  },
  periodoText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
    fontFamily: 'System',
  },
  periodoTextActive: {
    color: '#fff',
  },
  montoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  montoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
    fontFamily: 'System',
  },
  montoValor: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#27ae60',
    fontFamily: 'System',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginVertical: 5,
    fontFamily: 'System',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  seccion: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    fontFamily: 'System',
  },
  servicioCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  servicioInfo: {
    flex: 1,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
    fontFamily: 'System',
  },
  servicioEspacio: {
    fontSize: 14,
    color: '#5a6c7d',
    marginBottom: 2,
    fontFamily: 'System',
  },
  servicioFecha: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  servicioMonto: {
    alignItems: 'flex-end',
  },
  montoTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
    fontFamily: 'System',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoTexto: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'System',
  },
  retirarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  retirarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e8f4fd',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
    fontFamily: 'System',
  },
  infoTexto: {
    fontSize: 13,
    color: '#5a6c7d',
    lineHeight: 18,
    fontFamily: 'System',
  },
  bottomSpacing: {
    height: 30,
  },
});

export default GananciasProveedor;