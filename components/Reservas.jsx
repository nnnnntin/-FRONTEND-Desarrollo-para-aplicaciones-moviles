import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
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

const Reservas = ({ navigation }) => {
  const [modalReseña, setModalReseña] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('todas');

  const reservas = [
    {
      id: 1,
      fechaReserva: '01/01/2025',
      oficina: {
        nombre: "Oficina Panorámica 'Skyview'",
        imagen: require('../assets/images/oficina-skyview.jpg')
      },
      estado: 'finalizada',
      puedeReseñar: true
    },
    {
      id: 2,
      fechaReserva: '20/06/2025',
      oficina: {
        nombre: "Oficina 'El mirador'",
        imagen: require('../assets/images/oficina-skyview.jpg')
      },
      estado: 'confirmada',
      puedeReseñar: false
    },
    {
      id: 3,
      fechaReserva: '15/05/2025',
      oficina: {
        nombre: "Sala de Reuniones Premium",
        imagen: require('../assets/images/oficina-skyview.jpg')
      },
      estado: 'finalizada',
      puedeReseñar: true,
      yaReseñada: true
    }
  ];

  const esFechaProxima = (fechaReserva) => {
    const fechaActual = new Date();
    const [dia, mes, año] = fechaReserva.split('/');
    const fechaReservaDate = new Date(año, mes - 1, dia);
    return fechaReservaDate >= fechaActual;
  };

  const getReservasFiltradas = () => {
    switch (filtroActivo) {
      case 'proximas':
        return reservas.filter(reserva => 
          esFechaProxima(reserva.fechaReserva) && reserva.estado !== 'finalizada'
        );
      case 'pasadas':
        return reservas.filter(reserva => 
          !esFechaProxima(reserva.fechaReserva) || reserva.estado === 'finalizada'
        );
      default:
        return reservas;
    }
  };

  const handleVolver = () => {
    navigation.goBack();
  };

  const handleReservaPress = (reserva) => {
    navigation.navigate('DetalleReserva', { reserva });
  };

  const handleReseñar = (reserva) => {
    setReservaSeleccionada(reserva);
    setModalReseña(true);
    setCalificacion(0);
    setComentario('');
  };

  const handleEnviarReseña = () => {
    if (calificacion === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    Alert.alert(
      'Reseña enviada',
      'Gracias por tu opinión',
      [
        {
          text: 'OK',
          onPress: () => {
            setModalReseña(false);
            setReservaSeleccionada(null);
          }
        }
      ]
    );
  };

  const handleFiltroChange = (filtro) => {
    setFiltroActivo(filtro);
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'confirmada':
        return { backgroundColor: '#3498db', text: 'Confirmada' };
      case 'finalizada':
        return { backgroundColor: '#27ae60', text: 'Finalizada' };
      case 'cancelada':
        return { backgroundColor: '#e74c3c', text: 'Cancelada' };
      default:
        return { backgroundColor: '#95a5a6', text: estado };
    }
  };

  const ReservaItem = ({ reserva }) => {
    const estadoInfo = getEstadoBadge(reserva.estado);

    return (
      <TouchableOpacity
        style={styles.reservaItem}
        onPress={() => handleReservaPress(reserva)}
        activeOpacity={0.7}
      >
        <View style={styles.imagenContainer}>
          <View style={styles.imagenPlaceholder}>
            <Ionicons name="business" size={24} color="#4a90e2" />
          </View>
        </View>

        <View style={styles.reservaInfo}>
          <View style={styles.reservaHeader}>
            <Text style={styles.fechaReserva}>
              {reserva.fechaReserva}
            </Text>
            <View style={[styles.estadoBadge, { backgroundColor: estadoInfo.backgroundColor }]}>
              <Text style={styles.estadoText}>{estadoInfo.text}</Text>
            </View>
          </View>
          <Text style={styles.nombreOficina}>
            {reserva.oficina.nombre}
          </Text>

          {reserva.estado === 'finalizada' && reserva.puedeReseñar && !reserva.yaReseñada && (
            <TouchableOpacity
              style={styles.reseñarButton}
              onPress={(e) => {
                e.stopPropagation();
                handleReseñar(reserva);
              }}
            >
              <Ionicons name="star-outline" size={16} color="#f39c12" />
              <Text style={styles.reseñarText}>Dejar reseña</Text>
            </TouchableOpacity>
          )}

          {reserva.yaReseñada && (
            <View style={styles.yaReseñadaBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
              <Text style={styles.yaReseñadaText}>Ya reseñaste</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const reservasFiltradas = getReservasFiltradas();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleVolver}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Reservas</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, filtroActivo === 'todas' && styles.tabActive]}
            onPress={() => handleFiltroChange('todas')}
          >
            <Text style={[styles.tabText, filtroActivo === 'todas' && styles.tabTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, filtroActivo === 'proximas' && styles.tabActive]}
            onPress={() => handleFiltroChange('proximas')}
          >
            <Text style={[styles.tabText, filtroActivo === 'proximas' && styles.tabTextActive]}>
              Próximas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, filtroActivo === 'pasadas' && styles.tabActive]}
            onPress={() => handleFiltroChange('pasadas')}
          >
            <Text style={[styles.tabText, filtroActivo === 'pasadas' && styles.tabTextActive]}>
              Pasadas
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reservasContainer}>
          {reservasFiltradas.length > 0 ? (
            reservasFiltradas.map((reserva) => (
              <ReservaItem key={reserva.id} reserva={reserva} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#bdc3c7" />
              <Text style={styles.emptyStateText}>
                No tienes reservas {filtroActivo === 'proximas' ? 'próximas' : filtroActivo === 'pasadas' ? 'pasadas' : ''}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalReseña}
        onRequestClose={() => setModalReseña(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dejar reseña</Text>
              <TouchableOpacity onPress={() => setModalReseña(false)}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {reservaSeleccionada?.oficina.nombre}
            </Text>

            <View style={styles.starsContainer}>
              <Text style={styles.starsLabel}>Calificación</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setCalificacion(star)}
                  >
                    <Ionicons
                      name={star <= calificacion ? "star" : "star-outline"}
                      size={32}
                      color="#f39c12"
                      style={styles.star}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.inputLabel}>Comentario (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Cuéntanos tu experiencia..."
              value={comentario}
              onChangeText={setComentario}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={styles.enviarButton}
              onPress={handleEnviarReseña}
            >
              <Text style={styles.enviarButtonText}>Enviar reseña</Text>
            </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4a90e2',
  },
  tabText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  tabTextActive: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  reservasContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  reservaItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  imagenContainer: {
    marginRight: 16,
  },
  imagenPlaceholder: {
    width: 60,
    height: 45,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reservaInfo: {
    flex: 1,
  },
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fechaReserva: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'System',
  },
  nombreOficina: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
    lineHeight: 20,
    marginBottom: 8,
  },
  reseñarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffbf0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  reseñarText: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: '600',
    fontFamily: 'System',
  },
  yaReseñadaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  yaReseñadaText: {
    fontSize: 12,
    color: '#27ae60',
    fontFamily: 'System',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 12,
    textAlign: 'center',
    fontFamily: 'System',
  },
  bottomSpacing: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
    fontFamily: 'System',
  },
  starsContainer: {
    marginBottom: 20,
  },
  starsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    fontFamily: 'System',
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  star: {
    marginHorizontal: 5,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: 'System',
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
    fontFamily: 'System',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  enviarButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  enviarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
});

export default Reservas;