import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const ReportesAdmin = ({ navigation }) => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');
  const [reporteSeleccionado, setReporteSeleccionado] = useState('ingresos');
  const [modalExportar, setModalExportar] = useState(false);

  const datosBase = {
    día: {
      ingresos: {
        labels: ['00h', '06h', '12h', '18h', '24h'],
        data: [120, 300, 780, 1200, 950]
      },
      reservas: {
        labels: ['Mañana', 'Tarde', 'Noche'],
        data: [8, 15, 5]
      },
      metricas: {
        tasaOcupacion: 65,
        satisfaccionPromedio: 4.3,
        tiempoRespuesta: '45 min',
        tasaCancelacion: 3.2,
        ingresosPorUsuario: 89.50,
        reservasRecurrentes: 23
      }
    },
    semana: {
      ingresos: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        data: [3200, 3800, 4100, 4500, 5200, 6800, 2800]
      },
      reservas: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        data: [32, 38, 41, 45, 52, 68, 28]
      },
      metricas: {
        tasaOcupacion: 72,
        satisfaccionPromedio: 4.4,
        tiempoRespuesta: '1.8 horas',
        tasaCancelacion: 4.1,
        ingresosPorUsuario: 156.25,
        reservasRecurrentes: 45
      }
    },
    mes: {
      ingresos: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        data: [20000, 22000, 25000, 28000, 32000, 35000]
      },
      reservas: {
        labels: ['S1', 'S2', 'S3', 'S4'],
        data: [180, 220, 265, 211]
      },
      metricas: {
        tasaOcupacion: 78,
        satisfaccionPromedio: 4.6,
        tiempoRespuesta: '2.4 horas',
        tasaCancelacion: 5.2,
        ingresosPorUsuario: 234.56,
        reservasRecurrentes: 67
      }
    },
    año: {
      ingresos: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        data: [67000, 89000, 95000, 102000]
      },
      reservas: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        data: [720, 890, 950, 1020]
      },
      metricas: {
        tasaOcupacion: 82,
        satisfaccionPromedio: 4.7,
        tiempoRespuesta: '3.2 horas',
        tasaCancelacion: 4.8,
        ingresosPorUsuario: 485.75,
        reservasRecurrentes: 78
      }
    }
  };

  const datosIngresos = useMemo(() => {
    const datos = datosBase[periodoSeleccionado].ingresos;
    return {
      labels: datos.labels,
      datasets: [{
        data: datos.data,
        color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
        strokeWidth: 2
      }]
    };
  }, [periodoSeleccionado]);

  const datosReservas = useMemo(() => {
    const datos = datosBase[periodoSeleccionado].reservas;
    return {
      labels: datos.labels,
      datasets: [{
        data: datos.data
      }]
    };
  }, [periodoSeleccionado]);

  const datosDistribucionUsuarios = [
    {
      name: 'Usuarios',
      population: 1200,
      color: '#4a90e2',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: 'Clientes',
      population: 287,
      color: '#27ae60',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: 'Proveedores',
      population: 56,
      color: '#9b59b6',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }
  ];

  const metricas = useMemo(() => {
    return datosBase[periodoSeleccionado].metricas;
  }, [periodoSeleccionado]);

  const reportesProblemas = [
    {
      id: 1,
      tipo: 'servicio',
      usuario: 'Juan Pérez',
      email: 'juan@email.com',
      fecha: '18/06/2025',
      asunto: 'Problema con limpieza',
      mensaje: 'El servicio de limpieza no llegó a la hora acordada',
      espacio: 'Oficina Skyview',
      estado: 'pendiente',
      prioridad: 'alta'
    },
    {
      id: 2,
      tipo: 'pago',
      usuario: 'María González',
      email: 'maria@email.com',
      fecha: '17/06/2025',
      asunto: 'Error en cobro',
      mensaje: 'Se me cobró dos veces la misma reserva',
      monto: 1200,
      estado: 'en_proceso',
      prioridad: 'urgente'
    },
    {
      id: 3,
      tipo: 'espacio',
      usuario: 'Carlos Rodríguez',
      email: 'carlos@email.com',
      fecha: '16/06/2025',
      asunto: 'Aire acondicionado no funciona',
      mensaje: 'El aire acondicionado de la sala de reuniones no enfría',
      espacio: 'Sala Premium',
      estado: 'resuelto',
      prioridad: 'media'
    }
  ];

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4a90e2'
    }
  };

  const handleExportar = (formato) => {
    Alert.alert(
      'Exportar reporte',
      `¿Exportar reporte de ${reporteSeleccionado} en formato ${formato}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Exportar',
          onPress: () => {
            setModalExportar(false);
            Alert.alert('Éxito', `Reporte exportado en formato ${formato}`);
          }
        }
      ]
    );
  };

  const handleResolverProblema = (problema) => {
    Alert.alert(
      'Resolver problema',
      '¿Marcar este reporte como resuelto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resolver',
          onPress: () => {
            Alert.alert('Éxito', 'Reporte marcado como resuelto');
          }
        }
      ]
    );
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'urgente': return '#e74c3c';
      case 'alta': return '#f39c12';
      case 'media': return '#3498db';
      case 'baja': return '#95a5a6';
      default: return '#7f8c8d';
    }
  };

  const getTituloGrafico = (tipo) => {
    const periodos = {
      día: 'hoy',
      semana: 'esta semana',
      mes: 'este mes',
      año: 'este año'
    };
    
    if (tipo === 'ingresos') {
      return `Evolución de ingresos - ${periodos[periodoSeleccionado]}`;
    } else {
      return `Reservas por ${periodoSeleccionado === 'día' ? 'período del día' : 
                            periodoSeleccionado === 'semana' ? 'día de la semana' :
                            periodoSeleccionado === 'mes' ? 'semana del mes' : 'trimestre'}`;
    }
  };

  const renderReporteProblema = ({ item }) => (
    <TouchableOpacity style={styles.problemaCard}>
      <View style={styles.problemaHeader}>
        <View style={styles.problemaInfo}>
          <Text style={styles.problemaAsunto}>{item.asunto}</Text>
          <Text style={styles.problemaUsuario}>{item.usuario} - {item.email}</Text>
          <Text style={styles.problemaFecha}>{item.fecha}</Text>
        </View>
        <View style={[
          styles.prioridadBadge,
          { backgroundColor: getPrioridadColor(item.prioridad) + '20' }
        ]}>
          <Text style={[
            styles.prioridadText,
            { color: getPrioridadColor(item.prioridad) }
          ]}>
            {item.prioridad.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.problemaMensaje}>{item.mensaje}</Text>

      {item.espacio && (
        <View style={styles.problemaDetalles}>
          <Ionicons name="business" size={14} color="#7f8c8d" />
          <Text style={styles.problemaDetalleText}>{item.espacio}</Text>
        </View>
      )}

      {item.monto && (
        <View style={styles.problemaDetalles}>
          <Ionicons name="cash" size={14} color="#7f8c8d" />
          <Text style={styles.problemaDetalleText}>${item.monto}</Text>
        </View>
      )}

      <View style={styles.problemaFooter}>
        <View style={[
          styles.estadoBadge,
          {
            backgroundColor: item.estado === 'resuelto' ? '#27ae60' :
              item.estado === 'en_proceso' ? '#3498db' : '#f39c12'
          }
        ]}>
          <Text style={styles.estadoText}>
            {item.estado.replace('_', ' ').charAt(0).toUpperCase() +
              item.estado.replace('_', ' ').slice(1)}
          </Text>
        </View>

        {item.estado !== 'resuelto' && (
          <TouchableOpacity
            style={styles.resolverButton}
            onPress={() => handleResolverProblema(item)}
          >
            <Text style={styles.resolverButtonText}>Resolver</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportes y Análisis</Text>
        <TouchableOpacity
          onPress={() => setModalExportar(true)}
          style={styles.exportButton}
        >
          <Ionicons name="download-outline" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.periodosContainer}>
          {['día', 'semana', 'mes', 'año'].map((periodo) => (
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

        <View style={styles.metricasContainer}>
          <Text style={styles.seccionTitle}>Métricas clave - {periodoSeleccionado}</Text>
          <View style={styles.metricasGrid}>
            <View style={styles.metricaCard}>
              <View style={[styles.metricaIcon, { backgroundColor: '#4a90e220' }]}>
                <Ionicons name="trending-up" size={24} color="#4a90e2" />
              </View>
              <Text style={styles.metricaValue}>{metricas.tasaOcupacion}%</Text>
              <Text style={styles.metricaLabel}>Tasa ocupación</Text>
            </View>

            <View style={styles.metricaCard}>
              <View style={[styles.metricaIcon, { backgroundColor: '#f39c1220' }]}>
                <Ionicons name="star" size={24} color="#f39c12" />
              </View>
              <Text style={styles.metricaValue}>{metricas.satisfaccionPromedio}</Text>
              <Text style={styles.metricaLabel}>Satisfacción</Text>
            </View>

            <View style={styles.metricaCard}>
              <View style={[styles.metricaIcon, { backgroundColor: '#27ae6020' }]}>
                <Ionicons name="time" size={24} color="#27ae60" />
              </View>
              <Text style={styles.metricaValue}>{metricas.tiempoRespuesta}</Text>
              <Text style={styles.metricaLabel}>Tiempo respuesta</Text>
            </View>

            <View style={styles.metricaCard}>
              <View style={[styles.metricaIcon, { backgroundColor: '#e74c3c20' }]}>
                <Ionicons name="close-circle" size={24} color="#e74c3c" />
              </View>
              <Text style={styles.metricaValue}>{metricas.tasaCancelacion}%</Text>
              <Text style={styles.metricaLabel}>Cancelaciones</Text>
            </View>

            <View style={styles.metricaCard}>
              <View style={[styles.metricaIcon, { backgroundColor: '#9b59b620' }]}>
                <Ionicons name="cash" size={24} color="#9b59b6" />
              </View>
              <Text style={styles.metricaValue}>${metricas.ingresosPorUsuario}</Text>
              <Text style={styles.metricaLabel}>Ingreso por usuario</Text>
            </View>

            <View style={styles.metricaCard}>
              <View style={[styles.metricaIcon, { backgroundColor: '#e67e2220' }]}>
                <Ionicons name="repeat" size={24} color="#e67e22" />
              </View>
              <Text style={styles.metricaValue}>{metricas.reservasRecurrentes}%</Text>
              <Text style={styles.metricaLabel}>Reservas recurrentes</Text>
            </View>
          </View>
        </View>

        <View style={styles.graficoContainer}>
          <Text style={styles.graficoTitle}>{getTituloGrafico('ingresos')}</Text>
          <LineChart
            data={datosIngresos}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.grafico}
          />
        </View>

        <View style={styles.graficoContainer}>
          <Text style={styles.graficoTitle}>{getTituloGrafico('reservas')}</Text>
          <BarChart
            data={datosReservas}
            width={width - 40}
            height={200}
            chartConfig={chartConfig}
            style={styles.grafico}
          />
        </View>

        <View style={styles.graficoContainer}>
          <Text style={styles.graficoTitle}>Distribución de usuarios</Text>
          <PieChart
            data={datosDistribucionUsuarios}
            width={width - 40}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.grafico}
          />
        </View>

        <View style={styles.problemasContainer}>
          <View style={styles.problemasHeader}>
            <Text style={styles.seccionTitle}>Reportes de problemas</Text>
            <TouchableOpacity>
              <Text style={styles.verTodos}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={reportesProblemas}
            renderItem={renderReporteProblema}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        visible={modalExportar}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalExportar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Exportar reporte</Text>
              <TouchableOpacity
                onPress={() => setModalExportar(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalSubtitle}>
                Selecciona el formato de exportación
              </Text>

              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => handleExportar('PDF')}
              >
                <View style={[styles.exportIcon, { backgroundColor: '#e74c3c20' }]}>
                  <Ionicons name="document" size={24} color="#e74c3c" />
                </View>
                <View style={styles.exportInfo}>
                  <Text style={styles.exportTitle}>PDF</Text>
                  <Text style={styles.exportDescription}>
                    Reporte completo con gráficos
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#7f8c8d" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => handleExportar('Excel')}
              >
                <View style={[styles.exportIcon, { backgroundColor: '#27ae6020' }]}>
                  <Ionicons name="grid" size={24} color="#27ae60" />
                </View>
                <View style={styles.exportInfo}>
                  <Text style={styles.exportTitle}>Excel</Text>
                  <Text style={styles.exportDescription}>
                    Datos en formato de hoja de cálculo
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#7f8c8d" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => handleExportar('CSV')}
              >
                <View style={[styles.exportIcon, { backgroundColor: '#3498db20' }]}>
                  <Ionicons name="code" size={24} color="#3498db" />
                </View>
                <View style={styles.exportInfo}>
                  <Text style={styles.exportTitle}>CSV</Text>
                  <Text style={styles.exportDescription}>
                    Datos sin formato para análisis
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#7f8c8d" />
              </TouchableOpacity>

              <View style={styles.modalPeriodo}>
                <Text style={styles.modalPeriodoLabel}>Período del reporte:</Text>
                <Text style={styles.modalPeriodoValue}>
                  {periodoSeleccionado.charAt(0).toUpperCase() + periodoSeleccionado.slice(1)} actual
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  exportButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  periodosContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
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
  },
  periodoTextActive: {
    color: '#fff',
  },
  metricasContainer: {
    padding: 20,
  },
  seccionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  metricasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (width - 50) / 2,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  metricaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricaValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  metricaLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  graficoContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  graficoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  grafico: {
    marginVertical: 8,
    borderRadius: 16,
  },
  problemasContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  problemasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  verTodos: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
  },
  problemaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  problemaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  problemaInfo: {
    flex: 1,
  },
  problemaAsunto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  problemaUsuario: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 2,
  },
  problemaFecha: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  prioridadBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  prioridadText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  problemaMensaje: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 20,
    marginBottom: 8,
  },
  problemaDetalles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  problemaDetalleText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  problemaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  resolverButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#27ae60',
  },
  resolverButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exportInfo: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  exportDescription: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalPeriodo: {
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  modalPeriodoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  modalPeriodoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a90e2',
  },
});

export default ReportesAdmin;