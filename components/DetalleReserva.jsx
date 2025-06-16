import { Ionicons } from '@expo/vector-icons';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const DetalleReserva = ({ navigation, route }) => {
  if (!route?.params?.reserva) {
    console.error('❌ No se recibieron parámetros de reserva');
    Alert.alert('Error', 'No se encontraron los datos de la reserva');
    navigation.goBack();
    return null;
  }

  const { reserva } = route.params;

  const detalleReserva = {
    precio: '$1200.00',
    metodoPago: 'Tarjeta de crédito',
    capacidad: '8 personas',
    ubicacion: 'Montevideo, Ciudad Vieja ***',
    horario: '13:00 - 15:00',
    validaHasta: 'Enero',
    codigoReserva: 'RES-2026-001'
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleVerPublicacion = () => {

    let oficinaId = 1;
    let oficinaColor = '#4a90e2';
    
    if (reserva.oficina.nombre.includes('Skyview')) {
      oficinaId = 1;
      oficinaColor = '#27ae60';
    } else if (reserva.oficina.nombre.includes('Mirador')) {
      oficinaId = 2;
      oficinaColor = '#e67e22';
    } else if (reserva.oficina.nombre.includes('Centro')) {
      oficinaId = 3;
      oficinaColor = '#8e44ad';
    }
    
    const oficinaParaDetalle = {
      id: oficinaId,
      nombre: reserva.oficina.nombre,
      color: oficinaColor
    };
    
    navigation.navigate('DetalleOficina', { oficina: oficinaParaDetalle });
  };

  const handleIrInicio = () => {
    navigation.navigate('InicioMain');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleGoBack} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>
          Reserva de: {reserva.oficina.nombre}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="business" size={40} color="white" />
          </View>
          <View style={styles.imageOverlay}>
            <Text style={styles.imageText}>{reserva.oficina.nombre}</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.oficinaTitle}>{reserva.oficina.nombre}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>Información:</Text>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Reserva válida hasta {detalleReserva.validaHasta}</Text> por{' '}
              <Text style={styles.infoBold}>{detalleReserva.precio}</Text> el{' '}
              <Text style={styles.infoBold}>{reserva.fechaReserva}</Text> con{' '}
              <Text style={styles.infoBold}>{detalleReserva.metodoPago}</Text>.
            </Text>
            
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Capacidad para:</Text> {detalleReserva.capacidad}.
            </Text>
            
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Ubicación:</Text> {detalleReserva.ubicacion}.
            </Text>
            
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Horario:</Text> {detalleReserva.horario}.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.verPublicacionContainer}
            onPress={handleVerPublicacion}
            activeOpacity={0.7}
          >
            <Text style={styles.verPublicacionText}>Ver publicación</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={styles.inicioButton}
          onPress={handleIrInicio}
          activeOpacity={0.8}
        >
          <Text style={styles.inicioButtonText}>Inicio</Text>
        </TouchableOpacity>
      </View>
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
    minHeight: 60,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a90e2',
    fontFamily: 'System',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
    lineHeight: 20,
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    position: 'relative',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 15,
    left: 35,
    right: 35,
  },
  imageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  oficinaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
    lineHeight: 24,
  },
  infoSection: {
    paddingHorizontal: 20,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
    marginBottom: 15,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  infoText: {
    fontSize: 14,
    color: '#5a6c7d',
    fontFamily: 'System',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoBold: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  verPublicacionContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  verPublicacionText: {
    fontSize: 16,
    color: '#4a90e2',
    fontFamily: 'System',
    textDecorationLine: 'underline',
  },
  bottomSpacing: {
    height: 100,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  inicioButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  inicioButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default DetalleReserva;