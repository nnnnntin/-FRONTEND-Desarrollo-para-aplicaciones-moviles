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
import { useDispatch, useSelector } from 'react-redux';
import { actualizarEspacio, eliminarEspacio } from '../store/slices/espaciosSlice';

const GestionPublicaciones = ({ navigation }) => {
  const [tabActiva, setTabActiva] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [modalDetalles, setModalDetalles] = useState(false);
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState(null);
  const [modalEditar, setModalEditar] = useState(false);
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    precio: '',
    capacidad: '',
  });

  const {
    espaciosFiltrados = [],
    filtroTipo = 'todos',
    textoBusqueda = '',
    loading = false,
    error = null,
    refreshing = false
  } = useSelector(state => state.espacios || {});

  const capitalize = txt =>
    typeof txt === 'string' && txt.length
      ? txt[0].toUpperCase() + txt.slice(1)
      : '';

  const estadisticas = {
    total: espaciosFiltrados.length,
    oficina: espaciosFiltrados.filter(p => p.tipo === 'oficina').length,
    escritorio: espaciosFiltrados.filter(p => p.tipo === 'escritorio').length,
    espacio: espaciosFiltrados.filter(p => p.tipo === 'espacio').length,
    sala: espaciosFiltrados.filter(p => p.tipo === 'sala').length,
    ingresosTotal: espaciosFiltrados.reduce((sum, p) => sum + (p.ingresosGenerados || 0), 0),
    comisionesTotal: espaciosFiltrados.reduce((sum, p) => sum + (p.comisionesGeneradas || 0), 0)
  };

  const getPublicacionesFiltradas = () => {
    let filtradas = espaciosFiltrados;

    if (tabActiva !== 'todas') {
      filtradas = filtradas.filter(p => {
        if (tabActiva === 'oficina') return p.tipo === 'oficina';
        if (tabActiva === 'espacio') return p.tipo === 'espacio';
        if (tabActiva === 'escritorio') return p.tipo === 'escritorio';
        if (tabActiva === 'sala') return p.tipo === 'sala';
        return true;
      });
    }

    if (busqueda) {
      filtradas = filtradas.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.propietario.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.direccion.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    return filtradas;
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'oficina': return '#4a90e2';
      case 'espacio': return '#9b59b6';
      case 'sala': return '#f39c12';
      case 'escritorio': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  const getEstadoInfo = (estado) => {
    switch (estado) {
      case 'disponible': return { color: '#27ae60', icono: 'checkmark-circle' };
      case 'espacio': return { color: '#f39c12', icono: 'pause-circle' };
      case 'sala': return { color: '#3498db', icono: 'time' };
      case 'escritorio': return { color: '#e74c3c', icono: 'warning' };
      default: return { color: '#7f8c8d', icono: 'help-circle' };
    }
  };

  const handleGuardarCambios = async () => {
    if (!form.nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    if (!form.precio.trim() || isNaN(form.precio)) {
      Alert.alert('Error', 'El precio debe ser un número');
      return;
    }

    const datosActualizados = {
      nombre: form.nombre.trim(),
      capacidad: Number(form.capacidad || 0),
    };

    try {
      await dispatch(
        actualizarEspacio({
          id: publicacionSeleccionada.id,
          tipo: publicacionSeleccionada.tipo,
          datosActualizados,
        })
      ).unwrap();

      setModalEditar(false);
      Alert.alert('Éxito', 'El espacio fue actualizado correctamente');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error || 'No se pudo actualizar el espacio');
    }
  };

  const handleVerDetalles = (publicacion) => {
    setPublicacionSeleccionada(publicacion);
    setModalDetalles(true);
  };

  const handleEliminarPublicacion = (publicacion) => {
    Alert.alert(
      'Eliminar publicación',
      `¿Estás seguro de eliminar "${publicacion.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () =>
            dispatch(
              eliminarEspacio({
                id: publicacion.id,
                tipo: publicacion.tipo,
              }),
            )
              .unwrap()
              .then(() => Alert.alert('Éxito', 'Espacio eliminado'))
              .catch((err) => Alert.alert('Error', err)),
        },
      ],
    );
  };

  const renderPublicacion = ({ item }) => {
    const estadoInfo = getEstadoInfo(item.estado);

    return (
      <TouchableOpacity
        style={styles.publicacionCard}
        onPress={() => handleVerDetalles(item)}
      >
        <View style={styles.publicacionHeader}>
          <View style={[styles.tipoIcon, { backgroundColor: getTipoColor(item.tipo) + '20' }]}>
            <Ionicons
              name={item.tipo === 'oficina' ? 'business' :
                item.tipo === 'espacio' ? 'square' :
                  item.tipo === 'sala' ? 'people' : 'desktop'}
              size={20}
              color={getTipoColor(item.tipo)}
            />
          </View>
          <View style={styles.publicacionInfo}>
            <Text style={styles.publicacionNombre}>{item.nombre}</Text>
            <Text style={styles.publicacionPropietario}>{item.propietario}</Text>
            <Text style={styles.publicacionDireccion}>{item.direccion}</Text>
          </View>
          <View style={styles.estadoContainer}>
            <Ionicons name={estadoInfo.icono} size={24} color={estadoInfo.color} />
          </View>
        </View>

        <View style={styles.publicacionStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Precio</Text>
            <Text style={styles.statValue}>${item.precio}/día</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Capacidad</Text>
            <Text style={styles.statValue}>{item.capacidad} pers.</Text>
          </View>
          {item.reservasTotal && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Reservas</Text>
              <Text style={styles.statValue}>{item.reservasTotal}</Text>
            </View>
          )}
          {item.calificacion && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Rating</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#f39c12" />
                <Text style={styles.statValue}>{item.calificacion}</Text>
              </View>
            </View>
          )}
        </View>

        {item.estado === 'reportada' && (
          <View style={styles.alertaBadge}>
            <Ionicons name="alert-circle" size={16} color="#e74c3c" />
            <Text style={styles.alertaText}>
              {item.reportes?.length || 0} reportes activos
            </Text>
          </View>
        )}
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
        <Text style={styles.headerTitle}>Gestión de Espacios</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, propietario o dirección..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <View style={styles.estadisticasCard}>
        <View style={styles.estadisticasGrid}>
          <View style={styles.estatItem}>
            <Text style={styles.estatNumero}>{estadisticas.total}</Text>
            <Text style={styles.estatLabel}>Total</Text>
          </View>
          <View style={styles.estatItem}>
            <Text style={[styles.estatNumero, { color: '#27ae60' }]}>
              {estadisticas.oficina}
            </Text>
            <Text style={styles.estatLabel}>oficina</Text>
          </View>
          <View style={styles.estatItem}>
            <Text style={[styles.estatNumero, { color: '#3498db' }]}>
              {estadisticas.escritorio}
            </Text>
            <Text style={styles.estatLabel}>escritorio</Text>
          </View>
          <View style={styles.estatItem}>
            <Text style={[styles.estatNumero, { color: '#e74c3c' }]}>
              {estadisticas.sala}
            </Text>
            <Text style={styles.estatLabel}>sala</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {['todas', 'oficina', 'espacio', 'escritorio', 'sala'].map(tab => (
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

      <FlatList
        data={getPublicacionesFiltradas()}
        renderItem={renderPublicacion}
        keyExtractor={(item) => item.id.toString()}
        style={styles.lista}
        contentContainerStyle={styles.listaContent}
      />

      <Modal
        visible={modalDetalles}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalDetalles(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles del espacio</Text>
              <TouchableOpacity
                onPress={() => setModalDetalles(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            {publicacionSeleccionada && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.modalSeccion}>
                  <View style={[
                    styles.modalTipoHeader,
                    { backgroundColor: getTipoColor(publicacionSeleccionada.tipo) + '20' }
                  ]}>
                    <Ionicons
                      name={publicacionSeleccionada.tipo === 'oficina' ? 'business' :
                        publicacionSeleccionada.tipo === 'espacio' ? 'square' :
                          publicacionSeleccionada.tipo === 'sala' ? 'people' : 'desktop'}
                      size={24}
                      color={getTipoColor(publicacionSeleccionada.tipo)}
                    />
                    <Text style={styles.modalTipoText}>
                      {capitalize(publicacionSeleccionada.tipo)}
                    </Text>
                  </View>

                  <Text style={styles.modalNombre}>{publicacionSeleccionada.nombre}</Text>
                  <Text style={styles.modalDireccion}>{publicacionSeleccionada.direccion}</Text>

                  <View style={[
                    styles.modalEstadoBadge,
                    { backgroundColor: getEstadoInfo(publicacionSeleccionada.datosCompletos.estado).color + '20' }
                  ]}>
                    <Ionicons
                      name={getEstadoInfo(publicacionSeleccionada.datosCompletos.estado).icono}
                      size={16}
                      color={getEstadoInfo(publicacionSeleccionada.datosCompletos.estado).color}
                    />
                    <Text style={[
                      styles.modalEstadoText,
                      { color: getEstadoInfo(publicacionSeleccionada.datosCompletos.estado).color }
                    ]}>
                      {capitalize(publicacionSeleccionada.estado)}

                    </Text>
                  </View>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Información del propietario</Text>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Nombre</Text>
                    <Text style={styles.modalInfoValue}>{publicacionSeleccionada.datosCompletos.usuarioId.nombre}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Email</Text>
                    <Text style={styles.modalInfoValue}>{publicacionSeleccionada.datosCompletos.usuarioId.email}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Fecha publicación</Text>
                    <Text style={styles.modalInfoValue}>{publicacionSeleccionada.datosCompletos.createdAt}</Text>
                  </View>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Detalles del espacio</Text>
                  <View style={styles.modalGrid}>
                    <View style={styles.modalGridItem}>
                      <Text style={styles.modalGridLabel}>Precio</Text>
                      <Text style={styles.modalGridValue}>${publicacionSeleccionada.precio}/día</Text>
                    </View>
                    <View style={styles.modalGridItem}>
                      <Text style={styles.modalGridLabel}>Capacidad</Text>
                      <Text style={styles.modalGridValue}>{publicacionSeleccionada.capacidad} personas</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalAcciones}>
                  <TouchableOpacity
                    style={[styles.modalBoton, styles.botonEliminar]}
                    onPress={() => handleEliminarPublicacion(publicacionSeleccionada)}
                  >
                    <Ionicons name="trash" size={16} color="#fff" />
                    <Text style={styles.modalBotonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalEditar}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalEditar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar espacio</Text>
              <TouchableOpacity
                onPress={() => setModalEditar(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                value={form.nombre}
                onChangeText={txt => setForm({ ...form, nombre: txt })}
                style={styles.input}
              />

              <Text style={styles.inputLabel}>Capacidad (personas)</Text>
              <TextInput
                value={form.capacidad}
                onChangeText={txt => setForm({ ...form, capacidad: txt })}
                keyboardType="numeric"
                style={styles.input}
              />

              <View style={styles.modalAcciones}>
                <TouchableOpacity
                  style={[styles.modalBoton, styles.botonEditar]}
                  onPress={handleGuardarCambios}
                >
                  <Ionicons name="save" size={16} color="#fff" />
                  <Text style={styles.modalBotonText}>Guardar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBoton, styles.botonPausar]}
                  onPress={() => setModalEditar(false)}
                >
                  <Ionicons name="arrow-undo" size={16} color="#fff" />
                  <Text style={styles.modalBotonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  estadisticasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
    paddingTop: 12,
  },
  financieraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  financieraLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  financieraValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
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
  publicacionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  publicacionHeader: {
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
  publicacionInfo: {
    flex: 1,
  },
  publicacionNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  publicacionPropietario: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 2,
  },
  publicacionDireccion: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  estadoContainer: {
    justifyContent: 'center',
  },
  publicacionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  alertaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    gap: 6,
  },
  alertaText: {
    fontSize: 12,
    color: '#e74c3c',
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
  modalSeccion: {
    marginBottom: 20,
  },
  modalTipoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  modalTipoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  modalNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  modalDireccion: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  modalEstadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 6,
  },
  modalEstadoText: {
    fontSize: 14,
    fontWeight: '600',
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
  },
  modalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalGridItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  modalGridLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  modalGridValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  serviciosContainer: {
    marginTop: 12,
  },
  serviciosLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  serviciosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  servicioChip: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  servicioText: {
    fontSize: 12,
    color: '#4a90e2',
  },
  modalEstadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  ultimaReservaText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  reporteItem: {
    flexDirection: 'row',
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  reporteInfo: {
    flex: 1,
  },
  reporteMotivo: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 2,
  },
  reporteDetalles: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalAlerta: {
    flexDirection: 'row',
    backgroundColor: '#fffbf0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  modalAlertaText: {
    flex: 1,
    fontSize: 14,
    color: '#f39c12',
  },
  documentoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  documentoText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  modalAcciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  modalBoton: {
    flex: 1,
    minWidth: 100,
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
  botonPausar: {
    backgroundColor: '#f39c12',
  },
  botonActivar: {
    backgroundColor: '#27ae60',
  },
  botonEditar: {
    backgroundColor: '#4a90e2',
  },
  botonEliminar: {
    backgroundColor: '#e74c3c',
  },
  modalBotonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
    color: '#2c3e50',
  },
  inputLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },

});

export default GestionPublicaciones;