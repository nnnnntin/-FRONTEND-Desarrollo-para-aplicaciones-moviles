import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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

const BuscarProveedores = ({ navigation, route }) => {
  const { oficina } = route.params;

  const [searchText, setSearchText] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroCalificacion, setFiltroCalificacion] = useState(0);
  const [filtroPrecio, setFiltroPrecio] = useState('todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  const categorias = [
    { id: 'todos', nombre: 'Todos', icono: 'apps' },
    { id: 'limpieza', nombre: 'Limpieza', icono: 'sparkles' },
    { id: 'tecnologia', nombre: 'Tecnología', icono: 'laptop' },
    { id: 'catering', nombre: 'Catering', icono: 'restaurant' },
    { id: 'seguridad', nombre: 'Seguridad', icono: 'shield-checkmark' },
    { id: 'mantenimiento', nombre: 'Mantenimiento', icono: 'construct' },
    { id: 'eventos', nombre: 'Eventos', icono: 'calendar' }
  ];

  const proveedoresDisponibles = [
    {
      id: 1,
      nombre: 'María González',
      empresa: 'Cleaning Pro',
      servicio: 'Limpieza profunda de oficinas',
      categoria: 'limpieza',
      descripcion: 'Especialista en limpieza comercial con 8 años de experiencia. Uso productos ecológicos.',
      precio: 120,
      calificacion: 4.8,
      trabajosCompletados: 156,
      disponibilidad: 'Lun - Vie, 6AM - 6PM',
      certificaciones: ['ISO 14001', 'Higiene Industrial'],
      distancia: 2.3,
      imagen: null
    },
    {
      id: 2,
      nombre: 'Carlos Rodríguez',
      empresa: 'Tech Support 24/7',
      servicio: 'Soporte técnico audiovisual',
      categoria: 'tecnologia',
      descripcion: 'Técnico certificado en equipos audiovisuales y sistemas de conferencia.',
      precio: 150,
      calificacion: 4.9,
      trabajosCompletados: 89,
      disponibilidad: '24/7',
      certificaciones: ['CompTIA A+', 'Cisco CCNA'],
      distancia: 1.8,
      imagen: null
    },
    {
      id: 3,
      nombre: 'Ana Martínez',
      empresa: 'Catering Express',
      servicio: 'Catering corporativo',
      categoria: 'catering',
      descripcion: 'Chef profesional especializada en eventos corporativos y reuniones ejecutivas.',
      precio: 35,
      calificacion: 4.6,
      trabajosCompletados: 234,
      disponibilidad: 'Lun - Sáb, 7AM - 9PM',
      certificaciones: ['Manipulación de alimentos', 'HACCP'],
      distancia: 3.1,
      imagen: null
    },
    {
      id: 4,
      nombre: 'Roberto Silva',
      empresa: 'Security Plus',
      servicio: 'Seguridad para eventos',
      categoria: 'seguridad',
      descripcion: 'Ex-policía con 15 años de experiencia en seguridad privada y eventos corporativos.',
      precio: 200,
      calificacion: 4.7,
      trabajosCompletados: 78,
      disponibilidad: 'Disponible 24/7',
      certificaciones: ['Seguridad Privada', 'Primeros Auxilios'],
      distancia: 4.2,
      imagen: null
    },
    {
      id: 5,
      nombre: 'Laura Pérez',
      empresa: 'Mantenimiento Integral',
      servicio: 'Mantenimiento de oficinas',
      categoria: 'mantenimiento',
      descripcion: 'Técnica en mantenimiento con especialización en sistemas eléctricos y plomería.',
      precio: 80,
      calificacion: 4.5,
      trabajosCompletados: 145,
      disponibilidad: 'Lun - Vie, 8AM - 5PM',
      certificaciones: ['Electricista', 'Plomería básica'],
      distancia: 2.9,
      imagen: null
    }
  ];

  const getProveedoresFiltrados = () => {
    let filtrados = proveedoresDisponibles;

    if (searchText) {
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
        p.empresa.toLowerCase().includes(searchText.toLowerCase()) ||
        p.servicio.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filtroCategoria !== 'todos') {
      filtrados = filtrados.filter(p => p.categoria === filtroCategoria);
    }

    if (filtroCalificacion > 0) {
      filtrados = filtrados.filter(p => p.calificacion >= filtroCalificacion);
    }

    if (filtroPrecio !== 'todos') {
      switch (filtroPrecio) {
        case 'bajo':
          filtrados = filtrados.filter(p => p.precio <= 100);
          break;
        case 'medio':
          filtrados = filtrados.filter(p => p.precio > 100 && p.precio <= 150);
          break;
        case 'alto':
          filtrados = filtrados.filter(p => p.precio > 150);
          break;
      }
    }

    return filtrados.sort((a, b) => b.calificacion - a.calificacion);
  };

  const handleVerPerfil = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModalVisible(true);
  };

  const handleAgregarProveedor = (proveedor) => {
    Alert.alert(
      'Agregar proveedor',
      `¿Quieres agregar a ${proveedor.nombre} (${proveedor.empresa}) a tu espacio "${oficina.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Agregar',
          onPress: () => {
            Alert.alert(
              'Proveedor agregado',
              `${proveedor.nombre} ha sido agregado a tu espacio. Los clientes ahora podrán solicitar sus servicios.`,
              [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack()
                }
              ]
            );
          }
        }
      ]
    );
  };

  const renderProveedor = ({ item: proveedor }) => (
    <View style={styles.proveedorCard}>
      <View style={styles.proveedorHeader}>
        <View style={styles.proveedorAvatar}>
          <Text style={styles.proveedorInitials}>
            {proveedor.nombre.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.proveedorInfo}>
          <Text style={styles.proveedorNombre}>{proveedor.nombre}</Text>
          <Text style={styles.proveedorEmpresa}>{proveedor.empresa}</Text>
          <Text style={styles.proveedorServicio}>{proveedor.servicio}</Text>
        </View>
        <View style={styles.proveedorStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#f39c12" />
            <Text style={styles.statText}>{proveedor.calificacion}</Text>
          </View>
          <Text style={styles.distanciaText}>{proveedor.distancia} km</Text>
        </View>
      </View>

      <Text style={styles.proveedorDescripcion}>{proveedor.descripcion}</Text>

      <View style={styles.proveedorDetalles}>
        <View style={styles.detalleRow}>
          <Ionicons name="pricetag" size={16} color="#4a90e2" />
          <Text style={styles.detalleText}>${proveedor.precio}/servicio</Text>
        </View>
        <View style={styles.detalleRow}>
          <Ionicons name="checkmark-done" size={16} color="#27ae60" />
          <Text style={styles.detalleText}>{proveedor.trabajosCompletados} trabajos</Text>
        </View>
        <View style={styles.detalleRow}>
          <Ionicons name="time" size={16} color="#7f8c8d" />
          <Text style={styles.detalleText}>{proveedor.disponibilidad}</Text>
        </View>
      </View>

      <View style={styles.certificaciones}>
        {proveedor.certificaciones.slice(0, 2).map((cert, index) => (
          <View key={index} style={styles.certificacionTag}>
            <Text style={styles.certificacionText}>{cert}</Text>
          </View>
        ))}
        {proveedor.certificaciones.length > 2 && (
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
          <Text style={styles.agregarText}>Agregar</Text>
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
        <Text style={styles.headerTitle}>Buscar proveedores</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, empresa o servicio..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
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

      <View style={styles.filtrosAdicionales}>
        <Text style={styles.filtrosTitle}>Filtros:</Text>
        <View style={styles.filtrosRow}>
          <TouchableOpacity
            style={[styles.filtroChip, filtroCalificacion >= 4.5 && styles.filtroChipActive]}
            onPress={() => setFiltroCalificacion(filtroCalificacion >= 4.5 ? 0 : 4.5)}
          >
            <Ionicons name="star" size={14} color={filtroCalificacion >= 4.5 ? '#fff' : '#f39c12'} />
            <Text style={[styles.filtroChipText, filtroCalificacion >= 4.5 && styles.filtroChipTextActive]}>
              4.5+
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filtroChip, filtroPrecio === 'bajo' && styles.filtroChipActive]}
            onPress={() => setFiltroPrecio(filtroPrecio === 'bajo' ? 'todos' : 'bajo')}
          >
            <Text style={[styles.filtroChipText, filtroPrecio === 'bajo' && styles.filtroChipTextActive]}>
              Hasta $100
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filtroChip, filtroPrecio === 'medio' && styles.filtroChipActive]}
            onPress={() => setFiltroPrecio(filtroPrecio === 'medio' ? 'todos' : 'medio')}
          >
            <Text style={[styles.filtroChipText, filtroPrecio === 'medio' && styles.filtroChipTextActive]}>
              $100-150
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.resultadosHeader}>
        <Text style={styles.resultadosText}>
          {proveedoresFiltrados.length} proveedores encontrados
        </Text>
        <Text style={styles.espacioText}>para {oficina.nombre}</Text>
      </View>

      {proveedoresFiltrados.length === 0 ? (
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
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProveedor}
          style={styles.lista}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaContent}
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
                      {proveedorSeleccionado.nombre.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.perfilInfo}>
                    <Text style={styles.perfilNombre}>{proveedorSeleccionado.nombre}</Text>
                    <Text style={styles.perfilEmpresa}>{proveedorSeleccionado.empresa}</Text>
                    <View style={styles.perfilRating}>
                      <Ionicons name="star" size={16} color="#f39c12" />
                      <Text style={styles.perfilCalificacion}>{proveedorSeleccionado.calificacion}</Text>
                      <Text style={styles.perfilTrabajos}>({proveedorSeleccionado.trabajosCompletados} trabajos)</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.perfilDescripcion}>{proveedorSeleccionado.descripcion}</Text>

                <View style={styles.perfilDetalles}>
                  <Text style={styles.perfilSeccionTitulo}>Servicio</Text>
                  <Text style={styles.perfilTexto}>{proveedorSeleccionado.servicio}</Text>

                  <Text style={styles.perfilSeccionTitulo}>Disponibilidad</Text>
                  <Text style={styles.perfilTexto}>{proveedorSeleccionado.disponibilidad}</Text>

                  <Text style={styles.perfilSeccionTitulo}>Certificaciones</Text>
                  <View style={styles.certificacionesList}>
                    {proveedorSeleccionado.certificaciones.map((cert, index) => (
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
                  <Text style={styles.agregarModalText}>Agregar a mi espacio</Text>
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
  agregarModalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default BuscarProveedores;