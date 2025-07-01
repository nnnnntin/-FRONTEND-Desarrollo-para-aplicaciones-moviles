import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
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
import * as yup from 'yup';
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


const notificacionSchema = yup.object({
  id: yup
    .mixed()
    .required('ID de notificación es requerido')
    .test('id-valido', 'ID debe ser string o número', function(value) {
      return typeof value === 'string' || typeof value === 'number';
    }),
  
  titulo: yup
    .string()
    .required('El título es requerido')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres')
    .trim(),
  
  mensaje: yup
    .string()
    .required('El mensaje es requerido')
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(500, 'El mensaje no puede exceder 500 caracteres')
    .trim(),
  
  leida: yup
    .boolean()
    .required('El estado de lectura es requerido'),
  
  prioridad: yup
    .string()
    .test('prioridad-valida', 'Prioridad debe ser: baja, media o alta', function(value) {
      if (!value) return true; 
      const prioridadesValidas = ['baja', 'media', 'alta'];
      return prioridadesValidas.includes(value);
    })
    .default('media'),
  
  icono: yup
    .string()
    .required('El icono es requerido')
    .matches(/^[\w-]+$/, 'Formato de icono inválido'),
  
  color: yup
    .string()
    .required('El color es requerido')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Formato de color hexadecimal inválido'),
});


const notificacionesListSchema = yup.array().of(notificacionSchema);


