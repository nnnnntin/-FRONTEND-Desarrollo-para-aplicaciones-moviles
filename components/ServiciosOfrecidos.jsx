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
import {
  actualizarProveedor,
  eliminarProveedor,
  obtenerProveedores
} from '../store/slices/proveedoresSlice';

const ServiciosOfrecidos = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { oficina } = route.params;


  const { proveedores, loading, error } = useSelector(state => state.proveedores);
  const { user } = useSelector(state => state.auth);

  const [filtroCategoria, setFiltroCategoria] = useState('todos');


  const proveedoresExternos = proveedores.filter(p => p.usuarioId === user?.id || p.propietarioId === user?.id);

  const categorias = [
    { id: 'todos', nombre: 'Todos', icono: 'apps' },
    { id: 'limpieza', nombre: 'Limpieza', icono: 'sparkles' },
    { id: 'tecnologia', nombre: 'Tecnología', icono: 'laptop' },
    { id: 'catering', nombre: 'Catering', icono: 'restaurant' },
    { id: 'seguridad', nombre: 'Seguridad', icono: 'shield-checkmark' }
  ];


  useEffect(() => {
    dispatch(obtenerProveedores());
  }, [dispatch]);

  const toggleProveedor = async (proveedorId) => {
    try {
      const proveedor = proveedoresExternos.find(p => p.id === proveedorId);
      const proveedorActualizado = {
        ...proveedor,
        activo: !proveedor.activo
      };

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
    Alert.alert(
      'Remover proveedor',
      '¿Estás seguro de que quieres remover este proveedor de tu espacio?',
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

  const handleViewProfile = (proveedor) => {
    navigation.navigate('PerfilProveedor', { proveedor });
  };

  const handleBuscarProveedores = () => {
    navigation.navigate('BuscarProveedores', { oficina });
  };

  const handleCrearProveedor = () => {
    navigation.navigate('CrearProveedor', { oficina });
  };

  const getProveedoresFiltrados = () => {
    if (filtroCategoria === 'todos') {
      return proveedoresExternos;
    }
    return proveedoresExternos.filter(p => p.categoria === filtroCategoria || p.tipo === filtroCategoria);
  };

  const renderProveedor = ({ item: proveedor }) => (
    <View style={[styles.proveedorCard, !proveedor.activo && styles.proveedorInactivo]}>
      <View style={styles.proveedorHeader}>
        <View style={styles.proveedorInfo}>
          <Text style={[styles.proveedorNombre, !proveedor.activo && styles.textoInactivo]}>
            {proveedor.nombre || proveedor.proveedor}
          </Text>
          <Text style={[styles.servicioNombre, !proveedor.activo && styles.textoInactivo]}>
            {proveedor.servicio || proveedor.servicios?.[0]?.nombre || 'Servicio general'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.toggleButton, proveedor.activo && styles.toggleButtonActive]}
          onPress={() => toggleProveedor(proveedor.id)}
          disabled={loading}
        >
          <Ionicons
            name={proveedor.activo ? 'checkmark' : 'close'}
            size={20}
            color={proveedor.activo ? '#fff' : '#7f8c8d'}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.descripcion, !proveedor.activo && styles.textoInactivo]}>
        {proveedor.descripcion || 'Proveedor de servicios profesionales'}
      </Text>

      <View style={styles.proveedorStats}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={16} color="#f39c12" />
          <Text style={styles.statText}>{proveedor.calificacion || proveedor.rating || 4.5}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-done" size={16} color="#27ae60" />
          <Text style={styles.statText}>{proveedor.completados || proveedor.trabajosCompletados || 0} trabajos</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="pricetag" size={16} color="#4a90e2" />
          <Text style={styles.statText}>
            ${proveedor.precio || proveedor.precioBase || 0}/servicio
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
          onPress={() => handleRemoveProveedor(proveedor.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#e74c3c" />
          <Text style={styles.removeButtonText}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoria = ({ item: categoria }) => (
    <TouchableOpacity
      style={[
        styles.categoriaButton,
        filtroCategoria === categoria.id && styles.categoriaButtonActive
      ]}
      onPress={() => setFiltroCategoria(categoria.id)}
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

  const proveedoresFiltrados = getProveedoresFiltrados();

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

      <View style={styles.infoContainer}>
        <Text style={styles.espacioNombre}>{oficina.nombre}</Text>
        <Text style={styles.infoText}>
          Gestiona los proveedores externos que ofrecen servicios en tu espacio
        </Text>
        {error && (
          <Text style={styles.errorText}>Error: {error}</Text>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statContainer}>
          <Text style={styles.statNumber}>
            {proveedoresExternos.filter(p => p.activo).length}
          </Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
        <View style={styles.statContainer}>
          <Text style={styles.statNumber}>
            {proveedoresExternos.filter(p => !p.activo).length}
          </Text>
          <Text style={styles.statLabel}>Inactivos</Text>
        </View>
        <View style={styles.statContainer}>
          <Text style={styles.statNumber}>
            {proveedoresExternos.length}
          </Text>
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
          keyExtractor={(item) => item.id.toString()}
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
});

export default ServiciosOfrecidos;