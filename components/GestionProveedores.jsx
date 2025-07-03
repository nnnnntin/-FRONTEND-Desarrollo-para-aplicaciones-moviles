import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import {
  actualizarProveedor,
  filtrarProveedores,
  obtenerProveedores
} from '../store/slices/proveedoresSlice';

const GestionProveedores = ({ navigation }) => {
  const dispatch = useDispatch();
  const { proveedores, loading } = useSelector(state => state.proveedores);

  const [tabActiva, setTabActiva] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modalDetalles, setModalDetalles] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  useEffect(() => {
    cargarProveedores();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [tabActiva, busqueda]);

  const cargarProveedores = async () => {
    try {
      await dispatch(obtenerProveedores(0, 100));
    } catch (error) {
      console.error(error);
    }
  };

  const aplicarFiltros = async () => {
    try {
      const filtros = {};

      if (tabActiva !== 'todos') {
        if (tabActiva === 'activos') filtros.activo = true;
        if (tabActiva === 'pendientes') filtros.verificado = false;
        if (tabActiva === 'suspendidos') filtros.activo = false;
      }

      if (busqueda.trim()) {
        filtros.busqueda = busqueda.trim();
      }

      await dispatch(filtrarProveedores(filtros));
    } catch (error) {
      console.error(error);
    }
  };

  const getProveedoresFiltrados = () => {
    if (!proveedores) return [];

    let filtrados = proveedores;

    if (tabActiva !== 'todos') {
      filtrados = filtrados.filter(p => {
        if (tabActiva === 'activos') return p.activo === true && p.verificado === true;
        if (tabActiva === 'pendientes') return p.verificado === false;
        if (tabActiva === 'suspendidos') return p.activo === false;
        return true;
      });
    }

    if (busqueda) {
      filtrados = filtrados.filter(p =>
        p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.empresa?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.servicios?.some(s => s.nombre?.toLowerCase().includes(busqueda.toLowerCase()))
      );
    }

    return filtrados;
  };

  const getEstadisticas = () => {
    if (!proveedores) return { total: 0, activos: 0, pendientes: 0, suspendidos: 0, serviciosTotales: 0, gananciasTotales: 0, comisionesTotales: 0 };

    const total = proveedores.length;
    const activos = proveedores.filter(p => p.activo === true && p.verificado === true).length;
    const pendientes = proveedores.filter(p => p.verificado === false).length;
    const suspendidos = proveedores.filter(p => p.activo === false).length;
    const serviciosTotales = proveedores.reduce((sum, p) => sum + (p.trabajosCompletados || 0), 0);
    const gananciasTotales = proveedores.reduce((sum, p) => sum + (p.gananciasGeneradas || 0), 0);
    const comisionesTotales = proveedores.reduce((sum, p) => sum + (p.comisionesPagadas || 0), 0);

    return { total, activos, pendientes, suspendidos, serviciosTotales, gananciasTotales, comisionesTotales };
  };

  const getEstadoInfo = (proveedor) => {
    if (!proveedor.verificado) return { color: '#f39c12', icono: 'time', texto: 'pendiente' };
    if (!proveedor.activo) return { color: '#e74c3c', icono: 'close-circle', texto: 'suspendido' };
    return { color: '#27ae60', icono: 'checkmark-circle', texto: 'activo' };
  };

  const handleVerDetalles = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModalDetalles(true);
  };

