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
  responderSolicitudServicio,
  setSolicitudesServicios
} from '../store/slices/proveedoresSlice';

const SolicitudesServicios = ({ navigation }) => {
  const dispatch = useDispatch();
  const { oficinasPropias } = useSelector(state => state.usuario);
  const { solicitudesServicios, loading } = useSelector(state => state.proveedores);

  const [tabActiva, setTabActiva] = useState('pendientes');
  const [modalVisible, setModalVisible] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [respuestaModal, setRespuestaModal] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState('');


  const [solicitudesLocal] = useState([
    {
      _id: 1,
      proveedor: {
        _id: 'prov1',
        nombre: 'María González',
        empresa: 'Cleaning Pro',
        calificacion: 4.8,
        trabajosCompletados: 156,
        avatar: null
      },
      servicio: {
        _id: 'serv1',
        nombre: 'Limpieza profunda de oficinas',
        tipo: 'limpieza',
        descripcion: 'Servicio completo de limpieza con productos ecológicos',
        precio: 120,
        precioOfrecido: 100
      },
      espacio: {
        _id: 1,
        nombre: "Oficina Panorámica 'Skyview'"
      },
      propuesta: {
        mensaje: 'Hola, me gustaría ofrecer mi servicio de limpieza profunda en tu espacio. Tengo 8 años de experiencia y uso productos ecológicos certificados.',
        disponibilidad: 'Lunes a viernes, 6AM - 6PM, horarios flexibles',
        condicionesEspeciales: 'Descuento del 20% por ser el primer servicio. Garantía de satisfacción 100%.'
      },
      fechaSolicitud: '2024-12-15T10:30:00Z',
      estado: 'pendiente',
      fechaRespuesta: null,
      mensajeRespuesta: null
    },

  ]);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = () => {

    dispatch(setSolicitudesServicios(solicitudesLocal));
  };

  const handleVerDetalle = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setModalVisible(true);
  };

  const handleResponder = (solicitud, accion) => {
    setSolicitudSeleccionada(solicitud);
    setMensajeRespuesta('');
    setRespuestaModal(true);

    if (accion === 'aceptar') {
      setMensajeRespuesta('Perfecto, acepto tu propuesta. ¿Cuándo podrías empezar?');
    } else if (accion === 'rechazar') {
      setMensajeRespuesta('Gracias por tu propuesta, pero por el momento no necesitamos este servicio.');
    }
  };

  const handleEnviarRespuesta = async (accion) => {
    if (!mensajeRespuesta.trim()) {
      Alert.alert('Error', 'Debes escribir un mensaje de respuesta');
      return;
    }

    try {
      const respuesta = {
        accion,
        mensaje: mensajeRespuesta
      };

      const result = await dispatch(responderSolicitudServicio(solicitudSeleccionada._id, respuesta));

      if (result.success) {
        setRespuestaModal(false);
        setModalVisible(false);

        Alert.alert(
          'Respuesta enviada',
          `Has ${accion === 'aceptar' ? 'aceptado' : 'rechazado'} la propuesta de ${solicitudSeleccionada.proveedor.nombre}.`
        );


        cargarSolicitudes();
      } else {
        Alert.alert('Error', 'No se pudo enviar la respuesta');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un error al enviar la respuesta');
    }
  };

  const getSolicitudesFiltradas = () => {
    if (!solicitudesServicios) return [];

    switch (tabActiva) {
      case 'pendientes':
        return solicitudesServicios.filter(s => s.estado === 'pendiente');
      case 'aceptadas':
        return solicitudesServicios.filter(s => s.estado === 'aceptada');
      case 'completadas':
        return solicitudesServicios.filter(s => s.estado === 'completada');
      case 'rechazadas':
        return solicitudesServicios.filter(s => s.estado === 'rechazada');
      case 'todas':
      default:
        return solicitudesServicios;
    }
  };

  const getEstadisticas = () => {
    if (!solicitudesServicios) return { pendientes: 0, aceptadas: 0, rechazadas: 0, completadas: 0, total: 0 };

    const pendientes = solicitudesServicios.filter(s => s.estado === 'pendiente').length;
    const aceptadas = solicitudesServicios.filter(s => s.estado === 'aceptada').length;
    const rechazadas = solicitudesServicios.filter(s => s.estado === 'rechazada').length;
    const completadas = solicitudesServicios.filter(s => s.estado === 'completada').length;

    return { pendientes, aceptadas, rechazadas, completadas, total: solicitudesServicios.length };
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHoras < 1) return 'Hace menos de 1 hora';
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    if (diffDias < 7) return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;

    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: fecha.getFullYear() !== ahora.getFullYear() ? 'numeric' : undefined
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return '#f39c12';
      case 'aceptada': return '#27ae60';
      case 'rechazada': return '#e74c3c';
      case 'completada': return '#3498db';
      default: return '#7f8c8d';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'aceptada': return 'Aceptada';
      case 'rechazada': return 'Rechazada';
      case 'completada': return 'Completada';
      default: return estado;
    }
  };

  const renderSolicitud = ({ item: solicitud }) => (
    <TouchableOpacity
      style={styles.solicitudCard}
      onPress={() => handleVerDetalle(solicitud)}
      activeOpacity={0.7}
    >
      <View style={styles.solicitudHeader}>
        <View style={styles.proveedorInfo}>
          <View style={styles.proveedorAvatar}>
            <Text style={styles.proveedorInitials}>
              {solicitud.proveedor.nombre.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.proveedorDetails}>
            <Text style={styles.proveedorNombre}>{solicitud.proveedor.nombre}</Text>
            <Text style={styles.proveedorEmpresa}>{solicitud.proveedor.empresa}</Text>
            <View style={styles.proveedorRating}>
              <Ionicons name="star" size={14} color="#f39c12" />
              <Text style={styles.ratingText}>{solicitud.proveedor.calificacion}</Text>
              <Text style={styles.trabajosText}>({solicitud.proveedor.trabajosCompletados})</Text>
            </View>
          </View>
        </View>

        <View style={styles.solicitudMeta}>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(solicitud.estado) }]}>
            <Text style={styles.estadoText}>{getEstadoTexto(solicitud.estado)}</Text>
          </View>
          <Text style={styles.fechaText}>{formatearFecha(solicitud.fechaSolicitud)}</Text>
        </View>
      </View>

      <View style={styles.servicioInfo}>
        <Text style={styles.servicioNombre}>{solicitud.servicio.nombre}</Text>
        <Text style={styles.espacioNombre}>para {solicitud.espacio.nombre}</Text>
      </View>

      <Text style={styles.propuestaMensaje} numberOfLines={2}>
        {solicitud.propuesta.mensaje}
      </Text>

      <View style={styles.precioInfo}>
        {solicitud.servicio.precioOfrecido < solicitud.servicio.precio ? (
          <View style={styles.precioDescuento}>
            <Text style={styles.precioOriginal}>${solicitud.servicio.precio}</Text>
            <Text style={styles.precioOfrecido}>${solicitud.servicio.precioOfrecido}</Text>
            <View style={styles.descuentoBadge}>
              <Text style={styles.descuentoText}>DESCUENTO</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.precio}>${solicitud.servicio.precioOfrecido}</Text>
        )}
      </View>

      {solicitud.estado === 'pendiente' && (
        <View style={styles.accionesRapidas}>
          <TouchableOpacity
            style={styles.rechazarButton}
            onPress={(e) => {
              e.stopPropagation();
              handleResponder(solicitud, 'rechazar');
            }}
          >
            <Ionicons name="close" size={16} color="#e74c3c" />
            <Text style={styles.rechazarText}>Rechazar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.aceptarButton}
            onPress={(e) => {
              e.stopPropagation();
              handleResponder(solicitud, 'aceptar');
            }}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.aceptarText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      )}

      {solicitud.estado !== 'pendiente' && solicitud.mensajeRespuesta && (
        <View style={styles.respuestaContainer}>
          <Text style={styles.respuestaLabel}>Tu respuesta:</Text>
          <Text style={styles.respuestaTexto} numberOfLines={2}>
            {solicitud.mensajeRespuesta}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const estadisticas = getEstadisticas();
  const solicitudesFiltradas = getSolicitudesFiltradas();

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
        <Text style={styles.headerTitle}>Solicitudes de servicios</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.estadisticasContainer}>
        <View style={styles.estadisticaItem}>
          <Text style={[styles.estadisticaNumero, { color: '#f39c12' }]}>
            {estadisticas.pendientes}
          </Text>
          <Text style={styles.estadisticaLabel}>Pendientes</Text>
        </View>
        <View style={styles.estadisticaItem}>
          <Text style={[styles.estadisticaNumero, { color: '#27ae60' }]}>
            {estadisticas.aceptadas}
          </Text>
          <Text style={styles.estadisticaLabel}>Aceptadas</Text>
        </View>
        <View style={styles.estadisticaItem}>
          <Text style={[styles.estadisticaNumero, { color: '#3498db' }]}>
            {estadisticas.completadas}
          </Text>
          <Text style={styles.estadisticaLabel}>Completadas</Text>
        </View>
        <View style={styles.estadisticaItem}>
          <Text style={[styles.estadisticaNumero, { color: '#7f8c8d' }]}>
            {estadisticas.total}
          </Text>
          <Text style={styles.estadisticaLabel}>Total</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {[
          { id: 'pendientes', nombre: 'Pendientes', count: estadisticas.pendientes },
          { id: 'aceptadas', nombre: 'Aceptadas', count: estadisticas.aceptadas },
          { id: 'completadas', nombre: 'Completadas', count: estadisticas.completadas },
          { id: 'rechazadas', nombre: 'Rechazadas', count: estadisticas.rechazadas },
          { id: 'todas', nombre: 'Todas', count: estadisticas.total }
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, tabActiva === tab.id && styles.tabActive]}
            onPress={() => setTabActiva(tab.id)}
          >
            <Text style={[styles.tabText, tabActiva === tab.id && styles.tabTextActive]}>
              {tab.nombre} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando solicitudes...</Text>
        </View>
      ) : solicitudesFiltradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="mail-outline" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>
            {tabActiva === 'pendientes' ? 'No tienes solicitudes pendientes' :
              tabActiva === 'aceptadas' ? 'No has aceptado ninguna solicitud' :
                tabActiva === 'completadas' ? 'No tienes servicios completados' :
                  tabActiva === 'rechazadas' ? 'No has rechazado ninguna solicitud' :
                    'No tienes solicitudes de servicios'}
          </Text>
          <Text style={styles.emptySubtext}>
            Las solicitudes de proveedores aparecerán aquí cuando ofrezcan sus servicios para tus espacios
          </Text>
        </View>
      ) : (
        <FlatList
          data={solicitudesFiltradas}
          keyExtractor={(item) => item._id?.toString()}
          renderItem={renderSolicitud}
          style={styles.lista}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaContent}
          refreshing={loading}
          onRefresh={cargarSolicitudes}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
      </Modal>

      <Modal
        visible={respuestaModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRespuestaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.respuestaModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Responder solicitud</Text>
              <TouchableOpacity
                onPress={() => setRespuestaModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <View style={styles.respuestaModalContent}>
              {solicitudSeleccionada && (
                <View style={styles.respuestaInfoContainer}>
                  <Text style={styles.respuestaInfoText}>
                    Respondiendo a {solicitudSeleccionada.proveedor.nombre}
                  </Text>
                  <Text style={styles.respuestaServicioText}>
                    {solicitudSeleccionada.servicio.nombre}
                  </Text>
                </View>
              )}

              <Text style={styles.respuestaLabel}>Mensaje de respuesta</Text>
              <TextInput
                style={styles.respuestaTextArea}
                value={mensajeRespuesta}
                onChangeText={setMensajeRespuesta}
                placeholder="Escribe tu respuesta al proveedor..."
                multiline
                numberOfLines={6}
              />

              <View style={styles.respuestaActions}>
                <TouchableOpacity
                  style={styles.respuestaCancelButton}
                  onPress={() => setRespuestaModal(false)}
                >
                  <Text style={styles.respuestaCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.respuestaEnviarButton}
                  onPress={() => handleEnviarRespuesta('aceptar')}
                >
                  <Text style={styles.respuestaEnviarText}>Enviar respuesta</Text>
                </TouchableOpacity>
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
  placeholder: {
    width: 30,
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
  },
  estadisticaLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  tabActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
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
    paddingTop: 15,
    paddingBottom: 20,
  },
  solicitudCard: {
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
  solicitudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  proveedorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  proveedorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  proveedorInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  proveedorDetails: {
    flex: 1,
  },
  proveedorNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  proveedorEmpresa: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
    marginTop: 2,
  },
  proveedorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
  },
  trabajosText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  solicitudMeta: {
    alignItems: 'flex-end',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  estadoText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  fechaText: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  servicioInfo: {
    marginBottom: 12,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  espacioNombre: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  propuestaMensaje: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 20,
    marginBottom: 12,
  },
  precioInfo: {
    marginBottom: 16,
  },
  precioDescuento: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  precioOriginal: {
    fontSize: 14,
    color: '#7f8c8d',
    textDecorationLine: 'line-through',
  },
  precioOfrecido: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  precio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  descuentoBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  descuentoText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  accionesRapidas: {
    flexDirection: 'row',
    gap: 8,
  },
  rechazarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef5f5',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  rechazarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
  },
  aceptarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  aceptarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  respuestaContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  respuestaLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
    marginBottom: 4,
  },
  respuestaTexto: {
    fontSize: 12,
    color: '#2c3e50',
    lineHeight: 16,
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
    maxHeight: 500,
  },
  modalProveedorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  modalProveedorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalProveedorInitials: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalProveedorDetails: {
    flex: 1,
  },
  modalProveedorNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalProveedorEmpresa: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
    marginTop: 2,
  },
  modalProveedorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  modalRatingText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  modalTrabajosText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalSeccion: {
    marginBottom: 20,
  },
  modalSeccionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  modalServicioNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a90e2',
    marginBottom: 4,
  },
  modalServicioDescripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 4,
  },
  modalEspacioInfo: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  modalPropuestaMensaje: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  modalTexto: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  modalPrecioContainer: {
    alignItems: 'flex-start',
  },
  modalPrecioDescuento: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  modalPrecioOriginal: {
    fontSize: 16,
    color: '#7f8c8d',
    textDecorationLine: 'line-through',
  },
  modalPrecioOfrecido: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  modalPrecio: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  modalDescuentoTexto: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: '600',
    marginTop: 4,
  },
  modalRespuestaContainer: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  modalRespuestaTexto: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 4,
  },
  modalRespuestaFecha: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  modalRechazarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef5f5',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  modalRechazarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
  },
  modalAceptarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  modalAceptarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  respuestaModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  respuestaModalContent: {
    padding: 20,
  },
  respuestaInfoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  respuestaInfoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  respuestaServicioText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  respuestaLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  respuestaTextArea: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    color: '#2c3e50',
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  respuestaActions: {
    flexDirection: 'row',
    gap: 12,
  },
  respuestaCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
  },
  respuestaEnviarButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
  },
  respuestaCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  respuestaEnviarText: {
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

export default SolicitudesServicios;