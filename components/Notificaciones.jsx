import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  cargarNotificacionesUsuario,
  clearError,
  eliminarNotificacionPorId,
  marcarNotificacionComoLeida,
  marcarTodasNotificacionesComoLeidas,
  selectError,
  selectIsLoading,
  selectNotificaciones,
  selectTotalNoLeidas
} from '../store/slices/notificacionesSlice';

const Notificaciones = ({ navigation }) => {
  const dispatch = useDispatch();


  const { usuario, token } = useSelector(state => state.auth);
  const notificaciones = useSelector(selectNotificaciones);
  const totalNoLeidas = useSelector(selectTotalNoLeidas);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error]);

  const cargarNotificaciones = async () => {
    if (!usuario || !token) {
      console.warn('🟡 No hay usuario logueado o token disponible');
      return;
    }

    const usuarioId = usuario._id || usuario.id;
    if (!usuarioId) {
      console.warn('🟡 No se pudo obtener el ID del usuario');
      return;
    }

    console.log('🔵 Cargando notificaciones para usuario:', usuarioId);
    dispatch(cargarNotificacionesUsuario(usuarioId, token, {
      limit: 50,
      leidas: false
    }));
  };

  const manejarMarcarComoLeida = (notificacion) => {
    if (notificacion.leida) return;

    console.log('🔵 Marcando notificación como leída:', notificacion.id);
    dispatch(marcarNotificacionComoLeida(notificacion.id, token));
  };

  const manejarEliminarNotificacion = async (notificacionId) => {
    try {
      console.log('🔵 Eliminando notificación:', notificacionId);
      await dispatch(eliminarNotificacionPorId(notificacionId, token));
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la notificación');
    }
  };

  const manejarMarcarTodasComoLeidas = async () => {
    if (totalNoLeidas === 0) return;

    try {
      const usuarioId = usuario._id || usuario.id;
      if (!usuarioId) {
        console.warn('🟡 No se pudo obtener el ID del usuario');
        return;
      }

      console.log('🔵 Marcando todas las notificaciones como leídas');
      await dispatch(marcarTodasNotificacionesComoLeidas(usuarioId, token));
    } catch (error) {
      Alert.alert('Error', 'No se pudieron marcar todas como leídas');
    }
  };

  const onRefresh = async () => {
    await cargarNotificaciones();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };


  useEffect(() => {
    return () => {


    };
  }, []);

  const renderNotificacion = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificacionItem,
        !item.leida && styles.notificacionNoLeida,
        item.prioridad === 'alta' && styles.notificacionPrioridadAlta
      ]}
      onPress={() => manejarMarcarComoLeida(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconoContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icono} size={24} color={item.color} />
      </View>

      <View style={styles.contenidoNotificacion}>
        <View style={styles.headerNotificacion}>
          <Text style={styles.tituloNotificacion}>{item.titulo}</Text>
          {!item.leida && <View style={styles.indicadorNoLeido} />}
        </View>
        <Text style={styles.mensajeNotificacion}>{item.mensaje}</Text>
        <Text style={styles.fechaNotificacion}>{item.fecha}</Text>
      </View>

      <TouchableOpacity
        style={styles.botonEliminar}
        onPress={() => manejarEliminarNotificacion(item.id)}
      >
        <Ionicons name="close" size={20} color="#7f8c8d" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
          Notificaciones
          {totalNoLeidas > 0 && (
            <Text style={styles.contadorNoLeidas}> ({totalNoLeidas})</Text>
          )}
        </Text>
        {totalNoLeidas > 0 && (
          <TouchableOpacity
            onPress={manejarMarcarTodasComoLeidas}
            style={styles.marcarTodasButton}
          >
            <Ionicons name="checkmark-done" size={20} color="#4a90e2" />
          </TouchableOpacity>
        )}
        {totalNoLeidas === 0 && <View style={styles.placeholder} />}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      ) : notificaciones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>No tienes notificaciones</Text>
          <Text style={styles.emptySubtext}>
            Aquí aparecerán tus notificaciones cuando las recibas
          </Text>
        </View>
      ) : (
        <FlatList
          data={notificaciones}
          renderItem={renderNotificacion}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
        />
      )}
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
    fontFamily: 'System',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  contadorNoLeidas: {
    color: '#4a90e2',
    fontSize: 16,
  },
  marcarTodasButton: {
    padding: 5,
  },
  placeholder: {
    width: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
    fontFamily: 'System',
  },
  listContainer: {
    padding: 20,
  },
  notificacionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  notificacionNoLeida: {
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  notificacionPrioridadAlta: {
    borderLeftColor: '#e74c3c',
  },
  iconoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contenidoNotificacion: {
    flex: 1,
  },
  headerNotificacion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tituloNotificacion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
    flex: 1,
  },
  indicadorNoLeido: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4a90e2',
    marginLeft: 8,
  },
  mensajeNotificacion: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 20,
    marginBottom: 4,
    fontFamily: 'System',
  },
  fechaNotificacion: {
    fontSize: 12,
    color: '#bdc3c7',
    fontFamily: 'System',
  },
  botonEliminar: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
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
});

export default Notificaciones;