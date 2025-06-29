import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import { cargarEspaciosCliente, cargarTodosLosEspacios } from '../store/slices/espaciosSlice';

const { width, height } = Dimensions.get('window');

const Mapa = ({ navigation }) => {
  const dispatch = useDispatch();
  const [ubicacion, setUbicacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEspacio, setSelectedEspacio] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [radioKm, setRadioKm] = useState(5);
  const [mostrarCirculo, setMostrarCirculo] = useState(true);
  const [region, setRegion] = useState({
    latitude: -34.9011,
    longitude: -56.1645,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Redux state
  const { tipoUsuario, usuario } = useSelector(state => state.auth || {});
  const { 
    espaciosMapeados = [], 
    loading: loadingEspacios,
    error: errorEspacios 
  } = useSelector(state => state.espacios || {});

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;
    return distancia;
  };

  // Cargar ubicación al montar el componente
  useEffect(() => {
    const obtenerUbicacion = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación para mostrar espacios cercanos');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUbicacion(coords);
        setRegion({
          ...coords,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        // Observar cambios de ubicación
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000, // Cada 10 segundos
            distanceInterval: 100, // Cada 100 metros
          },
          (nuevaUbicacion) => {
            setUbicacion({
              latitude: nuevaUbicacion.coords.latitude,
              longitude: nuevaUbicacion.coords.longitude,
            });
          }
        );

      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
        // Ubicación por defecto (Montevideo)
        setUbicacion({
          latitude: -34.9011,
          longitude: -56.1645,
        });
      } finally {
        setLoading(false);
      }
    };

    obtenerUbicacion();
  }, []);

  // Cargar espacios del backend
  useEffect(() => {
    const cargarEspacios = async () => {
      try {
        if (tipoUsuario === 'cliente') {
          await dispatch(cargarEspaciosCliente());
        } else {
          await dispatch(cargarTodosLosEspacios({ filtroTipo: filtroActivo }));
        }
      } catch (error) {
        console.error('Error cargando espacios:', error);
      }
    };

    cargarEspacios();
  }, [dispatch, tipoUsuario, filtroActivo]);

  // Mostrar errores si los hay
  useEffect(() => {
    if (errorEspacios) {
      Alert.alert('Error', errorEspacios);
    }
  }, [errorEspacios]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getMarkerColor = (tipo, esPropio = false) => {
    if (esPropio) return 'green';

    switch (tipo) {
      case 'oficina': return '#4a90e2';
      case 'espacio': return '#9b59b6';
      case 'sala': return '#f39c12';
      case 'escritorio': return '#e67e22';
      case 'edificio': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const handleMarkerPress = (espacio) => {
    setSelectedEspacio(espacio);
    setModalVisible(true);
  };

  const abrirEnGoogleMaps = (lat, lon, nombre) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;
    Linking.openURL(url);
  };

  const handleReservar = () => {
    setModalVisible(false);
    navigation.navigate('DetalleOficina', { 
      oficina: {
        id: selectedEspacio.id,
        nombre: selectedEspacio.nombre,
        tipo: selectedEspacio.tipo,
        direccion: selectedEspacio.direccion,
        datosCompletos: selectedEspacio.datosCompletos
      },
      espacio: selectedEspacio.datosCompletos
    });
  };

  const renderServiceIcon = (service) => {
    switch (service) {
      case 'wifi': return <Ionicons name="wifi" size={16} color="#4a90e2" />;
      case 'cafe': return <Ionicons name="cafe" size={16} color="#4a90e2" />;
      case 'seguridad': return <Ionicons name="shield-checkmark" size={16} color="#4a90e2" />;
      case 'parking': return <Ionicons name="car" size={16} color="#4a90e2" />;
      case 'impresora': return <Ionicons name="print" size={16} color="#4a90e2" />;
      case 'proyector': return <Ionicons name="tv" size={16} color="#4a90e2" />;
      case 'pizarra': return <Ionicons name="easel" size={16} color="#4a90e2" />;
      default: return <Ionicons name="checkmark-circle" size={16} color="#4a90e2" />;
    }
  };

  // Obtener coordenadas del espacio desde el backend
  const obtenerCoordenadas = (espacio) => {
    // Primero verificar en datosCompletos.ubicacion.coordenadas
    if (espacio.datosCompletos?.ubicacion?.coordenadas) {
      const coords = espacio.datosCompletos.ubicacion.coordenadas;
      if (coords.lat && coords.lng) {
        return {
          latitude: coords.lat,
          longitude: coords.lng
        };
      }
    }

    // Verificar en datosCompletos.coordenadas (alternativa)
    if (espacio.datosCompletos?.coordenadas) {
      const coords = espacio.datosCompletos.coordenadas;
      if (coords.lat && coords.lng) {
        return {
          latitude: coords.lat,
          longitude: coords.lng
        };
      }
      if (coords.latitude && coords.longitude) {
        return {
          latitude: coords.latitude,
          longitude: coords.longitude
        };
      }
    }

    // Si no hay coordenadas, retornar null
    return null;
  };

  const getMarcadores = () => {
    if (!Array.isArray(espaciosMapeados)) {
      return [];
    }

    let espaciosFiltrados = espaciosMapeados;

    // Filtrar por tipo si no es 'todos'
    if (filtroActivo !== 'todos') {
      espaciosFiltrados = espaciosMapeados.filter(espacio => espacio.tipo === filtroActivo);
    }

    // Para clientes, filtrar solo sus espacios
    if (tipoUsuario === 'cliente') {
      const userId = usuario?.id || usuario?._id;
      if (userId) {
        espaciosFiltrados = espaciosFiltrados.filter(espacio => {
          const propietarioId = espacio.datosCompletos?.propietarioId || 
                               espacio.datosCompletos?.usuarioId;
          
          if (typeof propietarioId === 'object') {
            return propietarioId._id === userId || propietarioId.$oid === userId;
          }
          
          return propietarioId?.toString() === userId?.toString();
        });
      }
    }

    // Filtrar espacios que tengan coordenadas válidas
    const espaciosConCoordenadas = espaciosFiltrados
      .map(espacio => {
        const coordenadas = obtenerCoordenadas(espacio);
        if (coordenadas) {
          return {
            ...espacio,
            coordenada: coordenadas
          };
        }
        return null;
      })
      .filter(Boolean);

    // Filtrar por distancia si hay ubicación del usuario
    if (ubicacion && (tipoUsuario === 'usuario' || tipoUsuario === 'proveedor')) {
      return espaciosConCoordenadas.filter(espacio => {
        const distancia = calcularDistancia(
          ubicacion.latitude,
          ubicacion.longitude,
          espacio.coordenada.latitude,
          espacio.coordenada.longitude
        );
        return distancia <= radioKm;
      });
    }

    return espaciosConCoordenadas;
  };

  const getHeaderTitle = () => {
    switch (tipoUsuario) {
      case 'usuario':
        return 'Espacios cercanos';
      case 'cliente':
        return 'Mis espacios';
      case 'proveedor':
        return 'Espacios disponibles';
      default:
        return 'Mapa de espacios';
    }
  };

  const getInfoText = () => {
    const count = marcadores.length;
    const tipo = tipoUsuario === 'proveedor' ? 'espacios disponibles' : 'espacios';
    const distancia = (tipoUsuario === 'usuario' || tipoUsuario === 'proveedor') ? ` en ${radioKm} km` : '';
    
    return `${count} ${tipo}${distancia}`;
  };

  const marcadores = getMarcadores();

  const filtros = [
    { id: 'todos', nombre: 'Todos', icono: 'apps' },
    { id: 'oficina', nombre: 'Oficinas', icono: 'business' },
    { id: 'espacio', nombre: 'Espacios', icono: 'square' },
    { id: 'sala', nombre: 'Salas', icono: 'people' },
    { id: 'escritorio', nombre: 'Escritorios', icono: 'desktop' },
    { id: 'edificio', nombre: 'Edificios', icono: 'business-outline' }
  ];

  const radiosDisponibles = [1, 2, 5, 10, 15, 25];

  const cambiarRadio = () => {
    const currentIndex = radiosDisponibles.indexOf(radioKm);
    const nextIndex = (currentIndex + 1) % radiosDisponibles.length;
    const nuevoRadio = radiosDisponibles[nextIndex];
    setRadioKm(nuevoRadio);

    if (ubicacion) {
      const latitudeDelta = nuevoRadio / 111;
      const longitudeDelta = nuevoRadio / (111 * Math.cos(ubicacion.latitude * Math.PI / 180));

      setRegion({
        latitude: ubicacion.latitude,
        longitude: ubicacion.longitude,
        latitudeDelta: latitudeDelta * 2.5,
        longitudeDelta: longitudeDelta * 2.5,
      });
    }
  };

  const esEspacioPropio = (espacio) => {
    if (tipoUsuario !== 'cliente') return false;
    
    const userId = usuario?.id || usuario?._id;
    const propietarioId = espacio.datosCompletos?.propietarioId || 
                         espacio.datosCompletos?.usuarioId;
    
    if (typeof propietarioId === 'object') {
      return propietarioId._id === userId || propietarioId.$oid === userId;
    }
    
    return propietarioId?.toString() === userId?.toString();
  };

  if (loading || loadingEspacios) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.cargando}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.cargandoText}>
            {loading ? 'Obteniendo ubicación...' : 'Cargando espacios...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>
          {getHeaderTitle()}
        </Text>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => {
            if (ubicacion) {
              setRegion({
                ...ubicacion,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              });
            }
          }}
        >
          <Ionicons name="location" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      {(tipoUsuario === 'usuario' || tipoUsuario === 'proveedor') && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtrosContainer}
          >
            {filtros.map(filtro => (
              <TouchableOpacity
                key={filtro.id}
                style={[
                  styles.filtroButton,
                  filtroActivo === filtro.id && styles.filtroButtonActive
                ]}
                onPress={() => setFiltroActivo(filtro.id)}
              >
                <Ionicons
                  name={filtro.icono}
                  size={18}
                  color={filtroActivo === filtro.id ? '#fff' : '#4a90e2'}
                />
                <Text style={[
                  styles.filtroText,
                  filtroActivo === filtro.id && styles.filtroTextActive
                ]}>
                  {filtro.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={cambiarRadio}
              activeOpacity={0.7}
            >
              <Ionicons name="navigate-circle" size={20} color="#4a90e2" />
              <Text style={styles.radioText}>Radio: {radioKm} km</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.circleToggle, mostrarCirculo && styles.circleToggleActive]}
              onPress={() => setMostrarCirculo(!mostrarCirculo)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={mostrarCirculo ? "eye" : "eye-off"}
                size={18}
                color={mostrarCirculo ? "#fff" : "#4a90e2"}
              />
            </TouchableOpacity>
          </View>
        </>
      )}

      <MapView
        style={styles.mapa}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onRegionChangeComplete={(region) => setRegion(region)}
      >
        {ubicacion && (
          <Marker
            coordinate={ubicacion}
            title="Estás aquí"
            description="Esta es tu ubicación actual"
            pinColor="blue"
          />
        )}

        {ubicacion && mostrarCirculo && (tipoUsuario === 'usuario' || tipoUsuario === 'proveedor') && (
          <Circle
            center={ubicacion}
            radius={radioKm * 1000}
            strokeColor="rgba(74, 144, 226, 0.5)"
            fillColor="rgba(74, 144, 226, 0.1)"
            strokeWidth={2}
          />
        )}

        {marcadores.map((espacio) => (
          <Marker
            key={espacio.id}
            coordinate={espacio.coordenada}
            title={espacio.nombre}
            description="Toca para ver detalles"
            pinColor={getMarkerColor(espacio.tipo, esEspacioPropio(espacio))}
            onCalloutPress={() => handleMarkerPress(espacio)}
          >
            <View style={[
              styles.markerContainer,
              {
                backgroundColor: getMarkerColor(espacio.tipo, esEspacioPropio(espacio))
              }
            ]}>
              <Ionicons
                name={
                  espacio.tipo === 'oficina' ? 'business' :
                    espacio.tipo === 'espacio' ? 'square' :
                      espacio.tipo === 'sala' ? 'people' :
                        espacio.tipo === 'escritorio' ? 'desktop' :
                          espacio.tipo === 'edificio' ? 'business-outline' : 'location'
                }
                size={20}
                color="#fff"
              />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.informacion}>
        <Text style={styles.infoTexto}>
          <Ionicons name="location" size={14} color="#4a90e2" />
          {getInfoText()}
        </Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#2c3e50" />
            </TouchableOpacity>

            {selectedEspacio && (
              <>
                <Text style={styles.modalTitle}>{selectedEspacio.nombre}</Text>
                <Text style={styles.modalDireccion}>{selectedEspacio.direccion}</Text>

                {ubicacion && selectedEspacio.coordenada && (
                  <View style={styles.distanciaContainer}>
                    <Ionicons name="walk" size={16} color="#7f8c8d" />
                    <Text style={styles.distanciaText}>
                      {calcularDistancia(
                        ubicacion.latitude,
                        ubicacion.longitude,
                        selectedEspacio.coordenada.latitude,
                        selectedEspacio.coordenada.longitude
                      ).toFixed(1)} km de distancia
                    </Text>
                  </View>
                )}

                <View style={styles.modalInfo}>
                  <View style={styles.infoItem}>
                    <Ionicons name="people" size={20} color="#7f8c8d" />
                    <Text style={styles.infoText}>{selectedEspacio.capacidad} personas</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="pricetag" size={20} color="#27ae60" />
                    <Text style={styles.infoText}>${selectedEspacio.precio}/día</Text>
                  </View>
                </View>

                {Array.isArray(selectedEspacio.servicios) && selectedEspacio.servicios.length > 0 && (
                  <View style={styles.serviciosContainer}>
                    <Text style={styles.serviciosTitle}>Servicios incluidos:</Text>
                    <View style={styles.serviciosGrid}>
                      {selectedEspacio.servicios.map((servicio, index) => (
                        <View key={index} style={styles.servicioChip}>
                          {renderServiceIcon(servicio)}
                          <Text style={styles.servicioText}>{servicio}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.direccionesButton}
                  onPress={() => abrirEnGoogleMaps(
                    selectedEspacio.coordenada.latitude,
                    selectedEspacio.coordenada.longitude,
                    selectedEspacio.nombre
                  )}
                >
                  <Ionicons name="navigate" size={20} color="#4a90e2" />
                  <Text style={styles.direccionesText}>Ver direcciones en Google Maps</Text>
                </TouchableOpacity>

                {esEspacioPropio(selectedEspacio) ? (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.verDetallesButton]}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate('DetalleOficina', {
                        oficina: {
                          id: selectedEspacio.id,
                          nombre: selectedEspacio.nombre,
                          tipo: selectedEspacio.tipo,
                          direccion: selectedEspacio.direccion,
                          datosCompletos: selectedEspacio.datosCompletos
                        },
                        espacio: selectedEspacio.datosCompletos,
                        esPropia: true
                      });
                    }}
                  >
                    <Text style={styles.verDetallesButtonText}>Gestionar espacio</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleReservar}
                  >
                    <Text style={styles.modalButtonText}>
                      {tipoUsuario === 'proveedor' ? 'Ofrecer servicios' : 'Reservar ahora'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
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
  locationButton: {
    padding: 5,
  },
  filtrosContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 5,
    paddingHorizontal: 20,
    maxHeight: 45,
    marginTop: 10,
    borderBottomWidth: 0,
  },
  filtroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  filtroButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  filtroText: {
    fontSize: 12,
    color: '#4a90e2',
    marginLeft: 4,
    fontFamily: 'System',
  },
  filtroTextActive: {
    color: '#fff',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    flex: 1,
    marginRight: 10,
  },
  radioText: {
    fontSize: 14,
    color: '#4a90e2',
    marginLeft: 8,
    fontFamily: 'System',
    fontWeight: '600',
  },
  circleToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleToggleActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  mapa: {
    flex: 1,
  },
  cargando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cargandoText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4a90e2',
    fontFamily: 'System',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  informacion: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    padding: 16,
    backgroundColor: '#ffffffee',
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTexto: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
    fontFamily: 'System',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    marginTop: 10,
    fontFamily: 'System',
  },
  modalDireccion: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
    fontFamily: 'System',
  },
  distanciaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e8f4fd',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  distanciaText: {
    fontSize: 14,
    color: '#4a90e2',
    marginLeft: 6,
    fontFamily: 'System',
    fontWeight: '600',
  },
  modalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#2c3e50',
    fontFamily: 'System',
  },
  serviciosContainer: {
    marginBottom: 20,
  },
  serviciosTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    fontFamily: 'System',
  },
  serviciosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  servicioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  servicioText: {
    fontSize: 14,
    color: '#4a90e2',
    fontFamily: 'System',
  },
  direccionesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  direccionesText: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
    fontFamily: 'System',
  },
  modalButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  verDetallesButton: {
    backgroundColor: '#27ae60',
  },
  verDetallesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
});

export default Mapa;