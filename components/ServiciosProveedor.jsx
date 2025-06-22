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
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

const ServiciosProveedor = ({ navigation }) => {
  const { datosUsuario } = useSelector(state => state.usuario);

  const [tabActiva, setTabActiva] = useState('activos');
  const [modalVisible, setModalVisible] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({});

  const [misServicios, setMisServicios] = useState([
    {
      id: 1,
      nombre: 'Limpieza profunda de oficinas',
      categoria: 'Limpieza',
      descripcion: 'Servicio completo de limpieza para espacios de trabajo, incluyendo desinfección y mantenimiento de superficies.',
      precio: 120,
      duracion: '2-3 horas',
      estado: 'activo',
      calificacion: 4.8,
      trabajosCompletados: 45,
      trabajosPendientes: 3,
      solicitudesPendientes: 7,
      disponibilidad: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
      certificaciones: ['ISO 14001', 'Higiene Industrial'],
      fechaCreacion: '2024-01-15',
      ultimaActualizacion: '2024-12-01'
    },
    {
      id: 2,
      nombre: 'Mantenimiento de equipos audiovisuales',
      categoria: 'Tecnología',
      descripcion: 'Revisión, mantenimiento y reparación de equipos de audio, video y proyección para espacios corporativos.',
      precio: 150,
      duracion: '1-2 horas',
      estado: 'activo',
      calificacion: 4.9,
      trabajosCompletados: 32,
      trabajosPendientes: 1,
      solicitudesPendientes: 4,
      disponibilidad: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
      certificaciones: ['CompTIA A+', 'Cisco CCNA'],
      fechaCreacion: '2024-02-20',
      ultimaActualizacion: '2024-11-15'
    },
    {
      id: 3,
      nombre: 'Seguridad para eventos corporativos',
      categoria: 'Seguridad',
      descripcion: 'Personal de seguridad especializado para eventos empresariales y reuniones de alta importancia.',
      precio: 200,
      duracion: 'Por evento',
      estado: 'pausado',
      calificacion: 4.7,
      trabajosCompletados: 28,
      trabajosPendientes: 0,
      solicitudesPendientes: 2,
      disponibilidad: ['viernes', 'sabado', 'domingo'],
      certificaciones: ['Seguridad Privada', 'Primeros Auxilios'],
      fechaCreacion: '2024-03-10',
      ultimaActualizacion: '2024-10-30'
    }
  ]);

  const categorias = {
    'Limpieza': { color: '#3498db', icono: 'sparkles' },
    'Tecnología': { color: '#9b59b6', icono: 'laptop' },
    'Seguridad': { color: '#e67e22', icono: 'shield-checkmark' },
    'Catering': { color: '#e74c3c', icono: 'restaurant' },
    'Mantenimiento': { color: '#95a5a6', icono: 'construct' },
    'Eventos': { color: '#f39c12', icono: 'calendar' }
  };

  const handleEditarServicio = (servicio) => {
    setServicioSeleccionado(servicio);
    setFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: servicio.precio.toString(),
      duracion: servicio.duracion
    });
    setModoEdicion(true);
    setModalVisible(true);
  };

  const handleVerDetalles = (servicio) => {
    setServicioSeleccionado(servicio);
    setModoEdicion(false);
    setModalVisible(true);
  };

  const handleToggleEstado = (servicioId) => {
    setMisServicios(prev => prev.map(servicio => {
      if (servicio.id === servicioId) {
        const nuevoEstado = servicio.estado === 'activo' ? 'pausado' : 'activo';
        return { ...servicio, estado: nuevoEstado };
      }
      return servicio;
    }));
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
          onPress: () => {
            setMisServicios(prev => prev.filter(servicio => servicio.id !== servicioId));
          }
        }
      ]
    );
  };

  const handleGuardarEdicion = () => {
    if (!formData.nombre.trim() || !formData.precio.trim()) {
      Alert.alert('Error', 'Nombre y precio son obligatorios');
      return;
    }

    setMisServicios(prev => prev.map(servicio => {
      if (servicio.id === servicioSeleccionado.id) {
        return {
          ...servicio,
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: parseFloat(formData.precio),
          duracion: formData.duracion,
          ultimaActualizacion: new Date().toISOString().split('T')[0]
        };
      }
      return servicio;
    }));

    setModalVisible(false);
    Alert.alert('Éxito', 'Servicio actualizado correctamente');
  };

  const getServiciosFiltrados = () => {
    switch (tabActiva) {
      case 'activos':
        return misServicios.filter(s => s.estado === 'activo');
      case 'pausados':
        return misServicios.filter(s => s.estado === 'pausado');
      case 'todos':
      default:
        return misServicios;
    }
  };

  const getEstadisticas = () => {
    const activos = misServicios.filter(s => s.estado === 'activo').length;
    const pausados = misServicios.filter(s => s.estado === 'pausado').length;
    const totalTrabajos = misServicios.reduce((sum, s) => sum + s.trabajosCompletados, 0);
    const totalSolicitudes = misServicios.reduce((sum, s) => sum + s.solicitudesPendientes, 0);

    return { activos, pausados, totalTrabajos, totalSolicitudes };
  };

  const estadisticas = getEstadisticas();

  const renderServicio = ({ item: servicio }) => {
    const categoria = categorias[servicio.categoria] || { color: '#7f8c8d', icono: 'ellipse' };

    return (
      <View style={[
        styles.servicioCard,
        servicio.estado === 'pausado' && styles.servicioCardPausado
      ]}>
        <View style={styles.servicioHeader}>
          <View style={[styles.categoriaIcon, { backgroundColor: categoria.color }]}>
            <Ionicons name={categoria.icono} size={20} color="#fff" />
          </View>
          <View style={styles.servicioInfo}>
            <Text style={[
              styles.servicioNombre,
              servicio.estado === 'pausado' && styles.textoPausado
            ]}>
              {servicio.nombre}
            </Text>
            <Text style={styles.servicioCategoria}>{servicio.categoria}</Text>
          </View>
          <View style={styles.servicioEstado}>
            <View style={[
              styles.estadoBadge,
              { backgroundColor: servicio.estado === 'activo' ? '#27ae60' : '#f39c12' }
            ]}>
              <Text style={styles.estadoText}>
                {servicio.estado === 'activo' ? 'Activo' : 'Pausado'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[
          styles.servicioDescripcion,
          servicio.estado === 'pausado' && styles.textoPausado
        ]}>
          {servicio.descripcion}
        </Text>

        <View style={styles.servicioStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#f39c12" />
            <Text style={styles.statText}>{servicio.calificacion}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-done" size={16} color="#27ae60" />
            <Text style={styles.statText}>{servicio.trabajosCompletados}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={16} color="#4a90e2" />
            <Text style={styles.statText}>{servicio.trabajosPendientes}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="mail" size={16} color="#9b59b6" />
            <Text style={styles.statText}>{servicio.solicitudesPendientes}</Text>
          </View>
        </View>

        <View style={styles.servicioDetalles}>
          <View style={styles.detalleItem}>
            <Ionicons name="pricetag" size={16} color="#27ae60" />
            <Text style={styles.detalleText}>${servicio.precio}</Text>
          </View>
          <View style={styles.detalleItem}>
            <Ionicons name="clock" size={16} color="#7f8c8d" />
            <Text style={styles.detalleText}>{servicio.duracion}</Text>
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
            onPress={() => handleToggleEstado(servicio.id)}
          >
            <Ionicons
              name={servicio.estado === 'activo' ? 'pause' : 'play'}
              size={16}
              color={servicio.estado === 'activo' ? '#f39c12' : '#27ae60'}
            />
            <Text style={[
              styles.actionButtonText,
              { color: servicio.estado === 'activo' ? '#f39c12' : '#27ae60' }
            ]}>
              {servicio.estado === 'activo' ? 'Pausar' : 'Activar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleEliminarServicio(servicio.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#e74c3c" />
            <Text style={[styles.actionButtonText, { color: '#e74c3c' }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const serviciosFiltrados = getServiciosFiltrados();

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
        <TouchableOpacity
          onPress={() => navigation.navigate('CrearServicio')}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#4a90e2" />
        </TouchableOpacity>
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
            Todos ({misServicios.length})
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

      {serviciosFiltrados.length === 0 ? (
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
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderServicio}
          style={styles.lista}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaContent}
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
                            value={formData.duracion}
                            onChangeText={(text) => setFormData({ ...formData, duracion: text })}
                          />
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.servicioModalHeader}>
                        <View style={styles.servicioModalInfo}>
                          <Text style={styles.servicioModalNombre}>{servicioSeleccionado.nombre}</Text>
                          <Text style={styles.servicioModalCategoria}>{servicioSeleccionado.categoria}</Text>
                          <View style={styles.servicioModalRating}>
                            <Ionicons name="star" size={16} color="#f39c12" />
                            <Text style={styles.ratingText}>{servicioSeleccionado.calificacion}</Text>
                            <Text style={styles.trabajosText}>({servicioSeleccionado.trabajosCompletados} trabajos)</Text>
                          </View>
                        </View>
                        <View style={styles.servicioModalPrecio}>
                          <Text style={styles.precioText}>${servicioSeleccionado.precio}</Text>
                          <Text style={styles.duracionText}>{servicioSeleccionado.duracion}</Text>
                        </View>
                      </View>

                      <Text style={styles.descripcionModal}>{servicioSeleccionado.descripcion}</Text>

                      <View style={styles.estadisticasModal}>
                        <View style={styles.statModalItem}>
                          <Ionicons name="time" size={20} color="#4a90e2" />
                          <Text style={styles.statModalNumber}>{servicioSeleccionado.trabajosPendientes}</Text>
                          <Text style={styles.statModalLabel}>Pendientes</Text>
                        </View>
                        <View style={styles.statModalItem}>
                          <Ionicons name="mail" size={20} color="#9b59b6" />
                          <Text style={styles.statModalNumber}>{servicioSeleccionado.solicitudesPendientes}</Text>
                          <Text style={styles.statModalLabel}>Solicitudes</Text>
                        </View>
                        <View style={styles.statModalItem}>
                          <Ionicons name="checkmark-done" size={20} color="#27ae60" />
                          <Text style={styles.statModalNumber}>{servicioSeleccionado.trabajosCompletados}</Text>
                          <Text style={styles.statModalLabel}>Completados</Text>
                        </View>
                      </View>

                      <View style={styles.certificacionesModal}>
                        <Text style={styles.certificacionesTitle}>Certificaciones</Text>
                        {servicioSeleccionado.certificaciones.map((cert, index) => (
                          <View key={index} style={styles.certificacionItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                            <Text style={styles.certificacionText}>{cert}</Text>
                          </View>
                        ))}
                      </View>
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
});

export default ServiciosProveedor;