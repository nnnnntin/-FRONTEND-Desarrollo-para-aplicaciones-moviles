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
import * as Yup from 'yup';
import {
  actualizarServicioAdicional,
  eliminarServicioAdicional,
  obtenerServiciosPorProveedor,
  toggleServicioAdicional
} from '../store/slices/proveedoresSlice';

const servicioEditSchema = Yup.object({
  nombre: Yup.string()
    .required('El nombre del servicio es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  descripcion: Yup.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim(),
  precio: Yup.number()
    .required('El precio es obligatorio')
    .positive('El precio debe ser un número positivo')
    .max(999999, 'El precio no puede exceder $999,999')
    .typeError('El precio debe ser un número válido'),
  unidadPrecio: Yup.string()
    .test('unidad-precio-valida', 'Unidad de precio no válida', function (value) {
      const unidadesValidas = ['por_uso', 'por_hora', 'por_persona', 'por_dia'];
      return unidadesValidas.includes(value);
    })
    .required('La unidad de precio es obligatoria'),
  tiempoAnticipacion: Yup.number()
    .min(0, 'El tiempo de anticipación debe ser mayor o igual a 0')
    .max(8760, 'El tiempo de anticipación no puede exceder 8760 horas (1 año)')
    .integer('El tiempo de anticipación debe ser un número entero')
    .typeError('El tiempo de anticipación debe ser un número válido'),
  requiereAprobacion: Yup.boolean()
});

const servicioSchema = Yup.object({
  _id: Yup.string().required('ID del servicio es requerido'),
  nombre: Yup.string().required('Nombre del servicio es requerido'),
  descripcion: Yup.string(),
  tipo: Yup.string().required('Tipo de servicio es requerido'),
  precio: Yup.number().positive('El precio debe ser positivo').required('Precio es requerido'),
  unidadPrecio: Yup.string()
    .test('unidad-precio-valida', 'Unidad de precio no válida', function (value) {
      if (!value) return true;
      const unidadesValidas = ['por_uso', 'por_hora', 'por_persona', 'por_dia'];
      return unidadesValidas.includes(value);
    }),
  activo: Yup.boolean().required('Estado activo es requerido'),
  calificacion: Yup.number().min(0).max(5),
  trabajosCompletados: Yup.number().min(0),
  trabajosPendientes: Yup.number().min(0),
  solicitudesPendientes: Yup.number().min(0),
  tiempoAnticipacion: Yup.number().min(0),
  requiereAprobacion: Yup.boolean()
});

const estadisticasSchema = Yup.object({
  activos: Yup.number().min(0).required(),
  pausados: Yup.number().min(0).required(),
  totalTrabajos: Yup.number().min(0).required(),
  totalSolicitudes: Yup.number().min(0).required()
});

const ServiciosProveedor = ({ navigation }) => {
  const dispatch = useDispatch();

  const { usuario } = useSelector(state => state.auth);
  const { serviciosProveedor, loading, error } = useSelector(state => state.proveedores);

  const [tabActiva, setTabActiva] = useState('activos');
  const [modalVisible, setModalVisible] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({});
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});

  const categorias = {
    'catering': { color: '#e74c3c', icono: 'restaurant' },
    'limpieza': { color: '#3498db', icono: 'sparkles' },
    'recepcion': { color: '#9b59b6', icono: 'people' },
    'parking': { color: '#2ecc71', icono: 'car' },
    'impresion': { color: '#f39c12', icono: 'print' },
    'otro': { color: '#95a5a6', icono: 'ellipse' }
  };

  const validarServicios = (servicios) => {
    try {
      if (!Array.isArray(servicios)) {
        return [];
      }

      return servicios.filter(servicio => {
        try {
          servicioSchema.validateSync(servicio);
          return true;
        } catch (error) {
          return false;
        }
      });
    } catch (error) {
      return [];
    }
  };

  const validarEstadisticas = (stats) => {
    try {
      estadisticasSchema.validateSync(stats);
      return stats;
    } catch (error) {
      return { activos: 0, pausados: 0, totalTrabajos: 0, totalSolicitudes: 0 };
    }
  };

  const validarFormulario = async (datos) => {
    try {
      await servicioEditSchema.validate(datos, { abortEarly: false });
      setErroresValidacion({});
      return true;
    } catch (error) {
      const errores = {};
      if (error.inner) {
        error.inner.forEach(err => {
          errores[err.path] = err.message;
        });
      } else {
        errores.general = error.message;
      }
      setErroresValidacion(errores);
      return false;
    }
  };

  useEffect(() => {
    if (usuario?.id) {
      cargarServicios();
    }
  }, [usuario?.id]);

  const cargarServicios = async () => {
    if (!usuario?.id) {
      return;
    }

    try {
      setLoadingLocal(true);

      const result = await dispatch(obtenerServiciosPorProveedor(usuario.id));

      if (obtenerServiciosPorProveedor.rejected.match(result)) {
        Alert.alert('Error', result.payload || 'Error al cargar servicios');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión al cargar servicios');
    } finally {
      setLoadingLocal(false);
    }
  };

  const onRefresh = async () => {
    await cargarServicios();
  };

  const handleEditarServicio = (servicio) => {
    try {

      servicioSchema.validateSync(servicio);

      setServicioSeleccionado(servicio);
      setFormData({
        nombre: servicio.nombre || '',
        descripcion: servicio.descripcion || '',
        precio: servicio.precio?.toString() || '',
        unidadPrecio: servicio.unidadPrecio || 'por_uso',
        tiempoAnticipacion: servicio.tiempoAnticipacion?.toString() || '',
        requiereAprobacion: servicio.requiereAprobacion || false
      });
      setModoEdicion(true);
      setModalVisible(true);
      setErroresValidacion({});
    } catch (error) {
      Alert.alert('Error', 'Datos del servicio inválidos: ' + error.message);
    }
  };

  const handleVerDetalles = (servicio) => {
    try {

      servicioSchema.validateSync(servicio);

      setServicioSeleccionado(servicio);
      setModoEdicion(false);
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Datos del servicio inválidos: ' + error.message);
    }
  };

  const handleToggleEstado = async (servicioId, estadoActual) => {
    try {

      if (!servicioId || typeof servicioId !== 'string') {
        throw new Error('ID de servicio inválido');
      }

      const nuevoEstado = !estadoActual;
      const result = await dispatch(toggleServicioAdicional({
        id: servicioId,
        activo: nuevoEstado
      }));

      if (toggleServicioAdicional.fulfilled.match(result)) {
        await cargarServicios();
        Alert.alert('Éxito', `Servicio ${nuevoEstado ? 'activado' : 'pausado'} correctamente`);
      } else {
        Alert.alert('Error', result.payload || 'No se pudo cambiar el estado del servicio');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un error al cambiar el estado: ' + error.message);
    }
  };

  const handleEliminarServicio = (servicioId) => {
    try {

      if (!servicioId || typeof servicioId !== 'string') {
        throw new Error('ID de servicio inválido');
      }

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

                if (eliminarServicioAdicional.fulfilled.match(result)) {
                  await cargarServicios();
                  Alert.alert('Éxito', 'Servicio eliminado correctamente');
                } else {
                  Alert.alert('Error', result.payload || 'No se pudo eliminar el servicio');
                }
              } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Ocurrió un error al eliminar el servicio');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'ID de servicio inválido: ' + error.message);
    }
  };

  const handleGuardarEdicion = async () => {
    try {

      const esValido = await validarFormulario(formData);

      if (!esValido) {

        const primerError = Object.values(erroresValidacion)[0];
        Alert.alert('Error de validación', primerError);
        return;
      }

      const servicioActualizado = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion?.trim() || '',
        precio: parseFloat(formData.precio),
        unidadPrecio: formData.unidadPrecio,
        tiempoAnticipacion: formData.tiempoAnticipacion ? parseInt(formData.tiempoAnticipacion) : 0,
        requiereAprobacion: formData.requiereAprobacion
      };

      await servicioEditSchema.validate(servicioActualizado);

      const result = await dispatch(actualizarServicioAdicional({
        id: servicioSeleccionado._id,
        datos: servicioActualizado
      }));

      if (actualizarServicioAdicional.fulfilled.match(result)) {
        setModalVisible(false);
        await cargarServicios();
        Alert.alert('Éxito', 'Servicio actualizado correctamente');
        setErroresValidacion({});
      } else {
        Alert.alert('Error', result.payload || 'No se pudo actualizar el servicio');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Error en la validación: ' + error.message);
    }
  };

  const getServiciosFiltrados = () => {
    try {
      const serviciosValidados = validarServicios(serviciosProveedor || []);

      switch (tabActiva) {
        case 'activos':
          return serviciosValidados.filter(s => s.activo === true);
        case 'pausados':
          return serviciosValidados.filter(s => s.activo === false);
        case 'todos':
        default:
          return serviciosValidados;
      }
    } catch (error) {
      return [];
    }
  };

  const getEstadisticas = () => {
    try {
      const serviciosValidados = validarServicios(serviciosProveedor || []);

      const activos = serviciosValidados.filter(s => s.activo === true).length;
      const pausados = serviciosValidados.filter(s => s.activo === false).length;
      const totalTrabajos = serviciosValidados.reduce((sum, s) => sum + (s.trabajosCompletados || 0), 0);
      const totalSolicitudes = serviciosValidados.reduce((sum, s) => sum + (s.solicitudesPendientes || 0), 0);

      const stats = { activos, pausados, totalTrabajos, totalSolicitudes };
      return validarEstadisticas(stats);
    } catch (error) {
      return validarEstadisticas({ activos: 0, pausados: 0, totalTrabajos: 0, totalSolicitudes: 0 });
    }
  };

  const estadisticas = getEstadisticas();
  const serviciosFiltrados = getServiciosFiltrados();
  const isLoading = loading || loadingLocal;

  const renderServicio = ({ item: servicio }) => {
    try {

      servicioSchema.validateSync(servicio);

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
              <Text style={styles.detalleText}>
                ${servicio.precio} {servicio.unidadPrecio && `(${servicio.unidadPrecio.replace('_', ' ')})`}
              </Text>
            </View>
            {servicio.tiempoAnticipacion && (
              <View style={styles.detalleItem}>
                <Ionicons name="clock" size={16} color="#7f8c8d" />
                <Text style={styles.detalleText}>{servicio.tiempoAnticipacion}h anticipación</Text>
              </View>
            )}
            {servicio.requiereAprobacion && (
              <View style={styles.detalleItem}>
                <Ionicons name="checkmark-circle" size={16} color="#e67e22" />
                <Text style={styles.detalleText}>Requiere aprobación</Text>
              </View>
            )}
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
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleEliminarServicio(servicio._id)}
            >
              <Ionicons name="trash-outline" size={16} color="#e74c3c" />
              <Text style={[styles.actionButtonText, { color: '#e74c3c' }]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

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
          <Text style={styles.proveedorNombre}>
            {usuario?.username || 'Tu nombre'}
          </Text>
          <Text style={styles.proveedorTipo}>Proveedor de servicios</Text>
          <Text style={styles.proveedorId}>
            ID: {usuario?.id}
          </Text>
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

      {isLoading ? (
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
          refreshing={isLoading}
          onRefresh={onRefresh}
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
                onPress={() => {
                  setModalVisible(false);
                  setErroresValidacion({});
                }}
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
                          style={[
                            styles.input,
                            erroresValidacion.nombre && styles.inputError
                          ]}
                          value={formData.nombre}
                          onChangeText={(text) => {
                            setFormData({ ...formData, nombre: text });
                            if (erroresValidacion.nombre) {
                              setErroresValidacion({ ...erroresValidacion, nombre: null });
                            }
                          }}
                          placeholder="Ej: Limpieza de oficinas"
                        />
                        {erroresValidacion.nombre && (
                          <Text style={styles.errorText}>{erroresValidacion.nombre}</Text>
                        )}
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Descripción</Text>
                        <TextInput
                          style={[
                            styles.textArea,
                            erroresValidacion.descripcion && styles.inputError
                          ]}
                          value={formData.descripcion}
                          onChangeText={(text) => {
                            setFormData({ ...formData, descripcion: text });
                            if (erroresValidacion.descripcion) {
                              setErroresValidacion({ ...erroresValidacion, descripcion: null });
                            }
                          }}
                          multiline
                          numberOfLines={4}
                          placeholder="Describe tu servicio en detalle..."
                        />
                        {erroresValidacion.descripcion && (
                          <Text style={styles.errorText}>{erroresValidacion.descripcion}</Text>
                        )}
                      </View>

                      <View style={styles.rowInputs}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                          <Text style={styles.inputLabel}>Precio (USD)</Text>
                          <TextInput
                            style={[
                              styles.input,
                              erroresValidacion.precio && styles.inputError
                            ]}
                            value={formData.precio}
                            onChangeText={(text) => {
                              setFormData({ ...formData, precio: text });
                              if (erroresValidacion.precio) {
                                setErroresValidacion({ ...erroresValidacion, precio: null });
                              }
                            }}
                            keyboardType="numeric"
                            placeholder="0.00"
                          />
                          {erroresValidacion.precio && (
                            <Text style={styles.errorText}>{erroresValidacion.precio}</Text>
                          )}
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                          <Text style={styles.inputLabel}>Tiempo anticipación (horas)</Text>
                          <TextInput
                            style={[
                              styles.input,
                              erroresValidacion.tiempoAnticipacion && styles.inputError
                            ]}
                            value={formData.tiempoAnticipacion}
                            onChangeText={(text) => {
                              setFormData({ ...formData, tiempoAnticipacion: text });
                              if (erroresValidacion.tiempoAnticipacion) {
                                setErroresValidacion({ ...erroresValidacion, tiempoAnticipacion: null });
                              }
                            }}
                            keyboardType="numeric"
                            placeholder="24"
                          />
                          {erroresValidacion.tiempoAnticipacion && (
                            <Text style={styles.errorText}>{erroresValidacion.tiempoAnticipacion}</Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Unidad de precio</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unidadContainer}>
                          {['por_uso', 'por_hora', 'por_persona', 'por_dia'].map((unidad) => (
                            <TouchableOpacity
                              key={unidad}
                              style={[
                                styles.unidadButton,
                                formData.unidadPrecio === unidad && styles.unidadButtonActive
                              ]}
                              onPress={() => setFormData({ ...formData, unidadPrecio: unidad })}
                            >
                              <Text style={[
                                styles.unidadButtonText,
                                formData.unidadPrecio === unidad && styles.unidadButtonTextActive
                              ]}>
                                {unidad.replace('_', ' ')}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                        {erroresValidacion.unidadPrecio && (
                          <Text style={styles.errorText}>{erroresValidacion.unidadPrecio}</Text>
                        )}
                      </View>

                      <View style={styles.checkboxContainer}>
                        <TouchableOpacity
                          style={styles.checkbox}
                          onPress={() => setFormData({ ...formData, requiereAprobacion: !formData.requiereAprobacion })}
                        >
                          <Ionicons
                            name={formData.requiereAprobacion ? 'checkbox' : 'square-outline'}
                            size={24}
                            color={formData.requiereAprobacion ? '#27ae60' : '#7f8c8d'}
                          />
                          <Text style={styles.checkboxText}>Requiere aprobación previa</Text>
                        </TouchableOpacity>
                        {erroresValidacion.requiereAprobacion && (
                          <Text style={styles.errorText}>{erroresValidacion.requiereAprobacion}</Text>
                        )}
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
                          <Text style={styles.duracionText}>
                            {servicioSeleccionado.unidadPrecio?.replace('_', ' ') || 'por uso'}
                          </Text>
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

                      <View style={styles.detallesAdicionales}>
                        {servicioSeleccionado.tiempoAnticipacion && (
                          <View style={styles.detalleAdicional}>
                            <Ionicons name="clock" size={16} color="#7f8c8d" />
                            <Text style={styles.detalleAdicionalText}>
                              Requiere {servicioSeleccionado.tiempoAnticipacion} horas de anticipación
                            </Text>
                          </View>
                        )}
                        {servicioSeleccionado.requiereAprobacion && (
                          <View style={styles.detalleAdicional}>
                            <Ionicons name="checkmark-circle" size={16} color="#e67e22" />
                            <Text style={styles.detalleAdicionalText}>
                              Requiere aprobación previa
                            </Text>
                          </View>
                        )}
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
                    onPress={() => {
                      setModalVisible(false);
                      setErroresValidacion({});
                    }}
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
  proveedorId: {
    fontSize: 12,
    color: '#95a5a6',
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
  unidadContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  unidadButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  unidadButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  unidadButtonText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  unidadButtonTextActive: {
    color: '#fff',
  },
  checkboxContainer: {
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxText: {
    fontSize: 14,
    color: '#2c3e50',
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
  detallesAdicionales: {
    marginBottom: 20,
  },
  detalleAdicional: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detalleAdicionalText: {
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
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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