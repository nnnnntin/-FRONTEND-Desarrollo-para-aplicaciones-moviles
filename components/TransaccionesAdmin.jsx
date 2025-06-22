import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
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

const TransaccionesAdmin = ({ navigation }) => {
  const [tabActiva, setTabActiva] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [modalFiltros, setModalFiltros] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);

  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    montoMin: '',
    montoMax: '',
    estado: 'todos',
    tipo: 'todos'
  });

  const [transacciones] = useState([
    {
      id: 'TRX001',
      tipo: 'comision_reserva',
      descripcion: 'Comisión por reserva - Oficina Skyview',
      usuario: 'Cliente Demo',
      monto: 120.00,
      fecha: '2025-06-20 10:30',
      estado: 'completado',
      metodoPago: 'Transferencia bancaria',
      detalles: {
        espacioId: 1,
        espacioNombre: 'Oficina Skyview',
        reservaId: 'RES456',
        porcentajeComision: 10,
        montoTotal: 1200
      }
    },
    {
      id: 'TRX002',
      tipo: 'comision_servicio',
      descripcion: 'Comisión servicio limpieza',
      usuario: 'María González - Cleaning Pro',
      monto: 24.00,
      fecha: '2025-06-20 09:15',
      estado: 'pendiente',
      metodoPago: 'Por definir',
      detalles: {
        servicioId: 23,
        servicioNombre: 'Limpieza profunda',
        solicitudId: 'SOL789',
        porcentajeComision: 20,
        montoTotal: 120
      }
    },
    {
      id: 'TRX003',
      tipo: 'membresia',
      descripcion: 'Suscripción Premium',
      usuario: 'Juan Pérez',
      monto: 49.99,
      fecha: '2025-06-19 18:45',
      estado: 'completado',
      metodoPago: 'Tarjeta de crédito',
      detalles: {
        tipoMembresia: 'Premium',
        duracion: '1 mes',
        fechaInicio: '2025-06-19',
        fechaFin: '2025-07-19'
      }
    },
    {
      id: 'TRX004',
      tipo: 'reembolso',
      descripcion: 'Reembolso por cancelación',
      usuario: 'Carlos Rodríguez',
      monto: -180.00,
      fecha: '2025-06-19 16:20',
      estado: 'procesando',
      metodoPago: 'Devolución a tarjeta',
      detalles: {
        motivoReembolso: 'Cancelación por parte del cliente',
        reservaOriginal: 'RES123',
        penalizacion: 20
      }
    },
    {
      id: 'TRX005',
      tipo: 'comision_reserva',
      descripcion: 'Comisión por reserva - Sala Premium',
      usuario: 'Business Center',
      monto: 200.00,
      fecha: '2025-06-19 14:00',
      estado: 'completado',
      metodoPago: 'Transferencia bancaria',
      detalles: {
        espacioId: 5,
        espacioNombre: 'Sala de Reuniones Premium',
        reservaId: 'RES890',
        porcentajeComision: 10,
        montoTotal: 2000
      }
    }
  ]);

  const estadisticas = {
    totalTransacciones: transacciones.length,
    montoTotal: transacciones.reduce((sum, t) => sum + t.monto, 0),
    completadas: transacciones.filter(t => t.estado === 'completado').length,
    pendientes: transacciones.filter(t => t.estado === 'pendiente').length,
    procesando: transacciones.filter(t => t.estado === 'procesando').length
  };

  const getTipoInfo = (tipo) => {
    switch (tipo) {
      case 'comision_reserva':
        return { icono: 'business', color: '#4a90e2' };
      case 'comision_servicio':
        return { icono: 'construct', color: '#27ae60' };
      case 'membresia':
        return { icono: 'star', color: '#f39c12' };
      case 'reembolso':
        return { icono: 'return-down-back', color: '#e74c3c' };
      default:
        return { icono: 'cash', color: '#7f8c8d' };
    }
  };

  const getEstadoInfo = (estado) => {
    switch (estado) {
      case 'completado':
        return { color: '#27ae60', texto: 'Completado' };
      case 'pendiente':
        return { color: '#f39c12', texto: 'Pendiente' };
      case 'procesando':
        return { color: '#3498db', texto: 'Procesando' };
      case 'cancelado':
        return { color: '#e74c3c', texto: 'Cancelado' };
      default:
        return { color: '#7f8c8d', texto: estado };
    }
  };

  const getTransaccionesFiltradas = () => {
    let filtradas = transacciones;

    if (tabActiva !== 'todas') {
      filtradas = filtradas.filter(t => t.tipo === tabActiva);
    }

    if (busqueda) {
      filtradas = filtradas.filter(t =>
        t.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.id.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    return filtradas;
  };

  const handleVerDetalle = (transaccion) => {
    setTransaccionSeleccionada(transaccion);
    setModalDetalle(true);
  };

  const handleExportar = () => {
    Alert.alert(
      'Exportar transacciones',
      'Selecciona el formato de exportación',
      [
        { text: 'CSV', onPress: () => Alert.alert('Éxito', 'Archivo CSV generado') },
        { text: 'Excel', onPress: () => Alert.alert('Éxito', 'Archivo Excel generado') },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleProcesarPago = (transaccion) => {
    Alert.alert(
      'Procesar pago',
      `¿Procesar el pago de $${transaccion.monto} a ${transaccion.usuario}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Procesar',
          onPress: () => {
            Alert.alert('Éxito', 'Pago procesado correctamente');
          }
        }
      ]
    );
  };

  const renderTransaccion = ({ item }) => {
    const tipoInfo = getTipoInfo(item.tipo);
    const estadoInfo = getEstadoInfo(item.estado);

    return (
      <TouchableOpacity
        style={styles.transaccionCard}
        onPress={() => handleVerDetalle(item)}
      >
        <View style={styles.transaccionHeader}>
          <View style={[styles.tipoIcon, { backgroundColor: tipoInfo.color + '20' }]}>
            <Ionicons name={tipoInfo.icono} size={20} color={tipoInfo.color} />
          </View>
          <View style={styles.transaccionInfo}>
            <Text style={styles.transaccionId}>#{item.id}</Text>
            <Text style={styles.transaccionDescripcion}>{item.descripcion}</Text>
            <Text style={styles.transaccionUsuario}>{item.usuario}</Text>
            <Text style={styles.transaccionFecha}>{item.fecha}</Text>
          </View>
        </View>

        <View style={styles.transaccionFooter}>
          <Text style={[
            styles.transaccionMonto,
            item.monto < 0 && styles.montoNegativo
          ]}>
            {item.monto < 0 ? '-' : '+'}${Math.abs(item.monto).toFixed(2)}
          </Text>
          <View style={[
            styles.estadoBadge,
            { backgroundColor: estadoInfo.color + '20' }
          ]}>
            <Text style={[styles.estadoText, { color: estadoInfo.color }]}>
              {estadoInfo.texto}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headerTitle}>Transacciones</Text>
        <TouchableOpacity
          onPress={handleExportar}
          style={styles.exportButton}
        >
          <Ionicons name="download-outline" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por ID, descripción o usuario..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
        <TouchableOpacity
          onPress={() => setModalFiltros(true)}
          style={styles.filterButton}
        >
          <Ionicons name="filter" size={20} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <View style={styles.estadisticasCard}>
        <View style={styles.estatItem}>
          <Text style={styles.estatValor}>{estadisticas.totalTransacciones}</Text>
          <Text style={styles.estatLabel}>Total</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={[styles.estatValor, { color: '#27ae60' }]}>
            ${estadisticas.montoTotal.toFixed(2)}
          </Text>
          <Text style={styles.estatLabel}>Monto total</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={[styles.estatValor, { color: '#f39c12' }]}>
            {estadisticas.pendientes}
          </Text>
          <Text style={styles.estatLabel}>Pendientes</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        <TouchableOpacity
          style={[styles.tab, tabActiva === 'todas' && styles.tabActive]}
          onPress={() => setTabActiva('todas')}
        >
          <Text style={[styles.tabText, tabActiva === 'todas' && styles.tabTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tabActiva === 'comision_reserva' && styles.tabActive]}
          onPress={() => setTabActiva('comision_reserva')}
        >
          <Text style={[styles.tabText, tabActiva === 'comision_reserva' && styles.tabTextActive]}>
            Reservas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tabActiva === 'comision_servicio' && styles.tabActive]}
          onPress={() => setTabActiva('comision_servicio')}
        >
          <Text style={[styles.tabText, tabActiva === 'comision_servicio' && styles.tabTextActive]}>
            Servicios
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tabActiva === 'membresia' && styles.tabActive]}
          onPress={() => setTabActiva('membresia')}
        >
          <Text style={[styles.tabText, tabActiva === 'membresia' && styles.tabTextActive]}>
            Membresías
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tabActiva === 'reembolso' && styles.tabActive]}
          onPress={() => setTabActiva('reembolso')}
        >
          <Text style={[styles.tabText, tabActiva === 'reembolso' && styles.tabTextActive]}>
            Reembolsos
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <FlatList
        data={getTransaccionesFiltradas()}
        renderItem={renderTransaccion}
        keyExtractor={(item) => item.id}
        style={styles.lista}
        contentContainerStyle={styles.listaContent}
      />

      <Modal
        visible={modalDetalle}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalDetalle(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle de transacción</Text>
              <TouchableOpacity
                onPress={() => setModalDetalle(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            {transaccionSeleccionada && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.modalSeccion}>
                  <View style={styles.modalIdContainer}>
                    <Text style={styles.modalIdLabel}>ID Transacción</Text>
                    <Text style={styles.modalIdValue}>#{transaccionSeleccionada.id}</Text>
                  </View>

                  <View style={[
                    styles.modalTipoBadge,
                    { backgroundColor: getTipoInfo(transaccionSeleccionada.tipo).color + '20' }
                  ]}>
                    <Ionicons
                      name={getTipoInfo(transaccionSeleccionada.tipo).icono}
                      size={16}
                      color={getTipoInfo(transaccionSeleccionada.tipo).color}
                    />
                    <Text style={[
                      styles.modalTipoText,
                      { color: getTipoInfo(transaccionSeleccionada.tipo).color }
                    ]}>
                      {transaccionSeleccionada.tipo.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Información general</Text>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Descripción</Text>
                    <Text style={styles.modalInfoValue}>{transaccionSeleccionada.descripcion}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Usuario</Text>
                    <Text style={styles.modalInfoValue}>{transaccionSeleccionada.usuario}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Fecha</Text>
                    <Text style={styles.modalInfoValue}>{transaccionSeleccionada.fecha}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Método de pago</Text>
                    <Text style={styles.modalInfoValue}>{transaccionSeleccionada.metodoPago}</Text>
                  </View>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Detalles de la transacción</Text>
                  {Object.entries(transaccionSeleccionada.detalles).map(([key, value]) => (
                    <View key={key} style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>
                        {key.replace(/([A-Z])/g, ' $1').charAt(0).toUpperCase() +
                          key.replace(/([A-Z])/g, ' $1').slice(1)}
                      </Text>
                      <Text style={styles.modalInfoValue}>{value}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalMontoContainer}>
                  <Text style={styles.modalMontoLabel}>Monto total</Text>
                  <Text style={[
                    styles.modalMontoValue,
                    transaccionSeleccionada.monto < 0 && styles.modalMontoNegativo
                  ]}>
                    {transaccionSeleccionada.monto < 0 ? '-' : ''}
                    ${Math.abs(transaccionSeleccionada.monto).toFixed(2)}
                  </Text>
                </View>

                <View style={[
                  styles.modalEstadoContainer,
                  { backgroundColor: getEstadoInfo(transaccionSeleccionada.estado).color + '20' }
                ]}>
                  <Text style={[
                    styles.modalEstadoText,
                    { color: getEstadoInfo(transaccionSeleccionada.estado).color }
                  ]}>
                    Estado: {getEstadoInfo(transaccionSeleccionada.estado).texto}
                  </Text>
                </View>

                {transaccionSeleccionada.estado === 'pendiente' && (
                  <TouchableOpacity
                    style={styles.procesarButton}
                    onPress={() => {
                      setModalDetalle(false);
                      handleProcesarPago(transaccionSeleccionada);
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.procesarButtonText}>Procesar pago</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalFiltros}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalFiltros(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity
                onPress={() => setModalFiltros(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.filtroSeccion}>
                <Text style={styles.filtroLabel}>Fecha inicio</Text>
                <TextInput
                  style={styles.filtroInput}
                  placeholder="DD/MM/YYYY"
                  value={filtros.fechaInicio}
                  onChangeText={(text) => setFiltros({ ...filtros, fechaInicio: text })}
                />
              </View>

              <View style={styles.filtroSeccion}>
                <Text style={styles.filtroLabel}>Fecha fin</Text>
                <TextInput
                  style={styles.filtroInput}
                  placeholder="DD/MM/YYYY"
                  value={filtros.fechaFin}
                  onChangeText={(text) => setFiltros({ ...filtros, fechaFin: text })}
                />
              </View>

              <View style={styles.filtroSeccion}>
                <Text style={styles.filtroLabel}>Monto mínimo</Text>
                <TextInput
                  style={styles.filtroInput}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={filtros.montoMin}
                  onChangeText={(text) => setFiltros({ ...filtros, montoMin: text })}
                />
              </View>

              <View style={styles.filtroSeccion}>
                <Text style={styles.filtroLabel}>Monto máximo</Text>
                <TextInput
                  style={styles.filtroInput}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={filtros.montoMax}
                  onChangeText={(text) => setFiltros({ ...filtros, montoMax: text })}
                />
              </View>

              <TouchableOpacity
                style={styles.aplicarFiltrosButton}
                onPress={() => setModalFiltros(false)}
              >
                <Text style={styles.aplicarFiltrosText}>Aplicar filtros</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.limpiarFiltrosButton}
                onPress={() => {
                  setFiltros({
                    fechaInicio: '',
                    fechaFin: '',
                    montoMin: '',
                    montoMax: '',
                    estado: 'todos',
                    tipo: 'todos'
                  });
                }}
              >
                <Text style={styles.limpiarFiltrosText}>Limpiar filtros</Text>
              </TouchableOpacity>
            </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 10,
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#2c3e50',
  },
  filterButton: {
    padding: 8,
    marginLeft: 8,
  },
  estadisticasCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  estatItem: {
    alignItems: 'center',
  },
  estatValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  estatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f8f9fa',
  },
  tabActive: {
    backgroundColor: '#4a90e2',
  },
  tabText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  lista: {
    flex: 1,
  },
  listaContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  transaccionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  transaccionHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transaccionInfo: {
    flex: 1,
  },
  transaccionId: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  transaccionDescripcion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  transaccionUsuario: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 2,
  },
  transaccionFecha: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  transaccionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transaccionMonto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  montoNegativo: {
    color: '#e74c3c',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
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
    maxHeight: '85%',
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
  modalSeccion: {
    marginBottom: 20,
  },
  modalIdContainer: {
    marginBottom: 12,
  },
  modalIdLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  modalIdValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalTipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  modalTipoText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalSeccionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  modalInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  modalMontoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  modalMontoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  modalMontoValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  modalMontoNegativo: {
    color: '#e74c3c',
  },
  modalEstadoContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalEstadoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  procesarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  procesarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filtroSeccion: {
    marginBottom: 16,
  },
  filtroLabel: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
    fontWeight: '600',
  },
  filtroInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  aplicarFiltrosButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  aplicarFiltrosText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  limpiarFiltrosButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  limpiarFiltrosText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransaccionesAdmin;