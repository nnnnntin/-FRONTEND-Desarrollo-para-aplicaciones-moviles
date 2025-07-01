import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
import { useDispatch, useSelector } from 'react-redux';

import {
  actualizarUsuario,
  cambiarRolUsuario,
  clearError,
  eliminarUsuario,
  limpiarUsuarioSeleccionado,
  obtenerUsuarios,
  seleccionarUsuario
} from '../store/slices/usuarioSlice';

const GestionUsuarios = ({ navigation }) => {

  const dispatch = useDispatch();
  const { token, usuario: usuarioLogueado } = useSelector(state => state.auth);
  const {
    usuarios,
    usuarioSeleccionado,
    loading,
    error,
    loadingDetalle,
    pagination
  } = useSelector(state => state.usuario);


  const [tabActiva, setTabActiva] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modalDetalles, setModalDetalles] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    verificarPermisos();
    cargarUsuarios();


    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);


  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const verificarPermisos = () => {
    if (!usuarioLogueado || usuarioLogueado.tipoUsuario !== 'administrador') {
      Alert.alert(
        'Acceso denegado',
        'Solo los administradores pueden acceder a esta función',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

const capitalize = txt =>
  typeof txt === 'string' && txt.length
    ? txt[0].toUpperCase() + txt.slice(1)
    : '';

  const cargarUsuarios = async () => {
   await dispatch(obtenerUsuarios({ skip: 0, limit: 100 }));
  };

console.log('Usuarios cargados:', usuarios);
  const usuariosMapeados = usuarios.map(user => ({
    id: user._id || user.id,
    nombre: user.nombre + (user.apellidos ? ' ' + user.apellidos : ''),
    email: user.email,
    username: user.username,
    tipo: user.tipoUsuario || 'usuario',
    estado: user.activo ? 'activo' : 'suspendido',
    fechaRegistro: new Date(user.createdAt).toLocaleDateString(),
    ultimoAcceso: new Date(user.updatedAt).toLocaleDateString(),
    verificado: user.verificado,
    rol: user.rol,
    telefono: user.datosPersonales?.telefono,
    documentoIdentidad: user.datosPersonales?.documentoIdentidad,
    fotoUrl: user.datosPersonales?.fotoUrl,
    direccion: user.direccion,
    membresia: user.membresia?.tipoMembresiaId ? 'Premium' : 'Básico',
    datosCompletos: user
  }));

  const estadisticasPorTipo = {
    usuarios: usuariosMapeados.filter(u => u.tipo === 'usuario').length,
    clientes: usuariosMapeados.filter(u => u.tipo === 'cliente').length,
    proveedores: usuariosMapeados.filter(u => u.tipo === 'proveedor').length,
    administradores: usuariosMapeados.filter(u => u.tipo === 'administrador').length,
    activos: usuariosMapeados.filter(u => u.estado === 'activo').length,
    suspendidos: usuariosMapeados.filter(u => u.estado === 'suspendido').length,
    verificados: usuariosMapeados.filter(u => u.verificado).length
  };

  const getUsuariosFiltrados = () => {
    let filtrados = usuariosMapeados;

    if (tabActiva !== 'todos') {
      filtrados = filtrados.filter(u => u.tipo === tabActiva);
    }

    if (busqueda) {
      filtrados = filtrados.filter(u =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.username.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    return filtrados;
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'usuario': return '#4a90e2';
      case 'cliente': return '#27ae60';
      case 'proveedor': return '#9b59b6';
      case 'administrador': return '#e74c3c';
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
    dispatch(seleccionarUsuario(usuario));
    setModalDetalles(true);
  };

const handleCambiarEstado = (usuario, nuevoEstado) => {
  const estadoActivo = nuevoEstado === 'activo';

  Alert.alert(
    'Cambiar estado',
    `¿Cambiar estado de ${usuario.nombre} a ${nuevoEstado}?`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            setIsUpdating(true);

            // 1️⃣  despacha y unwrap
            await dispatch(
              actualizarUsuario({
                usuarioId: usuario.id,
                datosActualizacion: { activo: estadoActivo },
              })
            ).unwrap();

            // 2️⃣  feedback
            Alert.alert('Éxito', 'Estado actualizado correctamente');

             // 🔄 2) actualizo el usuario del modal (opcional)
            dispatch(seleccionarUsuario({
              ...usuario,
              estado: nuevoEstado,
              activo: estadoActivo
            }));
          } catch (err) {
            console.error(err);
            Alert.alert('Error', err.message || 'No se pudo actualizar');
          } finally {
            setIsUpdating(false);
          }
        },
      },
    ]
  );
};

 
  const handleCambiarRol = async (usuario, nuevoRol) => {
    Alert.alert(
      'Cambiar rol',
      `¿Estás seguro de cambiar el rol de ${usuario.nombre} a ${nuevoRol}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setIsUpdating(true);


              const result = await dispatch(cambiarRolUsuario({
                usuarioId: usuario.id,
                nuevoRol: nuevoRol
              }));

              if (cambiarRolUsuario.fulfilled.match(result)) {
                Alert.alert('Éxito', 'Rol actualizado correctamente');

                cargarUsuarios();
              } else {
                throw new Error(result.payload || 'Error al cambiar rol');
              }
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'No se pudo cambiar el rol del usuario');
            } finally {
              setIsUpdating(false);
            }
          }
        }
      ]
    );
  };


  const handleEliminarUsuario = async (usuario) => {
    Alert.alert(
      'Eliminar usuario',
      `¿Estás seguro de eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsUpdating(true);


              const result = await dispatch(eliminarUsuario(usuario.id));

              if (eliminarUsuario.fulfilled.match(result)) {
                setModalDetalles(false);
                dispatch(limpiarUsuarioSeleccionado());
                Alert.alert('Éxito', 'Usuario eliminado correctamente');
              } else {
                throw new Error(result.payload || 'Error al eliminar usuario');
              }
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'No se pudo eliminar el usuario');
            } finally {
              setIsUpdating(false);
            }
          }
        }
      ]
    );
  };


  const handleCerrarModal = () => {
    setModalDetalles(false);
    dispatch(limpiarUsuarioSeleccionado());
  };

  const renderUsuario = ({ item }) => (
    <TouchableOpacity
      style={styles.usuarioCard}
      onPress={() => handleVerDetalles(item)}
    >
      <View style={styles.usuarioHeader}>
        <View style={styles.avatarContainer}>
          {item.fotoUrl ? (
            <Image source={{ uri: item.fotoUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {item.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </Text>
          )}
        </View>
        <View style={styles.usuarioInfo}>
          <Text style={styles.usuarioNombre}>{item.nombre}</Text>
          <Text style={styles.usuarioEmail}>{item.email}</Text>
          <Text style={styles.usuarioUsername}>@{item.username}</Text>
          <View style={styles.usuarioMeta}>
            <View style={[styles.tipoBadge, { backgroundColor: getTipoColor(item.tipo) + '20' }]}>
              <Text style={[styles.tipoText, { color: getTipoColor(item.tipo) }]}>
                {capitalize(item.tipo)}
              </Text>
            </View>
            <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) + '20' }]}>
              <Text style={[styles.estadoText, { color: getEstadoColor(item.estado) }]}>
                {capitalize(item.estado)}
              </Text>
            </View>
            {item.verificado && (
              <View style={styles.verificadoBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderModalContent = () => {
    if (!usuarioSeleccionado) return null;

    return (
      <ScrollView style={styles.modalContent}>
        <View style={styles.modalUsuarioHeader}>
          <View style={styles.modalAvatar}>
            {usuarioSeleccionado.fotoUrl ? (
              <Image source={{ uri: usuarioSeleccionado.fotoUrl }} style={styles.modalAvatarImage} />
            ) : (
              <Text style={styles.modalAvatarText}>
                {usuarioSeleccionado.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </Text>
            )}
          </View>
          <View style={styles.modalUsuarioInfo}>
            <Text style={styles.modalUsuarioNombre}>{usuarioSeleccionado.nombre}</Text>
            <Text style={styles.modalUsuarioEmail}>{usuarioSeleccionado.email}</Text>
            <Text style={styles.modalUsuarioUsername}>@{usuarioSeleccionado.username}</Text>
            <View style={styles.modalBadges}>
              <View style={[styles.tipoBadge, { backgroundColor: getTipoColor(usuarioSeleccionado.tipo) + '20' }]}>
                <Text style={[styles.tipoText, { color: getTipoColor(usuarioSeleccionado.tipo) }]}>
                  {capitalize(usuarioSeleccionado.tipo)}
                </Text>
              </View>
              <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(usuarioSeleccionado.estado) + '20' }]}>
                <Text style={[styles.estadoText, { color: getEstadoColor(usuarioSeleccionado.estado) }]}>
                  {capitalize(usuarioSeleccionado.estado)}
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
            <Text style={styles.modalInfoLabel}>Última actualización</Text>
            <Text style={styles.modalInfoValor}>{usuarioSeleccionado.ultimoAcceso}</Text>
          </View>
          <View style={styles.modalInfoItem}>
            <Text style={styles.modalInfoLabel}>Rol</Text>
            <Text style={styles.modalInfoValor}>{usuarioSeleccionado.rol}</Text>
          </View>
          <View style={styles.modalInfoItem}>
            <Text style={styles.modalInfoLabel}>Verificado</Text>
            <Text style={styles.modalInfoValor}>{usuarioSeleccionado.verificado ? 'Sí' : 'No'}</Text>
          </View>
          {usuarioSeleccionado.telefono && (
            <View style={styles.modalInfoItem}>
              <Text style={styles.modalInfoLabel}>Teléfono</Text>
              <Text style={styles.modalInfoValor}>{usuarioSeleccionado.telefono}</Text>
            </View>
          )}
          {usuarioSeleccionado.documentoIdentidad && (
            <View style={styles.modalInfoItem}>
              <Text style={styles.modalInfoLabel}>Documento</Text>
              <Text style={styles.modalInfoValor}>{usuarioSeleccionado.documentoIdentidad}</Text>
            </View>
          )}
        </View>

        {usuarioSeleccionado.direccion && (
          <View style={styles.modalSeccion}>
            <Text style={styles.modalSeccionTitulo}>Dirección</Text>
            {usuarioSeleccionado.direccion.calle && (
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>Calle</Text>
                <Text style={styles.modalInfoValor}>{usuarioSeleccionado.direccion.calle}</Text>
              </View>
            )}
            {usuarioSeleccionado.direccion.ciudad && (
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>Ciudad</Text>
                <Text style={styles.modalInfoValor}>{usuarioSeleccionado.direccion.ciudad}</Text>
              </View>
            )}
            {usuarioSeleccionado.direccion.codigoPostal && (
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>Código Postal</Text>
                <Text style={styles.modalInfoValor}>{usuarioSeleccionado.direccion.codigoPostal}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.modalAcciones}>
    {/*       <View style={styles.accionesSection}>
            <Text style={styles.accionesTitle}>Cambiar tipo de usuario</Text>
            <View style={styles.rolesContainer}>
              {['usuario', 'cliente', 'proveedor', 'administrador'].map(tipo => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.rolButton,
                    usuarioSeleccionado.tipo === tipo && styles.rolButtonActive,
                    isUpdating && styles.buttonDisabled
                  ]}
                  onPress={() => handleCambiarRol(usuarioSeleccionado, tipo)}
                  disabled={isUpdating || usuarioSeleccionado.tipo === tipo}
                >
                  <Text style={[
                    styles.rolButtonText,
                    usuarioSeleccionado.tipo === tipo && styles.rolButtonTextActive
                  ]}>
                    {capitalize(tipo)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.accionesSection}>
            <Text style={styles.accionesTitle}>Cambiar rol</Text>
            <View style={styles.rolesContainer}>
              {['usuario', 'editor', 'administrador'].map(rol => (
                <TouchableOpacity
                  key={rol}
                  style={[
                    styles.rolButton,
                    usuarioSeleccionado.rol === rol && styles.rolButtonActive,
                    isUpdating && styles.buttonDisabled
                  ]}
                  onPress={() => handleCambiarRol(usuarioSeleccionado, rol)}
                  disabled={isUpdating || usuarioSeleccionado.rol === rol}
                >
                  <Text style={[
                    styles.rolButtonText,
                    usuarioSeleccionado.rol === rol && styles.rolButtonTextActive
                  ]}>
                    {capitalize(rol)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
*/}
          <View style={styles.accionesSection}>
            <Text style={styles.accionesTitle}>Acciones</Text>
            <View style={styles.botonesContainer}>
              {usuarioSeleccionado.estado === 'activo' ? (
                <TouchableOpacity
                  style={[styles.modalBoton, styles.botonSuspender, isUpdating && styles.buttonDisabled]}
                  onPress={() => handleCambiarEstado(usuarioSeleccionado, 'suspendido')}
                  disabled={isUpdating}
                >
                  <Ionicons name="pause" size={16} color="#fff" />
                  <Text style={styles.modalBotonText}>Suspender</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.modalBoton, styles.botonActivar, isUpdating && styles.buttonDisabled]}
                  onPress={() => handleCambiarEstado(usuarioSeleccionado, 'activo')}
                  disabled={isUpdating}
                >
                  <Ionicons name="play" size={16} color="#fff" />
                  <Text style={styles.modalBotonText}>Activar</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.modalBoton, styles.botonEliminar, isUpdating && styles.buttonDisabled]}
                onPress={() => handleEliminarUsuario(usuarioSeleccionado)}
                disabled={isUpdating}
              >
                <Ionicons name="trash" size={16} color="#fff" />
                <Text style={styles.modalBotonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {isUpdating && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4a90e2" />
            <Text style={styles.loadingText}>Actualizando...</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
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
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={cargarUsuarios}
          disabled={loading}
        >
          <Ionicons name="refresh" size={24} color={loading ? "#ccc" : "#4a90e2"} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, email o username..."
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
        {['todos', 'usuario', 'cliente', 'proveedor', 'administrador'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, tabActiva === tab && styles.tabActive]}
            onPress={() => setTabActiva(tab)}
          >
            <Text style={[styles.tabText, tabActiva === tab && styles.tabTextActive]}>
              {tab === 'todos' ? 'Todos' : capitalize(tab)}
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
        refreshing={loading}
        onRefresh={cargarUsuarios}
      />

      <Modal
        visible={modalDetalles}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles del usuario</Text>
              <TouchableOpacity
                onPress={handleCerrarModal}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>
            {renderModalContent()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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
  refreshButton: {
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
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 2,
  },
  usuarioUsername: {
    fontSize: 12,
    color: '#9b59b6',
    marginBottom: 6,
  },
  usuarioMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
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
  verificadoBadge: {
    marginLeft: 4,
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
  modalAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    marginBottom: 2,
  },
  modalUsuarioUsername: {
    fontSize: 12,
    color: '#9b59b6',
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
  modalAcciones: {
    marginTop: 20,
  },
  accionesSection: {
    marginBottom: 20,
  },
  accionesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  rolesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  rolButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    alignItems: 'center',
  },
  rolButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  rolButtonText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  rolButtonTextActive: {
    color: '#fff',
  },
  botonesContainer: {
    flexDirection: 'row',
    gap: 10,
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