const handleCambiarEstado = (proveedor, nuevoEstado) => {
  const body = {};

  if (nuevoEstado === 'activo') {
    body.activo = true;
    body.verificado = true;
  } else if (nuevoEstado === 'pendiente') {
    body.verificado = false;
  } else if (nuevoEstado === 'suspendido') {
    body.activo = false;
  }

  Alert.alert(
    'Cambiar estado',
    `¿Cambiar el estado de ${proveedor.empresa || proveedor.nombre} a ${nuevoEstado}?`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            await dispatch(
              actualizarProveedor({ id: proveedor._id, datos: body })
            ).unwrap();        // ← lanza si hay error

            Alert.alert('Éxito', 'Estado actualizado');
            setModalDetalles(false);
            // ya no hace falta recargar, el slice se actualiza solo (ver punto 3)
          } catch (err) {
            console.error(err);
            Alert.alert('Error', err || 'No se pudo actualizar');
          }
        },
      },
    ]
  );
};


  const handleVerDocumentos = (proveedor) => {
    setModalDetalles(false);
    Alert.alert('Documentos', 'Funcionalidad de ver documentos en desarrollo');
  };

  const handleContactar = (proveedor) => {
    Alert.alert(
      'Contactar proveedor',
      `¿Cómo deseas contactar a ${proveedor.nombre}?`,
      [
        { text: 'Email', onPress: () => console.log('Abrir email') },
        { text: 'Teléfono', onPress: () => console.log('Llamar') },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const renderServicio = (servicio) => (
    <View key={servicio._id || servicio.nombre} style={styles.servicioChip}>
      <Text style={styles.servicioText}>{servicio.nombre}</Text>
    </View>
  );

  const renderProveedor = ({ item }) => {
    const estadoInfo = getEstadoInfo(item);

    return (
      <TouchableOpacity
        style={styles.proveedorCard}
        onPress={() => handleVerDetalles(item)}
      >
        <View style={styles.proveedorHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {(item.empresa || item.nombre || 'PR').split(' ').map(w => w[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <View style={styles.proveedorInfo}>
            <Text style={styles.proveedorNombre}>{item.nombre || 'Sin nombre'}</Text>
            <Text style={styles.proveedorEmpresa}>{item.empresa || 'Sin empresa'}</Text>
            <Text style={styles.proveedorEmail}>{item.email || 'Sin email'}</Text>
          </View>
          <View style={[styles.estadoIcon, { backgroundColor: estadoInfo.color + '20' }]}>
            <Ionicons name={estadoInfo.icono} size={24} color={estadoInfo.color} />
          </View>
        </View>

        <View style={styles.serviciosContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(item.servicios || []).slice(0, 3).map(servicio => renderServicio(servicio))}
            {(item.servicios || []).length > 3 && (
              <View style={styles.servicioChip}>
                <Text style={styles.servicioText}>+{item.servicios.length - 3} más</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.proveedorStats}>
          {estadoInfo.texto === 'activo' && (
            <>
              <View style={styles.statItem}>
                <Ionicons name="star" size={16} color="#f39c12" />
                <Text style={styles.statText}>{item.calificacion || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="construct" size={16} color="#4a90e2" />
                <Text style={styles.statText}>{item.trabajosCompletados || 0} servicios</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="cash" size={16} color="#27ae60" />
                <Text style={styles.statText}>${item.gananciasGeneradas || 0}</Text>
              </View>
            </>
          )}
          {estadoInfo.texto === 'pendiente' && (
            <View style={styles.alertaBadge}>
              <Ionicons name="alert-circle" size={16} color="#f39c12" />
              <Text style={styles.alertaText}>
                Documentos pendientes de verificación
              </Text>
            </View>
          )}
          {estadoInfo.texto === 'suspendido' && (
            <View style={styles.alertaBadge}>
              <Ionicons name="warning" size={16} color="#e74c3c" />
              <Text style={styles.alertaText}>Cuenta suspendida</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const estadisticas = getEstadisticas();
  const proveedoresFiltrados = getProveedoresFiltrados();

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
        <Text style={styles.headerTitle}>Gestión de Proveedores</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, empresa o servicio..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <View style={styles.estadisticasCard}>
        <View style={styles.estatItem}>
          <Text style={styles.estatNumero}>{estadisticas.total}</Text>
          <Text style={styles.estatLabel}>Total</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={[styles.estatNumero, { color: '#27ae60' }]}>
            {estadisticas.activos}
          </Text>
          <Text style={styles.estatLabel}>Activos</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={[styles.estatNumero, { color: '#f39c12' }]}>
            {estadisticas.pendientes}
          </Text>
          <Text style={styles.estatLabel}>Pendientes</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={[styles.estatNumero, { color: '#4a90e2' }]}>
            {estadisticas.serviciosTotales}
          </Text>
          <Text style={styles.estatLabel}>Servicios</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {['todos', 'activos', 'pendientes', 'suspendidos'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, tabActiva === tab && styles.tabActive]}
            onPress={() => setTabActiva(tab)}
          >
            <Text style={[styles.tabText, tabActiva === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando proveedores...</Text>
        </View>
      ) : (
        <FlatList
          data={proveedoresFiltrados}
          renderItem={renderProveedor}
          keyExtractor={(item) => item._id?.toString()}
          style={styles.lista}
          contentContainerStyle={styles.listaContent}
          refreshing={loading}
          onRefresh={cargarProveedores}
        />
      )}

      <Modal
        visible={modalDetalles}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalDetalles(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles del proveedor</Text>
              <TouchableOpacity
                onPress={() => setModalDetalles(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            {proveedorSeleccionado && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.modalProveedorHeader}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>
                      {(proveedorSeleccionado.empresa || proveedorSeleccionado.nombre || 'PR').split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </Text>
                  </View>
                  <View style={styles.modalProveedorInfo}>
                    <Text style={styles.modalProveedorNombre}>{proveedorSeleccionado.nombre}</Text>
                    <Text style={styles.modalProveedorEmpresa}>{proveedorSeleccionado.empresa}</Text>
                    <View style={[
                      styles.modalEstadoBadge,
                      { backgroundColor: getEstadoInfo(proveedorSeleccionado).color + '20' }
                    ]}>
                      <Ionicons
                        name={getEstadoInfo(proveedorSeleccionado).icono}
                        size={16}
                        color={getEstadoInfo(proveedorSeleccionado).color}
                      />
                      <Text style={[
                        styles.modalEstadoText,
                        { color: getEstadoInfo(proveedorSeleccionado).color }
                      ]}>
                        {getEstadoInfo(proveedorSeleccionado).texto.charAt(0).toUpperCase() + getEstadoInfo(proveedorSeleccionado).texto.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Información de contacto</Text>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="mail" size={16} color="#4a90e2" />
                    <Text style={styles.modalInfoValue}>{proveedorSeleccionado.email}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="call" size={16} color="#4a90e2" />
                    <Text style={styles.modalInfoValue}>{proveedorSeleccionado.contacto.telefono || 'No especificado'}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="calendar" size={16} color="#4a90e2" />
                    <Text style={styles.modalInfoValue}>
                      Registrado el {proveedorSeleccionado.createdAt
                                      ? new Date(proveedorSeleccionado.createdAt).toLocaleString('es-UY', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })
                                      : 'Fecha no disponible'}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Servicios ofrecidos</Text>
                  <View style={styles.modalServiciosGrid}>
                    {(proveedorSeleccionado.servicios || []).map((servicio, index) => (
                      <View key={index} style={styles.modalServicioChip}>
                        <Text style={styles.modalServicioText}>{servicio.nombre}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {getEstadoInfo(proveedorSeleccionado).texto === 'activo' && (
                  <View style={styles.modalSeccion}>
                    <Text style={styles.modalSeccionTitle}>Estadísticas</Text>
                    <View style={styles.modalEstadisticas}>
                      <View style={styles.modalEstatItem}>
                        <Ionicons name="star" size={20} color="#f39c12" />
                        <Text style={styles.modalEstatValor}>{proveedorSeleccionado.calificacion || 0}</Text>
                        <Text style={styles.modalEstatLabel}>Calificación</Text>
                      </View>
                      <View style={styles.modalEstatItem}>
                        <Ionicons name="construct" size={20} color="#4a90e2" />
                        <Text style={styles.modalEstatValor}>{proveedorSeleccionado.trabajosCompletados || 0}</Text>
                        <Text style={styles.modalEstatLabel}>Servicios</Text>
                      </View>
                      <View style={styles.modalEstatItem}>
                        <Ionicons name="cash" size={20} color="#27ae60" />
                        <Text style={styles.modalEstatValor}>${proveedorSeleccionado.gananciasGeneradas || 0}</Text>
                        <Text style={styles.modalEstatLabel}>Ganancias</Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.modalAcciones}>
                  {getEstadoInfo(proveedorSeleccionado).texto === 'pendiente' && (
                    <TouchableOpacity
                      style={[styles.modalBoton, styles.botonAprobar]}
                      onPress={() => handleCambiarEstado(proveedorSeleccionado, 'activo')}
                    >
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={styles.modalBotonText}>Aprobar</Text>
                    </TouchableOpacity>
                  )}

                  {getEstadoInfo(proveedorSeleccionado).texto === 'activo' && (
                    <TouchableOpacity
                      style={[styles.modalBoton, styles.botonSuspender]}
                      onPress={() => handleCambiarEstado(proveedorSeleccionado, 'suspendido')}
                    >
                      <Ionicons name="pause" size={16} color="#fff" />
                      <Text style={styles.modalBotonText}>Suspender</Text>
                    </TouchableOpacity>
                  )}

                  {getEstadoInfo(proveedorSeleccionado).texto === 'suspendido' && (
                    <TouchableOpacity
                      style={[styles.modalBoton, styles.botonActivar]}
                      onPress={() => handleCambiarEstado(proveedorSeleccionado, 'activo')}
                    >
                      <Ionicons name="play" size={16} color="#fff" />
                      <Text style={styles.modalBotonText}>Activar</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.modalBoton, styles.botonContactar]}
                    onPress={() => handleContactar(proveedorSeleccionado)}
                  >
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.modalBotonText}>Contactar</Text>
                  </TouchableOpacity>
                </View>
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
  addButton: {
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
  estadisticasCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  estatItem: {
    alignItems: 'center',
    flex: 1,
  },
  estatNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  estatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  estadisticasFinancieras: {
    backgroundColor: '#2c3e50',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  financieraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  financieraLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  financieraValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
  proveedorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  proveedorHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  proveedorInfo: {
    flex: 1,
  },
  proveedorNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  proveedorEmpresa: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 2,
  },
  proveedorEmail: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  estadoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviciosContainer: {
    marginBottom: 12,
  },
  servicioChip: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  servicioText: {
    fontSize: 12,
    color: '#4a90e2',
  },
  proveedorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#5a6c7d',
  },
  alertaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbf0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  alertaText: {
    fontSize: 12,
    color: '#f39c12',
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
    maxHeight: '90%',
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
  modalProveedorHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalProveedorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  modalProveedorNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  modalProveedorEmpresa: {
    fontSize: 16,
    color: '#4a90e2',
    marginBottom: 8,
  },
  modalEstadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  modalEstadoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalSeccion: {
    marginBottom: 20,
  },
  modalSeccionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#2c3e50',
  },
  modalServiciosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalServicioChip: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalServicioText: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '500',
  },
  modalZonasContainer: {
    gap: 8,
  },
  modalZonaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalZonaText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  modalEstadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  modalEstatItem: {
    alignItems: 'center',
  },
  modalEstatValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginVertical: 4,
  },
  modalEstatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalDocumentoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalDocumentoText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  modalAlerta: {
    flexDirection: 'row',
    backgroundColor: '#fffbf0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  modalAlertaContent: {
    flex: 1,
  },
  modalAlertaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f39c12',
    marginBottom: 4,
  },
  modalAlertaText: {
    fontSize: 12,
    color: '#f39c12',
  },
  modalAcciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  modalBoton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  botonAprobar: {
    backgroundColor: '#27ae60',
  },
  botonSuspender: {
    backgroundColor: '#f39c12',
  },
  botonActivar: {
    backgroundColor: '#27ae60',
  },
  botonDocumentos: {
    backgroundColor: '#3498db',
  },
  botonContactar: {
    backgroundColor: '#4a90e2',
  },
  modalBotonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default GestionProveedores;