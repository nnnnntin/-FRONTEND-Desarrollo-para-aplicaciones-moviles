import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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
  View
} from 'react-native';

const GestionUsuarios = ({ navigation }) => {
  const [tabActiva, setTabActiva] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modalDetalles, setModalDetalles] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan@email.com',
      tipo: 'usuario',
      estado: 'activo',
      fechaRegistro: '2024-01-15',
      ultimoAcceso: '2025-06-18',
      reservas: 45,
      gastoTotal: 5400,
      membresia: 'Premium'
    },
    {
      id: 2,
      nombre: 'María González',
      email: 'maria@cleaningpro.com',
      tipo: 'proveedor',
      estado: 'activo',
      fechaRegistro: '2024-02-20',
      ultimoAcceso: '2025-06-17',
      serviciosCompletados: 156,
      gananciasGeneradas: 18720,
      calificacion: 4.8
    },
    {
      id: 3,
      nombre: 'Cliente Demo',
      email: 'demo@empresa.com',
      tipo: 'cliente',
      estado: 'activo',
      fechaRegistro: '2024-01-10',
      ultimoAcceso: '2025-06-18',
      espaciosPublicados: 2,
      reservasRecibidas: 234,
      ingresosGenerados: 45600
    },
    {
      id: 4,
      nombre: 'Carlos Rodríguez',
      email: 'carlos@email.com',
      tipo: 'usuario',
      estado: 'suspendido',
      fechaRegistro: '2024-03-05',
      ultimoAcceso: '2025-05-10',
      reservas: 12,
      gastoTotal: 890,
      membresia: 'Básico',
      razonSuspension: 'Múltiples cancelaciones sin justificación'
    },
    {
      id: 5,
      nombre: 'Ana Martínez',
      email: 'ana@catering.com',
      tipo: 'proveedor',
      estado: 'pendiente',
      fechaRegistro: '2025-06-15',
      ultimoAcceso: '2025-06-15',
      documentosPendientes: ['Certificado sanitario', 'Seguro de responsabilidad']
    }
  ]);

  const estadisticasPorTipo = {
    usuarios: usuarios.filter(u => u.tipo === 'usuario').length,
    clientes: usuarios.filter(u => u.tipo === 'cliente').length,
    proveedores: usuarios.filter(u => u.tipo === 'proveedor').length,
    activos: usuarios.filter(u => u.estado === 'activo').length,
    suspendidos: usuarios.filter(u => u.estado === 'suspendido').length,
    pendientes: usuarios.filter(u => u.estado === 'pendiente').length
  };

  const getUsuariosFiltrados = () => {
    let filtrados = usuarios;

    if (tabActiva !== 'todos') {
      filtrados = filtrados.filter(u => u.tipo === tabActiva);
    }

    if (busqueda) {
      filtrados = filtrados.filter(u =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    return filtrados;
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'usuario': return '#4a90e2';
      case 'cliente': return '#27ae60';
      case 'proveedor': return '#9b59b6';
      default: return '#7f8c8d';
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo': return '#27ae60';
      case 'suspendido': return '#e74c3c';
      case 'pendiente': return '#f39c12';
      default: return '#7f8c8d';
    }
  };

  const handleVerDetalles = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalDetalles(true);
  };

  const handleCambiarEstado = (usuario, nuevoEstado) => {
    Alert.alert(
      'Cambiar estado',
      `¿Estás seguro de cambiar el estado de ${usuario.nombre} a ${nuevoEstado}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setUsuarios(prev => prev.map(u =>
              u.id === usuario.id ? { ...u, estado: nuevoEstado } : u
            ));
            Alert.alert('Éxito', 'Estado actualizado correctamente');
          }
        }
      ]
    );
  };

  const handleEliminarUsuario = (usuario) => {
    Alert.alert(
      'Eliminar usuario',
      `¿Estás seguro de eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setUsuarios(prev => prev.filter(u => u.id !== usuario.id));
            setModalDetalles(false);
            Alert.alert('Éxito', 'Usuario eliminado correctamente');
          }
        }
      ]
    );
  };

  const renderUsuario = ({ item }) => (
    <TouchableOpacity
      style={styles.usuarioCard}
      onPress={() => handleVerDetalles(item)}
    >
      <View style={styles.usuarioHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.nombre.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.usuarioInfo}>
          <Text style={styles.usuarioNombre}>{item.nombre}</Text>
          <Text style={styles.usuarioEmail}>{item.email}</Text>
          <View style={styles.usuarioMeta}>
            <View style={[styles.tipoBadge, { backgroundColor: getTipoColor(item.tipo) + '20' }]}>
              <Text style={[styles.tipoText, { color: getTipoColor(item.tipo) }]}>
                {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
              </Text>
            </View>
            <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) + '20' }]}>
              <Text style={[styles.estadoText, { color: getEstadoColor(item.estado) }]}>
                {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.usuarioStats}>
        {item.tipo === 'usuario' && (
          <>
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={16} color="#7f8c8d" />
              <Text style={styles.statText}>{item.reservas} reservas</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="card" size={16} color="#27ae60" />
              <Text style={styles.statText}>${item.gastoTotal}</Text>
            </View>
          </>
        )}
        {item.tipo === 'cliente' && (
          <>
            <View style={styles.statItem}>
              <Ionicons name="business" size={16} color="#7f8c8d" />
              <Text style={styles.statText}>{item.espaciosPublicados} espacios</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cash" size={16} color="#27ae60" />
              <Text style={styles.statText}>${item.ingresosGenerados}</Text>
            </View>
          </>
        )}
        {item.tipo === 'proveedor' && item.estado === 'activo' && (
          <>
            <View style={styles.statItem}>
              <Ionicons name="construct" size={16} color="#7f8c8d" />
              <Text style={styles.statText}>{item.serviciosCompletados} servicios</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#f39c12" />
              <Text style={styles.statText}>{item.calificacion}</Text>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <View style={styles.estadisticasContainer}>
        <View style={styles.estatItem}>
          <Text style={styles.estatNumero}>{estadisticasPorTipo.usuarios}</Text>
          <Text style={styles.estatLabel}>Usuarios</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={styles.estatNumero}>{estadisticasPorTipo.clientes}</Text>
          <Text style={styles.estatLabel}>Clientes</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={styles.estatNumero}>{estadisticasPorTipo.proveedores}</Text>
          <Text style={styles.estatLabel}>Proveedores</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={[styles.estatNumero, { color: '#27ae60' }]}>{estadisticasPorTipo.activos}</Text>
          <Text style={styles.estatLabel}>Activos</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {['todos', 'usuario', 'cliente', 'proveedor'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, tabActiva === tab && styles.tabActive]}
            onPress={() => setTabActiva(tab)}
          >
            <Text style={[styles.tabText, tabActiva === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1) + (tab === 'todos' ? 's' : 's')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={getUsuariosFiltrados()}
        renderItem={renderUsuario}
        keyExtractor={(item) => item.id.toString()}
        style={styles.lista}
        contentContainerStyle={styles.listaContent}
      />

      <Modal
        visible={modalDetalles}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalDetalles(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles del usuario</Text>
              <TouchableOpacity
                onPress={() => setModalDetalles(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            {usuarioSeleccionado && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.modalUsuarioHeader}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>
                      {usuarioSeleccionado.nombre.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.modalUsuarioInfo}>
                    <Text style={styles.modalUsuarioNombre}>{usuarioSeleccionado.nombre}</Text>
                    <Text style={styles.modalUsuarioEmail}>{usuarioSeleccionado.email}</Text>
                    <View style={styles.modalBadges}>
                      <View style={[styles.tipoBadge, { backgroundColor: getTipoColor(usuarioSeleccionado.tipo) + '20' }]}>
                        <Text style={[styles.tipoText, { color: getTipoColor(usuarioSeleccionado.tipo) }]}>
                          {usuarioSeleccionado.tipo.charAt(0).toUpperCase() + usuarioSeleccionado.tipo.slice(1)}
                        </Text>
                      </View>
                      <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(usuarioSeleccionado.estado) + '20' }]}>
                        <Text style={[styles.estadoText, { color: getEstadoColor(usuarioSeleccionado.estado) }]}>
                          {usuarioSeleccionado.estado.charAt(0).toUpperCase() + usuarioSeleccionado.estado.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitulo}>Información general</Text>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Fecha de registro</Text>
                    <Text style={styles.modalInfoValor}>{usuarioSeleccionado.fechaRegistro}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Último acceso</Text>
                    <Text style={styles.modalInfoValor}>{usuarioSeleccionado.ultimoAcceso}</Text>
                  </View>
                  {usuarioSeleccionado.membresia && (
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Membresía</Text>
                      <Text style={styles.modalInfoValor}>{usuarioSeleccionado.membresia}</Text>
                    </View>
                  )}
                </View>

                {usuarioSeleccionado.tipo === 'usuario' && (
                  <View style={styles.modalSeccion}>
                    <Text style={styles.modalSeccionTitulo}>Actividad</Text>
                    <View style={styles.modalStatsGrid}>
                      <View style={styles.modalStatItem}>
                        <Ionicons name="calendar" size={24} color="#4a90e2" />
                        <Text style={styles.modalStatValor}>{usuarioSeleccionado.reservas}</Text>
                        <Text style={styles.modalStatLabel}>Reservas</Text>
                      </View>
                      <View style={styles.modalStatItem}>
                        <Ionicons name="cash" size={24} color="#27ae60" />
                        <Text style={styles.modalStatValor}>${usuarioSeleccionado.gastoTotal}</Text>
                        <Text style={styles.modalStatLabel}>Gasto total</Text>
                      </View>
                    </View>
                  </View>
                )}

                {usuarioSeleccionado.estado === 'suspendido' && usuarioSeleccionado.razonSuspension && (
                  <View style={styles.modalAlerta}>
                    <Ionicons name="warning" size={20} color="#e74c3c" />
                    <Text style={styles.modalAlertaText}>{usuarioSeleccionado.razonSuspension}</Text>
                  </View>
                )}

                {usuarioSeleccionado.estado === 'pendiente' && usuarioSeleccionado.documentosPendientes && (
                  <View style={styles.modalSeccion}>
                    <Text style={styles.modalSeccionTitulo}>Documentos pendientes</Text>
                    {usuarioSeleccionado.documentosPendientes.map((doc, index) => (
                      <View key={index} style={styles.documentoItem}>
                        <Ionicons name="document-text" size={16} color="#f39c12" />
                        <Text style={styles.documentoText}>{doc}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.modalAcciones}>
                  {usuarioSeleccionado.estado === 'activo' && (
                    <TouchableOpacity
                      style={[styles.modalBoton, styles.botonSuspender]}
                      onPress={() => handleCambiarEstado(usuarioSeleccionado, 'suspendido')}
                    >
                      <Ionicons name="pause" size={16} color="#fff" />
                      <Text style={styles.modalBotonText}>Suspender</Text>
                    </TouchableOpacity>
                  )}

                  {usuarioSeleccionado.estado === 'suspendido' && (
                    <TouchableOpacity
                      style={[styles.modalBoton, styles.botonActivar]}
                      onPress={() => handleCambiarEstado(usuarioSeleccionado, 'activo')}
                    >
                      <Ionicons name="play" size={16} color="#fff" />
                      <Text style={styles.modalBotonText}>Activar</Text>
                    </TouchableOpacity>
                  )}

                  {usuarioSeleccionado.estado === 'pendiente' && (
                    <TouchableOpacity
                      style={[styles.modalBoton, styles.botonAprobar]}
                      onPress={() => handleCambiarEstado(usuarioSeleccionado, 'activo')}
                    >
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={styles.modalBotonText}>Aprobar</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.modalBoton, styles.botonEliminar]}
                    onPress={() => handleEliminarUsuario(usuarioSeleccionado)}
                  >
                    <Ionicons name="trash" size={16} color="#fff" />
                    <Text style={styles.modalBotonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
  addButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 10,
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
  estadisticasContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 1,
  },
  estatItem: {
    flex: 1,
    alignItems: 'center',
  },
  estatNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  estatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f8f9fa',
  },
  tabActive: {
    backgroundColor: '#4a90e2',
  },
  tabText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  lista: {
    flex: 1,
  },
  listaContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  usuarioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  usuarioHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  usuarioInfo: {
    flex: 1,
  },
  usuarioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  usuarioEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  usuarioMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tipoText: {
    fontSize: 11,
    fontWeight: '600',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 11,
    fontWeight: '600',
  },
  usuarioStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#5a6c7d',
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
  modalUsuarioHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalUsuarioInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  modalUsuarioNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  modalUsuarioEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  modalBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  modalSeccion: {
    marginBottom: 20,
  },
  modalSeccionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  modalInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  modalInfoValor: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  modalStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginVertical: 4,
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalAlerta: {
    flexDirection: 'row',
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  modalAlertaText: {
    flex: 1,
    fontSize: 12,
    color: '#e74c3c',
  },
  documentoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  documentoText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  modalAcciones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalBoton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  botonSuspender: {
    backgroundColor: '#f39c12',
  },
  botonActivar: {
    backgroundColor: '#27ae60',
  },
  botonAprobar: {
    backgroundColor: '#4a90e2',
  },
  botonEliminar: {
    backgroundColor: '#e74c3c',
  },
  modalBotonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GestionUsuarios;