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
import * as yup from 'yup';

import {
  cancelarMembresia,
  clearError,
  obtenerMembresiasActivas,
  obtenerPromocionesActivas,
  suscribirMembresia
} from '../store/slices/membresiaSlice';

import { loguear } from '../store/slices/authSlice';

const membresiaSchema = yup.object({
  _id: yup
    .string()
    .required('El ID de la membresía es obligatorio'),

  nombre: yup
    .string()
    .required('El nombre de la membresía es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder los 50 caracteres'),

  tipo: yup
    .string()
    .required('El tipo de membresía es obligatorio')
    .test('tipo-membresia-valido', 'Tipo de membresía inválido', function(value) {
      const tiposValidos = ['basico', 'estandar', 'premium', 'empresarial'];
      return tiposValidos.includes(value);
    }),

  precio: yup.lazy((value) => {
    if (typeof value === 'object') {
      return yup.object({
        valor: yup
          .number()
          .required('El valor del precio es obligatorio')
          .min(0, 'El precio no puede ser negativo')
          .max(99999, 'El precio no puede exceder $9,999'),
        periodicidad: yup
          .string()
          .test('periodicidad-valida', 'Periodicidad inválida', function(value) {
            const periodicidadesValidas = ['mensual', 'trimestral', 'anual'];
            return periodicidadesValidas.includes(value);
          })
      });
    }
    return yup
      .number()
      .required('El precio es obligatorio')
      .min(0, 'El precio no puede ser negativo')
      .max(99999, 'El precio no puede exceder $9,999');
  }),

  descripcion: yup
    .string()
    .nullable()
    .max(500, 'La descripción no puede exceder los 500 caracteres'),

  beneficios: yup
    .array()
    .of(
      yup.lazy((value) => {
        if (typeof value === 'string') {
          return yup.string().min(5, 'Cada beneficio debe tener al menos 5 caracteres');
        }
        return yup.object({
          descripcion: yup.string(),
          tipo: yup.string(),
          valor: yup.mixed()
        });
      })
    )
    .min(1, 'Debe tener al menos un beneficio'),

  duracion: yup
    .number()
    .nullable()
    .integer('La duración debe ser un número entero')
    .min(1, 'La duración debe ser mayor a 0')
    .max(365, 'La duración no puede exceder 365 días'),

  activo: yup
    .boolean()
    .required('El estado activo es obligatorio'),

  restricciones: yup
    .mixed()
    .nullable()
});


const suscripcionSchema = yup.object({
  usuarioId: yup
    .string()
    .required('El ID del usuario es obligatorio'),

  membresiaId: yup
    .string()
    .required('El ID de la membresía es obligatorio')
    .test('not-fallback', 'ID de membresía inválido', function(value) {
      return !value || !value.includes('fallback');
    }),

  fechaInicio: yup
    .string()
    .required('La fecha de inicio es obligatoria')
    .test('valid-date', 'Fecha de inicio inválida', function(value) {
      const date = new Date(value);
      return !isNaN(date.getTime()) && date >= new Date(Date.now() - 24 * 60 * 60 * 1000);
    }),

  metodoPagoId: yup
    .string()
    .required('El método de pago es obligatorio'),

  renovacionAutomatica: yup
    .boolean()
    .required('La renovación automática debe estar definida')
});


const cancelacionSchema = yup.object({
  usuarioId: yup
    .string()
    .required('El ID del usuario es obligatorio'),

  membresiaId: yup
    .string()
    .required('El ID de la membresía es obligatorio'),

  motivo: yup
    .string()
    .required('El motivo de cancelación es obligatorio')
    .min(10, 'El motivo debe tener al menos 10 caracteres')
    .max(500, 'El motivo no puede exceder los 500 caracteres'),

  fechaCancelacion: yup
    .string()
    .required('La fecha de cancelación es obligatoria')
    .test('valid-date', 'Fecha de cancelación inválida', function(value) {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }),

  reembolsoParcial: yup
    .boolean()
    .required('El reembolso parcial debe estar definido')
});


