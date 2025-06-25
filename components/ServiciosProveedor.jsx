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
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  actualizarServicioAdicional,
  eliminarServicioAdicional,
  obtenerServiciosPorProveedor,
  toggleServicioAdicional
} from '../store/slices/proveedoresSlice';

const ServiciosProveedor = ({ navigation }) => {
  const dispatch = useDispatch();
  const { datosUsuario } = useSelector(state => state.usuario);
  const { serviciosProveedor, loading } = useSelector(state => state.proveedores);

  const [tabActiva, setTabActiva] = useState('activos');
  const [modalVisible, setModalVisible] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({});

  const categorias = {
    'limpieza': { color: '#3498db', icono: 'sparkles' },
    'tecnologia': { color: '#9b59b6', icono: 'laptop' },
    'seguridad': { color: '#e67e22', icono: 'shield-checkmark' },
    'catering': { color: '#e74c3c', icono: 'restaurant' },
    'mantenimiento': { color: '#95a5a6', icono: 'construct' },
    'eventos': { color: '#f39c12', icono: 'calendar' }
  };

  useEffect(() => {
    if (datosUsuario?._id) {
      cargarServicios();
    }
  }, [datosUsuario]);

  const cargarServicios = async () => {
    try {
      await dispatch(obtenerServiciosPorProveedor(datosUsuario._id));
    } catch (error) {
      console.error('Error cargando servicios:', error);
    }
  };

  const handleEditarServicio = (servicio) => {
    setServicioSeleccionado(servicio);
    setFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: servicio.precio?.toString(),
      duracionEstimada: servicio.duracionEstimada
    });
    setModoEdicion(true);
    setModalVisible(true);
  };

  const handleVerDetalles = (servicio) => {
    setServicioSeleccionado(servicio);
    setModoEdicion(false);
    setModalVisible(true);
  };

  const handleToggleEstado = async (servicioId, estadoActual) => {
    try {
      const nuevoEstado = estadoActual === 'activo' ? false : true;
      const result = await dispatch(toggleServicioAdicional(servicioId, nuevoEstado));
      
      if (result.success) {
        await cargarServicios(); 
      } else {
        Alert.alert('Error', 'No se pudo cambiar el estado del servicio');
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
      Alert.alert('Error', 'Ocurrió un error al cambiar el estado');
    }
  };

  const handleEliminarServicio = (servicioId) => {
    Alert.alert(
      'Eliminar servicio',
      '¿Estás seguro de que quieres eliminar este servicio? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await dispatch(eliminarServicioAdicional(servicioId));
              if (result.success) {
                await cargarServicios();
              } else {
                Alert.alert('Error', 'No se pudo eliminar el servicio');
              }
            } catch (error) {
              console.error('Error eliminando servicio:', error);
              Alert.alert('Error', 'Ocurrió un error al eliminar el servicio');
            }
          }
        }
      ]
    );
  };

  const handleGuardarEdicion = async () => {
    if (!formData.nombre?.trim() || !formData.precio?.trim()) {
      Alert.alert('Error', 'Nombre y precio son obligatorios');
      return;
    }

    try {
      const servicioActualizado = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        duracionEstimada: formData.duracionEstimada
      };

      const result = await dispatch(actualizarServicioAdicional(servicioSeleccionado._id, servicioActualizado));
      
      if (result.success) {
        setModalVisible(false);
        await cargarServicios();
        Alert.alert('Éxito', 'Servicio actualizado correctamente');
      } else {
        Alert.alert('Error', result.error || 'No se pudo actualizar el servicio');
      }
    } catch (error) {
      console.error('Error actualizando servicio:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar el servicio');
    }
  };

  const getServiciosFiltrados = () => {
    if (!serviciosProveedor) return [];
    
    switch (tabActiva) {
      case 'activos':
        return serviciosProveedor.filter(s => s.activo === true);
      case 'pausados':
        return serviciosProveedor.filter(s => s.activo === false);
      case 'todos':
      default:
        return serviciosProveedor;
    }
  };

  const getEstadisticas = () => {
    if (!serviciosProveedor) return { activos: 0, pausados: 0, totalTrabajos: 0, totalSolicitudes: 0 };
    
    const activos = serviciosProveedor.filter(s => s.activo === true).length;
    const pausados = serviciosProveedor.filter(s => s.activo === false).length;
    const totalTrabajos = serviciosProveedor.reduce((sum, s) => sum + (s.trabajosCompletados || 0), 0);
    const totalSolicitudes = serviciosProveedor.reduce((sum, s) => sum + (s.solicitudesPendientes || 0), 0);

    return { activos, pausados, totalTrabajos, totalSolicitudes };
  };

  const estadisticas = getEstadisticas();
  const serviciosFiltrados = getServiciosFiltrados();

  const renderServicio = ({ item: servicio }) => {
    const categoria = categorias[servicio.tipo] || { color: '#7f8c8d', icono: 'ellipse' };

    return (
      <View style={[
        styles.servicioCard,
        !servicio.activo && styles.servicioCardPausado
      ]}>
        <View style={styles.servicioHeader}>
          <View style={[styles.categoriaIcon, { backgroundColor: categoria.color }]}>
            <Ionicons name={categoria.icono} size={20} color="#fff" />
          </View>
          <View style={styles.servicioInfo}>
            <Text style={[
              styles.servicioNombre,
              !servicio.activo && styles.textoPausado
            ]}>
              {servicio.nombre}
            </Text>
            <Text style={styles.servicioCategoria}>{servicio.tipo}</Text>
          </View>
          <View style={styles.servicioEstado}>
            <View style={[
              styles.estadoBadge,
              { backgroundColor: servicio.activo ? '#27ae60' : '#f39c12' }
            ]}>
              <Text style={styles.estadoText}>
                {servicio.activo ? 'Activo' : 'Pausado'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[
          styles.servicioDescripcion,
          !servicio.activo && styles.textoPausado
        ]}>
          {servicio.descripcion}
        </Text>

        <View style={styles.servicioStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#f39c12" />
            <Text style={styles.statText}>{servicio.calificacion || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-done" size={16} color="#27ae60" />
            <Text style={styles.statText}>{servicio.trabajosCompletados || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={16} color="#4a90e2" />
            <Text style={styles.statText}>{servicio.trabajosPendientes || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="mail" size={16} color="#9b59b6" />
            <Text style={styles.statText}>{servicio.solicitudesPendientes || 0}</Text>
          </View>
        </View>

        <View style={styles.servicioDetalles}>
          <View style={styles.detalleItem}>
            <Ionicons name="pricetag" size={16} color="#27ae60" />
            <Text style={styles.detalleText}>${servicio.precio}</Text>
          </View>
          <View style={styles.detalleItem}>
            <Ionicons name="clock" size={16} color="#7f8c8d" />
            <Text style={styles.detalleText}>{servicio.duracionEstimada}</Text>
          </View>
        </View>

        <View style={styles.servicioActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleVerDetalles(servicio)}
          >
            <Ionicons name="eye-outline" size={16} color="#4a90e2" />
            <Text style={styles.actionButtonText}>Ver</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditarServicio(servicio)}
          >
            <Ionicons name="create-outline" size={16} color="#4a90e2" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.toggleButton]}
            onPress={() => handleToggleEstado(servicio._id, servicio.activo ? 'activo' : 'pausado')}
          >
            <Ionicons
              name={servicio.activo ? 'pause' : 'play'}
              size={16}
              color={servicio.activo ? '#f39c12' : '#27ae60'}
            />
            <Text style={[
              styles.actionButtonText,
              { color: servicio.activo ? '#f39c12' : '#27ae60' }
            ]}>
              {servicio.activo ? 'Pausar' : 'Activar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleEliminarServicio(servicio._id)}
          >
            <Ionicons name="trash-outline" size={16} color="#e74c3c" />
            <Text style={[styles.actionButtonText, { color: '#e74c3c' }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Mis servicios</Text>
      </View>

      <View style={styles.proveedorInfo}>
        <View style={styles.proveedorAvatar}>
          <Ionicons name="person" size={24} color="#fff" />
        </View>
        <View style={styles.proveedorDetails}>
          <Text style={styles.proveedorNombre}>{datosUsuario?.nombre || 'Tu nombre'}</Text>
          <Text style={styles.proveedorTipo}>Proveedor de servicios</Text>
        </View>
      </View>

      <View style={styles.estadisticasContainer}>
        <View style={styles.estadisticaItem}>
          <Text style={styles.estadisticaNumero}>{estadisticas.activos}</Text>
          <Text style={styles.estadisticaLabel}>Servicios activos</Text>
        </View>
        <View style={styles.estadisticaItem}>
          <Text style={styles.estadisticaNumero}>{estadisticas.totalTrabajos}</Text>
          <Text style={styles.estadisticaLabel}>Trabajos completados</Text>
        </View>
        <View style={styles.estadisticaItem}>
          <Text style={styles.estadisticaNumero}>{estadisticas.totalSolicitudes}</Text>
          <Text style={styles.estadisticaLabel}>Solicitudes pendientes</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, tabActiva === 'todos' && styles.tabActive]}
          onPress={() => setTabActiva('todos')}
        >
          <Text style={[styles.tabText, tabActiva === 'todos' && styles.tabTextActive]}>
            Todos ({serviciosProveedor?.length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tabActiva === 'activos' && styles.tabActive]}
          onPress={() => setTabActiva('activos')}
        >
          <Text style={[styles.tabText, tabActiva === 'activos' && styles.tabTextActive]}>
            Activos ({estadisticas.activos})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tabActiva === 'pausados' && styles.tabActive]}
          onPress={() => setTabActiva('pausados')}
        >
          <Text style={[styles.tabText, tabActiva === 'pausados' && styles.tabTextActive]}>
            Pausados ({estadisticas.pausados})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando servicios...</Text>
        </View>
      ) : serviciosFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>
            {tabActiva === 'activos' ? 'No tienes servicios activos' :
              tabActiva === 'pausados' ? 'No tienes servicios pausados' :
                'No tienes servicios creados'}
          </Text>
          <Text style={styles.emptySubtext}>
            {tabActiva === 'todos'
              ? 'Crea tu primer servicio para empezar a recibir solicitudes'
              : 'Los servicios aparecerán aquí según su estado'}
          </Text>
          {tabActiva === 'todos' && (
            <TouchableOpacity
              style={styles.crearButton}
              onPress={() => navigation.navigate('CrearServicio')}
            >
              <Text style={styles.crearButtonText}>Crear servicio</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={serviciosFiltrados}
          keyExtractor={(item) => item._id?.toString()}
          renderItem={renderServicio}
          style={styles.lista}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaContent}
          refreshing={loading}
          onRefresh={cargarServicios}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modoEdicion ? 'Editar servicio' : 'Detalles del servicio'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {servicioSeleccionado && (
                <>
                  {modoEdicion ? (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Nombre del servicio</Text>
                        <TextInput
                          style={styles.input}
                          value={formData.nombre}
                          onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Descripción</Text>
                        <TextInput
                          style={styles.textArea}
                          value={formData.descripcion}
                          onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                          multiline
                          numberOfLines={4}
                        />
                      </View>

                      <View style={styles.rowInputs}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                          <Text style={styles.inputLabel}>Precio (USD)</Text>
                          <TextInput
                            style={styles.input}
                            value={formData.precio}
                            onChangeText={(text) => setFormData({ ...formData, precio: text })}
                            keyboardType="numeric"
                          />
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                          <Text style={styles.inputLabel}>Duración</Text>
                          <TextInput
                            style={styles.input}
                            value={formData.duracionEstimada}
                            onChangeText={(text) => setFormData({ ...formData, duracionEstimada: text })}
                          />
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.servicioModalHeader}>
                        <View style={styles.servicioModalInfo}>
                          <Text style={styles.servicioModalNombre}>{servicioSeleccionado.nombre}</Text>
                          <Text style={styles.servicioModalCategoria}>{servicioSeleccionado.tipo}</Text>
                          <View style={styles.servicioModalRating}>
                            <Ionicons name="star" size={16} color="#f39c12" />
                            <Text style={styles.ratingText}>{servicioSeleccionado.calificacion || 0}</Text>
                            <Text style={styles.trabajosText}>({servicioSeleccionado.trabajosCompletados || 0} trabajos)</Text>
                          </View>
                        </View>
                        <View style={styles.servicioModalPrecio}>
                          <Text style={styles.precioText}>${servicioSeleccionado.precio}</Text>
                          <Text style={styles.duracionText}>{servicioSeleccionado.duracionEstimada}</Text>
                        </View>
                      </View>

                      <Text style={styles.descripcionModal}>{servicioSeleccionado.descripcion}</Text>

                      <View style={styles.estadisticasModal}>
                        <View style={styles.statModalItem}>
                          <Ionicons name="time" size={20} color="#4a90e2" />
                          <Text style={styles.statModalNumber}>{servicioSeleccionado.trabajosPendientes || 0}</Text>
                          <Text style={styles.statModalLabel}>Pendientes</Text>
                        </View>
                        <View style={styles.statModalItem}>
                          <Ionicons name="mail" size={20} color="#9b59b6" />
                          <Text style={styles.statModalNumber}>{servicioSeleccionado.solicitudesPendientes || 0}</Text>
                          <Text style={styles.statModalLabel}>Solicitudes</Text>
                        </View>
                        <View style={styles.statModalItem}>
                          <Ionicons name="checkmark-done" size={20} color="#27ae60" />
                          <Text style={styles.statModalNumber}>{servicioSeleccionado.trabajosCompletados || 0}</Text>
                          <Text style={styles.statModalLabel}>Completados</Text>
                        </View>
                      </View>

                      {servicioSeleccionado.certificaciones && servicioSeleccionado.certificaciones.length > 0 && (
                        <View style={styles.certificacionesModal}>
                          <Text style={styles.certificacionesTitle}>Certificaciones</Text>
                          {servicioSeleccionado.certificaciones.map((cert, index) => (
                            <View key={index} style={styles.certificacionItem}>
                              <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                              <Text style={styles.certificacionText}>{cert}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </>
                  )}
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              {modoEdicion ? (
                <>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleGuardarEdicion}
                  >
                    <Text style={styles.saveButtonText}>Guardar cambios</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.editModalButton}
                  onPress={() => setModoEdicion(true)}
                >
                  <Ionicons name="create-outline" size={16} color="#fff" />
                  <Text style={styles.editModalButtonText}>Editar servicio</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => navigation.navigate('CrearServicio')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
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
  proveedorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  proveedorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  proveedorDetails: {
    flex: 1,
  },
  proveedorNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  proveedorTipo: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  estadisticasContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  estadisticaItem: {
    flex: 1,
    alignItems: 'center',
  },
  estadisticaNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  estadisticaLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4a90e2',
  },
  tabText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#4a90e2',
  },
  lista: {
    flex: 1,
  },
  listaContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  servicioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  servicioCardPausado: {
    opacity: 0.7,
  },
  servicioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoriaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  servicioInfo: {
    flex: 1,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  servicioCategoria: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  servicioEstado: {
    alignItems: 'flex-end',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  textoPausado: {
    color: '#bdc3c7',
  },
  servicioDescripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 16,
  },
  servicioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  servicioDetalles: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  detalleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detalleText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  servicioActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a90e2',
  },
  toggleButton: {
    backgroundColor: '#fef5f5',
  },
  deleteButton: {
    backgroundColor: '#fef5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  crearButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  crearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
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
  textArea: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    color: '#2c3e50',
    height: 100,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  servicioModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  servicioModalInfo: {
    flex: 1,
  },
  servicioModalNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  servicioModalCategoria: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
    marginBottom: 8,
  },
  servicioModalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  trabajosText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  servicioModalPrecio: {
    alignItems: 'flex-end',
  },
  precioText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  duracionText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  descripcionModal: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 20,
  },
  estadisticasModal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statModalItem: {
    alignItems: 'center',
    gap: 4,
  },
  statModalNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statModalLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  certificacionesModal: {
    marginBottom: 20,
  },
  certificacionesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  certificacionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  certificacionText: {
    fontSize: 14,
    color: '#2c3e50',
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
    backgroundColor: '#27ae60',
    alignItems: 'center',
  },
  editModalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4a90e2',
    gap: 8,
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
  editModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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

export default ServiciosProveedor;