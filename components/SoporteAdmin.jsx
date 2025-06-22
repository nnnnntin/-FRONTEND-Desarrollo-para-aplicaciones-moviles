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

const SoporteAdmin = ({ navigation }) => {
  const [tabActiva, setTabActiva] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalRespuesta, setModalRespuesta] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [respuesta, setRespuesta] = useState('');

  const [tickets] = useState([
    {
      id: 'TKT001',
      tipo: 'problema_tecnico',
      asunto: 'Error al procesar pago',
      descripcion: 'No puedo completar el pago de mi reserva. La página se queda cargando y no avanza.',
      usuario: 'Juan Pérez',
      email: 'juan@email.com',
      tipoUsuario: 'usuario',
      fecha: '2025-06-20 10:30',
      estado: 'abierto',
      prioridad: 'alta',
      categoria: 'pagos',
      respuestas: []
    },
    {
      id: 'TKT002',
      tipo: 'reporte_servicio',
      asunto: 'Servicio de limpieza deficiente',
      descripcion: 'El servicio de limpieza no cumplió con lo acordado. Dejaron áreas sin limpiar.',
      usuario: 'Cliente Demo',
      email: 'demo@empresa.com',
      tipoUsuario: 'cliente',
      espacio: 'Oficina Skyview',
      proveedor: 'Cleaning Pro',
      fecha: '2025-06-20 09:15',
      estado: 'en_proceso',
      prioridad: 'media',
      categoria: 'servicios',
      respuestas: [
        {
          fecha: '2025-06-20 11:00',
          mensaje: 'Hemos contactado al proveedor para revisar el servicio.',
          admin: 'Admin'
        }
      ]
    },
    {
      id: 'TKT003',
      tipo: 'consulta',
      asunto: '¿Cómo cambio mi plan de membresía?',
      descripcion: 'Quiero actualizar de plan básico a premium pero no encuentro la opción.',
      usuario: 'María González',
      email: 'maria@email.com',
      tipoUsuario: 'proveedor',
      fecha: '2025-06-19 18:45',
      estado: 'resuelto',
      prioridad: 'baja',
      categoria: 'membresias',
      respuestas: [
        {
          fecha: '2025-06-19 19:30',
          mensaje: 'Para cambiar tu membresía, ve a Mi Cuenta > Membresías y selecciona el plan deseado.',
          admin: 'Admin'
        },
        {
          fecha: '2025-06-19 20:00',
          mensaje: 'Gracias, ya pude hacerlo!',
          usuario: 'María González'
        }
      ]
    },
    {
      id: 'TKT004',
      tipo: 'sugerencia',
      asunto: 'Agregar filtro por precio',
      descripcion: 'Sería útil poder filtrar espacios por rango de precio en la búsqueda.',
      usuario: 'Carlos Rodríguez',
      email: 'carlos@email.com',
      tipoUsuario: 'usuario',
      fecha: '2025-06-19 16:20',
      estado: 'abierto',
      prioridad: 'baja',
      categoria: 'funcionalidad',
      respuestas: []
    },
    {
      id: 'TKT005',
      tipo: 'problema_acceso',
      asunto: 'No puedo acceder a mi cuenta',
      descripcion: 'Intento iniciar sesión pero dice que mi contraseña es incorrecta, aunque estoy seguro que es la correcta.',
      usuario: 'Ana Martínez',
      email: 'ana@email.com',
      tipoUsuario: 'usuario',
      fecha: '2025-06-19 14:00',
      estado: 'abierto',
      prioridad: 'urgente',
      categoria: 'acceso',
      respuestas: []
    }
  ]);

  const estadisticas = {
    total: tickets.length,
    abiertos: tickets.filter(t => t.estado === 'abierto').length,
    enProceso: tickets.filter(t => t.estado === 'en_proceso').length,
    resueltos: tickets.filter(t => t.estado === 'resuelto').length,
    urgentes: tickets.filter(t => t.prioridad === 'urgente').length
  };

  const getTipoInfo = (tipo) => {
    switch (tipo) {
      case 'problema_tecnico':
        return { icono: 'bug', color: '#e74c3c', texto: 'Problema técnico' };
      case 'reporte_servicio':
        return { icono: 'warning', color: '#f39c12', texto: 'Reporte de servicio' };
      case 'consulta':
        return { icono: 'help-circle', color: '#3498db', texto: 'Consulta' };
      case 'sugerencia':
        return { icono: 'bulb', color: '#9b59b6', texto: 'Sugerencia' };
      case 'problema_acceso':
        return { icono: 'lock-closed', color: '#e67e22', texto: 'Problema de acceso' };
      default:
        return { icono: 'chatbubble', color: '#7f8c8d', texto: 'Otro' };
    }
  };

  const getEstadoInfo = (estado) => {
    switch (estado) {
      case 'abierto':
        return { color: '#e74c3c', texto: 'Abierto' };
      case 'en_proceso':
        return { color: '#f39c12', texto: 'En proceso' };
      case 'resuelto':
        return { color: '#27ae60', texto: 'Resuelto' };
      case 'cerrado':
        return { color: '#7f8c8d', texto: 'Cerrado' };
      default:
        return { color: '#7f8c8d', texto: estado };
    }
  };

  const getPrioridadInfo = (prioridad) => {
    switch (prioridad) {
      case 'urgente':
        return { color: '#e74c3c', icono: 'flash' };
      case 'alta':
        return { color: '#f39c12', icono: 'arrow-up' };
      case 'media':
        return { color: '#3498db', icono: 'remove' };
      case 'baja':
        return { color: '#27ae60', icono: 'arrow-down' };
      default:
        return { color: '#7f8c8d', icono: 'help' };
    }
  };

  const getTicketsFiltrados = () => {
    let filtrados = tickets;

    if (tabActiva !== 'todos') {
      filtrados = filtrados.filter(t => t.estado === tabActiva);
    }

    if (busqueda) {
      filtrados = filtrados.filter(t =>
        t.asunto.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.id.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    return filtrados;
  };

  const handleVerDetalle = (ticket) => {
    setTicketSeleccionado(ticket);
    setModalDetalle(true);
  };

  const handleResponder = (ticket) => {
    setTicketSeleccionado(ticket);
    setRespuesta('');
    setModalRespuesta(true);
  };

  const handleEnviarRespuesta = () => {
    if (!respuesta.trim()) {
      Alert.alert('Error', 'Por favor escribe una respuesta');
      return;
    }

    Alert.alert(
      'Enviar respuesta',
      '¿Enviar esta respuesta al usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: () => {
            setModalRespuesta(false);
            Alert.alert('Éxito', 'Respuesta enviada correctamente');
          }
        }
      ]
    );
  };

  const handleCambiarEstado = (ticket, nuevoEstado) => {
    Alert.alert(
      'Cambiar estado',
      `¿Cambiar el estado del ticket a "${getEstadoInfo(nuevoEstado).texto}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cambiar',
          onPress: () => {
            Alert.alert('Éxito', 'Estado actualizado');
            setModalDetalle(false);
          }
        }
      ]
    );
  };

  const handleCambiarPrioridad = (ticket) => {
    const prioridades = ['urgente', 'alta', 'media', 'baja'];

    Alert.alert(
      'Cambiar prioridad',
      'Selecciona la nueva prioridad:',
      prioridades.map(p => ({
        text: p.charAt(0).toUpperCase() + p.slice(1),
        onPress: () => {
          Alert.alert('Éxito', 'Prioridad actualizada');
        }
      })).concat([{ text: 'Cancelar', style: 'cancel' }])
    );
  };

  const renderTicket = ({ item }) => {
    const tipoInfo = getTipoInfo(item.tipo);
    const estadoInfo = getEstadoInfo(item.estado);
    const prioridadInfo = getPrioridadInfo(item.prioridad);

    return (
      <TouchableOpacity
        style={styles.ticketCard}
        onPress={() => handleVerDetalle(item)}
      >
        <View style={styles.ticketHeader}>
          <View style={[styles.tipoIcon, { backgroundColor: tipoInfo.color + '20' }]}>
            <Ionicons name={tipoInfo.icono} size={20} color={tipoInfo.color} />
          </View>
          <View style={styles.ticketInfo}>
            <View style={styles.ticketTitleRow}>
              <Text style={styles.ticketId}>#{item.id}</Text>
              <View style={[styles.prioridadBadge, { backgroundColor: prioridadInfo.color + '20' }]}>
                <Ionicons name={prioridadInfo.icono} size={12} color={prioridadInfo.color} />
                <Text style={[styles.prioridadText, { color: prioridadInfo.color }]}>
                  {item.prioridad}
                </Text>
              </View>
            </View>
            <Text style={styles.ticketAsunto} numberOfLines={1}>{item.asunto}</Text>
            <Text style={styles.ticketDescripcion} numberOfLines={2}>{item.descripcion}</Text>
            <View style={styles.ticketMeta}>
              <Text style={styles.ticketUsuario}>{item.usuario}</Text>
              <Text style={styles.ticketFecha}>{item.fecha}</Text>
            </View>
          </View>
        </View>

        <View style={styles.ticketFooter}>
          <View style={[styles.estadoBadge, { backgroundColor: estadoInfo.color + '20' }]}>
            <Text style={[styles.estadoText, { color: estadoInfo.color }]}>
              {estadoInfo.texto}
            </Text>
          </View>
          <View style={styles.ticketActions}>
            {item.respuestas.length > 0 && (
              <View style={styles.respuestaIndicator}>
                <Ionicons name="chatbubbles" size={16} color="#4a90e2" />
                <Text style={styles.respuestaCount}>{item.respuestas.length}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.responderButton}
              onPress={() => handleResponder(item)}
            >
              <Ionicons name="send" size={16} color="#4a90e2" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headerTitle}>Soporte y Tickets</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por ID, asunto o usuario..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <View style={styles.estadisticasCard}>
        <View style={styles.estatItem}>
          <Text style={styles.estatNumero}>{estadisticas.total}</Text>
          <Text style={styles.estatLabel}>Total</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={[styles.estatNumero, { color: '#e74c3c' }]}>
            {estadisticas.abiertos}
          </Text>
          <Text style={styles.estatLabel}>Abiertos</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={[styles.estatNumero, { color: '#f39c12' }]}>
            {estadisticas.enProceso}
          </Text>
          <Text style={styles.estatLabel}>En proceso</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={[styles.estatNumero, { color: '#27ae60' }]}>
            {estadisticas.resueltos}
          </Text>
          <Text style={styles.estatLabel}>Resueltos</Text>
        </View>
      </View>

      {estadisticas.urgentes > 0 && (
        <View style={styles.alertaUrgente}>
          <Ionicons name="flash" size={20} color="#e74c3c" />
          <Text style={styles.alertaUrgenteText}>
            {estadisticas.urgentes} tickets urgentes requieren atención inmediata
          </Text>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {['todos', 'abierto', 'en_proceso', 'resuelto'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, tabActiva === tab && styles.tabActive]}
            onPress={() => setTabActiva(tab)}
          >
            <Text style={[styles.tabText, tabActiva === tab && styles.tabTextActive]}>
              {tab === 'todos' ? 'Todos' :
                tab === 'abierto' ? 'Abiertos' :
                  tab === 'en_proceso' ? 'En proceso' : 'Resueltos'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={getTicketsFiltrados()}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id}
        style={styles.lista}
        contentContainerStyle={styles.listaContent}
      />

      <Modal
        visible={modalDetalle}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalDetalle(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle del ticket</Text>
              <TouchableOpacity
                onPress={() => setModalDetalle(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            {ticketSeleccionado && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.modalTicketHeader}>
                  <Text style={styles.modalTicketId}>#{ticketSeleccionado.id}</Text>
                  <View style={[
                    styles.modalTipoBadge,
                    { backgroundColor: getTipoInfo(ticketSeleccionado.tipo).color + '20' }
                  ]}>
                    <Ionicons
                      name={getTipoInfo(ticketSeleccionado.tipo).icono}
                      size={16}
                      color={getTipoInfo(ticketSeleccionado.tipo).color}
                    />
                    <Text style={[
                      styles.modalTipoText,
                      { color: getTipoInfo(ticketSeleccionado.tipo).color }
                    ]}>
                      {getTipoInfo(ticketSeleccionado.tipo).texto}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalAsunto}>{ticketSeleccionado.asunto}</Text>

                <View style={styles.modalInfoRow}>
                  <View style={[
                    styles.modalEstadoBadge,
                    { backgroundColor: getEstadoInfo(ticketSeleccionado.estado).color + '20' }
                  ]}>
                    <Text style={[
                      styles.modalEstadoText,
                      { color: getEstadoInfo(ticketSeleccionado.estado).color }
                    ]}>
                      {getEstadoInfo(ticketSeleccionado.estado).texto}
                    </Text>
                  </View>

                  <View style={[
                    styles.modalPrioridadBadge,
                    { backgroundColor: getPrioridadInfo(ticketSeleccionado.prioridad).color + '20' }
                  ]}>
                    <Ionicons
                      name={getPrioridadInfo(ticketSeleccionado.prioridad).icono}
                      size={14}
                      color={getPrioridadInfo(ticketSeleccionado.prioridad).color}
                    />
                    <Text style={[
                      styles.modalPrioridadText,
                      { color: getPrioridadInfo(ticketSeleccionado.prioridad).color }
                    ]}>
                      {ticketSeleccionado.prioridad}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Información del usuario</Text>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="person" size={16} color="#4a90e2" />
                    <Text style={styles.modalInfoValue}>{ticketSeleccionado.usuario}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="mail" size={16} color="#4a90e2" />
                    <Text style={styles.modalInfoValue}>{ticketSeleccionado.email}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="shield" size={16} color="#4a90e2" />
                    <Text style={styles.modalInfoValue}>
                      Tipo: {ticketSeleccionado.tipoUsuario}
                    </Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="calendar" size={16} color="#4a90e2" />
                    <Text style={styles.modalInfoValue}>{ticketSeleccionado.fecha}</Text>
                  </View>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Descripción</Text>
                  <Text style={styles.modalDescripcion}>{ticketSeleccionado.descripcion}</Text>
                </View>

                {ticketSeleccionado.espacio && (
                  <View style={styles.modalSeccion}>
                    <Text style={styles.modalSeccionTitle}>Información adicional</Text>
                    <View style={styles.modalInfoItem}>
                      <Ionicons name="business" size={16} color="#4a90e2" />
                      <Text style={styles.modalInfoValue}>Espacio: {ticketSeleccionado.espacio}</Text>
                    </View>
                    {ticketSeleccionado.proveedor && (
                      <View style={styles.modalInfoItem}>
                        <Ionicons name="construct" size={16} color="#4a90e2" />
                        <Text style={styles.modalInfoValue}>
                          Proveedor: {ticketSeleccionado.proveedor}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {ticketSeleccionado.respuestas && ticketSeleccionado.respuestas.length > 0 && (
                  <View style={styles.modalSeccion}>
                    <Text style={styles.modalSeccionTitle}>Conversación</Text>
                    {ticketSeleccionado.respuestas.map((respuesta, index) => (
                      <View key={index} style={styles.respuestaItem}>
                        <View style={styles.respuestaHeader}>
                          <Text style={styles.respuestaAutor}>
                            {respuesta.admin ? 'Admin' : respuesta.usuario}
                          </Text>
                          <Text style={styles.respuestaFecha}>{respuesta.fecha}</Text>
                        </View>
                        <Text style={styles.respuestaMensaje}>{respuesta.mensaje}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.modalAcciones}>
                  <TouchableOpacity
                    style={[styles.modalBoton, styles.botonResponder]}
                    onPress={() => {
                      setModalDetalle(false);
                      handleResponder(ticketSeleccionado);
                    }}
                  >
                    <Ionicons name="send" size={16} color="#fff" />
                    <Text style={styles.modalBotonText}>Responder</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBoton, styles.botonEstado]}
                    onPress={() => handleCambiarEstado(
                      ticketSeleccionado,
                      ticketSeleccionado.estado === 'abierto' ? 'en_proceso' : 'resuelto'
                    )}
                  >
                    <Ionicons name="sync" size={16} color="#fff" />
                    <Text style={styles.modalBotonText}>Cambiar estado</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBoton, styles.botonPrioridad]}
                    onPress={() => handleCambiarPrioridad(ticketSeleccionado)}
                  >
                    <Ionicons name="flag" size={16} color="#fff" />
                    <Text style={styles.modalBotonText}>Prioridad</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalRespuesta}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalRespuesta(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Responder ticket</Text>
              <TouchableOpacity
                onPress={() => setModalRespuesta(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            {ticketSeleccionado && (
              <View style={styles.modalContent}>
                <View style={styles.respuestaInfo}>
                  <Text style={styles.respuestaInfoLabel}>Respondiendo a:</Text>
                  <Text style={styles.respuestaInfoValue}>{ticketSeleccionado.usuario}</Text>
                  <Text style={styles.respuestaInfoAsunto}>
                    Re: {ticketSeleccionado.asunto}
                  </Text>
                </View>

                <View style={styles.respuestaInputContainer}>
                  <Text style={styles.respuestaLabel}>Tu respuesta:</Text>
                  <TextInput
                    style={styles.respuestaInput}
                    placeholder="Escribe tu respuesta aquí..."
                    multiline
                    value={respuesta}
                    onChangeText={setRespuesta}
                  />
                </View>

                <View style={styles.respuestaOpciones}>
                  <TouchableOpacity style={styles.opcionItem}>
                    <Ionicons name="attach" size={20} color="#4a90e2" />
                    <Text style={styles.opcionText}>Adjuntar archivo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.opcionItem}>
                    <Ionicons name="document-text" size={20} color="#4a90e2" />
                    <Text style={styles.opcionText}>Usar plantilla</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.respuestaActions}>
                  <TouchableOpacity
                    style={styles.cancelarButton}
                    onPress={() => setModalRespuesta(false)}
                  >
                    <Text style={styles.cancelarButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.enviarButton}
                    onPress={handleEnviarRespuesta}
                  >
                    <Ionicons name="send" size={16} color="#fff" />
                    <Text style={styles.enviarButtonText}>Enviar respuesta</Text>
                  </TouchableOpacity>
                </View>
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
  estadisticasCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  estatItem: {
    alignItems: 'center',
    flex: 1,
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
  alertaUrgente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  alertaUrgenteText: {
    flex: 1,
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
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
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  ticketHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketId: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  prioridadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  prioridadText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  ticketAsunto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  ticketDescripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  ticketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketUsuario: {
    fontSize: 12,
    color: '#4a90e2',
  },
  ticketFecha: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ticketActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  respuestaIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  respuestaCount: {
    fontSize: 12,
    color: '#4a90e2',
    fontWeight: '600',
  },
  responderButton: {
    padding: 8,
    backgroundColor: '#e8f4fd',
    borderRadius: 16,
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
    maxHeight: '90%',
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
  modalTicketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTicketId: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  modalTipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  modalTipoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalAsunto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  modalEstadoBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalEstadoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalPrioridadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  modalPrioridadText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalSeccion: {
    marginBottom: 20,
  },
  modalSeccionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#2c3e50',
  },
  modalDescripcion: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 20,
  },
  respuestaItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  respuestaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  respuestaAutor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  respuestaFecha: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  respuestaMensaje: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 20,
  },
  modalAcciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  modalBoton: {
    flex: 1,
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  botonResponder: {
    backgroundColor: '#4a90e2',
  },
  botonEstado: {
    backgroundColor: '#27ae60',
  },
  botonPrioridad: {
    backgroundColor: '#f39c12',
  },
  modalBotonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  respuestaInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  respuestaInfoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  respuestaInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  respuestaInfoAsunto: {
    fontSize: 14,
    color: '#5a6c7d',
  },
  respuestaInputContainer: {
    marginBottom: 20,
  },
  respuestaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  respuestaInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  respuestaOpciones: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  opcionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  opcionText: {
    fontSize: 14,
    color: '#4a90e2',
  },
  respuestaActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelarButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
  },
  cancelarButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  enviarButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#4a90e2',
    gap: 8,
  },
  enviarButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default SoporteAdmin;