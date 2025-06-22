import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
  Alert,
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
import { desloguear } from '../store/slices/usuarioSlice';
import HamburgerMenu from './HamburgerMenu';

const Inicio = ({ navigation, setIsLogged, resetSession }) => {
  const [searchText, setSearchText] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const dispatch = useDispatch();

  const { tipoUsuario, oficinasPropias, datosUsuario } = useSelector(state => state.usuario);

  const tipos = [
    { id: 'todos', nombre: 'Todos', icono: 'apps' },
    { id: 'oficina', nombre: 'Oficinas', icono: 'business' },
    { id: 'espacio', nombre: 'Espacios', icono: 'square' },
    { id: 'escritorio', nombre: 'Escritorios', icono: 'desktop' },
    { id: 'edificio', nombre: 'Edificios', icono: 'business-outline' },
    { id: 'sala', nombre: 'Salas', icono: 'people' }
  ];

  const todasLasOficinas = [
    {
      id: 1,
      nombre: "Oficina Panorámica 'Skyview'",
      tipo: 'oficina',
      servicios: ['wifi', 'cafe', 'seguridad'],
      color: '#4a90e2',
      propietario: 'Cliente Demo',
      precio: '1200',
      capacidad: 8,
      direccion: 'Montevideo, Ciudad Vieja'
    },
    {
      id: 2,
      nombre: "Oficina 'El mirador'",
      tipo: 'oficina',
      servicios: ['wifi', 'cafe', 'parking'],
      color: '#27ae60',
      propietario: 'Cliente Demo',
      precio: '1500',
      capacidad: 12,
      direccion: 'Montevideo, Pocitos'
    },
    {
      id: 3,
      nombre: "Oficina 'Centro'",
      tipo: 'oficina',
      servicios: ['wifi', 'seguridad'],
      color: '#e74c3c',
      propietario: 'Otro Cliente',
      precio: '900',
      capacidad: 6,
      direccion: 'Montevideo, Centro'
    },
    {
      id: 4,
      nombre: "Espacio Coworking",
      tipo: 'espacio',
      servicios: ['wifi', 'cafe', 'impresora'],
      color: '#9b59b6',
      propietario: 'Spaces Inc',
      precio: '50',
      capacidad: 1,
      direccion: 'Montevideo, Cordón'
    },
    {
      id: 5,
      nombre: "Sala de Reuniones Premium",
      tipo: 'sala',
      servicios: ['wifi', 'proyector', 'pizarra'],
      color: '#f39c12',
      propietario: 'Business Center',
      precio: '200',
      capacidad: 20,
      direccion: 'Montevideo, Carrasco'
    }
  ];

  const getOficinas = () => {
    if (tipoUsuario === 'cliente') {
      return todasLasOficinas.filter(oficina => oficinasPropias.includes(oficina.id));
    } else if (tipoUsuario === 'usuario') {
      return todasLasOficinas.filter(oficina =>
        filtroTipo === 'todos' || oficina.tipo === filtroTipo
      );
    } else if (tipoUsuario === 'proveedor') {
      return todasLasOficinas.filter(oficina =>
        filtroTipo === 'todos' || oficina.tipo === filtroTipo
      );
    } else if (tipoUsuario === 'admin') {
      return todasLasOficinas.filter(oficina =>
        filtroTipo === 'todos' || oficina.tipo === filtroTipo
      );
    }
    return [];
  };

  const oficinas = getOficinas();

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleCloseMenu = () => {
    setMenuVisible(false);
  };

  const verDetalleOficina = (oficina) => {
    const params = { oficina };

    if (tipoUsuario === 'cliente') {
      params.esPropia = oficinasPropias.includes(oficina.id);
    } else {
      params.esPropia = false;
    }

    navigation.navigate('DetalleOficina', params);
  };

  const handleCrearPublicacion = () => {
    navigation.navigate('CrearPublicacion');
  };

  const handleCrearServicio = () => {
    navigation.navigate('CrearServicio');
  };

  const handleVerMembresias = () => {
    navigation.navigate('Membresias');
  };

  const handleVerMapa = () => {
    navigation.navigate('Mapa');
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      dispatch(desloguear());
      await SecureStore.deleteItemAsync('isLogged');
      await SecureStore.deleteItemAsync('usuario');
      setMenuVisible(false);

      setTimeout(() => {
        setIsLogged(false);
        Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente');
      }, 300);

    } catch (error) {
      dispatch(desloguear());
      setMenuVisible(false);

      setTimeout(() => {
        setIsLogged(false);
      }, 300);

    } finally {
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 500);
    }
  };

  const renderServiceIcon = (service) => {
    switch (service) {
      case 'wifi':
        return <Ionicons name="wifi" size={20} color="#4a90e2" />;
      case 'cafe':
        return <Ionicons name="cafe" size={20} color="#4a90e2" />;
      case 'seguridad':
        return <Ionicons name="shield-checkmark" size={20} color="#4a90e2" />;
      case 'parking':
        return <Ionicons name="car" size={20} color="#4a90e2" />;
      case 'impresora':
        return <Ionicons name="print" size={20} color="#4a90e2" />;
      case 'proyector':
        return <Ionicons name="tv" size={20} color="#4a90e2" />;
      case 'pizarra':
        return <Ionicons name="easel" size={20} color="#4a90e2" />;
      default:
        return <Ionicons name="checkmark-circle" size={20} color="#4a90e2" />;
    }
  };

  const getActionButtonText = () => {
    switch (tipoUsuario) {
      case 'usuario':
        return 'Reservar';
      case 'cliente':
        return 'Gestionar';
      case 'proveedor':
        return 'Ofrecer servicios';
      default:
        return 'Ver detalles';
    }
  };

  const OficinaCard = ({ oficina }) => {
    const esPropia = tipoUsuario === 'cliente' && oficinasPropias.includes(oficina.id);

    return (
      <View style={styles.card}>
        <View style={[styles.cardImagePlaceholder, { backgroundColor: oficina.color }]}>
          <Ionicons name={tipos.find(t => t.id === oficina.tipo)?.icono || 'business'} size={40} color="white" />
          <Text style={styles.cardImageText}>{oficina.tipo}</Text>
          {esPropia && (
            <View style={styles.propiaIndicator}>
              <Text style={styles.propiaText}>Tu espacio</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{oficina.nombre}</Text>
          <Text style={styles.cardDireccion}>{oficina.direccion}</Text>

          <View style={styles.cardInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="people" size={16} color="#7f8c8d" />
              <Text style={styles.infoText}>{oficina.capacidad} personas</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="pricetag" size={16} color="#27ae60" />
              <Text style={styles.infoText}>${oficina.precio}/día</Text>
            </View>
          </View>

          <View style={styles.servicesContainer}>
            <Text style={styles.servicesLabel}>Servicios</Text>
            <View style={styles.servicesIcons}>
              {oficina.servicios.map((service, index) => (
                <View key={index} style={styles.serviceIcon}>
                  {renderServiceIcon(service)}
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.verButton,
              tipoUsuario === 'proveedor' && styles.verButtonProveedor
            ]}
            onPress={() => verDetalleOficina(oficina)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.verButtonText,
              tipoUsuario === 'proveedor' && styles.verButtonTextProveedor
            ]}>
              {getActionButtonText()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {tipoUsuario === 'cliente' ? 'Mis espacios' :
            tipoUsuario === 'proveedor' ? 'Oportunidades de servicio' : 'Reservar espacios'}
        </Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notificaciones')}
        >
          <Ionicons name="notifications-outline" size={24} color="#4a90e2" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              tipoUsuario === 'usuario' ? 'Buscar espacios...' :
                tipoUsuario === 'cliente' ? 'Buscar en mis espacios...' :
                  'Buscar oportunidades...'
            }
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {tipoUsuario === 'usuario' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtrosContainer}
          >
            {tipos.map(tipo => (
              <TouchableOpacity
                key={tipo.id}
                style={[
                  styles.filtroButton,
                  filtroTipo === tipo.id && styles.filtroButtonActive
                ]}
                onPress={() => setFiltroTipo(tipo.id)}
              >
                <Ionicons
                  name={tipo.icono}
                  size={20}
                  color={filtroTipo === tipo.id ? '#fff' : '#4a90e2'}
                />
                <Text style={[
                  styles.filtroText,
                  filtroTipo === tipo.id && styles.filtroTextActive
                ]}>
                  {tipo.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {tipoUsuario === 'cliente' && (
          <TouchableOpacity
            style={styles.crearPublicacionButton}
            onPress={handleCrearPublicacion}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.crearPublicacionText}>Crear nueva publicación</Text>
          </TouchableOpacity>
        )}

        {oficinas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={
                tipoUsuario === 'cliente' ? 'business-outline' :
                  tipoUsuario === 'proveedor' ? 'construct-outline' :
                    'search-outline'
              }
              size={60}
              color="#bdc3c7"
            />
            <Text style={styles.emptyText}>
              {tipoUsuario === 'cliente' ? 'No tienes espacios publicados' :
                tipoUsuario === 'proveedor' ? 'No hay oportunidades disponibles' :
                  'No se encontraron espacios'}
            </Text>
            <Text style={styles.emptySubtext}>
              {tipoUsuario === 'cliente' ? 'Publica tu primer espacio y comienza a recibir reservas' :
                tipoUsuario === 'proveedor' ? 'Crea un servicio para empezar a ofrecerlo en espacios' :
                  'Intenta ajustar los filtros de búsqueda'}
            </Text>
            {tipoUsuario === 'cliente' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleCrearPublicacion}
              >
                <Text style={styles.emptyButtonText}>Publicar espacio</Text>
              </TouchableOpacity>
            )}
            {tipoUsuario === 'proveedor' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleCrearServicio}
              >
                <Text style={styles.emptyButtonText}>Crear servicio</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.oficinasContainer}>
            {oficinas.map((oficina) => (
              <OficinaCard key={oficina.id} oficina={oficina} />
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingMapButton}
        onPress={handleVerMapa}
        activeOpacity={0.8}
      >
        <Ionicons name="map" size={28} color="#fff" />
      </TouchableOpacity>

      <HamburgerMenu
        visible={menuVisible}
        onClose={handleCloseMenu}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        navigation={navigation}
      />
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
  menuButton: {
    width: 30,
    height: 20,
    justifyContent: 'space-between',
    padding: 5,
  },
  hamburgerLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#4a90e2',
    borderRadius: 2,
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
  notificationButton: {
    position: 'relative',
    padding: 5,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  membresiaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbf0',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#f39c12',
  },
  membresiaBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  membresiaTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  membresiaSubtitulo: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
    fontFamily: 'System',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginVertical: 20,
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
    fontFamily: 'System',
    color: '#2c3e50',
  },
  filtrosContainer: {
    marginBottom: 20,
    marginTop: -10,
  },
  filtroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    fontSize: 14,
    color: '#4a90e2',
    marginLeft: 6,
    fontFamily: 'System',
  },
  filtroTextActive: {
    color: '#fff',
  },
  crearPublicacionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  crearPublicacionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'System',
  },
  crearServicioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  crearServicioText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'System',
  },
  oficinasContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 20,
    fontFamily: 'System',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  emptyButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  propiaIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  propiaText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#27ae60',
    fontFamily: 'System',
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    fontFamily: 'System',
  },
  cardDireccion: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
    fontFamily: 'System',
  },
  cardInfo: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#5a6c7d',
    fontFamily: 'System',
  },
  servicesContainer: {
    marginBottom: 15,
  },
  servicesLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
    fontFamily: 'System',
  },
  servicesIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceIcon: {
    padding: 8,
    backgroundColor: '#f1f3f4',
    borderRadius: 20,
  },
  verButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  verButtonProveedor: {
    backgroundColor: '#27ae60',
  },
  verButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  verButtonTextProveedor: {
    color: '#fff',
  },
  floatingMapButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
});

export default Inicio;