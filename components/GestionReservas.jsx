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

const GestionReservas = ({ navigation }) => {
  const [tabActiva, setTabActiva] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [modalDetalle, setModalDetalle] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [modalFiltros, setModalFiltros] = useState(false);

  const [reservas] = useState([
    {
      id: 'RES001',
      espacio: 'Oficina Skyview',
      tipoEspacio: 'oficina',
      cliente: 'Juan Pérez',
      emailCliente: 'juan@email.com',
      propietario: 'Cliente Demo',
      fechaInicio: '2025-06-25',
      fechaFin: '2025-06-27',
      horario: '09:00 - 18:00',
      dias: 3,
      precioTotal: 3600,
      comision: 360,
      estado: 'confirmada',
      metodoPago: 'Tarjeta de crédito',
      serviciosAdicionales: ['Limpieza diaria', 'Café premium'],
      fechaCreacion: '2025-06-20 10:30'
    },
    {
      id: 'RES002',
      espacio: 'Sala de Reuniones Premium',
      tipoEspacio: 'sala',
      cliente: 'María González',
      emailCliente: 'maria@empresa.com',
      propietario: 'Business Center',
      fechaInicio: '2025-06-22',
      fechaFin: '2025-06-22',
      horario: '14:00 - 18:00',
      dias: 1,
      precioTotal: 200,
      comision: 20,
      estado: 'pendiente',
      metodoPago: 'Transferencia',
      serviciosAdicionales: ['Proyector', 'Catering'],
      fechaCreacion: '2025-06-19 15:45'
    },
    {
      id: 'RES003',
      espacio: 'Oficina El Mirador',
      tipoEspacio: 'oficina',
      cliente: 'Carlos Rodríguez',
      emailCliente: 'carlos@startup.com',
      propietario: 'Cliente Demo',
      fechaInicio: '2025-06-20',
      fechaFin: '2025-06-21',
      horario: '09:00 - 18:00',
      dias: 2,
      precioTotal: 3000,
      comision: 300,
      estado: 'cancelada',
      metodoPago: 'Tarjeta de crédito',
      motivoCancelacion: 'Cambio de planes del cliente',
      fechaCancelacion: '2025-06-18',
      reembolso: 2700,
      fechaCreacion: '2025-06-15 11:20'
    },
    {
      id: 'RES004',
      espacio: 'Espacio Coworking',
      tipoEspacio: 'espacio',
      cliente: 'Ana Martínez',
      emailCliente: 'ana@freelance.com',
      propietario: 'Spaces Inc',
      fechaInicio: '2025-06-21',
      fechaFin: '2025-06-21',
      horario: '08:00 - 20:00',
      dias: 1,
      precioTotal: 50,
      comision: 5,
      estado: 'en_curso',
      metodoPago: 'PayPal',
      serviciosAdicionales: [],
      fechaCreacion: '2025-06-18 09:00'
    },
    {
      id: 'RES005',
      espacio: 'Oficina Centro',
      tipoEspacio: 'oficina',
      cliente: 'Empresa XYZ',
      emailCliente: 'contacto@xyz.com',
      propietario: 'Otro Cliente',
      fechaInicio: '2025-06-15',
      fechaFin: '2025-06-19',
      horario: '09:00 - 18:00',
      dias: 5,
      precioTotal: 4500,
      comision: 450,
      estado: 'completada',
      metodoPago: 'Transferencia',
      serviciosAdicionales: ['Parking', 'Seguridad 24h'],
      calificacion: 5,
      comentario: 'Excelente espacio, muy recomendado',
      fechaCreacion: '2025-06-10 14:30'
    }
  ]);

  const estadisticas = {
    total: reservas.length,
    confirmadas: reservas.filter(r => r.estado === 'confirmada').length,
    pendientes: reservas.filter(r => r.estado === 'pendiente').length,
    canceladas: reservas.filter(r => r.estado === 'cancelada').length,
    completadas: reservas.filter(r => r.estado === 'completada').length,
    ingresosTotales: reservas.reduce((sum, r) => sum + (r.estado !== 'cancelada' ? r.precioTotal : 0), 0),
    comisionesTotales: reservas.reduce((sum, r) => sum + (r.estado !== 'cancelada' ? r.comision : 0), 0)
  };

  const getEstadoInfo = (estado) => {
    switch (estado) {
      case 'pendiente':
        return { color: '#f39c12', icono: 'time', texto: 'Pendiente' };
      case 'confirmada':
        return { color: '#3498db', icono: 'checkmark-circle', texto: 'Confirmada' };
      case 'en_curso':
        return { color: '#9b59b6', icono: 'play-circle', texto: 'En curso' };
      case 'completada':
        return { color: '#27ae60', icono: 'checkmark-done', texto: 'Completada' };
      case 'cancelada':
        return { color: '#e74c3c', icono: 'close-circle', texto: 'Cancelada' };
      default:
        return { color: '#7f8c8d', icono: 'help-circle', texto: estado };
    }
  };

  const getTipoEspacioInfo = (tipo) => {
    switch (tipo) {
      case 'oficina':
        return { icono: 'business', color: '#4a90e2' };
      case 'sala':
        return { icono: 'people', color: '#f39c12' };
      case 'espacio':
        return { icono: 'square', color: '#9b59b6' };
      default:
        return { icono: 'location', color: '#7f8c8d' };
    }
  };

  const getReservasFiltradas = () => {
    let filtradas = reservas;

    if (tabActiva !== 'todas') {
      filtradas = filtradas.filter(r => r.estado === tabActiva);
    }

    if (busqueda) {
      filtradas = filtradas.filter(r =>
        r.id.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.espacio.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.propietario.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    return filtradas;
  };

  const handleVerDetalle = (reserva) => {
    setReservaSeleccionada(reserva);
    setModalDetalle(true);
  };

  const handleCancelarReserva = (reserva) => {
    Alert.alert(
      'Cancelar reserva',
      '¿Estás seguro de cancelar esta reserva? Se procesará el reembolso correspondiente.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Éxito', 'Reserva cancelada y reembolso procesado');
            setModalDetalle(false);
          }
        }
      ]
    );
  };

  const handleConfirmarReserva = (reserva) => {
    Alert.alert(
      'Confirmar reserva',
      '¿Confirmar esta reserva?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            Alert.alert('Éxito', 'Reserva confirmada');
            setModalDetalle(false);
          }
        }
      ]
    );
  };

  const handleContactarUsuario = (email, tipo) => {
    Alert.alert(
      `Contactar ${tipo}`,
      `¿Enviar email a ${email}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => console.log('Abrir email') }
      ]
    );
  };

  const renderReserva = ({ item }) => {
    const estadoInfo = getEstadoInfo(item.estado);
    const tipoInfo = getTipoEspacioInfo(item.tipoEspacio);

    return (
      <TouchableOpacity
        style={styles.reservaCard}
        onPress={() => handleVerDetalle(item)}
      >
        <View style={styles.reservaHeader}>
          <View style={styles.reservaIdContainer}>
            <Text style={styles.reservaId}>#{item.id}</Text>
            <View style={[styles.estadoBadge, { backgroundColor: estadoInfo.color + '20' }]}>
              <Ionicons name={estadoInfo.icono} size={14} color={estadoInfo.color} />
              <Text style={[styles.estadoText, { color: estadoInfo.color }]}>
                {estadoInfo.texto}
              </Text>
            </View>
          </View>
          <Text style={styles.reservaFechaCreacion}>{item.fechaCreacion}</Text>
        </View>

        <View style={styles.reservaContent}>
          <View style={styles.espacioInfo}>
            <View style={[styles.tipoIcon, { backgroundColor: tipoInfo.color + '20' }]}>
              <Ionicons name={tipoInfo.icono} size={20} color={tipoInfo.color} />
            </View>
            <View style={styles.espacioDetalles}>
              <Text style={styles.espacioNombre}>{item.espacio}</Text>
              <Text style={styles.propietario}>Por: {item.propietario}</Text>
            </View>
          </View>

          <View style={styles.reservaDetalles}>
            <View style={styles.detalleRow}>
              <Ionicons name="person" size={14} color="#4a90e2" />
              <Text style={styles.clienteNombre}>{item.cliente}</Text>
            </View>
            <View style={styles.detalleRow}>
              <Ionicons name="calendar" size={14} color="#7f8c8d" />
              <Text style={styles.fechas}>
                {item.fechaInicio} {item.dias > 1 ? `al ${item.fechaFin}` : ''} ({item.dias} día{item.dias > 1 ? 's' : ''})
              </Text>
            </View>
            <View style={styles.detalleRow}>
              <Ionicons name="time" size={14} color="#7f8c8d" />
              <Text style={styles.horario}>{item.horario}</Text>
            </View>
          </View>

          <View style={styles.reservaFooter}>
            <View style={styles.montosContainer}>
              <Text style={styles.montoLabel}>Total:</Text>
              <Text style={styles.montoValue}>${item.precioTotal}</Text>
            </View>
            <View style={styles.montosContainer}>
              <Text style={styles.comisionLabel}>Comisión:</Text>
              <Text style={styles.comisionValue}>${item.comision}</Text>
            </View>
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
        <Text style={styles.headerTitle}>Gestión de Reservas</Text>
        <TouchableOpacity
          onPress={() => setModalFiltros(true)}
          style={styles.filterButton}
        >
          <Ionicons name="filter" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por ID, espacio, cliente o propietario..."
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
          <Text style={[styles.estatNumero, { color: '#3498db' }]}>
            {estadisticas.confirmadas}
          </Text>
          <Text style={styles.estatLabel}>Confirmadas</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={[styles.estatNumero, { color: '#f39c12' }]}>
            {estadisticas.pendientes}
          </Text>
          <Text style={styles.estatLabel}>Pendientes</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={[styles.estatNumero, { color: '#27ae60' }]}>
            ${estadisticas.comisionesTotales}
          </Text>
          <Text style={styles.estatLabel}>Comisiones</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {['todas', 'pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, tabActiva === tab && styles.tabActive]}
            onPress={() => setTabActiva(tab)}
          >
            <Text style={[styles.tabText, tabActiva === tab && styles.tabTextActive]}>
              {tab === 'todas' ? 'Todas' : getEstadoInfo(tab).texto}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={getReservasFiltradas()}
        renderItem={renderReserva}
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
              <Text style={styles.modalTitle}>Detalle de reserva</Text>
              <TouchableOpacity
                onPress={() => setModalDetalle(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            {reservaSeleccionada && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.modalIdSection}>
                  <Text style={styles.modalReservaId}>#{reservaSeleccionada.id}</Text>
                  <View style={[
                    styles.modalEstadoBadge,
                    { backgroundColor: getEstadoInfo(reservaSeleccionada.estado).color + '20' }
                  ]}>
                    <Ionicons
                      name={getEstadoInfo(reservaSeleccionada.estado).icono}
                      size={16}
                      color={getEstadoInfo(reservaSeleccionada.estado).color}
                    />
                    <Text style={[
                      styles.modalEstadoText,
                      { color: getEstadoInfo(reservaSeleccionada.estado).color }
                    ]}>
                      {getEstadoInfo(reservaSeleccionada.estado).texto}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Información del espacio</Text>
                  <View style={styles.modalEspacioCard}>
                    <View style={[
                      styles.modalTipoIcon,
                      { backgroundColor: getTipoEspacioInfo(reservaSeleccionada.tipoEspacio).color + '20' }
                    ]}>
                      <Ionicons
                        name={getTipoEspacioInfo(reservaSeleccionada.tipoEspacio).icono}
                        size={24}
                        color={getTipoEspacioInfo(reservaSeleccionada.tipoEspacio).color}
                      />
                    </View>
                    <View style={styles.modalEspacioInfo}>
                      <Text style={styles.modalEspacioNombre}>{reservaSeleccionada.espacio}</Text>
                      <TouchableOpacity
                        onPress={() => handleContactarUsuario(reservaSeleccionada.propietario, 'propietario')}
                      >
                        <Text style={styles.modalPropietario}>
                          Propietario: {reservaSeleccionada.propietario}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Información del cliente</Text>
                  <TouchableOpacity
                    style={styles.modalClienteCard}
                    onPress={() => handleContactarUsuario(reservaSeleccionada.emailCliente, 'cliente')}
                  >
                    <Ionicons name="person-circle" size={40} color="#4a90e2" />
                    <View style={styles.modalClienteInfo}>
                      <Text style={styles.modalClienteNombre}>{reservaSeleccionada.cliente}</Text>
                      <Text style={styles.modalClienteEmail}>{reservaSeleccionada.emailCliente}</Text>
                    </View>
                    <Ionicons name="mail" size={20} color="#4a90e2" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Detalles de la reserva</Text>
                  <View style={styles.modalDetalle}>
                    <Ionicons name="calendar" size={16} color="#4a90e2" />
                    <Text style={styles.modalDetalleText}>
                      {reservaSeleccionada.fechaInicio}
                      {reservaSeleccionada.dias > 1 ? ` al ${reservaSeleccionada.fechaFin}` : ''}
                    </Text>
                  </View>
                  <View style={styles.modalDetalle}>
                    <Ionicons name="time" size={16} color="#4a90e2" />
                    <Text style={styles.modalDetalleText}>{reservaSeleccionada.horario}</Text>
                  </View>
                  <View style={styles.modalDetalle}>
                    <Ionicons name="today" size={16} color="#4a90e2" />
                    <Text style={styles.modalDetalleText}>
                      {reservaSeleccionada.dias} día{reservaSeleccionada.dias > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.modalDetalle}>
                    <Ionicons name="card" size={16} color="#4a90e2" />
                    <Text style={styles.modalDetalleText}>{reservaSeleccionada.metodoPago}</Text>
                  </View>
                </View>

                {reservaSeleccionada.serviciosAdicionales.length > 0 && (
                  <View style={styles.modalSeccion}>
                    <Text style={styles.modalSeccionTitle}>Servicios adicionales</Text>
                    <View style={styles.serviciosGrid}>
                      {reservaSeleccionada.serviciosAdicionales.map((servicio, index) => (
                        <View key={index} style={styles.servicioChip}>
                          <Text style={styles.servicioText}>{servicio}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Información financiera</Text>
                  <View style={styles.modalFinanzas}>
                    <View style={styles.finanzaItem}>
                      <Text style={styles.finanzaLabel}>Precio total</Text>
                      <Text style={styles.finanzaValue}>${reservaSeleccionada.precioTotal}</Text>
                    </View>
                    <View style={styles.finanzaItem}>
                      <Text style={styles.finanzaLabel}>Comisión plataforma</Text>
                      <Text style={[styles.finanzaValue, { color: '#27ae60' }]}>
                        ${reservaSeleccionada.comision}
                      </Text>
                    </View>
                    {reservaSeleccionada.reembolso && (
                      <View style={styles.finanzaItem}>
                        <Text style={styles.finanzaLabel}>Reembolso</Text>
                        <Text style={[styles.finanzaValue, { color: '#e74c3c' }]}>
                          ${reservaSeleccionada.reembolso}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {reservaSeleccionada.estado === 'cancelada' && (
                  <View style={styles.modalAlerta}>
                    <Ionicons name="information-circle" size={20} color="#e74c3c" />
                    <View style={styles.modalAlertaContent}>
                      <Text style={styles.modalAlertaTitle}>Cancelación</Text>
                      <Text style={styles.modalAlertaText}>
                        Fecha: {reservaSeleccionada.fechaCancelacion}
                      </Text>
                      <Text style={styles.modalAlertaText}>
                        Motivo: {reservaSeleccionada.motivoCancelacion}
                      </Text>
                    </View>
                  </View>
                )}

                {reservaSeleccionada.estado === 'completada' && reservaSeleccionada.calificacion && (
                  <View style={styles.modalCalificacion}>
                    <Text style={styles.modalSeccionTitle}>Calificación del cliente</Text>
                    <View style={styles.calificacionContainer}>
                      <View style={styles.estrellas}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name="star"
                            size={20}
                            color={star <= reservaSeleccionada.calificacion ? '#f39c12' : '#e1e5e9'}
                          />
                        ))}
                      </View>
                      {reservaSeleccionada.comentario && (
                        <Text style={styles.comentario}>{reservaSeleccionada.comentario}</Text>
                      )}
                    </View>
                  </View>
                )}

                <View style={styles.modalAcciones}>
                  {reservaSeleccionada.estado === 'pendiente' && (
                    <>
                      <TouchableOpacity
                        style={[styles.modalBoton, styles.botonConfirmar]}
                        onPress={() => handleConfirmarReserva(reservaSeleccionada)}
                      >
                        <Ionicons name="checkmark" size={16} color="#fff" />
                        <Text style={styles.modalBotonText}>Confirmar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.modalBoton, styles.botonCancelar]}
                        onPress={() => handleCancelarReserva(reservaSeleccionada)}
                      >
                        <Ionicons name="close" size={16} color="#fff" />
                        <Text style={styles.modalBotonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {(reservaSeleccionada.estado === 'confirmada' || reservaSeleccionada.estado === 'en_curso') && (
                    <TouchableOpacity
                      style={[styles.modalBoton, styles.botonCancelar]}
                      onPress={() => handleCancelarReserva(reservaSeleccionada)}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                      <Text style={styles.modalBotonText}>Cancelar reserva</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.modalBoton, styles.botonContactar]}
                    onPress={() => handleContactarUsuario(reservaSeleccionada.emailCliente, 'cliente')}
                  >
                    <Ionicons name="mail" size={16} color="#fff" />
                    <Text style={styles.modalBotonText}>Contactar cliente</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalTimestamp}>
                  <Text style={styles.timestampText}>
                    Creada el {reservaSeleccionada.fechaCreacion}
                  </Text>
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
  reservaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    overflow: 'hidden',
  },
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  reservaIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reservaId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  estadoText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reservaFechaCreacion: {
    fontSize: 11,
    color: '#7f8c8d',
  },
  reservaContent: {
    padding: 16,
  },
  espacioInfo: {
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
  espacioDetalles: {
    flex: 1,
  },
  espacioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  propietario: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  reservaDetalles: {
    marginBottom: 12,
  },
  detalleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  clienteNombre: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
  },
  fechas: {
    fontSize: 13,
    color: '#5a6c7d',
  },
  horario: {
    fontSize: 13,
    color: '#5a6c7d',
  },
  reservaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  montosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  montoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  montoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  comisionLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  comisionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
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
  modalIdSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalReservaId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalEstadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  modalEstadoText: {
    fontSize: 14,
    fontWeight: '600',
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
  modalEspacioCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  modalTipoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalEspacioInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  modalEspacioNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  modalPropietario: {
    fontSize: 14,
    color: '#4a90e2',
  },
  modalClienteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  modalClienteInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modalClienteNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  modalClienteEmail: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  modalDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  modalDetalleText: {
    fontSize: 14,
    color: '#5a6c7d',
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
  modalFinanzas: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  finanzaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  finanzaLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  finanzaValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalAlerta: {
    flexDirection: 'row',
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  modalAlertaContent: {
    flex: 1,
  },
  modalAlertaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 4,
  },
  modalAlertaText: {
    fontSize: 12,
    color: '#e74c3c',
  },
  modalCalificacion: {
    marginBottom: 20,
  },
  calificacionContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  estrellas: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  comentario: {
    fontSize: 14,
    color: '#5a6c7d',
    fontStyle: 'italic',
  },
  modalAcciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  modalBoton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  botonConfirmar: {
    backgroundColor: '#27ae60',
  },
  botonCancelar: {
    backgroundColor: '#e74c3c',
  },
  botonContactar: {
    backgroundColor: '#4a90e2',
  },
  modalBotonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalTimestamp: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  timestampText: {
    fontSize: 12,
    color: '#bdc3c7',
  },
});

export default GestionReservas;