import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

import {
  actualizarSuscripcionActual,
  cancelarMembresia,
  clearError,
  obtenerMembresiasActivas,
  obtenerPromocionesActivas,
  suscribirMembresia
} from '../store/slices/membresiaSlice';

import { actualizarDatosUsuario } from '../store/slices/usuarioSlice';

const Membresias = ({ navigation }) => {
  
  const dispatch = useDispatch();
  const { usuario, token } = useSelector(state => state.auth);
  const { 
    membresiasActivas,
    promocionesActivas,
    suscripcionActual,
    loading,
    loadingSuscripcion,
    error,
    errorSuscripcion
  } = useSelector(state => state.membresias);

  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    cargarDatos();
    
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (usuario?.membresia?.tipoMembresiaId) {
      
      const planActual = planes.find(plan => 
        plan.id === usuario.membresia.tipoMembresiaId || 
        plan.nombre.toLowerCase() === usuario.tipoUsuario?.toLowerCase()
      );
      if (planActual) {
        setSelectedPlan(planActual.id);
      }
    }
  }, [usuario]);

  
  useEffect(() => {
    if (error || errorSuscripcion) {
      Alert.alert('Error', error || errorSuscripcion);
      dispatch(clearError());
    }
  }, [error, errorSuscripcion, dispatch]);

  
  const cargarDatos = () => {
    console.log('🔵 Iniciando carga de datos de membresías...');
    dispatch(obtenerMembresiasActivas());
    dispatch(obtenerPromocionesActivas());
  };

  
  useEffect(() => {
    console.log('🔍 Estado actual de membresías:', {
      membresiasActivas,
      loading,
      error,
      cantidad: membresiasActivas?.length
    });
  }, [membresiasActivas, loading, error]);

  
  const mapearMembresiaParaUI = (m) => {
    const getColorPorTipo = (tipo) => {
      switch (tipo?.toLowerCase()) {
        case 'basico': case 'usuario': return '#95a5a6';
        case 'premium': case 'cliente': return '#4a90e2';
        case 'empresarial': case 'proveedor': return '#9b59b6';
        case 'administrador': return '#e74c3c';
        default: return '#7f8c8d';
      }
    };

    const formatearPrecio = (precio) => {
      if (typeof precio === 'object' && precio.valor !== undefined) {
        return `$${precio.valor}`;
      }
      if (typeof precio === 'number') {
        return `$${precio}`;
      }
      if (typeof precio === 'string') {
        return precio.includes('$') ? precio : `$${precio}`;
      }
      return '$0.00';
    };

    
    const beneficiosStrings = Array.isArray(m.beneficios)
      ? m.beneficios.map(b =>
          typeof b === 'string'
            ? b
            : b.descripcion
              ? b.descripcion
              : JSON.stringify(b)
        )
      : [];

    return {
      id: m._id || m.id,
      nombre: m.nombre,
      tipo: m.tipo,
      precio: formatearPrecio(m.precio),
      precioNumerico: typeof m.precio === 'object' ? m.precio.valor : m.precio,
      periodo: 'mes',
      color: getColorPorTipo(m.tipo),
      descripcion: m.descripcion,
      beneficios: beneficiosStrings,
      duracion: m.duracion || 30,
      activo: m.activo,
      restricciones: m.restricciones,
      popular: m.tipo?.toLowerCase() === 'premium',
      tipoUsuario:
        m.tipo === 'basico' ? 'usuario' :
        m.tipo === 'premium' ? 'cliente' :
        m.tipo === 'empresarial' ? 'proveedor' :
        m.tipo,
      datosCompletos: m
    };
  };

  
  const planes = membresiasActivas && membresiasActivas.length > 0 
    ? membresiasActivas.map(mapearMembresiaParaUI)
    : [
        {
          id: 'basico-fallback',
          nombre: 'Básico',
          precio: '$19.99',
          precioNumerico: 19.99,
          periodo: 'mes',
          color: '#95a5a6',
          tipoUsuario: 'usuario',
          beneficios: [
            '5 reservas mensuales',
            'Acceso a oficinas estándar',
            'Soporte por email',
            'Cancelación gratuita hasta 24h antes'
          ]
        },
        {
          id: 'premium-fallback',
          nombre: 'Premium',
          precio: '$49.99',
          precioNumerico: 49.99,
          periodo: 'mes',
          color: '#4a90e2',
          popular: true,
          tipoUsuario: 'cliente',
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
          id: 'empresarial-fallback',
          nombre: 'Empresarial',
          precio: '$149.99',
          precioNumerico: 149.99,
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

  const handleGoBack = () => navigation.goBack();

  const handleSuscribirse = (plan) => {
    const membresiaActual = usuario?.membresia;
    if (membresiaActual?.tipoMembresiaId === plan.id && membresiaActual?.renovacionAutomatica) {
      Alert.alert('Ya tienes este plan', 'Este es tu plan actual y está activo');
      return;
    }

    navigation.navigate('MetodosPago', {
      modoSeleccion: true,
      modoSuscripcion: true,
      planSuscripcion: plan,
      precio: plan.precio,
      descripcion: `Plan ${plan.nombre} - ${plan.precio}/${plan.periodo}`,
      onPaymentSuccess: () => completarSuscripcion(plan)
    });
  };

  const handleCancelarMembresia = () => {
    Alert.alert(
      'Cancelar membresía',
      '¿Estás seguro de que quieres cancelar tu membresía actual? Perderás todos los beneficios al final del período actual.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: cancelarMembresiaBackend }
      ]
    );
  };

  const cancelarMembresiaBackend = async () => {
    try {
      setIsUpdating(true);
      const cancelacionData = {
        usuarioId: usuario._id,
        renovacionAutomatica: false,
        fechaVencimiento: usuario.membresia?.fechaVencimiento || new Date().toISOString()
      };
      const result = await dispatch(cancelarMembresia(cancelacionData));
      if (cancelarMembresia.fulfilled.match(result)) {
        dispatch(actualizarDatosUsuario(result.payload));
        Alert.alert('Membresía cancelada', 'Tu membresía se cancelará al final del período actual. Mantendrás acceso hasta entonces.');
        setSelectedPlan(null);
      } else {
        throw new Error(result.payload || 'Error al cancelar membresía');
      }
    } catch (err) {
      console.error('🔴 Error al cancelar membresía:', err);
      Alert.alert('Error', err.message || 'No se pudo cancelar la membresía');
    } finally {
      setIsUpdating(false);
    }
  };

  const actualizarMembresia = async (plan) => {
    try {
      setIsUpdating(true);
      const fechaInicio = new Date();
      const fechaVencimiento = new Date();
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
      const suscripcionData = {
        usuarioId: usuario._id,
        tipoMembresiaId: plan.id,
        fechaInicio: fechaInicio.toISOString(),
        fechaVencimiento: fechaVencimiento.toISOString(),
        renovacionAutomatica: true,
        planDetalle: plan
      };
      const result = await dispatch(suscribirMembresia(suscripcionData));
      if (suscribirMembresia.fulfilled.match(result)) {
        dispatch(actualizarDatosUsuario(result.payload));
        dispatch(actualizarSuscripcionActual(result.payload));
        setSelectedPlan(plan.id);
        Alert.alert('Suscripción exitosa', `¡Felicitaciones! Ahora tienes el plan ${plan.nombre}. Tu próximo cobro será el ${fechaVencimiento.toLocaleDateString()}.`);
        return true;
      } else {
        throw new Error(result.payload || 'Error al procesar la suscripción');
      }
    } catch (err) {
      console.error('🔴 Error al actualizar membresía:', err);
      Alert.alert('Error', err.message || 'No se pudo procesar la suscripción');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const completarSuscripcion = (plan) => actualizarMembresia(plan);

  const getMembresiaActual = () => {
    if (!usuario?.membresia?.tipoMembresiaId) return null;
    return planes.find(plan => plan.id === usuario.membresia.tipoMembresiaId);
  };

  const esPlanActivo = (planId) => {
    const mActual = usuario?.membresia;
    if (!mActual?.tipoMembresiaId) return false;
    const venc = new Date(mActual.fechaVencimiento);
    return mActual.tipoMembresiaId === planId && venc > new Date() && mActual.renovacionAutomatica;
  };

  const renderPlan = (plan) => {
    const isActive = esPlanActivo(plan.id);
    const mActual = getMembresiaActual();
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
          {plan.beneficios.map((texto, idx) => (
            <View key={idx} style={styles.beneficioItem}>
              <Ionicons name="checkmark-circle" size={20} color={plan.color} />
              <Text style={styles.beneficioTexto}>{texto}</Text>
            </View>
          ))}
        </View>

        {isActive ? (
          <View style={styles.activeContainer}>
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>PLAN ACTUAL</Text>
            </View>
            {usuario?.membresia?.fechaVencimiento && (
              <Text style={styles.vencimientoText}>
                Próximo cobro: {new Date(usuario.membresia.fechaVencimiento).toLocaleDateString()}
              </Text>
            )}
            <TouchableOpacity
              style={[styles.cancelButton, (isUpdating || loadingSuscripcion) && styles.buttonDisabled]}
              onPress={handleCancelarMembresia}
              disabled={isUpdating || loadingSuscripcion}
            >
              {(isUpdating || loadingSuscripcion) ? (
                <ActivityIndicator size="small" color="#e74c3c" />
              ) : (
                <Text style={styles.cancelButtonText}>Cancelar membresía</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.suscribirButton, { backgroundColor: plan.color }, (isUpdating || loadingSuscripcion) && styles.buttonDisabled]}
            onPress={() => handleSuscribirse(plan)}
            disabled={isUpdating || loadingSuscripcion}
          >
            <Text style={styles.suscribirButtonText}>
              {mActual ? 'Cambiar a este plan' : 'Suscribirse'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Cargando membresías...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membresías</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={cargarDatos} disabled={loading}>
          <Ionicons name="refresh" size={24} color={loading ? "#ccc" : "#4a90e2"} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Elige el plan perfecto para ti</Text>
          <Text style={styles.introSubtitle}>
            Accede a los mejores espacios de trabajo con beneficios exclusivos
          </Text>
        </View>

        {usuario?.membresia?.tipoMembresiaId && (
          <View style={styles.currentPlanInfo}>
            <Ionicons name="information-circle" size={20} color="#4a90e2" />
            <View style={styles.currentPlanTextContainer}>
              <Text style={styles.currentPlanText}>
                Plan actual: {getMembresiaActual()?.nombre || 'Desconocido'}
              </Text>
              {usuario.membresia.fechaVencimiento && (
                <Text style={styles.currentPlanSubtext}>
                  {usuario.membresia.renovacionAutomatica 
                    ? `Próximo cobro: ${new Date(usuario.membresia.fechaVencimiento).toLocaleDateString()}`
                    : `Vence: ${new Date(usuario.membresia.fechaVencimiento).toLocaleDateString()}`
                  }
                </Text>
              )}
            </View>
          </View>
        )}

        {promocionesActivas && promocionesActivas.length > 0 && (
          <View style={styles.promocionesContainer}>
            <Text style={styles.promocionesTitle}>🎉 Promociones disponibles</Text>
            {promocionesActivas.slice(0, 2).map((promocion, index) => (
              <View key={index} style={styles.promocionCard}>
                <Text style={styles.promocionTitulo}>{promocion.nombre}</Text>
                <Text style={styles.promocionDescripcion}>{promocion.descripcion}</Text>
                <Text style={styles.promocionCodigo}>Código: {promocion.codigo}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.planesContainer}>
          {planes && planes.length > 0 ? (
            planes.map(renderPlan)
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="information-circle-outline" size={48} color="#7f8c8d" />
              <Text style={styles.noDataText}>No hay planes de membresía disponibles</Text>
              <TouchableOpacity style={styles.retryButton} onPress={cargarDatos}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.infoAdicional}>
          <Text style={styles.infoTitulo}>Información importante:</Text>
          <Text style={styles.infoTexto}>
            • Todas las suscripciones se renuevan automáticamente{'\n'}
            • Puedes cancelar en cualquier momento{'\n'}
            • Los cambios de plan son inmediatos{'\n'}
            • Reembolsos según términos y condiciones
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {(isUpdating || loadingSuscripcion) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Procesando...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#7f8c8d', fontSize: 16, marginTop: 10, fontFamily: 'System' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2
  },
  backButton: { padding: 5 },
  headerTitle: {
    fontSize: 20, fontWeight: 'bold', color: '#2c3e50',
    fontFamily: 'System', flex: 1, textAlign: 'center', marginHorizontal: 10
  },
  refreshButton: { padding: 5 },
  content: { flex: 1 },
  introContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  introTitle: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', fontFamily: 'System' },
  introSubtitle: { fontSize: 16, color: '#7f8c8d', textAlign: 'center', marginTop: 8, fontFamily: 'System' },
  currentPlanInfo: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#e8f4fd',
    marginHorizontal: 20, marginVertical: 10, padding: 12, borderRadius: 8
  },
  currentPlanTextContainer: { marginLeft: 8, flex: 1 },
  currentPlanText: { fontSize: 14, color: '#4a90e2', fontWeight: '600', fontFamily: 'System' },
  currentPlanSubtext: { fontSize: 12, color: '#4a90e2', opacity: 0.8, marginTop: 2, fontFamily: 'System' },
  promocionesContainer: { marginHorizontal: 20, marginVertical: 10 },
  promocionesTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10, fontFamily: 'System' },
  promocionCard: {
    backgroundColor: '#fff5cd', padding: 12, borderRadius: 8, marginBottom: 8,
    borderLeftWidth: 4, borderLeftColor: '#f39c12'
  },
  promocionTitulo: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', fontFamily: 'System' },
  promocionDescripcion: { fontSize: 12, color: '#7f8c8d', marginTop: 2, fontFamily: 'System' },
  promocionCodigo: { fontSize: 12, fontWeight: 'bold', color: '#f39c12', marginTop: 4, fontFamily: 'System' },
  planesContainer: { paddingHorizontal: 20, paddingTop: 10 },
  debugContainer: {
    backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 16,
    borderWidth: 1, borderColor: '#e1e5e9'
  },
  debugTitle: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  debugText: { fontSize: 12, color: '#7f8c8d', marginBottom: 2 },
  planCard: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 20, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3
  },
  planCardActive: { borderWidth: 2, borderColor: '#27ae60' },
  planCardPopular: { position: 'relative' },
  popularBadge: {
    position: 'absolute', top: 10, right: 10, backgroundColor: '#e74c3c',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, zIndex: 1
  },
  popularText: { fontSize: 12, fontWeight: 'bold', color: '#fff', fontFamily: 'System' },
  planHeader: { padding: 20, alignItems: 'center' },
  planNombre: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 10, fontFamily: 'System' },
  precioContainer: { flexDirection: 'row', alignItems: 'baseline' },
  planPrecio: { fontSize: 36, fontWeight: 'bold', color: '#fff', fontFamily: 'System' },
  planPeriodo: { fontSize: 18, color: '#fff', opacity: 0.8, fontFamily: 'System' },
  beneficiosContainer: { padding: 20 },
  beneficioItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  beneficioTexto: { fontSize: 14, color: '#2c3e50', marginLeft: 10, flex: 1, fontFamily: 'System' },
  suscribirButton: {
    margin: 20, marginTop: 0, paddingVertical: 15, borderRadius: 8, alignItems: 'center'
  },
  suscribirButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff', fontFamily: 'System' },
  activeContainer: { margin: 20, marginTop: 0 },
  activeBadge: { backgroundColor: '#27ae60', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  activeText: { fontSize: 14, fontWeight: 'bold', color: '#fff', fontFamily: 'System' },
  vencimientoText: { fontSize: 12, color: '#7f8c8d', textAlign: 'center', marginBottom: 10, fontFamily: 'System' },
  cancelButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e74c3c', flexDirection: 'row', justifyContent: 'center' },
  cancelButtonText: { fontSize: 14, color: '#e74c3c', fontWeight: '600', fontFamily: 'System' },
  buttonDisabled: { opacity: 0.6 },
  infoAdicional: { marginHorizontal: 20, marginTop: 10, padding: 16, backgroundColor: '#fff', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#4a90e2' },
  infoTitulo: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8, fontFamily: 'System' },
  infoTexto: { fontSize: 12, color: '#7f8c8d', lineHeight: 18, fontFamily: 'System' },
  noDataContainer: { alignItems: 'center', padding: 40, backgroundColor: '#fff', borderRadius: 12, marginBottom: 20 },
  noDataText: { fontSize: 16, color: '#7f8c8d', textAlign: 'center', marginTop: 16, marginBottom: 20 },
  retryButton: { backgroundColor: '#4a90e2', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
  },
  bottomSpacing: { height: 30 }
});

export default Membresias;
