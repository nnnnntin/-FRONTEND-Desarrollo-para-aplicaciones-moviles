import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
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
  crearSolicitudServicio,
  filtrarProveedores,
  obtenerProveedores,
  setProveedorSeleccionado
} from '../store/slices/proveedoresSlice';

const busquedaSchema = Yup.object({
  searchText: Yup.string()
    .max(100, 'La búsqueda no puede tener más de 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]*$/, 'Solo se permiten letras, números y espacios'),

  filtroCategoria: Yup.string()
    .test('categoria-valida', 'Categoría no válida', function (value) {
      const categorias = ['todos', 'limpieza', 'tecnologia', 'catering', 'seguridad', 'mantenimiento', 'eventos'];
      return !value || categorias.includes(value);
    }),

  filtroCalificacion: Yup.number()
    .min(0, 'La calificación mínima es 0')
    .max(5, 'La calificación máxima es 5'),

  filtroPrecio: Yup.string()
    .test('precio-valido', 'Filtro de precio no válido', function (value) {
      const precios = ['todos', 'bajo', 'medio', 'alto'];
      return !value || precios.includes(value);
    })
});

const solicitudSchema = Yup.object({
  proveedorId: Yup.string()
    .required('El ID del proveedor es requerido')
    .min(1, 'ID de proveedor inválido'),

  espacioId: Yup.string()
    .required('El ID del espacio es requerido')
    .min(1, 'ID de espacio inválido'),

  mensaje: Yup.string()
    .required('El mensaje es requerido')
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(500, 'El mensaje no puede tener más de 500 caracteres'),

  estado: Yup.string()
    .test('estado-valido', 'Estado no válido', function (value) {
      const estados = ['enviada', 'pendiente', 'aceptada', 'rechazada'];
      return !value || estados.includes(value);
    })
    .default('enviada')
});

const BuscarProveedores = ({ navigation, route }) => {
  const { oficina } = route.params;
  const dispatch = useDispatch();

  const {
    proveedores,
    proveedorSeleccionado,
    loading,
    error
  } = useSelector(state => state.proveedores);

  const [searchText, setSearchText] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroCalificacion, setFiltroCalificacion] = useState(0);
  const [filtroPrecio, setFiltroPrecio] = useState('todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [errores, setErrores] = useState({});

  const categorias = [
    { id: 'todos', nombre: 'Todos', icono: 'apps' },
    { id: 'limpieza', nombre: 'Limpieza', icono: 'sparkles' },
    { id: 'tecnologia', nombre: 'Tecnología', icono: 'laptop' },
    { id: 'catering', nombre: 'Catering', icono: 'restaurant' },
    { id: 'seguridad', nombre: 'Seguridad', icono: 'shield-checkmark' },
    { id: 'mantenimiento', nombre: 'Mantenimiento', icono: 'construct' },
    { id: 'eventos', nombre: 'Eventos', icono: 'calendar' }
  ];

  useEffect(() => {
    cargarProveedores();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtroCategoria, filtroCalificacion, filtroPrecio, searchText]);

  const validarBusqueda = async () => {
    const datosBusqueda = {
      searchText,
      filtroCategoria,
      filtroCalificacion,
      filtroPrecio
    };

    try {
      await busquedaSchema.validate(datosBusqueda, { abortEarly: false });
      setErrores({});
      return true;
    } catch (error) {
      const nuevosErrores = {};
      error.inner.forEach(err => {
        nuevosErrores[err.path] = err.message;
      });
      setErrores(nuevosErrores);
      return false;
    }
  };

  const validarSolicitud = async (solicitudData) => {
    try {
      await solicitudSchema.validate(solicitudData, { abortEarly: false });
      return { isValid: true, errors: {} };
    } catch (error) {
      const nuevosErrores = {};
      error.inner.forEach(err => {
        nuevosErrores[err.path] = err.message;
      });
      return { isValid: false, errors: nuevosErrores };
    }
  };

  const cargarProveedores = async () => {
    try {
      await dispatch(obtenerProveedores(0, 50));
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los proveedores');
    }
  };

  const aplicarFiltros = async () => {
    const esValidoBusqueda = await validarBusqueda();
    if (!esValidoBusqueda) return;

    try {
      const filtros = {};

      if (filtroCategoria !== 'todos') {
        filtros.tipo = filtroCategoria;
      }

      if (filtroCalificacion > 0) {
        filtros.calificacionMinima = filtroCalificacion;
      }

      if (searchText.trim()) {
        filtros.busqueda = searchText.trim();
      }

      await dispatch(filtrarProveedores(filtros));
    } catch (error) {
      console.error(error);
    }
  };

  const getProveedoresFiltrados = () => {
    let filtrados = proveedores || [];

    if (searchText) {
      filtrados = filtrados.filter(p =>
        p.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.empresa?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.servicios?.some(s => s.nombre?.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    if (filtroPrecio !== 'todos') {
      filtrados = filtrados.filter(p => {
        const precioPromedio = p.servicios?.reduce((sum, s) => sum + (s.precio || 0), 0) / (p.servicios?.length || 1);
        switch (filtroPrecio) {
          case 'bajo':
            return precioPromedio <= 100;
          case 'medio':
            return precioPromedio > 100 && precioPromedio <= 150;
          case 'alto':
            return precioPromedio > 150;
          default:
            return true;
        }
      });
    }

    return filtrados.sort((a, b) => (b.calificacion || 0) - (a.calificacion || 0));
  };

  const handleVerPerfil = (proveedor) => {
    if (!proveedor || !proveedor._id) {
      Alert.alert('Error', 'Proveedor no válido');
      return;
    }

    dispatch(setProveedorSeleccionado(proveedor));
    setModalVisible(true);
  };

  const handleCambioTexto = async (texto) => {
    setSearchText(texto);

    try {
      await busquedaSchema.validateAt('searchText', { searchText: texto });
      setErrores(prev => ({ ...prev, searchText: null }));
    } catch (error) {
      setErrores(prev => ({ ...prev, searchText: error.message }));
    }
  };

  const handleCambioCategoria = async (categoria) => {
    setFiltroCategoria(categoria);

    try {
      await busquedaSchema.validateAt('filtroCategoria', { filtroCategoria: categoria });
      setErrores(prev => ({ ...prev, filtroCategoria: null }));
    } catch (error) {
      setErrores(prev => ({ ...prev, filtroCategoria: error.message }));
    }
  };

  const handleCambioCalificacion = async (calificacion) => {
    setFiltroCalificacion(calificacion);

    try {
      await busquedaSchema.validateAt('filtroCalificacion', { filtroCalificacion: calificacion });
      setErrores(prev => ({ ...prev, filtroCalificacion: null }));
    } catch (error) {
      setErrores(prev => ({ ...prev, filtroCalificacion: error.message }));
    }
  };

  const handleCambioPrecio = async (precio) => {
    setFiltroPrecio(precio);

    try {
      await busquedaSchema.validateAt('filtroPrecio', { filtroPrecio: precio });
      setErrores(prev => ({ ...prev, filtroPrecio: null }));
    } catch (error) {
      setErrores(prev => ({ ...prev, filtroPrecio: error.message }));
    }
  };

  const handleAgregarProveedor = async (proveedor) => {
    if (!proveedor || !proveedor._id) {
      Alert.alert('Error', 'Proveedor no válido');
      return;
    }

    if (!oficina || !oficina.id) {
      Alert.alert('Error', 'Información de oficina no válida');
      return;
    }

    const mensaje = `Hola ${proveedor.nombre}, me interesa que ofrezcas tus servicios en mi espacio "${oficina.nombre}". ¿Podrías enviarme una propuesta?`;

    const solicitudData = {
      proveedorId: proveedor._id,
      espacioId: oficina.id,
      mensaje,
      estado: 'enviada'
    };

    const validacion = await validarSolicitud(solicitudData);
    if (!validacion.isValid) {
      const erroresTexto = Object.values(validacion.errors).join('\n');
      Alert.alert('Error de validación', erroresTexto);
      return;
    }
  };

  const renderProveedor = ({ item: proveedor }) => (
    <View style={styles.proveedorCard}>
      <View style={styles.proveedorHeader}>
        <View style={styles.proveedorAvatar}>
          <Text style={styles.proveedorInitials}>
            {proveedor.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'PR'}
          </Text>
        </View>
        <View style={styles.proveedorInfo}>
          <Text style={styles.proveedorNombre}>{proveedor.nombre || 'Proveedor'}</Text>
          <Text style={styles.proveedorEmpresa}>{proveedor.empresa || 'Sin empresa'}</Text>
          <Text style={styles.proveedorServicio}>
            {proveedor.servicios?.[0]?.nombre || 'Servicios varios'}
          </Text>
        </View>
        <View style={styles.proveedorStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#f39c12" />
            <Text style={styles.statText}>{proveedor.calificacion || 0}</Text>
          </View>
          <Text style={styles.distanciaText}>{proveedor.distancia || '2.5'} km</Text>
        </View>
      </View>

      <Text style={styles.proveedorDescripcion}>
        {proveedor.descripcion || 'Proveedor de servicios profesionales con experiencia en el sector.'}
      </Text>

      <View style={styles.proveedorDetalles}>
        <View style={styles.detalleRow}>
          <Ionicons name="pricetag" size={16} color="#4a90e2" />
          <Text style={styles.detalleText}>
            ${proveedor.servicios?.[0]?.precio || 100}/servicio
          </Text>
        </View>
        <View style={styles.detalleRow}>
          <Ionicons name="checkmark-done" size={16} color="#27ae60" />
          <Text style={styles.detalleText}>
            {proveedor.trabajosCompletados || 0} trabajos
          </Text>
        </View>
        <View style={styles.detalleRow}>
          <Ionicons name="time" size={16} color="#7f8c8d" />
          <Text style={styles.detalleText}>
            {proveedor.disponibilidad || 'Lun - Vie, 8AM - 6PM'}
          </Text>
        </View>
      </View>

      <View style={styles.certificaciones}>
        {(proveedor.certificaciones || ['Certificado profesional']).slice(0, 2).map((cert, index) => (
          <View key={index} style={styles.certificacionTag}>
            <Text style={styles.certificacionText}>{cert}</Text>
          </View>
        ))}
        {(proveedor.certificaciones || []).length > 2 && (
          <Text style={styles.masCertificaciones}>
            +{proveedor.certificaciones.length - 2} más
          </Text>
        )}
      </View>

      <View style={styles.proveedorActions}>
        <TouchableOpacity
          style={styles.verPerfilButton}
          onPress={() => handleVerPerfil(proveedor)}
        >
          <Ionicons name="eye-outline" size={16} color="#4a90e2" />
          <Text style={styles.verPerfilText}>Ver perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.agregarButton}
          onPress={() => handleAgregarProveedor(proveedor)}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.agregarText}>Solicitar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoria = ({ item: categoria }) => (
    <TouchableOpacity
      style={[
        styles.categoriaButton,
        filtroCategoria === categoria.id && styles.categoriaButtonActive,
        errores.filtroCategoria && styles.categoriaButtonError
      ]}
      onPress={() => handleCambioCategoria(categoria.id)}
    >
      <Ionicons
        name={categoria.icono}
        size={18}
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

  const renderErrorText = (campo) => {
    if (errores[campo]) {
      return (
        <Text style={styles.errorText}>
          {errores[campo]}
        </Text>
      );
    }
    return null;
  };

  const proveedoresFiltrados = getProveedoresFiltrados();

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#e74c3c" />
          <Text style={styles.errorText}>Error al cargar proveedores</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={cargarProveedores}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Buscar proveedores</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={[
            styles.searchInput,
            errores.searchText && styles.searchInputError
          ]}
          placeholder="Buscar por nombre, empresa o servicio..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={handleCambioTexto}
        />
      </View>
      {renderErrorText('searchText')}

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoria}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriasContainer}
        contentContainerStyle={styles.categoriasContent}
      />
      {renderErrorText('filtroCategoria')}

      <View style={styles.filtrosAdicionales}>
        <Text style={styles.filtrosTitle}>Filtros:</Text>
        <View style={styles.filtrosRow}>
          <TouchableOpacity
            style={[
              styles.filtroChip,
              filtroCalificacion >= 4.5 && styles.filtroChipActive,
              errores.filtroCalificacion && styles.filtroChipError
            ]}
            onPress={() => handleCambioCalificacion(filtroCalificacion >= 4.5 ? 0 : 4.5)}
          >
            <Ionicons name="star" size={14} color={filtroCalificacion >= 4.5 ? '#fff' : '#f39c12'} />
            <Text style={[styles.filtroChipText, filtroCalificacion >= 4.5 && styles.filtroChipTextActive]}>
              4.5+
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filtroChip,
              filtroPrecio === 'bajo' && styles.filtroChipActive,
              errores.filtroPrecio && styles.filtroChipError
            ]}
            onPress={() => handleCambioPrecio(filtroPrecio === 'bajo' ? 'todos' : 'bajo')}
          >
            <Text style={[styles.filtroChipText, filtroPrecio === 'bajo' && styles.filtroChipTextActive]}>
              Hasta $100
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filtroChip,
              filtroPrecio === 'medio' && styles.filtroChipActive,
              errores.filtroPrecio && styles.filtroChipError
            ]}
            onPress={() => handleCambioPrecio(filtroPrecio === 'medio' ? 'todos' : 'medio')}
          >
            <Text style={[styles.filtroChipText, filtroPrecio === 'medio' && styles.filtroChipTextActive]}>
              $100-150
            </Text>
          </TouchableOpacity>
        </View>
        {renderErrorText('filtroCalificacion')}
        {renderErrorText('filtroPrecio')}
      </View>

      <View style={styles.resultadosHeader}>
        <Text style={styles.resultadosText}>
          {proveedoresFiltrados.length} proveedores encontrados
        </Text>
        <Text style={styles.espacioText}>para {oficina.nombre}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando proveedores...</Text>
        </View>
      ) : proveedoresFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>No se encontraron proveedores</Text>
          <Text style={styles.emptySubtext}>
            Intenta ajustar los filtros de búsqueda
          </Text>
        </View>
      ) : (
        <FlatList
          data={proveedoresFiltrados}
          keyExtractor={(item) => item._id || item.id?.toString()}
          renderItem={renderProveedor}
          style={styles.lista}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaContent}
          refreshing={loading}
          onRefresh={cargarProveedores}
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
              <Text style={styles.modalTitle}>Perfil del proveedor</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            {proveedorSeleccionado && (
              <View style={styles.modalContent}>
                <View style={styles.perfilHeader}>
                  <View style={styles.perfilAvatar}>
                    <Text style={styles.perfilInitials}>
                      {proveedorSeleccionado.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'PR'}
                    </Text>
                  </View>
                  <View style={styles.perfilInfo}>
                    <Text style={styles.perfilNombre}>{proveedorSeleccionado.nombre}</Text>
                    <Text style={styles.perfilEmpresa}>{proveedorSeleccionado.empresa}</Text>
                    <View style={styles.perfilRating}>
                      <Ionicons name="star" size={16} color="#f39c12" />
                      <Text style={styles.perfilCalificacion}>{proveedorSeleccionado.calificacion || 0}</Text>
                      <Text style={styles.perfilTrabajos}>({proveedorSeleccionado.trabajosCompletados || 0} trabajos)</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.perfilDescripcion}>
                  {proveedorSeleccionado.descripcion || 'Proveedor de servicios profesionales'}
                </Text>

                <View style={styles.perfilDetalles}>
                  <Text style={styles.perfilSeccionTitulo}>Servicios</Text>
                  {(proveedorSeleccionado.servicios || []).map((servicio, index) => (
                    <Text key={index} style={styles.perfilTexto}>• {servicio.nombre}</Text>
                  ))}

                  <Text style={styles.perfilSeccionTitulo}>Disponibilidad</Text>
                  <Text style={styles.perfilTexto}>{proveedorSeleccionado.disponibilidad || 'Consultar disponibilidad'}</Text>

                  <Text style={styles.perfilSeccionTitulo}>Certificaciones</Text>
                  <View style={styles.certificacionesList}>
                    {(proveedorSeleccionado.certificaciones || ['Certificado profesional']).map((cert, index) => (
                      <View key={index} style={styles.certificacionItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                        <Text style={styles.certificacionTexto}>{cert}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.agregarModalButton}
                  onPress={() => {
                    setModalVisible(false);
                    handleAgregarProveedor(proveedorSeleccionado);
                  }}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.agregarModalText}>Enviar solicitud</Text>
                </TouchableOpacity>
              </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
    textAlign: 'center',
  },
  searchInputError: {
    borderColor: '#e74c3c',
  },
  categoriaButtonError: {
    borderColor: '#e74c3c',
  },
  filtroChipError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: 20,
    fontFamily: 'System',
  },
  retryButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  filterButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
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
  categoriasContainer: {
    backgroundColor: '#fff',
    marginTop: 15,
  },
  categoriasContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  categoriaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  categoriaButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  categoriaText: {
    fontSize: 12,
    color: '#4a90e2',
    marginLeft: 4,
    fontWeight: '600',
  },
  categoriaTextActive: {
    color: '#fff',
  },
  filtrosAdicionales: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  filtrosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  filtrosRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filtroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    gap: 4,
  },
  filtroChipActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  filtroChipText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  filtroChipTextActive: {
    color: '#fff',
  },
  resultadosHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  resultadosText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  espacioText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  lista: {
    flex: 1,
  },
  listaContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
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
  proveedorHeader: {
    flexDirection: 'row',
    marginBottom: 12,
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
  proveedorInfo: {
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
  proveedorServicio: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  proveedorStats: {
    alignItems: 'flex-end',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  distanciaText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  proveedorDescripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 12,
  },
  proveedorDetalles: {
    marginBottom: 12,
    gap: 6,
  },
  detalleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detalleText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
  },
  certificaciones: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  certificacionTag: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  certificacionText: {
    fontSize: 10,
    color: '#27ae60',
    fontWeight: '600',
  },
  masCertificaciones: {
    fontSize: 10,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  proveedorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  verPerfilButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  verPerfilText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a90e2',
  },
  agregarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  agregarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
  },
  perfilHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  perfilAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  perfilInitials: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  perfilInfo: {
    flex: 1,
  },
  perfilNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  perfilEmpresa: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
    marginTop: 2,
  },
  perfilRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  perfilCalificacion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  perfilTrabajos: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  perfilDescripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 20,
  },
  perfilDetalles: {
    marginBottom: 24,
  },
  perfilSeccionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  perfilTexto: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 18,
  },
  certificacionesList: {
    gap: 8,
  },
  certificacionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  certificacionTexto: {
    fontSize: 14,
    color: '#2c3e50',
  },
  agregarModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
});

export default BuscarProveedores;