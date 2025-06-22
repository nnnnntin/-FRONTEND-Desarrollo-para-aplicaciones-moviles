import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
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

const ComisionesAdmin = ({ navigation }) => {
  const [tabActiva, setTabActiva] = useState('reservas');
  const [modalConfiguracion, setModalConfiguracion] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [comisionSeleccionada, setComisionSeleccionada] = useState(null);

  const [configuracionComisiones, setConfiguracionComisiones] = useState({
    reservas: {
      porcentaje: 10,
      minimo: 5,
      maximo: 500
    },
    servicios: {
      porcentaje: 20,
      minimo: 10,
      maximo: 200
    },
    membresias: {
      premium: 49.99,
      empresarial: 149.99,
      basico: 19.99
    }
  });

  const [tempConfig, setTempConfig] = useState({});

  const comisionesPorCobrar = [
    {
      id: 1,
      tipo: 'reserva',
      cliente: 'Cliente Demo',
      descripcion: 'Oficina Skyview - 3 días',
      montoTotal: 3600,
      comision: 360,
      fecha: '18/06/2025',
      estado: 'pendiente'
    },
    {
      id: 2,
      tipo: 'servicio',
      proveedor: 'María González - Cleaning Pro',
      descripcion: 'Limpieza profunda x 5',
      montoTotal: 600,
      comision: 120,
      fecha: '17/06/2025',
      estado: 'procesando'
    },
    {
      id: 3,
      tipo: 'reserva',
      cliente: 'Empresa ABC',
      descripcion: 'Sala de reuniones - 1 día',
      montoTotal: 200,
      comision: 20,
      fecha: '16/06/2025',
      estado: 'cobrado'
    }
  ];

  const resumenFinanciero = {
    pendienteCobro: 5840,
    cobradoMes: 23450,
    proyeccionMes: 32000,
    totalReservas: 234,
    totalServicios: 89,
    clientesActivos: 45,
    proveedoresActivos: 23
  };

  const handleVerDetalle = (comision) => {
    setComisionSeleccionada(comision);
    setModalDetalle(true);
  };

  const handleCobrarComision = (comision) => {
    Alert.alert(
      'Cobrar comisión',
      `¿Confirmar el cobro de $${comision.comision} a ${comision.cliente || comision.proveedor}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cobrar',
          onPress: () => {
            Alert.alert('Éxito', 'Comisión cobrada correctamente');
          }
        }
      ]
    );
  };

  const handleAbrirConfiguracion = () => {
    setTempConfig(configuracionComisiones);
    setModalConfiguracion(true);
  };

  const handleGuardarConfiguracion = () => {
    Alert.alert(
      'Guardar cambios',
      '¿Confirmar los nuevos porcentajes de comisión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: () => {
            setConfiguracionComisiones(tempConfig);
            setModalConfiguracion(false);
            Alert.alert('Éxito', 'Configuración actualizada');
          }
        }
      ]
    );
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return '#f39c12';
      case 'procesando': return '#3498db';
      case 'cobrado': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  const renderComision = (comision) => (
    <TouchableOpacity
      key={comision.id}
      style={styles.comisionCard}
      onPress={() => handleVerDetalle(comision)}
    >
      <View style={styles.comisionHeader}>
        <View style={[
          styles.tipoIcon,
          { backgroundColor: comision.tipo === 'reserva' ? '#4a90e220' : '#27ae6020' }
        ]}>
          <Ionicons
            name={comision.tipo === 'reserva' ? 'calendar' : 'construct'}
            size={20}
            color={comision.tipo === 'reserva' ? '#4a90e2' : '#27ae60'}
          />
        </View>
        <View style={styles.comisionInfo}>
          <Text style={styles.comisionCliente}>
            {comision.cliente || comision.proveedor}
          </Text>
          <Text style={styles.comisionDescripcion}>{comision.descripcion}</Text>
          <Text style={styles.comisionFecha}>{comision.fecha}</Text>
        </View>
      </View>

      <View style={styles.comisionMontos}>
        <View style={styles.montoItem}>
          <Text style={styles.montoLabel}>Total</Text>
          <Text style={styles.montoValue}>${comision.montoTotal}</Text>
        </View>
        <View style={styles.montoItem}>
          <Text style={styles.montoLabel}>Comisión</Text>
          <Text style={[styles.montoValue, styles.montoComision]}>
            ${comision.comision}
          </Text>
        </View>
      </View>

      <View style={styles.comisionFooter}>
        <View style={[
          styles.estadoBadge,
          { backgroundColor: getEstadoColor(comision.estado) + '20' }
        ]}>
          <Text style={[styles.estadoText, { color: getEstadoColor(comision.estado) }]}>
            {comision.estado.charAt(0).toUpperCase() + comision.estado.slice(1)}
          </Text>
        </View>
        {comision.estado === 'pendiente' && (
          <TouchableOpacity
            style={styles.cobrarButton}
            onPress={() => handleCobrarComision(comision)}
          >
            <Text style={styles.cobrarButtonText}>Cobrar</Text>
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
        <Text style={styles.headerTitle}>Gestión de Comisiones</Text>
        <TouchableOpacity
          onPress={handleAbrirConfiguracion}
          style={styles.configButton}
        >
          <Ionicons name="settings-outline" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenTitle}>Resumen del mes</Text>
          <View style={styles.resumenGrid}>
            <View style={styles.resumenItem}>
              <Ionicons name="time" size={20} color="#f39c12" />
              <Text style={styles.resumenValue}>${resumenFinanciero.pendienteCobro}</Text>
              <Text style={styles.resumenLabel}>Por cobrar</Text>
            </View>
            <View style={styles.resumenItem}>
              <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
              <Text style={styles.resumenValue}>${resumenFinanciero.cobradoMes}</Text>
              <Text style={styles.resumenLabel}>Cobrado</Text>
            </View>
            <View style={styles.resumenItem}>
              <Ionicons name="trending-up" size={20} color="#3498db" />
              <Text style={styles.resumenValue}>${resumenFinanciero.proyeccionMes}</Text>
              <Text style={styles.resumenLabel}>Proyección</Text>
            </View>
          </View>
        </View>

        <View style={styles.configActualCard}>
          <Text style={styles.configTitle}>Comisiones actuales</Text>
          <View style={styles.configGrid}>
            <View style={styles.configItem}>
              <View style={styles.configHeader}>
                <Ionicons name="calendar" size={16} color="#4a90e2" />
                <Text style={styles.configLabel}>Reservas</Text>
              </View>
              <Text style={styles.configValue}>{configuracionComisiones.reservas.porcentaje}%</Text>
            </View>
            <View style={styles.configItem}>
              <View style={styles.configHeader}>
                <Ionicons name="construct" size={16} color="#27ae60" />
                <Text style={styles.configLabel}>Servicios</Text>
              </View>
              <Text style={styles.configValue}>{configuracionComisiones.servicios.porcentaje}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, tabActiva === 'todas' && styles.tabActive]}
            onPress={() => setTabActiva('todas')}
          >
            <Text style={[styles.tabText, tabActiva === 'todas' && styles.tabTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tabActiva === 'reservas' && styles.tabActive]}
            onPress={() => setTabActiva('reservas')}
          >
            <Text style={[styles.tabText, tabActiva === 'reservas' && styles.tabTextActive]}>
              Reservas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tabActiva === 'servicios' && styles.tabActive]}
            onPress={() => setTabActiva('servicios')}
          >
            <Text style={[styles.tabText, tabActiva === 'servicios' && styles.tabTextActive]}>
              Servicios
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.comisionesContainer}>
          <Text style={styles.seccionTitle}>Comisiones recientes</Text>
          {comisionesPorCobrar
            .filter(c => tabActiva === 'todas' || c.tipo === tabActiva.slice(0, -1))
            .map(comision => renderComision(comision))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        visible={modalConfiguracion}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalConfiguracion(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configurar comisiones</Text>
              <TouchableOpacity
                onPress={() => setModalConfiguracion(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSeccion}>
                <Text style={styles.modalSeccionTitle}>Comisiones por Reservas</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Porcentaje (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={tempConfig.reservas?.porcentaje?.toString()}
                    onChangeText={(text) => setTempConfig({
                      ...tempConfig,
                      reservas: { ...tempConfig.reservas, porcentaje: parseFloat(text) || 0 }
                    })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.inputLabel}>Mínimo ($)</Text>
                    <TextInput
                      style={styles.input}
                      value={tempConfig.reservas?.minimo?.toString()}
                      onChangeText={(text) => setTempConfig({
                        ...tempConfig,
                        reservas: { ...tempConfig.reservas, minimo: parseFloat(text) || 0 }
                      })}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                    <Text style={styles.inputLabel}>Máximo ($)</Text>
                    <TextInput
                      style={styles.input}
                      value={tempConfig.reservas?.maximo?.toString()}
                      onChangeText={(text) => setTempConfig({
                        ...tempConfig,
                        reservas: { ...tempConfig.reservas, maximo: parseFloat(text) || 0 }
                      })}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.modalSeccion}>
                <Text style={styles.modalSeccionTitle}>Comisiones por Servicios</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Porcentaje (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={tempConfig.servicios?.porcentaje?.toString()}
                    onChangeText={(text) => setTempConfig({
                      ...tempConfig,
                      servicios: { ...tempConfig.servicios, porcentaje: parseFloat(text) || 0 }
                    })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.inputLabel}>Mínimo ($)</Text>
                    <TextInput
                      style={styles.input}
                      value={tempConfig.servicios?.minimo?.toString()}
                      onChangeText={(text) => setTempConfig({
                        ...tempConfig,
                        servicios: { ...tempConfig.servicios, minimo: parseFloat(text) || 0 }
                      })}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                    <Text style={styles.inputLabel}>Máximo ($)</Text>
                    <TextInput
                      style={styles.input}
                      value={tempConfig.servicios?.maximo?.toString()}
                      onChangeText={(text) => setTempConfig({
                        ...tempConfig,
                        servicios: { ...tempConfig.servicios, maximo: parseFloat(text) || 0 }
                      })}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.modalSeccion}>
                <Text style={styles.modalSeccionTitle}>Precios de Membresías</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Básico ($/mes)</Text>
                  <TextInput
                    style={styles.input}
                    value={tempConfig.membresias?.basico?.toString()}
                    onChangeText={(text) => setTempConfig({
                      ...tempConfig,
                      membresias: { ...tempConfig.membresias, basico: parseFloat(text) || 0 }
                    })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Premium ($/mes)</Text>
                  <TextInput
                    style={styles.input}
                    value={tempConfig.membresias?.premium?.toString()}
                    onChangeText={(text) => setTempConfig({
                      ...tempConfig,
                      membresias: { ...tempConfig.membresias, premium: parseFloat(text) || 0 }
                    })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Empresarial ($/mes)</Text>
                  <TextInput
                    style={styles.input}
                    value={tempConfig.membresias?.empresarial?.toString()}
                    onChangeText={(text) => setTempConfig({
                      ...tempConfig,
                      membresias: { ...tempConfig.membresias, empresarial: parseFloat(text) || 0 }
                    })}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalConfiguracion(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleGuardarConfiguracion}
              >
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalDetalle}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalDetalle(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle de comisión</Text>
              <TouchableOpacity
                onPress={() => setModalDetalle(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            {comisionSeleccionada && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.detalleSeccion}>
                  <Text style={styles.detalleLabel}>Tipo</Text>
                  <Text style={styles.detalleValue}>
                    {comisionSeleccionada.tipo.charAt(0).toUpperCase() + comisionSeleccionada.tipo.slice(1)}
                  </Text>
                </View>

                <View style={styles.detalleSeccion}>
                  <Text style={styles.detalleLabel}>
                    {comisionSeleccionada.cliente ? 'Cliente' : 'Proveedor'}
                  </Text>
                  <Text style={styles.detalleValue}>
                    {comisionSeleccionada.cliente || comisionSeleccionada.proveedor}
                  </Text>
                </View>

                <View style={styles.detalleSeccion}>
                  <Text style={styles.detalleLabel}>Descripción</Text>
                  <Text style={styles.detalleValue}>
                    {comisionSeleccionada.descripcion}
                  </Text>
                </View>

                <View style={styles.detalleSeccion}>
                  <Text style={styles.detalleLabel}>Fecha</Text>
                  <Text style={styles.detalleValue}>
                    {comisionSeleccionada.fecha}
                  </Text>
                </View>

                <View style={styles.detalleMontos}>
                  <View style={styles.detalleMontoItem}>
                    <Text style={styles.detalleMontoLabel}>Monto total</Text>
                    <Text style={styles.detalleMontoValue}>
                      ${comisionSeleccionada.montoTotal}
                    </Text>
                  </View>
                  <View style={styles.detalleMontoItem}>
                    <Text style={styles.detalleMontoLabel}>Porcentaje</Text>
                    <Text style={styles.detalleMontoValue}>
                      {comisionSeleccionada.tipo === 'reserva'
                        ? configuracionComisiones.reservas.porcentaje
                        : configuracionComisiones.servicios.porcentaje}%
                    </Text>
                  </View>
                  <View style={[styles.detalleMontoItem, styles.detalleMontoTotal]}>
                    <Text style={styles.detalleMontoLabelTotal}>Comisión</Text>
                    <Text style={styles.detalleMontoValueTotal}>
                      ${comisionSeleccionada.comision}
                    </Text>
                  </View>
                </View>

                {comisionSeleccionada.estado === 'pendiente' && (
                  <TouchableOpacity
                    style={styles.cobrarButtonModal}
                    onPress={() => {
                      setModalDetalle(false);
                      handleCobrarComision(comisionSeleccionada);
                    }}
                  >
                    <Ionicons name="cash" size={20} color="#fff" />
                    <Text style={styles.cobrarButtonModalText}>Cobrar ahora</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
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
  configButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  resumenCard: {
    backgroundColor: '#2c3e50',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
  },
  resumenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  resumenGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resumenItem: {
    flex: 1,
    alignItems: 'center',
  },
  resumenValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8,
  },
  resumenLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  configActualCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  configGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  configItem: {
    alignItems: 'center',
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  configLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  configValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4a90e2',
  },
  tabText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#4a90e2',
  },
  comisionesContainer: {
    paddingHorizontal: 20,
  },
  seccionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  comisionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  comisionHeader: {
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
  comisionInfo: {
    flex: 1,
  },
  comisionCliente: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  comisionDescripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  comisionFecha: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  comisionMontos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f3f4',
  },
  montoItem: {
    alignItems: 'center',
  },
  montoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  montoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  montoComision: {
    color: '#27ae60',
  },
  comisionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  cobrarButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cobrarButtonText: {
    color: '#fff',
    fontSize: 14,
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
    marginBottom: 24,
  },
  modalSeccionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    color: '#2c3e50',
  },
  inputRow: {
    flexDirection: 'row',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  detalleSeccion: {
    marginBottom: 16,
  },
  detalleLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  detalleValue: {
    fontSize: 16,
    color: '#2c3e50',
  },
  detalleMontos: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  detalleMontoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detalleMontoTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  detalleMontoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  detalleMontoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  detalleMontoLabelTotal: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  detalleMontoValueTotal: {
    fontSize: 20,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  cobrarButtonModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  cobrarButtonModalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ComisionesAdmin;