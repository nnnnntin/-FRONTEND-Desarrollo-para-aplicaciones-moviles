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

import { loguear } from '../store/slices/authSlice';

const Membresias = ({ navigation }) => {
  const dispatch = useDispatch();
  const { usuario, token } = useSelector(state => state.auth);
  const {
    membresiasActivas,
    promocionesActivas,
    suscripcionActual,
    loadingMembresiasActivas,
    loadingSuscripcion,
    errorMembresiasActivas,
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
    if (usuario?.membresia?.tipoMembresiaId && membresiasActivas.length > 0) {
      const planActual = membresiasActivas.find(plan =>
        (plan._id || plan.id) === usuario.membresia.tipoMembresiaId
      );
      if (planActual) {
        setSelectedPlan(planActual._id || planActual.id);
      }
    }
  }, [usuario, membresiasActivas]);

  useEffect(() => {
    if (errorMembresiasActivas || errorSuscripcion) {
      Alert.alert('Error', errorMembresiasActivas || errorSuscripcion);
      dispatch(clearError());
    }
  }, [errorMembresiasActivas, errorSuscripcion, dispatch]);

  const cargarDatos = () => {
    console.log('🔵 [Membresias] Cargando datos...');
    dispatch(obtenerMembresiasActivas());
    dispatch(obtenerPromocionesActivas());
  };

  const mapearMembresiaParaUI = (m) => {
    const getColorPorTipo = (tipo) => {
      switch (tipo?.toLowerCase()) {
        case 'basico': return '#95a5a6';
        case 'estandar': return '#3498db';
        case 'premium': return '#4a90e2';
        case 'empresarial': return '#9b59b6';
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

    const formatearPeriodo = (precio) => {
      if (typeof precio === 'object' && precio.periodicidad) {
        const periodos = {
          'mensual': 'mes',
          'trimestral': 'trimestre',
          'anual': 'año'
        };
        return periodos[precio.periodicidad] || 'mes';
      }
      return 'mes';
    };

    const beneficiosStrings = Array.isArray(m.beneficios)
      ? m.beneficios.map(b =>
        typeof b === 'string'
          ? b
          : b.descripcion
            ? b.descripcion
            : `${b.tipo}: ${b.valor || 'Incluido'}`
      )
      : [];

    return {
      id: m._id || m.id,
      nombre: m.nombre,
      tipo: m.tipo,
      precio: formatearPrecio(m.precio),
      precioNumerico: typeof m.precio === 'object' ? m.precio.valor : (parseFloat(m.precio) || 0),
      periodo: formatearPeriodo(m.precio),
      color: getColorPorTipo(m.tipo),
      descripcion: m.descripcion,
      beneficios: beneficiosStrings.length > 0 ? beneficiosStrings : [
        'Acceso a espacios de trabajo',
        'Soporte al cliente',
        'Cancelación flexible'
      ],
      duracion: m.duracion || 30,
      activo: m.activo,
      restricciones: m.restricciones,
      popular: m.tipo?.toLowerCase() === 'premium',
      tipoUsuario: m.tipo,
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
        tipoUsuario: 'basico',
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
        tipoUsuario: 'premium',
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

  const handleGoBack = () => navigation.popToTop();

  const handleSuscribirse = (plan) => {
    const membresiaActual = usuario?.membresia;

    if (membresiaActual?.tipoMembresiaId === plan.id && membresiaActual?.renovacionAutomatica) {
      Alert.alert('Ya tienes este plan', 'Este es tu plan actual y está activo');
      return;
    }

    if (plan.id.includes('fallback')) {
      Alert.alert(
        'Plan no disponible',
        'Este plan no está disponible en este momento. Por favor, verifica tu conexión e intenta nuevamente.',
        [
          { text: 'Reintentar', onPress: cargarDatos },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
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
        membresiaId: usuario.membresia?.tipoMembresiaId,
        motivo: 'Cancelación solicitada por el usuario',
        fechaCancelacion: new Date().toISOString(),
        reembolsoParcial: false
      };

      console.log('🔵 [Membresias] Enviando datos de cancelación:', cancelacionData);

      const result = await dispatch(cancelarMembresia(cancelacionData));

      if (cancelarMembresia.fulfilled.match(result)) {
        console.log('🟢 [Membresias] Cancelación exitosa:', result.payload);

        const usuarioActualizado = result.payload.usuario;
        dispatch(loguear({
          usuario: usuarioActualizado,
          token: token,
          tipoUsuario: usuarioActualizado.tipoUsuario
        }));

        Alert.alert(
          'Membresía cancelada',
          'Tu membresía se cancelará al final del período actual. Mantendrás acceso hasta entonces.'
        );
        setSelectedPlan(null);
      } else {
        console.error('🔴 [Membresias] Error en cancelación:', result.payload);
        throw new Error(result.payload || 'Error al cancelar membresía');
      }
    } catch (error) {
      console.error('🔴 [Membresias] Error en cancelarMembresiaBackend:', error);
      Alert.alert('Error', error.message || 'No se pudo cancelar la membresía');
    } finally {
      setIsUpdating(false);
    }
  };

const actualizarMembresia = async (plan) => {
  try {
    setIsUpdating(true);
    
    console.log('🔵 [Frontend] Iniciando suscripción a plan:', {
      planNombre: plan.nombre,
      planId: plan.id || plan._id,
      planTipo: plan.tipo,
      usuario: usuario?.username || usuario?.email,
      usuarioId: usuario?._id || usuario?.id
    });

    const membresiaId = plan.id || plan._id;
    if (!membresiaId || membresiaId.includes('fallback')) {
      throw new Error('ID de membresía inválido. Por favor, recarga la página e intenta nuevamente.');
    }

    console.log('🔍 [Frontend] Validando usuario:', {
      usuario: !!usuario,
      usuarioKeys: usuario ? Object.keys(usuario) : [],
      _id: usuario?._id,
      id: usuario?.id,
      username: usuario?.username,
      email: usuario?.email
    });

    const usuarioId = usuario?._id || usuario?.id;
    if (!usuario || !usuarioId) {
      console.error('🔴 [Frontend] Usuario inválido:', {
        usuario: !!usuario,
        usuarioData: usuario,
        _id: usuario?._id,
        id: usuario?.id
      });
      throw new Error('Usuario no válido. Por favor, inicia sesión nuevamente.');
    }

    const fechaInicio = new Date();
    const duracion = plan.datosCompletos?.duracion || plan.duracion || 30;

    console.log('🔵 [Frontend] Detalles de la suscripción:', {
      membresiaId,
      usuarioId,
      duracion,
      fechaInicio: fechaInicio.toISOString()
    });

    const suscripcionData = {
      usuarioId: usuarioId, 
      membresiaId: membresiaId, 
      fechaInicio: fechaInicio.toISOString(),
      metodoPagoId: 'default', 
      renovacionAutomatica: true, 
    };

    console.log('🔵 [Frontend] Datos enviados al backend:', suscripcionData);

    const result = await dispatch(suscribirMembresia(suscripcionData));

    if (suscribirMembresia.fulfilled.match(result)) {
      console.log('🟢 [Frontend] Respuesta exitosa del backend:', result.payload);

      const { usuario: usuarioActualizado, suscripcion } = result.payload;

      if (!usuarioActualizado) {
        throw new Error('No se recibió el usuario actualizado del servidor');
      }

      if (!usuarioActualizado.membresia || !usuarioActualizado.membresia.tipoMembresiaId) {
        throw new Error('La membresía no se asignó correctamente al usuario');
      }

      console.log('🟢 [Frontend] Membresía asignada exitosamente:', {
        usuarioId: usuarioActualizado._id,
        membresiaId: usuarioActualizado.membresia.tipoMembresiaId,
        fechaInicio: usuarioActualizado.membresia.fechaInicio,
        fechaVencimiento: usuarioActualizado.membresia.fechaVencimiento,
        renovacionAutomatica: usuarioActualizado.membresia.renovacionAutomatica
      });

      dispatch(loguear({
        usuario: usuarioActualizado,
        token: token,
        tipoUsuario: usuarioActualizado.tipoUsuario
      }));

      if (suscripcion) {
        dispatch(actualizarSuscripcionActual(suscripcion));
      }

      setSelectedPlan(membresiaId);

      const fechaVencimiento = new Date(usuarioActualizado.membresia.fechaVencimiento);

      Alert.alert(
        'Suscripción exitosa',
        `¡Felicitaciones! Ahora tienes el plan ${plan.nombre}.\n\n` +
        `Detalles:\n` +
        `• Plan: ${plan.nombre} (${plan.tipo})\n` +
        `• Próximo cobro: ${fechaVencimiento.toLocaleDateString()}\n` +
        `• Renovación automática: ${usuarioActualizado.membresia.renovacionAutomatica ? 'Sí' : 'No'}`,
        [
          {
            text: 'Perfecto',
            onPress: () => {
              console.log('🟢 [Frontend] Suscripción completada exitosamente');
            }
          }
        ]
      );

      return true;

    } else {
      console.error('🔴 [Frontend] Error en la respuesta del backend:', result.payload);

      let errorMessage = 'Error al procesar la suscripción';

      if (typeof result.payload === 'string') {
        errorMessage = result.payload;
      } else if (result.payload && result.payload.message) {
        errorMessage = result.payload.message;
      } else if (result.payload && result.payload.details) {
        errorMessage = result.payload.details;
      }

      throw new Error(errorMessage);
    }

  } catch (error) {
    console.error('🔴 [Frontend] Error completo en actualizarMembresia:', {
      message: error.message,
      stack: error.stack,
      planId: plan.id || plan._id,
      usuarioId: usuario?._id || usuario?.id
    });

    Alert.alert(
      'Error en la suscripción',
      error.message || 'No se pudo procesar la suscripción. Por favor, intenta nuevamente.',
      [
        {
          text: 'Reintentar',
          onPress: () => actualizarMembresia(plan)
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );

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
            style={[
              styles.suscribirButton,
              { backgroundColor: plan.color },
              (isUpdating || loadingSuscripcion) && styles.buttonDisabled
            ]}
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

  if (loadingMembresiasActivas && membresiasActivas.length === 0) {
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
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={cargarDatos}
          disabled={loadingMembresiasActivas}
        >
          <Ionicons
            name="refresh"
            size={24}
            color={loadingMembresiasActivas ? "#ccc" : "#4a90e2"}
          />
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

        {membresiasActivas.length === 0 && (
          <View style={styles.fallbackNotice}>
            <Ionicons name="warning" size={16} color="#f39c12" />
            <Text style={styles.fallbackText}>
              Mostrando planes offline. Verifica tu conexión.
            </Text>
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
  fallbackNotice: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ffeaa7', marginHorizontal: 20, marginVertical: 10,
    padding: 8, borderRadius: 6
  },
  fallbackText: {
    fontSize: 12, color: '#d63031', marginLeft: 6, fontFamily: 'System'
  },
  planesContainer: { paddingHorizontal: 20, paddingTop: 10 },
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
  cancelButton: {
    paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1,
    borderColor: '#e74c3c', flexDirection: 'row', justifyContent: 'center'
  },
  cancelButtonText: { fontSize: 14, color: '#e74c3c', fontWeight: '600', fontFamily: 'System' },
  buttonDisabled: { opacity: 0.6 },
  infoAdicional: {
    marginHorizontal: 20, marginTop: 10, padding: 16, backgroundColor: '#fff',
    borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#4a90e2'
  },
  infoTitulo: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8, fontFamily: 'System' },
  infoTexto: { fontSize: 12, color: '#7f8c8d', lineHeight: 18, fontFamily: 'System' },
  noDataContainer: {
    alignItems: 'center', padding: 40, backgroundColor: '#fff',
    borderRadius: 12, marginBottom: 20
  },
  noDataText: {
    fontSize: 16, color: '#7f8c8d', textAlign: 'center',
    marginTop: 16, marginBottom: 20
  },
  retryButton: {
    backgroundColor: '#4a90e2', paddingHorizontal: 24,
    paddingVertical: 12, borderRadius: 8
  },
  retryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
  },
  bottomSpacing: { height: 30 }
});

export default Membresias;