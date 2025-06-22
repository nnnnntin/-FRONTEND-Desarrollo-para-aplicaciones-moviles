import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { actualizarMembresia } from '../store/slices/usuarioSlice';

const Membresias = ({ navigation }) => {
  const dispatch = useDispatch();
  const { membresia } = useSelector(state => state.usuario);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const planes = [
    {
      id: 'basico',
      nombre: 'Básico',
      precio: '$19.99',
      periodo: 'mes',
      color: '#95a5a6',
      beneficios: [
        '5 reservas mensuales',
        'Acceso a oficinas estándar',
        'Soporte por email',
        'Cancelación gratuita hasta 24h antes'
      ]
    },
    {
      id: 'premium',
      nombre: 'Premium',
      precio: '$49.99',
      periodo: 'mes',
      color: '#4a90e2',
      popular: true,
      beneficios: [
        '20 reservas mensuales',
        'Acceso a todas las oficinas',
        'Soporte prioritario 24/7',
        'Cancelación gratuita hasta 2h antes',
        'Descuento 10% en servicios',
        'Invitados gratis (2 por reserva)'
      ]
    },
    {
      id: 'empresarial',
      nombre: 'Empresarial',
      precio: '$149.99',
      periodo: 'mes',
      color: '#9b59b6',
      beneficios: [
        'Reservas ilimitadas',
        'Acceso VIP a todas las ubicaciones',
        'Gestor de cuenta dedicado',
        'Cancelación gratuita sin restricciones',
        'Descuento 25% en servicios',
        'Invitados ilimitados',
        'Facturación corporativa',
        'Estadísticas de uso detalladas'
      ]
    }
  ];

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSuscribirse = (plan) => {
    if (membresia?.id === plan.id && membresia?.activa) {
      Alert.alert('Ya tienes este plan', 'Este es tu plan actual');
      return;
    }

    navigation.navigate('MetodosPago', {
      modoSeleccion: true,
      modoSuscripcion: true,
      planSuscripcion: plan,
      precio: plan.precio,
      descripcion: `Plan ${plan.nombre}`
    });
  };

  const handleCancelarMembresia = () => {
    Alert.alert(
      'Cancelar membresía',
      '¿Estás seguro de que quieres cancelar tu membresía actual?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            dispatch(actualizarMembresia(null));
            Alert.alert('Membresía cancelada', 'Tu membresía ha sido cancelada');
            setSelectedPlan(null);
          },
        },
      ]
    );
  };

  const completarSuscripcion = (plan) => {
    dispatch(actualizarMembresia({
      id: plan.id,
      nombre: plan.nombre,
      precio: plan.precio,
      activa: true,
      fechaInicio: new Date().toISOString(),
      fechaProximoPago: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
    setSelectedPlan(plan.id);
  };

  const renderPlan = (plan) => {
    const isActive = membresia?.id === plan.id && membresia?.activa;

    return (
      <View
        key={plan.id}
        style={[
          styles.planCard,
          isActive && styles.planCardActive,
          plan.popular && styles.planCardPopular
        ]}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MÁS POPULAR</Text>
          </View>
        )}

        <View style={[styles.planHeader, { backgroundColor: plan.color }]}>
          <Text style={styles.planNombre}>{plan.nombre}</Text>
          <View style={styles.precioContainer}>
            <Text style={styles.planPrecio}>{plan.precio}</Text>
            <Text style={styles.planPeriodo}>/{plan.periodo}</Text>
          </View>
        </View>

        <View style={styles.beneficiosContainer}>
          {plan.beneficios.map((beneficio, index) => (
            <View key={index} style={styles.beneficioItem}>
              <Ionicons name="checkmark-circle" size={20} color={plan.color} />
              <Text style={styles.beneficioTexto}>{beneficio}</Text>
            </View>
          ))}
        </View>

        {isActive ? (
          <View style={styles.activeContainer}>
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>PLAN ACTUAL</Text>
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelarMembresia}
            >
              <Text style={styles.cancelButtonText}>Cancelar membresía</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.suscribirButton, { backgroundColor: plan.color }]}
            onPress={() => handleSuscribirse(plan)}
          >
            <Text style={styles.suscribirButtonText}>
              {membresia ? 'Cambiar a este plan' : 'Suscribirse'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
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
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membresías</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Elige el plan perfecto para ti</Text>
          <Text style={styles.introSubtitle}>
            Accede a los mejores espacios de trabajo con beneficios exclusivos
          </Text>
        </View>

        {membresia && membresia.activa && (
          <View style={styles.currentPlanInfo}>
            <Ionicons name="information-circle" size={20} color="#4a90e2" />
            <Text style={styles.currentPlanText}>
              Tu plan actual es {membresia.nombre}. Próximo pago: {new Date(membresia.fechaProximoPago).toLocaleDateString()}
            </Text>
          </View>
        )}

        <View style={styles.planesContainer}>
          {planes.map(plan => renderPlan(plan))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  introContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    fontFamily: 'System',
  },
  introSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'System',
  },
  currentPlanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 12,
    borderRadius: 8,
  },
  currentPlanText: {
    fontSize: 14,
    color: '#4a90e2',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'System',
  },
  planesContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  planCardActive: {
    borderWidth: 2,
    borderColor: '#27ae60',
  },
  planCardPopular: {
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  popularText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'System',
  },
  planHeader: {
    padding: 20,
    alignItems: 'center',
  },
  planNombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    fontFamily: 'System',
  },
  precioContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrecio: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'System',
  },
  planPeriodo: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
    fontFamily: 'System',
  },
  beneficiosContainer: {
    padding: 20,
  },
  beneficioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  beneficioTexto: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 10,
    flex: 1,
    fontFamily: 'System',
  },
  suscribirButton: {
    margin: 20,
    marginTop: 0,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  suscribirButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'System',
  },
  activeContainer: {
    margin: 20,
    marginTop: 0,
  },
  activeBadge: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  activeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'System',
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
    fontFamily: 'System',
  },
  bottomSpacing: {
    height: 30,
  },
});

export default Membresias;