const promocionSchema = yup.object({
  nombre: yup
    .string()
    .required('El nombre de la promoción es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres'),

  descripcion: yup
    .string()
    .required('La descripción es obligatoria')
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(300, 'La descripción no puede exceder los 300 caracteres'),

  codigo: yup
    .string()
    .required('El código promocional es obligatorio')
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(20, 'El código no puede exceder los 20 caracteres')
    .matches(/^[A-Z0-9_-]+$/, 'El código solo puede contener mayúsculas, números, guiones y guiones bajos')
});

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
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [datosValidados, setDatosValidados] = useState(false);

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

  
  useEffect(() => {
    if (membresiasActivas.length > 0 || promocionesActivas.length > 0) {
      validarDatos();
    }
  }, [membresiasActivas, promocionesActivas]);

  const validarDatos = async () => {
    try {
      const errores = {};

      
      for (let i = 0; i < membresiasActivas.length; i++) {
        try {
          await membresiaSchema.validate(membresiasActivas[i], { abortEarly: false });
        } catch (error) {
          if (error.inner) {
            error.inner.forEach(err => {
              errores[`membresia_${i}_${err.path}`] = err.message;
            });
          } else {
            errores[`membresia_${i}`] = error.message;
          }
        }
      }

      
      for (let i = 0; i < promocionesActivas.length; i++) {
        try {
          await promocionSchema.validate(promocionesActivas[i], { abortEarly: false });
        } catch (error) {
          if (error.inner) {
            error.inner.forEach(err => {
              errores[`promocion_${i}_${err.path}`] = err.message;
            });
          } else {
            errores[`promocion_${i}`] = error.message;
          }
        }
      }

      setErroresValidacion(errores);
      setDatosValidados(Object.keys(errores).length === 0);

      if (Object.keys(errores).length > 0) {
        console.warn('Errores de validación en membresías:', errores);
      }

    } catch (error) {
      console.error('Error validando datos:', error);
      setDatosValidados(false);
    }
  };

  const validarSuscripcion = async (suscripcionData) => {
    try {
      await suscripcionSchema.validate(suscripcionData, { abortEarly: false });
      return { valido: true, errores: {} };
    } catch (error) {
      const errores = {};
      if (error.inner) {
        error.inner.forEach(err => {
          errores[err.path] = err.message;
        });
      } else {
        errores.general = error.message;
      }
      return { valido: false, errores };
    }
  };

  const validarCancelacion = async (cancelacionData) => {
    try {
      await cancelacionSchema.validate(cancelacionData, { abortEarly: false });
      return { valido: true, errores: {} };
    } catch (error) {
      const errores = {};
      if (error.inner) {
        error.inner.forEach(err => {
          errores[err.path] = err.message;
        });
      } else {
        errores.general = error.message;
      }
      return { valido: false, errores };
    }
  };

  const cargarDatos = () => {
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
      datosCompletos: m,
      validacionExitosa: !Object.keys(erroresValidacion).some(key => key.startsWith(`membresia_${membresiasActivas.indexOf(m)}_`))
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
        validacionExitosa: false,
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
        validacionExitosa: false,
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
        validacionExitosa: false,
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

    if (!plan.validacionExitosa) {
      Alert.alert(
        'Datos del plan inconsistentes',
        'Este plan presenta inconsistencias en sus datos. ¿Deseas continuar de todos modos?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => navegarAPago(plan) }
        ]
      );
      return;
    }

    navegarAPago(plan);
  };

  const navegarAPago = (plan) => {
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



  const completarSuscripcion = (plan) => actualizarMembresia(plan);

  const actualizarMembresia = async (plan) => {
  if (!usuario?._id && !usuario?.id) {
    Alert.alert('Error', 'No se pudo identificar el usuario. Por favor, inicia sesión nuevamente.');
    return;
  }

  setIsUpdating(true);

  try {
    
    const suscripcionData = {
      usuarioId: usuario._id || usuario.id,
      membresiaId: plan.id,
      fechaInicio: new Date().toISOString(),
      metodoPagoId: 'default', 
      renovacionAutomatica: true
    };

    
    const validacion = await validarSuscripcion(suscripcionData);
    if (!validacion.valido) {
      const erroresTexto = Object.values(validacion.errores).join('\n');
      Alert.alert('Datos inválidos', erroresTexto);
      return;
    }

    
    const resultado = await dispatch(suscribirMembresia(suscripcionData));
    
    if (suscribirMembresia.fulfilled.match(resultado)) {
      
      const usuarioActualizado = {
        ...usuario,
        membresia: {
          tipoMembresiaId: plan.id,
          fechaInicio: new Date().toISOString(),
          fechaVencimiento: new Date(Date.now() + (plan.duracion || 30) * 24 * 60 * 60 * 1000).toISOString(),
          renovacionAutomatica: true
        }
      };
      
      dispatch(loguear({ usuario: usuarioActualizado, token }));
      
      Alert.alert(
        'Suscripción exitosa',
        `Te has suscrito al plan ${plan.nombre} exitosamente.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      throw new Error(resultado.payload || 'Error al suscribirse');
    }
  } catch (error) {
    console.error('Error al actualizar membresía:', error);
    Alert.alert('Error', error.message || 'No se pudo completar la suscripción');
  } finally {
    setIsUpdating(false);
  }
};

const cancelarMembresiaBackend = async () => {
  if (!usuario?._id && !usuario?.id) {
    Alert.alert('Error', 'No se pudo identificar el usuario. Por favor, inicia sesión nuevamente.');
    return;
  }

  if (!usuario?.membresia?.tipoMembresiaId) {
    Alert.alert('Error', 'No tienes una membresía activa para cancelar.');
    return;
  }

  setIsUpdating(true);

  try {
    
    const cancelacionData = {
      usuarioId: usuario._id || usuario.id,
      membresiaId: usuario.membresia.tipoMembresiaId,
      motivo: 'Cancelación solicitada por el usuario',
      fechaCancelacion: new Date().toISOString(),
      reembolsoParcial: false
    };

    
    const validacion = await validarCancelacion(cancelacionData);
    if (!validacion.valido) {
      const erroresTexto = Object.values(validacion.errores).join('\n');
      Alert.alert('Datos inválidos', erroresTexto);
      return;
    }

    
    const resultado = await dispatch(cancelarMembresia(cancelacionData));
    
    if (cancelarMembresia.fulfilled.match(resultado)) {
      
      const usuarioActualizado = {
        ...usuario,
        membresia: {
          ...usuario.membresia,
          renovacionAutomatica: false,
          fechaCancelacion: new Date().toISOString()
        }
      };
      
      dispatch(loguear({ usuario: usuarioActualizado, token }));
      
      Alert.alert(
        'Membresía cancelada',
        'Tu membresía ha sido cancelada. Mantendrás el acceso hasta el final del período actual.',
        [{ text: 'OK' }]
      );
    } else {
      throw new Error(resultado.payload || 'Error al cancelar membresía');
    }
  } catch (error) {
    console.error('Error al cancelar membresía:', error);
    Alert.alert('Error', error.message || 'No se pudo cancelar la membresía');
  } finally {
    setIsUpdating(false);
  }
};

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

  
  const AlertaValidacion = () => {
    if (datosValidados && Object.keys(erroresValidacion).length === 0) {
      return (
        <View style={styles.alertaExito}>
          <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
          <Text style={styles.alertaExitoTexto}>
            Todos los datos de membresías son válidos
          </Text>
        </View>
      );
    }

    if (Object.keys(erroresValidacion).length > 0) {
      return (
        <View style={styles.alertaError}>
          <Ionicons name="warning" size={20} color="#e74c3c" />
          <View style={styles.alertaErrorContent}>
            <Text style={styles.alertaErrorTitulo}>Datos inconsistentes detectados</Text>
            <Text style={styles.alertaErrorTexto}>
              Algunos planes presentan inconsistencias. Verifica la información antes de suscribirte.
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderPlan = (plan) => {
    const isActive = esPlanActivo(plan.id);
    const mActual = getMembresiaActual();
    const planTieneErrores = !plan.validacionExitosa;

    return (
      <View
        key={plan.id}
        style={[
          styles.planCard,
          isActive && styles.planCardActive,
          plan.popular && styles.planCardPopular,
          planTieneErrores && styles.planCardError
        ]}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MÁS POPULAR</Text>
          </View>
        )}
        
        {planTieneErrores && (
          <View style={styles.errorBadge}>
            <Ionicons name="warning" size={16} color="#fff" />
            <Text style={styles.errorBadgeText}>DATOS INCONSISTENTES</Text>
          </View>
        )}

        {!planTieneErrores && plan.validacionExitosa && (
          <View style={styles.validBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.validBadgeText}>VERIFICADO</Text>
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
              (isUpdating || loadingSuscripcion) && styles.buttonDisabled,
              planTieneErrores && styles.suscribirButtonError
            ]}
            onPress={() => handleSuscribirse(plan)}
            disabled={isUpdating || loadingSuscripcion}
          >
            <Text style={styles.suscribirButtonText}>
              {mActual ? 'Cambiar a este plan' : 'Suscribirse'}
            </Text>
            {planTieneErrores && (
              <Ionicons name="warning" size={16} color="#fff" style={{ marginLeft: 8 }} />
            )}
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

        <AlertaValidacion />

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
            {promocionesActivas.slice(0, 2).map((promocion, index) => {
              const promocionTieneErrores = Object.keys(erroresValidacion).some(key => 
                key.startsWith(`promocion_${index}_`)
              );
              
              return (
                <View 
                  key={index} 
                  style={[
                    styles.promocionCard,
                    promocionTieneErrores && styles.promocionCardError
                  ]}
                >
                  <View style={styles.promocionHeader}>
                    <Text style={styles.promocionTitulo}>{promocion.nombre}</Text>
                    {promocionTieneErrores && (
                      <Ionicons name="warning" size={16} color="#e74c3c" />
                    )}
                  </View>
                  <Text style={styles.promocionDescripcion}>{promocion.descripcion}</Text>
                  <Text style={styles.promocionCodigo}>Código: {promocion.codigo}</Text>
                  {promocionTieneErrores && (
                    <Text style={styles.promocionError}>
                      ⚠️ Esta promoción presenta datos inconsistentes
                    </Text>
                  )}
                </View>
              );
            })}
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
            • Reembolsos según términos y condiciones{'\n'}
            • Los planes marcados con ⚠️ presentan inconsistencias en sus datos
          </Text>
        </View>

        {/* Resumen de validación */}
        

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

  
  alertaExito: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f4',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 20,
    marginBottom: 10,
    gap: 8,
  },
  alertaExitoTexto: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '500',
  },
  alertaError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 20,
    marginBottom: 10,
    gap: 8,
  },
  alertaErrorContent: {
    flex: 1,
  },
  alertaErrorTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
  },
  alertaErrorTexto: {
    fontSize: 12,
    color: '#7f1d1d',
    lineHeight: 16,
  },

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
  promocionCardError: {
    borderLeftColor: '#e74c3c',
    backgroundColor: '#fef2f2',
  },
  promocionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  promocionTitulo: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', fontFamily: 'System' },
  promocionDescripcion: { fontSize: 12, color: '#7f8c8d', marginTop: 2, fontFamily: 'System' },
  promocionCodigo: { fontSize: 12, fontWeight: 'bold', color: '#f39c12', marginTop: 4, fontFamily: 'System' },
  promocionError: {
    fontSize: 11,
    color: '#e74c3c',
    marginTop: 4,
    fontStyle: 'italic',
  },
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
    shadowOpacity: 0.1, shadowRadius: 3, position: 'relative'
  },
  planCardActive: { borderWidth: 2, borderColor: '#27ae60' },
  planCardPopular: { position: 'relative' },
  planCardError: { 
    borderWidth: 2, 
    borderColor: '#e74c3c',
    backgroundColor: '#fefefe'
  },
  popularBadge: {
    position: 'absolute', top: 10, right: 10, backgroundColor: '#e74c3c',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, zIndex: 1
  },
  popularText: { fontSize: 12, fontWeight: 'bold', color: '#fff', fontFamily: 'System' },
  errorBadge: {
    position: 'absolute', top: 10, left: 10, backgroundColor: '#e74c3c',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, zIndex: 1,
    flexDirection: 'row', alignItems: 'center', gap: 4
  },
  errorBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff', fontFamily: 'System' },
  validBadge: {
    position: 'absolute', top: 10, left: 10, backgroundColor: '#27ae60',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, zIndex: 1,
    flexDirection: 'row', alignItems: 'center', gap: 4
  },
  validBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff', fontFamily: 'System' },
  planHeader: { padding: 20, alignItems: 'center' },
  planNombre: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 10, fontFamily: 'System' },
  precioContainer: { flexDirection: 'row', alignItems: 'baseline' },
  planPrecio: { fontSize: 36, fontWeight: 'bold', color: '#fff', fontFamily: 'System' },
  planPeriodo: { fontSize: 18, color: '#fff', opacity: 0.8, fontFamily: 'System' },
  beneficiosContainer: { padding: 20 },
  beneficioItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  beneficioTexto: { fontSize: 14, color: '#2c3e50', marginLeft: 10, flex: 1, fontFamily: 'System' },
  suscribirButton: {
    margin: 20, marginTop: 0, paddingVertical: 15, borderRadius: 8, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center'
  },
  suscribirButtonError: {
    backgroundColor: '#e74c3c',
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
  
  
  resumenValidacion: {
    marginHorizontal: 20,
    marginTop: 15,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  resumenValidacionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  resumenValidacionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resumenStat: {
    alignItems: 'center',
  },
  resumenStatNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 4,
  },
  resumenStatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },

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