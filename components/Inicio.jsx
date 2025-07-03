import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { desloguear } from '../store/slices/authSlice';
import {
  cargarEspaciosCliente,
  cargarTodosLosEspacios,
  clearError,
  setFiltroTipo,
  setRefreshing,
  setTextoBusqueda
} from '../store/slices/espaciosSlice';
import {
  clearError as clearReservasError,
  obtenerReservasPorProveedor
} from '../store/slices/reservasSlice';
import HamburgerMenu from './HamburgerMenu';

const Inicio = ({ navigation, setIsLogged, resetSession }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [modoReordenar, setModoReordenar] = useState(false);
  const dispatch = useDispatch();

  const {
    tipoUsuario = 'usuario',
    usuario = {},
    token = null
  } = useSelector(state => state.auth || {});

  const {
    oficinasPropias = [],
    serviciosContratados = [],
    serviciosOfrecidos = []
  } = useSelector(state => state.usuario || {});

  const {
    espaciosFiltrados = [],
    filtroTipo = 'todos',
    textoBusqueda = '',
    loading = false,
    error = null,
    refreshing = false
  } = useSelector(state => state.espacios || {});

  const {
    reservasProveedor = [],
    resumenProveedor = null,
    loadingReservasProveedor = false,
    errorReservasProveedor = null
  } = useSelector(state => state.reservas || {});

  const tipos = [
    { id: 'todos', nombre: 'Todos', icono: 'apps', endpoint: null },
    { id: 'oficina', nombre: 'Oficinas', icono: 'business', endpoint: '/v1/oficinas' },
    { id: 'espacio', nombre: 'Espacios', icono: 'square', endpoint: '/v1/espacios' },
    { id: 'escritorio', nombre: 'Escritorios', icono: 'desktop', endpoint: '/v1/escritorios-flexibles' },
    { id: 'sala', nombre: 'Salas', icono: 'people', endpoint: '/v1/salas-reunion' }
  ];

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarDatos();
    });

    return unsubscribe;
  }, [navigation, filtroTipo, tipoUsuario]);

  useEffect(() => {
    cargarDatos();
  }, [filtroTipo, tipoUsuario]);

  useEffect(() => {
    if (tipoUsuario === 'proveedor' && usuario?.id) {
      cargarReservasProveedor();
    }
  }, [tipoUsuario, usuario?.id]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (errorReservasProveedor) {
      Alert.alert('Error', errorReservasProveedor);
      dispatch(clearReservasError());
    }
  }, [errorReservasProveedor, dispatch]);

  const cargarDatos = async () => {
    if (tipoUsuario === 'proveedor') {
      await cargarReservasProveedor();
    } else {
      await cargarEspacios();
    }
  };

  const onDragEndReservas = ({ data }) => {
    //console.log('Nuevo orden de reservas:', data);
  };

  const cargarEspacios = async () => {
    try {
      if (tipoUsuario === 'cliente') {
        const result = await dispatch(cargarEspaciosCliente());
      } else {
        const result = await dispatch(cargarTodosLosEspacios({ filtroTipo }));
      }
    } catch (error) {
      console.error('Error inesperado al cargar espacios:', error);
    }
  };

  const cargarReservasProveedor = async () => {
    try {
      const usuarioId = usuario?.id || usuario?._id;
      if (!usuarioId) {
        console.error('No se encontró ID del usuario proveedor');
        return;
      }

      const result = await dispatch(obtenerReservasPorProveedor(usuarioId));

      if (obtenerReservasPorProveedor.rejected.match(result)) {
        console.error('Error cargando reservas del proveedor:', result.payload);
      }
    } catch (error) {
      console.error('Error inesperado al cargar reservas del proveedor:', error);
    }
  };

  const handleCrearPublicacion = () => {
    navigation.navigate('CrearPublicacion', {
      onSuccess: () => {
        setTimeout(() => {
          cargarDatos();
        }, 500);
      }
    });
  };

  const handleFiltroChange = (nuevoFiltro) => {
    dispatch(setFiltroTipo(nuevoFiltro));
  };

  const handleSearchChange = (texto) => {
    dispatch(setTextoBusqueda(texto));
  };

  const onRefresh = async () => {
    dispatch(setRefreshing(true));
    await cargarDatos();
    dispatch(setRefreshing(false));
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleCloseMenu = () => {
    setMenuVisible(false);
  };

  const eliminarEspacio = (espacioId) => {
    Alert.alert(
      "Eliminar Espacio",
      "¿Estás seguro de que deseas eliminar este espacio?",
      [
        { text: "Cancelar", style: 'cancel' },
        { 
          text: "Eliminar", 
          style: 'destructive',
          onPress: () => {
            console.log('Eliminando espacio:', espacioId);
          }
        }
      ]
    );
  };

  const editarEspacio = (espacio) => {
    navigation.navigate('EditarEspacio', { espacio });
  };

  const eliminarReserva = (reservaId) => {
    Alert.alert(
      "Cancelar Reserva",
      "¿Estás seguro de que deseas cancelar esta reserva?",
      [
        { text: "No", style: 'cancel' },
        { 
          text: "Sí, cancelar", 
          style: 'destructive',
          onPress: () => {
            console.log('Cancelando reserva:', reservaId);
          }
        }
      ]
    );
  };

  const renderRightActionsEspacio = (espacio) => (
    <View style={styles.rightActions}>
      <RectButton
        style={[styles.actionButton, styles.editButton]}
        onPress={() => editarEspacio(espacio)}
      >
        <Ionicons name="pencil" size={20} color="#fff" />
        <Text style={styles.actionText}>Editar</Text>
      </RectButton>
      <RectButton
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => eliminarEspacio(espacio.id)}
      >
        <Ionicons name="trash" size={20} color="#fff" />
        <Text style={styles.actionText}>Eliminar</Text>
      </RectButton>
    </View>
  );

  const renderRightActionsReserva = (reserva) => (
    <View style={styles.rightActions}>
      <RectButton
        style={[styles.actionButton, styles.infoButton]}
        onPress={() => verDetalleReserva(reserva)}
      >
        <Ionicons name="information-circle" size={20} color="#fff" />
        <Text style={styles.actionText}>Info</Text>
      </RectButton>
      {reserva.estado === 'pendiente' && (
        <RectButton
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => eliminarReserva(reserva._id || reserva.id)}
        >
          <Ionicons name="close" size={20} color="#fff" />
          <Text style={styles.actionText}>Cancelar</Text>
        </RectButton>
      )}
    </View>
  );

  const verDetalleOficina = (espacio) => {
    if (!espacio || !espacio.datosCompletos) {
      Alert.alert('Error', 'No se pudieron cargar los datos del espacio');
      return;
    }

    const espacioId = espacio.id ||
      espacio.datosCompletos._id ||
      espacio.datosCompletos.id;

    if (!espacioId) {
      Alert.alert('Error', 'No se encontró el ID del espacio');
      return;
    }

    if (!espacio.tipo) {
      Alert.alert('Error', 'No se encontró el tipo del espacio');
      return;
    }

    const params = {
      oficina: {
        id: espacioId,
        nombre: espacio.nombre,
        tipo: espacio.tipo,
        direccion: espacio.direccion,
        datosCompletos: espacio.datosCompletos
      },
      espacio: espacio.datosCompletos
    };

    if (tipoUsuario === 'cliente') {
      let propietarioIdStr = null;

      if (espacio.datosCompletos.propietarioId) {
        if (typeof espacio.datosCompletos.propietarioId === 'object') {
          propietarioIdStr = espacio.datosCompletos.propietarioId._id || espacio.datosCompletos.propietarioId.$oid;
        } else {
          propietarioIdStr = espacio.datosCompletos.propietarioId;
        }
      }

      propietarioIdStr = propietarioIdStr?.toString();
      const userIdStr = usuario?.id?.toString() || usuario?._id?.toString();

      params.esPropia = propietarioIdStr && userIdStr && propietarioIdStr === userIdStr;
    } else {
      params.esPropia = false;
    }

    navigation.navigate('DetalleOficina', params);
  };

  const verDetalleReserva = (reserva) => {
    if (!reserva) {
      Alert.alert('Error', 'No se pudieron cargar los datos de la reserva');
      return;
    }

    navigation.navigate('DetalleReserva', {
      reserva: reserva,
      esProveedor: true
    });
  };

  const handleCrearServicio = () => {
    navigation.navigate('CrearServicio');
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
      console.error(error);
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
        return 'Ver detalles';
      default:
        return 'Ver detalles';
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'confirmada':
        return '#27ae60';
      case 'pendiente':
        return '#f39c12';
      case 'cancelada':
        return '#e74c3c';
      case 'completada':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ReservaProveedorCard = ({ reserva, drag, isActive }) => {
    if (!reserva) return null;

    const fechaInicio = new Date(reserva.fechaInicio);
    const fechaFin = new Date(reserva.fechaFin);

    const usuarioId = usuario?.id || usuario?._id;
    const serviciosDelProveedor = reserva.serviciosAdicionales?.filter(servicio => {
      const servicioProveedorId = typeof servicio.proveedorId === 'object'
        ? servicio.proveedorId._id || servicio.proveedorId.toString()
        : servicio.proveedorId?.toString();

      return servicioProveedorId === usuarioId?.toString();
    }) || [];

    const CardContent = (
      <View style={[
        styles.reservaCard,
        isActive && styles.activeCard,
        modoReordenar && styles.draggingCard
      ]}>
        {modoReordenar && (
          <TouchableOpacity 
            style={styles.dragHandle}
            onLongPress={drag}
          >
            <Ionicons name="reorder-three" size={24} color="#7f8c8d" />
          </TouchableOpacity>
        )}
        
        <View style={styles.reservaHeader}>
          <View style={styles.reservaInfo}>
            <Text style={styles.reservaTitulo}>
              {reserva.entidadReservada?.tipo === 'oficina' ? 'Oficina' :
                reserva.entidadReservada?.tipo === 'sala_reunion' ? 'Sala de reunión' :
                  reserva.entidadReservada?.tipo === 'escritorio_flexible' ? 'Escritorio' : 'Espacio'}
            </Text>
            <Text style={styles.reservaCliente}>
              Cliente: {reserva.clienteId?.nombre || 'Cliente'}
            </Text>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(reserva.estado) }]}>
            <Text style={styles.estadoText}>{reserva.estado}</Text>
          </View>
        </View>

        <View style={styles.reservaDetalles}>
          <View style={styles.fechaContainer}>
            <View style={styles.fechaItem}>
              <Ionicons name="calendar" size={16} color="#7f8c8d" />
              <Text style={styles.fechaText}>
                {formatearFecha(fechaInicio)} - {formatearFecha(fechaFin)}
              </Text>
            </View>
            <View style={styles.fechaItem}>
              <Ionicons name="time" size={16} color="#7f8c8d" />
              <Text style={styles.fechaText}>
                {formatearHora(fechaInicio)} - {formatearHora(fechaFin)}
              </Text>
            </View>
          </View>

          {serviciosDelProveedor.length > 0 && (
            <View style={styles.serviciosContainer}>
              <Text style={styles.serviciosLabel}>Tus servicios:</Text>
              {serviciosDelProveedor.map((servicio, index) => (
                <View key={index} style={styles.servicioItem}>
                  <Text style={styles.servicioNombre}>{servicio.nombre}</Text>
                  <Text style={styles.servicioPrecio}>${servicio.precio}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );

    if (modoReordenar) {
      return CardContent;
    }

    return (
      <Swipeable renderRightActions={() => renderRightActionsReserva(reserva)}>
        {CardContent}
      </Swipeable>
    );
  };

  const EspacioCard = ({ espacio }) => {
    if (!espacio || !espacio.datosCompletos) {
      return null;
    }

    let propietarioIdStr = null;

    if (espacio.datosCompletos.propietarioId) {
      if (typeof espacio.datosCompletos.propietarioId === 'object') {
        propietarioIdStr = espacio.datosCompletos.propietarioId._id || espacio.datosCompletos.propietarioId.$oid;
      } else {
        propietarioIdStr = espacio.datosCompletos.propietarioId;
      }
    }

    propietarioIdStr = propietarioIdStr?.toString();
    const userIdStr = usuario?.id?.toString() || usuario?._id?.toString();

    const esPropio = tipoUsuario === 'cliente' && propietarioIdStr && userIdStr && propietarioIdStr === userIdStr;

    const imagenesDisponibles = espacio.fotos || espacio.imagenes || [];

    const CardContent = (
      <View style={styles.card}>
        <View style={styles.cardImageContainer}>
          {Array.isArray(imagenesDisponibles) && imagenesDisponibles.length > 0 ? (
            <Image
              source={{ uri: imagenesDisponibles[0] }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cardImagePlaceholder, { backgroundColor: espacio.color }]}>
              <Ionicons name={tipos.find(t => t.id === espacio.tipo)?.icono || 'business'} size={40} color="white" />
              <Text style={styles.cardImageText}>{espacio.tipo}</Text>
            </View>
          )}

          {esPropio && (
            <View style={styles.propiaIndicator}>
              <Text style={styles.propiaText}>Tu espacio</Text>
            </View>
          )}

          {!espacio.disponible && (
            <View style={styles.noDisponibleIndicator}>
              <Text style={styles.noDisponibleText}>No disponible</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{espacio.nombre}</Text>
          <Text style={styles.cardDireccion}>{espacio.direccion}</Text>

          <View style={styles.cardInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="people" size={16} color="#7f8c8d" />
              <Text style={styles.infoText}>{espacio.capacidad} personas</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="pricetag" size={16} color="#27ae60" />
              <Text style={styles.infoText}>${espacio.precio}/día</Text>
            </View>
          </View>

          {Array.isArray(espacio.servicios) && espacio.servicios.length > 0 && (
            <View style={styles.servicesContainer}>
              <Text style={styles.servicesLabel}>Servicios</Text>
              <View style={styles.servicesIcons}>
                {espacio.servicios.slice(0, 4).map((service, index) => (
                  <View key={index} style={styles.serviceIcon}>
                    {renderServiceIcon(service)}
                  </View>
                ))}
                {espacio.servicios.length > 4 && (
                  <View style={styles.serviceIcon}>
                    <Text style={styles.moreServicesText}>+{espacio.servicios.length - 4}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.verButton,
              tipoUsuario === 'proveedor' && styles.verButtonProveedor,
              !espacio.disponible && styles.verButtonDisabled
            ]}
            onPress={() => verDetalleOficina(espacio)}
            activeOpacity={0.7}
            disabled={!espacio.disponible && tipoUsuario === 'usuario'}
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

    if (esPropio && tipoUsuario === 'cliente') {
      return (
        <Swipeable renderRightActions={() => renderRightActionsEspacio(espacio)}>
          {CardContent}
        </Swipeable>
      );
    }

    return CardContent;
  };

  const reservasFiltradas = reservasProveedor.filter(reserva => {
    if (!textoBusqueda) return true;

    const textoBusquedaLower = textoBusqueda.toLowerCase();
    const clienteNombre = reserva.clienteId?.nombre?.toLowerCase() || '';
    const entidadTipo = reserva.entidadReservada?.tipo?.toLowerCase() || '';
    const estado = reserva.estado?.toLowerCase() || '';

    return clienteNombre.includes(textoBusquedaLower) ||
      entidadTipo.includes(textoBusquedaLower) ||
      estado.includes(textoBusquedaLower);
  });

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
            tipoUsuario === 'proveedor' ? 'Mis reservas de servicios' : 'Reservar espacios'}
        </Text>
        <View style={styles.headerActions}>
          {tipoUsuario === 'proveedor' && (
            <TouchableOpacity
              style={[styles.reorderButton, modoReordenar && styles.reorderButtonActive]}
              onPress={() => setModoReordenar(!modoReordenar)}
            >
              <Ionicons 
                name={modoReordenar ? "checkmark" : "reorder-three"} 
                size={20} 
                color={modoReordenar ? "#fff" : "#4a90e2"} 
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notificaciones')}
          >
            <Ionicons name="notifications-outline" size={24} color="#4a90e2" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>
      {tipoUsuario === 'proveedor' && modoReordenar ? (
        <View style={styles.content}>
          <Text style={styles.reorderTitle}>Arrastra para reordenar tus reservas</Text>
          <DraggableFlatList
            data={reservasFiltradas.map((reserva, index) => ({
              ...reserva,
              key: reserva._id || reserva.id || index.toString()
            }))}
            onDragEnd={onDragEndReservas}
            keyExtractor={(item) => item.key}
            renderItem={({ item, drag, isActive }) => (
              <ReservaProveedorCard 
                reserva={item} 
                drag={drag} 
                isActive={isActive} 
              />
            )}
            contentContainerStyle={styles.draggableList}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing || loadingReservasProveedor} onRefresh={onRefresh} />
          }
        >
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={
                tipoUsuario === 'usuario' ? 'Buscar espacios...' :
                  tipoUsuario === 'cliente' ? 'Buscar en mis espacios...' :
                    'Buscar en mis reservas...'
              }
              placeholderTextColor="#999"
              value={textoBusqueda}
              onChangeText={handleSearchChange}
            />
          </View>

          {tipoUsuario === 'proveedor' && resumenProveedor && (
            <View style={styles.estadisticasContainer}>
              <Text style={styles.estadisticasTitle}>Resumen de servicios</Text>
              <View style={styles.estadisticasGrid}>
                <View style={styles.estadisticaItem}>
                  <Text style={styles.estadisticaNumero}>{resumenProveedor.totalReservas}</Text>
                  <Text style={styles.estadisticaLabel}>Total reservas</Text>
                </View>
                <View style={styles.estadisticaItem}>
                  <Text style={styles.estadisticaNumero}>{resumenProveedor.reservasConfirmadas}</Text>
                  <Text style={styles.estadisticaLabel}>Confirmadas</Text>
                </View>
              </View>
            </View>
          )}

          {(tipoUsuario === 'usuario' || tipoUsuario === 'administrador') && (
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
                  onPress={() => handleFiltroChange(tipo.id)}
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

          {tipoUsuario === 'proveedor' && (
            <TouchableOpacity
              style={styles.crearServicioButton}
              onPress={handleCrearServicio}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.crearServicioText}>Crear nuevo servicio</Text>
            </TouchableOpacity>
          )}

          {loading || loadingReservasProveedor ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4a90e2" />
              <Text style={styles.loadingText}>
                {tipoUsuario === 'proveedor' ? 'Cargando reservas...' : 'Cargando espacios...'}
              </Text>
            </View>
          ) : tipoUsuario === 'proveedor' ? (
            !Array.isArray(reservasFiltradas) || reservasFiltradas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={60} color="#bdc3c7" />
                <Text style={styles.emptyText}>
                  {textoBusqueda ? 'No se encontraron reservas con ese criterio' : 'No tienes reservas con servicios'}
                </Text>
                <Text style={styles.emptySubtext}>
                  Las reservas que incluyan tus servicios aparecerán aquí
                </Text>
              </View>
            ) : (
              <View style={styles.reservasContainer}>
                <Text style={styles.reservasCount}>
                  {reservasFiltradas.length} reserva{reservasFiltradas.length !== 1 ? 's' : ''}
                  {textoBusqueda ? ` encontrada${reservasFiltradas.length !== 1 ? 's' : ''}` : ' con tus servicios'}
                </Text>
                {reservasFiltradas.map((reserva) => (
                  <ReservaProveedorCard key={reserva._id || reserva.id || Math.random()} reserva={reserva} />
                ))}
              </View>
            )
          ) : (
            !Array.isArray(espaciosFiltrados) || espaciosFiltrados.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name={
                    tipoUsuario === 'cliente' ? 'business-outline' : 'search-outline'
                  }
                  size={60}
                  color="#bdc3c7"
                />
                <Text style={styles.emptyText}>
                  {tipoUsuario === 'cliente' ? 'No tienes espacios publicados' :
                    textoBusqueda ? 'No se encontraron espacios con ese criterio' : 'No hay espacios disponibles'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {tipoUsuario === 'cliente' ? 'Publica tu primer espacio y comienza a recibir reservas' :
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
              </View>
            ) : (
              <View style={styles.espaciosContainer}>
                <Text style={styles.espaciosCount}>
                  {espaciosFiltrados.length} espacio{espaciosFiltrados.length !== 1 ? 's' : ''}
                  {textoBusqueda ? ` encontrado${espaciosFiltrados.length !== 1 ? 's' : ''}` : ' disponible'}
                </Text>
                {espaciosFiltrados.map((espacio) => (
                  <EspacioCard key={espacio.id || Math.random()} espacio={espacio} />
                ))}
              </View>
            )
          )}
        </ScrollView>
      )}

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reorderButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4a90e2',
  },
  reorderButtonActive: {
    backgroundColor: '#4a90e2',
  },
  reorderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginVertical: 15,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
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
  draggableList: {
    paddingVertical: 10,
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
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  actionButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: '#f39c12',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  infoButton: {
    backgroundColor: '#3498db',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  activeCard: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    transform: [{ scale: 1.02 }],
  },
  draggingCard: {
    borderWidth: 2,
    borderColor: '#4a90e2',
    borderStyle: 'dashed',
  },
  dragHandle: {
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 8,
  },

  estadisticasContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  estadisticasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  estadisticasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  estadisticaItem: {
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
  },
  reservaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reservaInfo: {
    flex: 1,
  },
  reservaTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  reservaCliente: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  reservaDetalles: {
    marginBottom: 15,
  },
  fechaContainer: {
    marginBottom: 12,
  },
  fechaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fechaText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#5a6c7d',
  },
  serviciosContainer: {
    marginBottom: 12,
  },
  serviciosLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  servicioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginBottom: 4,
  },
  servicioNombre: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  servicioPrecio: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
    fontFamily: 'System',
  },
  espaciosContainer: {
    paddingBottom: 20,
  },
  espaciosCount: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
    fontFamily: 'System',
  },
  reservasContainer: {
    paddingBottom: 20,
  },
  reservasCount: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
    fontFamily: 'System',
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
    textAlign: 'center',
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
  noDisponibleIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  noDisponibleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreServicesText: {
    fontSize: 12,
    color: '#4a90e2',
    fontWeight: 'bold',
    fontFamily: 'System',
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
  verButtonDisabled: {
    backgroundColor: '#bdc3c7',
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
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});

export default Inicio;