const cargarNotificacionesParamsSchema = yup.object({
  usuarioId: yup
    .mixed()
    .required('ID de usuario es requerido')
    .test('usuario-id-valido', 'ID de usuario debe ser string o número', function(value) {
      return typeof value === 'string' || typeof value === 'number';
    }),
  
  token: yup
    .string()
    .required('Token de autenticación es requerido')
    .min(10, 'Token inválido'),
  
  opciones: yup.object({
    limit: yup
      .number()
      .positive('El límite debe ser positivo')
      .max(100, 'El límite máximo es 100')
      .default(50),
    
    leidas: yup
      .boolean()
      .default(false),
    
    desde: yup
      .date()
      .max(new Date(), 'La fecha no puede ser futura'),
    
    hasta: yup
      .date()
      .test('fecha-hasta-valida', 'La fecha hasta debe ser posterior a la fecha desde', function(value) {
        const { desde } = this.parent;
        if (!value || !desde) return true;
        return new Date(value) >= new Date(desde);
      })
      .max(new Date(), 'La fecha no puede ser futura'),
  }).default({}),
});
const Notificaciones = ({ navigation }) => {
  const dispatch = useDispatch();

  
  const { usuario, token } = useSelector(state => state.auth);
  const notificaciones = useSelector(selectNotificaciones);
  const totalNoLeidas = useSelector(selectTotalNoLeidas);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  
  const [validationErrors, setValidationErrors] = useState({});
  const [filtrosPagina, setFiltrosPagina] = useState({
    limit: 50,
    leidas: false
  });

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error]);

  
  const validarParametrosCarga = async (usuarioId, token, opciones = {}) => {
    try {
      await cargarNotificacionesParamsSchema.validate({
        usuarioId,
        token,
        opciones
      });
      return true;
    } catch (error) {
      console.error('Error de validación en parámetros:', error.message);
      setValidationErrors(prev => ({
        ...prev,
        parametros: error.message
      }));
      return false;
    }
  };

  
  const validarNotificacion = async (notificacion) => {
    try {
      await notificacionSchema.validate(notificacion);
      return true;
    } catch (error) {
      console.error('Error de validación en notificación:', error.message);
      return false;
    }
  };

  
  const validarListaNotificaciones = async (listaNotificaciones) => {
    try {
      await notificacionesListSchema.validate(listaNotificaciones);
      
      
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.lista;
        return newErrors;
      });
      
      return true;
    } catch (error) {
      console.error('Error de validación en lista:', error.message);
      setValidationErrors(prev => ({
        ...prev,
        lista: error.message
      }));
      return false;
    }
  };

  
  const obtenerNotificacionesValidas = () => {
    if (!notificaciones || notificaciones.length === 0) {
      return [];
    }

    return notificaciones.filter(notificacion => {
      
      const esValida = validarNotificacion(notificacion);
      if (!esValida) {
        console.warn('Notificación inválida filtrada:', notificacion);
      }
      return esValida;
    });
  };

  const cargarNotificaciones = async () => {
    if (!usuario || !token) {
      setValidationErrors(prev => ({
        ...prev,
        autenticacion: 'Usuario o token no disponible'
      }));
      return;
    }

    const usuarioId = usuario._id || usuario.id;
    if (!usuarioId) {
      setValidationErrors(prev => ({
        ...prev,
        usuario: 'ID de usuario no disponible'
      }));
      return;
    }

    
    const parametrosValidos = await validarParametrosCarga(usuarioId, token, filtrosPagina);
    if (!parametrosValidos) {
      Alert.alert('Error de validación', 'Los parámetros de carga no son válidos');
      return;
    }

    try {
      const resultado = await dispatch(cargarNotificacionesUsuario(usuarioId, token, filtrosPagina));
      
      
      if (resultado.payload) {
        await validarListaNotificaciones(resultado.payload);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setValidationErrors(prev => ({
        ...prev,
        carga: 'Error al cargar notificaciones'
      }));
    }
  };

  const manejarMarcarComoLeida = async (item) => {
    if (item.leida) return;

    
    const esValida = await validarNotificacion(item);
    if (!esValida) {
      Alert.alert('Error', 'La notificación no es válida');
      return;
    }

    
    if (!token) {
      Alert.alert('Error', 'No se encontró token de autenticación');
      return;
    }

    try {
      await dispatch(marcarNotificacionComoLeida(item.id, token));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
      Alert.alert('Error', 'No se pudo marcar la notificación como leída');
    }
  };

  const manejarEliminarNotificacion = async (notificacionId) => {
    
    try {
      await yup.oneOf ([yup.string(), yup.number()])
        .required('ID de notificación es requerido')
        .validate(notificacionId);
    } catch (error) {
      Alert.alert('Error', 'ID de notificación inválido');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'No se encontró token de autenticación');
      return;
    }

    try {
      await dispatch(eliminarNotificacionPorId(notificacionId, token));
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      Alert.alert('Error', 'No se pudo eliminar la notificación');
    }
  };

  const manejarMarcarTodasComoLeidas = async () => {
    if (totalNoLeidas === 0) return;

    const usuarioId = usuario._id || usuario.id;
    if (!usuarioId) {
      Alert.alert('Error', 'ID de usuario no disponible');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'No se encontró token de autenticación');
      return;
    }

    
    const parametrosValidos = await validarParametrosCarga(usuarioId, token);
    if (!parametrosValidos) {
      Alert.alert('Error', 'Parámetros inválidos para marcar todas como leídas');
      return;
    }

    try {
      await dispatch(marcarTodasNotificacionesComoLeidas(usuarioId, token));
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      Alert.alert('Error', 'No se pudieron marcar todas como leídas');
    }
  };

  const onRefresh = async () => {
    await cargarNotificaciones();
  };

  const handleGoBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  
  const actualizarFiltros = async (nuevosFiltros) => {
    try {
      await cargarNotificacionesParamsSchema.fields.opciones.validate(nuevosFiltros);
      setFiltrosPagina(prev => ({ ...prev, ...nuevosFiltros }));
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.filtros;
        return newErrors;
      });
    } catch (error) {
      setValidationErrors(prev => ({
        ...prev,
        filtros: error.message
      }));
      Alert.alert('Error', 'Filtros inválidos: ' + error.message);
    }
  };

  const renderNotificacion = ({ item }) => {
    
    if (!validarNotificacion(item)) {
      return null;
    }

    return (
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
            <Text style={styles.tituloNotificacion} numberOfLines={2}>
              {item.titulo}
            </Text>
            {!item.leida && <View style={styles.indicadorNoLeido} />}
          </View>
          <Text style={styles.mensajeNotificacion} numberOfLines={3}>
            {item.mensaje}
          </Text>
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
  };

  
  const ErrorValidacion = ({ error, style }) => {
    if (!error) return null;
    return (
      <View style={[styles.errorContainer, style]}>
        <Ionicons name="warning" size={16} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  };

  
  const notificacionesValidas = obtenerNotificacionesValidas();

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

      {/* Mostrar errores de validación si los hay */}
      <ErrorValidacion error={validationErrors.autenticacion} />
      <ErrorValidacion error={validationErrors.usuario} />
      <ErrorValidacion error={validationErrors.parametros} />
      <ErrorValidacion error={validationErrors.lista} />
      <ErrorValidacion error={validationErrors.filtros} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      ) : notificacionesValidas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>No tienes notificaciones</Text>
          <Text style={styles.emptySubtext}>
            Aquí aparecerán tus notificaciones cuando las recibas
          </Text>
          {Object.keys(validationErrors).length > 0 && (
            <Text style={styles.emptySubtext}>
              Algunas notificaciones fueron filtradas por errores de validación
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={notificacionesValidas}
          renderItem={renderNotificacion}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
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
  
  
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffeaa7',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'System',
  },
});

export default Notificaciones;