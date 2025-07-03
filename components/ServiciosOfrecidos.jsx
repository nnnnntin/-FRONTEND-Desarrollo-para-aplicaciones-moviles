import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import {
  actualizarProveedor,
  eliminarProveedor,
  obtenerProveedores
} from '../store/slices/proveedoresSlice';

const oficinaSchema = yup.object({
  id: yup
    .mixed()
    .required('ID de oficina es requerido')
    .test('id-valido', 'ID debe ser string o número', function (value) {
      return typeof value === 'string' || typeof value === 'number';
    }),

  nombre: yup
    .string()
    .required('Nombre de oficina es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
});

const usuarioSchema = yup.object({
  id: yup
    .mixed()
    .nullable()
    .test('id-valido', 'ID debe ser string o número', function (value) {
      if (value === null || value === undefined) return true;
      return typeof value === 'string' || typeof value === 'number';
    }),

  _id: yup
    .mixed()
    .nullable()
    .test('id-valido', 'ID debe ser string o número', function (value) {
      if (value === null || value === undefined) return true;
      return typeof value === 'string' || typeof value === 'number';
    }),
}).test('tiene-id', 'Usuario debe tener ID', function (value) {
  return value?.id || value?._id;
});

const proveedorExternoSchema = yup.object({
  id: yup
    .mixed()
    .required('ID de proveedor es requerido')
    .test('id-valido', 'ID debe ser string o número', function (value) {
      return typeof value === 'string' || typeof value === 'number';
    }),

  nombre: yup
    .string()
    .required('Nombre del proveedor es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),

  proveedor: yup
    .string()
    .when('nombre', {
      is: (nombre) => !nombre,
      then: (schema) => schema.required('Proveedor o nombre es requerido'),
      otherwise: (schema) => schema.nullable(),
    }),

  servicio: yup
    .string()
    .min(3, 'El servicio debe tener al menos 3 caracteres')
    .max(100, 'El servicio no puede exceder 100 caracteres')
    .nullable(),

  servicios: yup
    .array()
    .of(yup.object({
      nombre: yup.string().required('Nombre del servicio es requerido'),
      id: yup.mixed().nullable().test('id-valido', 'ID debe ser string o número', function (value) {
        if (value === null || value === undefined) return true;
        return typeof value === 'string' || typeof value === 'number';
      }),
    }))
    .nullable(),

  descripcion: yup
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .nullable(),

  categoria: yup
    .string()
    .test('categoria-valida', 'Categoría no válida', function (value) {
      if (!value) return true;
      const categoriasValidas = [
        'limpieza', 'tecnologia', 'catering', 'seguridad',
        'transporte', 'entretenimiento', 'mantenimiento'
      ];
      return categoriasValidas.includes(value);
    })
    .nullable(),

  tipo: yup
    .string()
    .test('tipo-valido', 'Tipo no válido', function (value) {
      if (!value) return true;
      const tiposValidos = [
        'limpieza', 'tecnologia', 'catering', 'seguridad',
        'transporte', 'entretenimiento', 'mantenimiento'
      ];
      return tiposValidos.includes(value);
    })
    .nullable(),

  calificacion: yup
    .number()
    .min(0, 'La calificación no puede ser negativa')
    .max(5, 'La calificación no puede exceder 5')
    .nullable(),

  rating: yup
    .number()
    .min(0, 'El rating no puede ser negativo')
    .max(5, 'El rating no puede exceder 5')
    .nullable(),

  completados: yup
    .number()
    .min(0, 'Los trabajos completados no pueden ser negativos')
    .integer('Debe ser un número entero')
    .nullable(),

  trabajosCompletados: yup
    .number()
    .min(0, 'Los trabajos completados no pueden ser negativos')
    .integer('Debe ser un número entero')
    .nullable(),

  precio: yup
    .number()
    .min(0, 'El precio no puede ser negativo')
    .max(100000, 'Precio excesivo')
    .nullable(),

  precioBase: yup
    .number()
    .min(0, 'El precio base no puede ser negativo')
    .max(100000, 'Precio base excesivo')
    .nullable(),

  activo: yup
    .boolean()
    .required('Estado activo es requerido'),

  usuarioId: yup
    .mixed()
    .nullable()
    .test('id-valido', 'ID debe ser string o número', function (value) {
      if (value === null || value === undefined) return true;
      return typeof value === 'string' || typeof value === 'number';
    }),

  propietarioId: yup
    .mixed()
    .nullable()
    .test('id-valido', 'ID debe ser string o número', function (value) {
      if (value === null || value === undefined) return true;
      return typeof value === 'string' || typeof value === 'number';
    }),
});

const proveedoresListSchema = yup.array().of(proveedorExternoSchema);

const categoriaSchema = yup.object({
  id: yup
    .string()
    .required('ID de categoría es requerido')
    .test('categoria-id-valida', 'Categoría ID no válida', function (value) {
      const categoriasValidas = ['todos', 'limpieza', 'tecnologia', 'catering', 'seguridad', 'transporte', 'entretenimiento'];
      return categoriasValidas.includes(value);
    }),

  nombre: yup
    .string()
    .required('Nombre de categoría es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),

  icono: yup
    .string()
    .required('Icono de categoría es requerido')
    .matches(/^[a-z-]+$/, 'Formato de icono inválido'),
});

const filtroSchema = yup.object().shape({
  categoria: yup
    .string()
    .oneOf(['todos', 'limpieza', 'tecnologia', 'catering', 'seguridad', 'transporte', 'entretenimiento'])
    .default('todos'),

  activo: yup
    .boolean()
    .nullable(),

  calificacionMinima: yup
    .number()
    .min(0)
    .max(5)
    .nullable(),
});

const ServiciosOfrecidos = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { oficina } = route.params;

  const { proveedores, loading, error } = useSelector(state => state.proveedores);
  const { user } = useSelector(state => state.auth);

  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [validationErrors, setValidationErrors] = useState({});

  const proveedoresExternos = proveedores.filter(p =>
    p.usuarioId === user?.id || p.propietarioId === user?.id
  );

  const categorias = [
    { id: 'todos', nombre: 'Todos', icono: 'apps' },
    { id: 'limpieza', nombre: 'Limpieza', icono: 'sparkles' },
    { id: 'tecnologia', nombre: 'Tecnología', icono: 'laptop' },
    { id: 'catering', nombre: 'Catering', icono: 'restaurant' },
    { id: 'seguridad', nombre: 'Seguridad', icono: 'shield-checkmark' },
    { id: 'transporte', nombre: 'Transporte', icono: 'car' },
    { id: 'entretenimiento', nombre: 'Entretenimiento', icono: 'musical-notes' }
  ];

  useEffect(() => {

    validarDatosIniciales();
    dispatch(obtenerProveedores());
  }, [dispatch]);

  useEffect(() => {

    validarProveedoresExternos();
  }, [proveedores, user]);

  const validarDatosIniciales = async () => {
    try {

      await oficinaSchema.validate(oficina);

      await usuarioSchema.validate(user);

      await yup.array().of(categoriaSchema).validate(categorias);

      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.oficina;
        delete newErrors.usuario;
        delete newErrors.categorias;
        return newErrors;
      });
    } catch (error) {
      setValidationErrors(prev => ({
        ...prev,
        [error.path]: error.message
      }));
    }
  };

  const validarProveedoresExternos = async () => {
    if (proveedoresExternos.length === 0) return;

    try {
      await proveedoresListSchema.validate(proveedoresExternos);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.proveedores;
        return newErrors;
      });
    } catch (error) {
      setValidationErrors(prev => ({
        ...prev,
        proveedores: error.message
      }));
    }
  };

  const validarProveedor = async (proveedor) => {
    try {
      await proveedorExternoSchema.validate(proveedor);
      return { valido: true, errores: null };
    } catch (error) {
      return { valido: false, errores: error.message };
    }
  };

  const validarFiltroCategoria = async (categoria) => {
    try {
      await filtroSchema.fields.categoria.validate(categoria);
      return true;
    } catch (error) {
      setValidationErrors(prev => ({
        ...prev,
        filtro: error.message
      }));
      return false;
    }
  };

  const obtenerProveedoresValidos = () => {
    return proveedoresExternos.filter(async (proveedor) => {
      const validacion = await validarProveedor(proveedor);
      return validacion.valido;
    });
  };

  const obtenerDatosProveedor = (proveedor) => {
    try {
      return {
        id: proveedor.id,
        nombre: proveedor.nombre || proveedor.proveedor || 'Proveedor sin nombre',
        servicio: proveedor.servicio ||
          proveedor.servicios?.[0]?.nombre ||
          'Servicio general',
        descripcion: proveedor.descripcion || 'Proveedor de servicios profesionales',
        calificacion: proveedor.calificacion || proveedor.rating || 0,
        completados: proveedor.completados || proveedor.trabajosCompletados || 0,
        precio: proveedor.precio || proveedor.precioBase || 0,
        categoria: proveedor.categoria || proveedor.tipo || 'general',
        activo: Boolean(proveedor.activo),
      };
    } catch (error) {
      return null;
    }
  };

  const toggleProveedor = async (proveedorId) => {
    try {

      const proveedor = proveedoresExternos.find(p => p.id === proveedorId);
      if (!proveedor) {
        Alert.alert('Error', 'Proveedor no encontrado');
        return;
      }

      const validacion = await validarProveedor(proveedor);
      if (!validacion.valido) {
        Alert.alert('Error', 'No se puede modificar un proveedor inválido: ' + validacion.errores);
        return;
      }

      const proveedorActualizado = {
        ...proveedor,
        activo: !proveedor.activo
      };

      const validacionActualizada = await validarProveedor(proveedorActualizado);
      if (!validacionActualizada.valido) {
        Alert.alert('Error', 'Datos actualizados inválidos: ' + validacionActualizada.errores);
        return;
      }

      const result = await dispatch(actualizarProveedor(proveedorId, proveedorActualizado));

      if (result.success) {
        dispatch(obtenerProveedores());
      } else {
        Alert.alert('Error', result.error || 'Error al cambiar estado del proveedor');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al cambiar estado del proveedor');
    }
  };

  const handleRemoveProveedor = (proveedorId) => {

    const proveedor = proveedoresExternos.find(p => p.id === proveedorId);
    if (!proveedor) {
      Alert.alert('Error', 'Proveedor no encontrado');
      return;
    }

    const datosProveedor = obtenerDatosProveedor(proveedor);
    if (!datosProveedor) {
      Alert.alert('Error', 'No se puede procesar este proveedor');
      return;
    }

    Alert.alert(
      'Remover proveedor',
      `¿Estás seguro de que quieres remover a "${datosProveedor.nombre}" de tu espacio?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await dispatch(eliminarProveedor(proveedorId));

              if (result.success) {
                dispatch(obtenerProveedores());
                Alert.alert('Éxito', 'Proveedor removido correctamente');
              } else {
                Alert.alert('Error', result.error || 'Error al remover el proveedor');
              }
            } catch (error) {
              Alert.alert('Error', 'Error al remover el proveedor');
            }
          }
        }
      ]
    );
  };

  const handleViewProfile = async (proveedor) => {

    const validacion = await validarProveedor(proveedor);
    if (!validacion.valido) {
      Alert.alert('Error', 'No se puede ver el perfil: datos de proveedor inválidos');
      return;
    }

    navigation.navigate('PerfilProveedor', { proveedor });
  };

  const handleBuscarProveedores = () => {

    oficinaSchema.validate(oficina).then(() => {
      navigation.navigate('BuscarProveedores', { oficina });
    }).catch((error) => {
      Alert.alert('Error', 'Datos de oficina inválidos: ' + error.message);
    });
  };

  const handleCrearProveedor = () => {

    oficinaSchema.validate(oficina).then(() => {
      navigation.navigate('CrearProveedor', { oficina });
    }).catch((error) => {
      Alert.alert('Error', 'Datos de oficina inválidos: ' + error.message);
    });
  };

  const handleFiltroChange = async (categoria) => {
    const esValido = await validarFiltroCategoria(categoria);
    if (esValido) {
      setFiltroCategoria(categoria);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.filtro;
        return newErrors;
      });
    } else {
      Alert.alert('Error', 'Categoría de filtro no válida');
    }
  };

  const getProveedoresFiltrados = () => {
    const proveedoresValidos = obtenerProveedoresValidos();

    if (filtroCategoria === 'todos') {
      return proveedoresValidos;
    }

    return proveedoresValidos.filter(proveedor => {
      const datos = obtenerDatosProveedor(proveedor);
      return datos && (
        datos.categoria === filtroCategoria ||
        proveedor.tipo === filtroCategoria
      );
    });
  };

  const ErrorText = ({ error, titulo }) => {
    if (!error) return null;
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={16} color="#e74c3c" />
        <Text style={styles.errorText}>{titulo}: {error}</Text>
      </View>
    );
  };

  const renderProveedor = ({ item: proveedor, index }) => {
    const datos = obtenerDatosProveedor(proveedor);

    if (!datos) {
      return (
        <View style={styles.proveedorInvalido}>
          <Text style={styles.proveedorInvalidoText}>
            Proveedor con datos inválidos (ID: {proveedor.id})
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.proveedorCard, !datos.activo && styles.proveedorInactivo]}>
        <View style={styles.proveedorHeader}>
          <View style={styles.proveedorInfo}>
            <Text style={[styles.proveedorNombre, !datos.activo && styles.textoInactivo]}>
              {datos.nombre}
            </Text>
            <Text style={[styles.servicioNombre, !datos.activo && styles.textoInactivo]}>
              {datos.servicio}
            </Text>
            <Text style={styles.categoriaTag}>
              {datos.categoria.charAt(0).toUpperCase() + datos.categoria.slice(1)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, datos.activo && styles.toggleButtonActive]}
            onPress={() => toggleProveedor(datos.id)}
            disabled={loading}
          >
            <Ionicons
              name={datos.activo ? 'checkmark' : 'close'}
              size={20}
              color={datos.activo ? '#fff' : '#7f8c8d'}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.descripcion, !datos.activo && styles.textoInactivo]}>
          {datos.descripcion}
        </Text>

        <View style={styles.proveedorStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#f39c12" />
            <Text style={styles.statText}>
              {datos.calificacion > 0 ? datos.calificacion.toFixed(1) : 'N/A'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-done" size={16} color="#27ae60" />
            <Text style={styles.statText}>{datos.completados} trabajos</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="pricetag" size={16} color="#4a90e2" />
            <Text style={styles.statText}>
              {datos.precio > 0 ? `$${datos.precio}/servicio` : 'Consultar'}
            </Text>
          </View>
        </View>

        <View style={styles.proveedorActions}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => handleViewProfile(proveedor)}
          >
            <Ionicons name="person-outline" size={16} color="#4a90e2" />
            <Text style={styles.profileButtonText}>Ver perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveProveedor(datos.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#e74c3c" />
            <Text style={styles.removeButtonText}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCategoria = ({ item: categoria }) => {

    try {
      categoriaSchema.validateSync(categoria);
    } catch (error) {
      return null;
    }

    return (
      <TouchableOpacity
        style={[
          styles.categoriaButton,
          filtroCategoria === categoria.id && styles.categoriaButtonActive
        ]}
        onPress={() => handleFiltroChange(categoria.id)}
      >
        <Ionicons
          name={categoria.icono}
          size={20}
          color={filtroCategoria === categoria.id ? '#fff' : '#4a90e2'}
        />
        <Text style={[
          styles.categoriaText,
          filtroCategoria === categoria.id && styles.categoriaTextActive
        ]}>
          {categoria.nombre}
        </Text>
      </TouchableOpacity>
    );
  };

  const proveedoresFiltrados = getProveedoresFiltrados();
  const proveedoresActivos = proveedoresExternos.filter(p => p.activo);
  const proveedoresInactivos = proveedoresExternos.filter(p => !p.activo);

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
        <Text style={styles.headerTitle}>Proveedores externos</Text>
        <TouchableOpacity
          onPress={handleBuscarProveedores}
          style={styles.searchButton}
        >
          <Ionicons name="search" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <ErrorText error={validationErrors.oficina} titulo="Oficina" />
      <ErrorText error={validationErrors.usuario} titulo="Usuario" />
      <ErrorText error={validationErrors.proveedores} titulo="Proveedores" />
      <ErrorText error={validationErrors.filtro} titulo="Filtro" />

      <View style={styles.infoContainer}>
        <Text style={styles.espacioNombre}>{oficina.nombre}</Text>
        <Text style={styles.infoText}>
          Gestiona los proveedores externos que ofrecen servicios en tu espacio
        </Text>
        {error && (
          <Text style={styles.errorTextGeneral}>Error: {error}</Text>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statContainer}>
          <Text style={styles.statNumber}>{proveedoresActivos.length}</Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
        <View style={styles.statContainer}>
          <Text style={styles.statNumber}>{proveedoresInactivos.length}</Text>
          <Text style={styles.statLabel}>Inactivos</Text>
        </View>
        <View style={styles.statContainer}>
          <Text style={styles.statNumber}>{proveedoresExternos.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoria}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriasContainer}
        contentContainerStyle={styles.categoriasContent}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando proveedores...</Text>
        </View>
      ) : proveedoresFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>
            {filtroCategoria === 'todos'
              ? 'No tienes proveedores externos'
              : `No hay proveedores en ${categorias.find(c => c.id === filtroCategoria)?.nombre}`}
          </Text>
          <Text style={styles.emptySubtext}>
            Busca y agrega proveedores para ofrecer más servicios
          </Text>
          {Object.keys(validationErrors).length > 0 && (
            <Text style={styles.emptySubtext}>
              Algunos proveedores fueron filtrados por errores de validación
            </Text>
          )}
          <TouchableOpacity style={styles.buscarButton} onPress={handleBuscarProveedores}>
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.buscarButtonText}>Buscar proveedores</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.crearButton} onPress={handleCrearProveedor}>
            <Ionicons name="add" size={20} color="#4a90e2" />
            <Text style={styles.crearButtonText}>Crear proveedor</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={proveedoresFiltrados}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderProveedor}
          style={styles.lista}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaContent}
        />
      )}

      <TouchableOpacity style={styles.fabButton} onPress={handleBuscarProveedores}>
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
  searchButton: {
    padding: 5,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  espacioNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  statContainer: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  categoriasContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  categoriasContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  categoriaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  categoriaButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  categoriaText: {
    fontSize: 14,
    color: '#4a90e2',
    marginLeft: 6,
    fontWeight: '600',
  },
  categoriaTextActive: {
    color: '#fff',
  },
  lista: {
    flex: 1,
  },
  listaContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  proveedorCard: {
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
  proveedorInactivo: {
    opacity: 0.6,
  },
  proveedorInvalido: {
    backgroundColor: '#ffeaa7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fdcb6e',
  },
  proveedorInvalidoText: {
    fontSize: 14,
    color: '#e17055',
    fontWeight: '600',
    textAlign: 'center',
  },
  proveedorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  proveedorInfo: {
    flex: 1,
  },
  proveedorNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  servicioNombre: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
    marginBottom: 4,
  },
  categoriaTag: {
    fontSize: 11,
    color: '#95a5a6',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  descripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 16,
  },
  textoInactivo: {
    color: '#bdc3c7',
  },
  proveedorStats: {
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
  proveedorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  profileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a90e2',
  },
  removeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef5f5',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  toggleButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
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
    fontFamily: 'System',
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
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  buscarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  buscarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  crearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  crearButtonText: {
    color: '#4a90e2',
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
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffeaa7',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginVertical: 2,
    borderRadius: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'System',
  },
  errorTextGeneral: {
    fontSize: 14,
    color: '#e74c3c',
    marginTop: 8,
    fontFamily: 'System',
  },
});

export default ServiciosOfrecidos;