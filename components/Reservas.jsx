import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from 'react-native';

const Reservas = ({ navigation }) => {
  const reservas = [
    {
      id: 1,
      fechaReserva: '01/01/2026',
      oficina: {
        nombre: "Oficina Panorámica 'Skyview'",
        imagen: require('../assets/images/oficina-skyview.jpg') 
      }
    },
    {
      id: 2,
      fechaReserva: '01/01/2026',
      oficina: {
        nombre: "Oficina Panorámica 'Skyview'",
        imagen: require('../assets/images/oficina-skyview.jpg')
      }
    },
    {
      id: 3,
      fechaReserva: '01/01/2026',
      oficina: {
        nombre: "Oficina Panorámica 'Skyview'",
        imagen: require('../assets/images/oficina-skyview.jpg')
      }
    }
  ];

  const handleVolver = () => {
    navigation.goBack();
  };

  const handleReservaPress = (reserva) => {
    navigation.navigate('DetalleReserva', { reserva });
  };

  const ReservaItem = ({ reserva }) => (
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
        <Text style={styles.fechaReserva}>
          Fecha de la reserva: {reserva.fechaReserva}
        </Text>
        <Text style={styles.nombreOficina}>
          {reserva.oficina.nombre}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Reservas</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Últimas reservas</Text>
        </View>

        <View style={styles.reservasContainer}>
          {reservas.map((reserva) => (
            <ReservaItem key={reserva.id} reserva={reserva} />
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={styles.volverButton}
          onPress={handleVolver}
          activeOpacity={0.8}
        >
          <Text style={styles.volverButtonText}>Volver</Text>
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
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a90e2',
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
  sectionTitleContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  reservasContainer: {
    paddingHorizontal: 20,
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
  fechaReserva: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'System',
    marginBottom: 4,
  },
  nombreOficina: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
    lineHeight: 20,
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
  volverButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  volverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default Reservas;