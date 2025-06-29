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

const GestionPublicaciones = ({ navigation }) => {
  const [tabActiva, setTabActiva] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [modalDetalles, setModalDetalles] = useState(false);
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState(null);
  const [modalEditar, setModalEditar] = useState(false);

  const [publicaciones, setPublicaciones] = useState([
    {
      id: 1,
      nombre: "Oficina Panorámica 'Skyview'",
      tipo: 'oficina',
      propietario: 'Cliente Demo',
      email: 'demo@empresa.com',
      estado: 'activa',
      precio: 1200,
      capacidad: 8,
      direccion: 'Montevideo, Ciudad Vieja',
      fechaPublicacion: '2024-01-15',
      reservasTotal: 145,
      ingresosGenerados: 45600,
      calificacion: 4.8,
      servicios: ['wifi', 'cafe', 'seguridad'],
      ultimaReserva: '2025-06-18',
      comisionesGeneradas: 4560
    },
    {
      id: 2,
      nombre: "Oficina 'El mirador'",
      tipo: 'oficina',
      propietario: 'Cliente Demo',
      email: 'demo@empresa.com',
      estado: 'activa',
      precio: 1500,
      capacidad: 12,
      direccion: 'Montevideo, Pocitos',
      fechaPublicacion: '2024-01-20',
      reservasTotal: 89,
      ingresosGenerados: 32400,
      calificacion: 4.9,
      servicios: ['wifi', 'cafe', 'parking'],
      ultimaReserva: '2025-06-17',
      comisionesGeneradas: 3240
    },
    {
      id: 3,
      nombre: "Oficina 'Centro'",
      tipo: 'oficina',
      propietario: 'Otro Cliente',
      email: 'otro@empresa.com',
      estado: 'pausada',
      precio: 900,
      capacidad: 6,
      direccion: 'Montevideo, Centro',
      fechaPublicacion: '2024-02-10',
      reservasTotal: 56,
      ingresosGenerados: 18900,
      calificacion: 4.5,
      servicios: ['wifi', 'seguridad'],
      ultimaReserva: '2025-05-20',
      comisionesGeneradas: 1890,
      razonPausa: 'Renovaciones en curso'
    },
    {
      id: 4,
      nombre: "Espacio Coworking",
      tipo: 'espacio',
      propietario: 'Spaces Inc',
      email: 'info@spaces.com',
      estado: 'pendiente',
      precio: 50,
      capacidad: 1,
      direccion: 'Montevideo, Cordón',
      fechaPublicacion: '2025-06-15',
      documentosPendientes: ['Habilitación municipal', 'Seguro del espacio']
    },
    {
      id: 5,
      nombre: "Sala de Reuniones Premium",
      tipo: 'sala',
      propietario: 'Business Center',
      email: 'contact@business.com',
      estado: 'reportada',
      precio: 200,
      capacidad: 20,
      direccion: 'Montevideo, Carrasco',
      fechaPublicacion: '2024-03-01',
      reservasTotal: 234,
      ingresosGenerados: 67800,
      calificacion: 3.2,
      servicios: ['wifi', 'proyector', 'pizarra'],
      ultimaReserva: '2025-06-10',
      comisionesGeneradas: 6780,
      reportes: [
        { fecha: '2025-06-05', motivo: 'Equipamiento defectuoso', usuario: 'juan@email.com' },
        { fecha: '2025-06-08', motivo: 'Limpieza deficiente', usuario: 'maria@email.com' }
      ]
    }
  ]);

  const estadisticas = {
    total: publicaciones.length,
    activas: publicaciones.filter(p => p.estado === 'activa').length,
    pausadas: publicaciones.filter(p => p.estado === 'pausada').length,
    pendientes: publicaciones.filter(p => p.estado === 'pendiente').length,
    reportadas: publicaciones.filter(p => p.estado === 'reportada').length,
    ingresosTotal: publicaciones.reduce((sum, p) => sum + (p.ingresosGenerados || 0), 0),
    comisionesTotal: publicaciones.reduce((sum, p) => sum + (p.comisionesGeneradas || 0), 0)
  };

  const getPublicacionesFiltradas = () => {
    let filtradas = publicaciones;

    if (tabActiva !== 'todas') {
      filtradas = filtradas.filter(p => {
        if (tabActiva === 'activas') return p.estado === 'activa';
        if (tabActiva === 'pausadas') return p.estado === 'pausada';
        if (tabActiva === 'pendientes') return p.estado === 'pendiente';
        if (tabActiva === 'reportadas') return p.estado === 'reportada';
        return true;
      });
    }

    if (busqueda) {
      filtradas = filtradas.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.propietario.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.direccion.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    return filtradas;
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'oficina': return '#4a90e2';
      case 'espacio': return '#9b59b6';
      case 'sala': return '#f39c12';
      case 'escritorio': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  const getEstadoInfo = (estado) => {
    switch (estado) {
      case 'activa': return { color: '#27ae60', icono: 'checkmark-circle' };
      case 'pausada': return { color: '#f39c12', icono: 'pause-circle' };
      case 'pendiente': return { color: '#3498db', icono: 'time' };
      case 'reportada': return { color: '#e74c3c', icono: 'warning' };
      default: return { color: '#7f8c8d', icono: 'help-circle' };
    }
  };

  const handleVerDetalles = (publicacion) => {
    setPublicacionSeleccionada(publicacion);
    setModalDetalles(true);
  };

  const handleCambiarEstado = (publicacion, nuevoEstado) => {
    Alert.alert(
      'Cambiar estado',
      `¿Cambiar el estado de "${publicacion.nombre}" a ${nuevoEstado}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setPublicaciones(prev => prev.map(p =>
              p.id === publicacion.id ? { ...p, estado: nuevoEstado } : p
            ));
            Alert.alert('Éxito', 'Estado actualizado correctamente');
          }
        }
      ]
    );
  };

  const handleEliminarPublicacion = (publicacion) => {
    Alert.alert(
      'Eliminar publicación',
      `¿Estás seguro de eliminar "${publicacion.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setPublicaciones(prev => prev.filter(p => p.id !== publicacion.id));
            setModalDetalles(false);
            Alert.alert('Éxito', 'Publicación eliminada');
          }
        }
      ]
    );
  };

  const renderPublicacion = ({ item }) => {
    const estadoInfo = getEstadoInfo(item.estado);

    return (
      <TouchableOpacity
        style={styles.publicacionCard}
        onPress={() => handleVerDetalles(item)}
      >
        <View style={styles.publicacionHeader}>
          <View style={[styles.tipoIcon, { backgroundColor: getTipoColor(item.tipo) + '20' }]}>
            <Ionicons
              name={item.tipo === 'oficina' ? 'business' :
                item.tipo === 'espacio' ? 'square' :
                  item.tipo === 'sala' ? 'people' : 'desktop'}
              size={20}
              color={getTipoColor(item.tipo)}
            />
          </View>
          <View style={styles.publicacionInfo}>
            <Text style={styles.publicacionNombre}>{item.nombre}</Text>
            <Text style={styles.publicacionPropietario}>{item.propietario}</Text>
            <Text style={styles.publicacionDireccion}>{item.direccion}</Text>
          </View>
          <View style={styles.estadoContainer}>
            <Ionicons name={estadoInfo.icono} size={24} color={estadoInfo.color} />
          </View>
        </View>

        <View style={styles.publicacionStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Precio</Text>
            <Text style={styles.statValue}>${item.precio}/día</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Capacidad</Text>
            <Text style={styles.statValue}>{item.capacidad} pers.</Text>
          </View>
          {item.reservasTotal && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Reservas</Text>
              <Text style={styles.statValue}>{item.reservasTotal}</Text>
            </View>
          )}
          {item.calificacion && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Rating</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#f39c12" />
                <Text style={styles.statValue}>{item.calificacion}</Text>
              </View>
            </View>
          )}
        </View>

        {item.estado === 'reportada' && (
          <View style={styles.alertaBadge}>
            <Ionicons name="alert-circle" size={16} color="#e74c3c" />
            <Text style={styles.alertaText}>
              {item.reportes?.length || 0} reportes activos
            </Text>
          </View>
        )}
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
        <Text style={styles.headerTitle}>Gestión de Espacios</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="filter" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, propietario o dirección..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <View style={styles.estadisticasCard}>
        <View style={styles.estadisticasGrid}>
          <View style={styles.estatItem}>
            <Text style={styles.estatNumero}>{estadisticas.total}</Text>
            <Text style={styles.estatLabel}>Total</Text>
          </View>
          <View style={styles.estatItem}>
            <Text style={[styles.estatNumero, { color: '#27ae60' }]}>
              {estadisticas.activas}
            </Text>
            <Text style={styles.estatLabel}>Activas</Text>
          </View>
          <View style={styles.estatItem}>
            <Text style={[styles.estatNumero, { color: '#3498db' }]}>
              {estadisticas.pendientes}
            </Text>
            <Text style={styles.estatLabel}>Pendientes</Text>
          </View>
          <View style={styles.estatItem}>
            <Text style={[styles.estatNumero, { color: '#e74c3c' }]}>
              {estadisticas.reportadas}
            </Text>
            <Text style={styles.estatLabel}>Reportadas</Text>
          </View>
        </View>
        <View style={styles.estadisticasFinancieras}>
          <View style={styles.financieraItem}>
            <Text style={styles.financieraLabel}>Ingresos totales</Text>
            <Text style={styles.financieraValue}>
              ${estadisticas.ingresosTotal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.financieraItem}>
            <Text style={styles.financieraLabel}>Comisiones generadas</Text>
            <Text style={[styles.financieraValue, { color: '#27ae60' }]}>
              ${estadisticas.comisionesTotal.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {['todas', 'activas', 'pausadas', 'pendientes', 'reportadas'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, tabActiva === tab && styles.tabActive]}
            onPress={() => setTabActiva(tab)}
          >
            <Text style={[styles.tabText, tabActiva === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={getPublicacionesFiltradas()}
        renderItem={renderPublicacion}
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
              <Text style={styles.modalTitle}>Detalles del espacio</Text>
              <TouchableOpacity
                onPress={() => setModalDetalles(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            {publicacionSeleccionada && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.modalSeccion}>
                  <View style={[
                    styles.modalTipoHeader,
                    { backgroundColor: getTipoColor(publicacionSeleccionada.tipo) + '20' }
                  ]}>
                    <Ionicons
                      name={publicacionSeleccionada.tipo === 'oficina' ? 'business' :
                        publicacionSeleccionada.tipo === 'espacio' ? 'square' :
                          publicacionSeleccionada.tipo === 'sala' ? 'people' : 'desktop'}
                      size={24}
                      color={getTipoColor(publicacionSeleccionada.tipo)}
                    />
                    <Text style={styles.modalTipoText}>
                      {publicacionSeleccionada.tipo.charAt(0).toUpperCase() + publicacionSeleccionada.tipo.slice(1)}
                    </Text>
                  </View>

                  <Text style={styles.modalNombre}>{publicacionSeleccionada.nombre}</Text>
                  <Text style={styles.modalDireccion}>{publicacionSeleccionada.direccion}</Text>

                  <View style={[
                    styles.modalEstadoBadge,
                    { backgroundColor: getEstadoInfo(publicacionSeleccionada.estado).color + '20' }
                  ]}>
                    <Ionicons
                      name={getEstadoInfo(publicacionSeleccionada.estado).icono}
                      size={16}
                      color={getEstadoInfo(publicacionSeleccionada.estado).color}
                    />
                    <Text style={[
                      styles.modalEstadoText,
                      { color: getEstadoInfo(publicacionSeleccionada.estado).color }
                    ]}>
                      {publicacionSeleccionada.estado.charAt(0).toUpperCase() + publicacionSeleccionada.estado.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Información del propietario</Text>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Nombre</Text>
                    <Text style={styles.modalInfoValue}>{publicacionSeleccionada.propietario}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Email</Text>
                    <Text style={styles.modalInfoValue}>{publicacionSeleccionada.email}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Fecha publicación</Text>
                    <Text style={styles.modalInfoValue}>{publicacionSeleccionada.fechaPublicacion}</Text>
                  </View>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Detalles del espacio</Text>
                  <View style={styles.modalGrid}>
                    <View style={styles.modalGridItem}>
                      <Text style={styles.modalGridLabel}>Precio</Text>
                      <Text style={styles.modalGridValue}>${publicacionSeleccionada.precio}/día</Text>
                    </View>
                    <View style={styles.modalGridItem}>
                      <Text style={styles.modalGridLabel}>Capacidad</Text>
                      <Text style={styles.modalGridValue}>{publicacionSeleccionada.capacidad} personas</Text>
                    </View>
                  </View>

                  {publicacionSeleccionada.servicios && (
                    <View style={styles.serviciosContainer}>
                      <Text style={styles.serviciosLabel}>Servicios incluidos:</Text>
                      <View style={styles.serviciosGrid}>
                        {publicacionSeleccionada.servicios.map((servicio, index) => (
                          <View key={index} style={styles.servicioChip}>
                            <Text style={styles.servicioText}>{servicio}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                {publicacionSeleccionada.estado === 'activa' && (
                  <View style={styles.modalSeccion}>
                    <Text style={styles.modalSeccionTitle}>Estadísticas</Text>
                    <View style={styles.modalEstadisticas}>
                      <View style={styles.modalEstatItem}>
                        <Ionicons name="calendar" size={20} color="#4a90e2" />
                        <Text style={styles.modalEstatValor}>{publicacionSeleccionada.reservasTotal}</Text>
                        <Text style={styles.modalEstatLabel}>Reservas</Text>
                      </View>
                      <View style={styles.modalEstatItem}>
                        <Ionicons name="cash" size={20} color="#27ae60" />
                        <Text style={styles.modalEstatValor}>${publicacionSeleccionada.ingresosGenerados}</Text>
                        <Text style={styles.modalEstatLabel}>Ingresos</Text>
                      </View>
                      <View style={styles.modalEstatItem}>
                        <Ionicons name="trending-up" size={20} color="#f39c12" />
                        <Text style={styles.modalEstatValor}>${publicacionSeleccionada.comisionesGeneradas}</Text>
                        <Text style={styles.modalEstatLabel}>Comisiones</Text>
                      </View>
                    </View>
                    {publicacionSeleccionada.ultimaReserva && (
                      <Text style={styles.ultimaReservaText}>
                        Última reserva: {publicacionSeleccionada.ultimaReserva}
                      </Text>
                    )}
                  </View>
                )}

                {publicacionSeleccionada.estado === 'reportada' && publicacionSeleccionada.reportes && (
                  <View style={styles.modalSeccion}>
                    <Text style={styles.modalSeccionTitle}>Reportes recibidos</Text>
                    {publicacionSeleccionada.reportes.map((reporte, index) => (
                      <View key={index} style={styles.reporteItem}>
                        <Ionicons name="alert-circle" size={16} color="#e74c3c" />
                        <View style={styles.reporteInfo}>
                          <Text style={styles.reporteMotivo}>{reporte.motivo}</Text>
                          <Text style={styles.reporteDetalles}>
                            {reporte.fecha} - {reporte.usuario}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {publicacionSeleccionada.estado === 'pausada' && publicacionSeleccionada.razonPausa && (
                  <View style={styles.modalAlerta}>
                    <Ionicons name="information-circle" size={20} color="#f39c12" />
                    <Text style={styles.modalAlertaText}>
                      Razón de pausa: {publicacionSeleccionada.razonPausa}
                    </Text>
                  </View>
                )}

                {publicacionSeleccionada.estado === 'pendiente' && publicacionSeleccionada.documentosPendientes && (
                  <View style={styles.modalSeccion}>
                    <Text style={styles.modalSeccionTitle}>Documentos pendientes</Text>
                    {publicacionSeleccionada.documentosPendientes.map((doc, index) => (
                      <View key={index} style={styles.documentoItem}>
                        <Ionicons name="document-text" size={16} color="#3498db" />
                        <Text style={styles.documentoText}>{doc}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.modalAcciones}>
                  {publicacionSeleccionada.estado === 'pendiente' && (
                    <TouchableOpacity
                      style={[styles.modalBoton, styles.botonAprobar]}
                      onPress={() => handleCambiarEstado(publicacionSeleccionada, 'activa')}
                    >
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={styles.modalBotonText}>Aprobar</Text>
                    </TouchableOpacity>
                  )}

                  {publicacionSeleccionada.estado === 'activa' && (
                    <TouchableOpacity
                      style={[styles.modalBoton, styles.botonPausar]}
                      onPress={() => handleCambiarEstado(publicacionSeleccionada, 'pausada')}
                    >
                      <Ionicons name="pause" size={16} color="#fff" />
                      <Text style={styles.modalBotonText}>Pausar</Text>
                    </TouchableOpacity>
                  )}

                  {publicacionSeleccionada.estado === 'pausada' && (
                    <TouchableOpacity
                      style={[styles.modalBoton, styles.botonActivar]}
                      onPress={() => handleCambiarEstado(publicacionSeleccionada, 'activa')}
                    >
                      <Ionicons name="play" size={16} color="#fff" />
                      <Text style={styles.modalBotonText}>Activar</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.modalBoton, styles.botonEditar]}
                    onPress={() => {
                      setModalDetalles(false);
                    }}
                  >
                    <Ionicons name="create" size={16} color="#fff" />
                    <Text style={styles.modalBotonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBoton, styles.botonEliminar]}
                    onPress={() => handleEliminarPublicacion(publicacionSeleccionada)}
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
  estadisticasCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  estadisticasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  estadisticasFinancieras: {
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
    paddingTop: 12,
  },
  financieraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  financieraLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  financieraValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
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
  publicacionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  publicacionHeader: {
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
  publicacionInfo: {
    flex: 1,
  },
  publicacionNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  publicacionPropietario: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 2,
  },
  publicacionDireccion: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  estadoContainer: {
    justifyContent: 'center',
  },
  publicacionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  alertaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    gap: 6,
  },
  alertaText: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: '600',
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
  modalSeccion: {
    marginBottom: 20,
  },
  modalTipoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  modalTipoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  modalNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  modalDireccion: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  modalEstadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 6,
  },
  modalEstadoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalSeccionTitle: {
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
  modalInfoValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  modalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalGridItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  modalGridLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  modalGridValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  serviciosContainer: {
    marginTop: 12,
  },
  serviciosLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  serviciosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  servicioChip: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  servicioText: {
    fontSize: 12,
    color: '#4a90e2',
  },
  modalEstadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalEstatItem: {
    alignItems: 'center',
  },
  modalEstatValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginVertical: 4,
  },
  modalEstatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  ultimaReservaText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  reporteItem: {
    flexDirection: 'row',
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  reporteInfo: {
    flex: 1,
  },
  reporteMotivo: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 2,
  },
  reporteDetalles: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalAlerta: {
    flexDirection: 'row',
    backgroundColor: '#fffbf0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  modalAlertaText: {
    flex: 1,
    fontSize: 14,
    color: '#f39c12',
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
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  modalBoton: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  botonAprobar: {
    backgroundColor: '#27ae60',
  },
  botonPausar: {
    backgroundColor: '#f39c12',
  },
  botonActivar: {
    backgroundColor: '#27ae60',
  },
  botonEditar: {
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

export default GestionPublicaciones;