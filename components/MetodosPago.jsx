import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loguear } from '../store/slices/authSlice';
import {
  actualizarSuscripcionActual,
  suscribirMembresia
} from '../store/slices/membresiaSlice';
import { cargarNotificacionesUsuario } from '../store/slices/notificacionesSlice';
import { crearFactura, crearPago, vincularFacturaPago } from '../store/slices/pagosSlice';
import { crearReserva } from '../store/slices/reservasSlice';
import {
  actualizarMetodoPagoPredeterminado,
  eliminarMetodoPago,
  obtenerMetodosPagoUsuario
} from '../store/slices/usuarioSlice';

const crearPayloadReservaLimpio = (datosReserva, usuario, metodo) => {
  const mapearTipoEspacio = (tipoOriginal) => {
    const mapeo = {
      'oficina': 'oficina',
      'sala': 'sala_reunion',
      'escritorio': 'escritorio_flexible',
      'espacio': 'oficina',
      'edificio': 'oficina'
    };
    return mapeo[tipoOriginal] || 'oficina';
  };

  const determinarTipoReserva = (horaInicio, horaFin) => {
    const [inicioH, inicioM] = horaInicio.split(':').map(Number);
    const [finH, finM] = horaFin.split(':').map(Number);
    const minutosInicio = inicioH * 60 + inicioM;
    const minutosFin = finH * 60 + finM;
    const duracion = minutosFin - minutosInicio;
    return duracion <= 480 ? 'hora' : 'dia';
  };

  const payload = {
    usuarioId: (usuario?.id || usuario?._id)?.toString(),
    entidadReservada: {
      tipo: mapearTipoEspacio(datosReserva.espacioTipo),
      id: datosReserva.espacioId?.toString()
    },
    fechaInicio: new Date(datosReserva.fechaHoraInicio),
    fechaFin: new Date(datosReserva.fechaHoraFin),
    horaInicio: datosReserva.horaInicio,
    horaFin: datosReserva.horaFin,
    tipoReserva: determinarTipoReserva(datosReserva.horaInicio, datosReserva.horaFin),
    precioTotal: parseFloat(datosReserva.precioTotal),
    estado: 'confirmada',
    cantidadPersonas: parseInt(datosReserva.cantidadPersonas) || 1,
    esRecurrente: false
  };

  if (datosReserva.espacioNombre) {
    payload.proposito = `Reserva de ${datosReserva.espacioNombre}`;
  }

  if (datosReserva.serviciosAdicionales && datosReserva.serviciosAdicionales.length > 0) {
    payload.serviciosAdicionales = datosReserva.serviciosAdicionales
      .map(s => s.id?.toString())
      .filter(Boolean);
  }

  if (datosReserva.descuento && datosReserva.descuento.porcentaje > 0) {
    payload.descuento = {
      porcentaje: datosReserva.descuento.porcentaje,
      codigo: datosReserva.descuento.codigo || "",
      motivo: datosReserva.descuento.motivo || "Descuento aplicado"
    };
  }

  return payload;
};

const crearDatosPagoCompatibles = (datosReserva, reservaId, usuario, metodo) => {
  const pagoData = {
    usuarioId: (usuario?.id || usuario?._id)?.toString(),
    monto: parseFloat(datosReserva.precioTotal),
    moneda: 'USD',
    conceptoPago: 'reserva',

    entidadRelacionada: {
      tipo: 'reserva',
      id: reservaId.toString()
    },

    fecha: new Date(),

    metodoPago: {
      tipo: mapearTipoMetodoPago(metodo.tipo),
      detalles: {
        marca: metodo.marca || 'N/A',
        ultimosDigitos: metodo.ultimosDigitos || '****',
        metodoId: (metodo._id || metodo.id)?.toString(),
        numeroAutorizacion: `AUTH_${Date.now()}`,
        referencia: `REF_${reservaId}`
      }
    },
    estado: 'completado',
    comprobante: `comp_${Date.now()}_${reservaId}`
  };

  return pagoData;
};

const mapearTipoMetodoPago = (tipoOriginal) => {
  const mapeo = {
    'tarjeta_credito': 'tarjeta',
    'tarjeta_debito': 'tarjeta',
    'cuenta_bancaria': 'transferencia',
    'paypal': 'paypal',
    'efectivo': 'efectivo'
  };
  return mapeo[tipoOriginal] || 'otro';
};

const validarPayloadPagoBackend = (payload) => {
  const errores = [];

  if (!payload.usuarioId || typeof payload.usuarioId !== 'string') {
    errores.push('usuarioId debe ser un string válido');
  }

  if (!payload.monto || isNaN(payload.monto) || payload.monto < 0) {
    errores.push('monto debe ser un número >= 0');
  }

  const conceptosValidos = ['reserva', 'membresia', 'multa', 'otro'];
  if (!payload.conceptoPago || !conceptosValidos.includes(payload.conceptoPago)) {
    errores.push(`conceptoPago debe ser uno de: ${conceptosValidos.join(', ')}`);
  }

  if (!payload.entidadRelacionada) {
    errores.push('entidadRelacionada es requerida');
  } else {
    const tiposValidos = ['reserva', 'membresia'];
    if (!payload.entidadRelacionada.tipo || !tiposValidos.includes(payload.entidadRelacionada.tipo)) {
      errores.push(`entidadRelacionada.tipo debe ser uno de: ${tiposValidos.join(', ')}`);
    }
    if (!payload.entidadRelacionada.id || typeof payload.entidadRelacionada.id !== 'string') {
      errores.push('entidadRelacionada.id debe ser un string válido');
    }
  }

  if (!payload.metodoPago) {
    errores.push('metodoPago es requerido');
  } else {
    const tiposMetodoValidos = ['tarjeta', 'transferencia', 'efectivo', 'paypal', 'otro'];
    if (!payload.metodoPago.tipo || !tiposMetodoValidos.includes(payload.metodoPago.tipo)) {
      errores.push(`metodoPago.tipo debe ser uno de: ${tiposMetodoValidos.join(', ')}`);
    }
  }

  const estadosValidos = ['pendiente', 'completado', 'fallido', 'reembolsado'];
  if (payload.estado && !estadosValidos.includes(payload.estado)) {
    errores.push(`estado debe ser uno de: ${estadosValidos.join(', ')}`);
  }

  if (payload.fecha && isNaN(new Date(payload.fecha).getTime())) {
    errores.push('fecha debe ser una fecha válida');
  }

  return errores;
};

const validarPayloadLimpio = (payload) => {
  const errores = [];

  if (!payload.usuarioId) errores.push('usuarioId es requerido');
  if (!payload.entidadReservada?.tipo) errores.push('entidadReservada.tipo es requerido');
  if (!payload.entidadReservada?.id) errores.push('entidadReservada.id es requerido');
  if (!payload.fechaInicio) errores.push('fechaInicio es requerido');
  if (!payload.fechaFin) errores.push('fechaFin es requerido');
  if (!payload.horaInicio) errores.push('horaInicio es requerido');
  if (!payload.horaFin) errores.push('horaFin es requerido');
  if (!payload.tipoReserva) errores.push('tipoReserva es requerido');
  if (payload.precioTotal === undefined || payload.precioTotal === null) errores.push('precioTotal es requerido');

  const tiposValidos = ['oficina', 'sala_reunion', 'escritorio_flexible'];
  if (!tiposValidos.includes(payload.entidadReservada?.tipo)) {
    errores.push(`Tipo inválido: ${payload.entidadReservada?.tipo}. Tipos válidos: ${tiposValidos.join(', ')}`);
  }

  const tiposReservaValidos = ['hora', 'dia', 'semana', 'mes'];
  if (!tiposReservaValidos.includes(payload.tipoReserva)) {
    errores.push(`tipoReserva inválido: ${payload.tipoReserva}. Tipos válidos: ${tiposReservaValidos.join(', ')}`);
  }

  const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio'];
  if (!estadosValidos.includes(payload.estado)) {
    errores.push(`estado inválido: ${payload.estado}. Estados válidos: ${estadosValidos.join(', ')}`);
  }

  if (payload.precioTotal !== undefined && payload.precioTotal < 0) {
    errores.push('precioTotal no puede ser negativo');
  }

  if (payload.cantidadPersonas !== undefined && payload.cantidadPersonas < 1) {
    errores.push('cantidadPersonas debe ser al menos 1');
  }

  return errores;
};

const crearFacturaDesdeReserva = async (reserva, pago, usuario, datosReserva) => {
  try {
    const reservaId = reserva._id || reserva.id;
    const numeroFactura = `FACT-${Date.now()}-${reservaId?.slice(-6)}`;

    const conceptos = [];

    const conceptoPrincipal = {
      descripcion: `Reserva de ${datosReserva.espacioNombre || 'Espacio'}`,
      cantidad: 1,
      precioUnitario: parseFloat(datosReserva.precioTotal) || 0,
      impuesto: 0,
      descuento: datosReserva.descuento?.porcentaje || 0,
      subtotal: parseFloat(datosReserva.precioTotal) || 0
    };
    conceptos.push(conceptoPrincipal);

    if (datosReserva.serviciosAdicionales?.length > 0) {
      datosReserva.serviciosAdicionales.forEach(servicio => {
        conceptos.push({
          descripcion: `Servicio adicional: ${servicio.nombre}`,
          cantidad: servicio.cantidad || 1,
          precioUnitario: parseFloat(servicio.precio || 0),
          impuesto: 0,
          descuento: 0,
          subtotal: parseFloat(servicio.precio || 0) * (servicio.cantidad || 1)
        });
      });
    }

    const subtotal = conceptos.reduce((sum, concepto) => sum + concepto.subtotal, 0);
    const descuentoTotal = (datosReserva.descuento?.porcentaje || 0) * subtotal / 100;
    const impuestosTotal = 0; 
    const total = subtotal - descuentoTotal + impuestosTotal;

    const usuarioId = usuario?.id || usuario?._id;
    if (!usuarioId) {
      throw new Error('ID de usuario requerido para crear factura');
    }

    if (!numeroFactura) {
      throw new Error('No se pudo generar número de factura');
    }

    if (total <= 0) {
      throw new Error('El total de la factura debe ser mayor a 0');
    }

    if (conceptos.length === 0) {
      throw new Error('La factura debe tener al menos un concepto');
    }

    const facturaData = {
      numeroFactura,
      usuarioId: usuarioId.toString(),
      emisorId: 'plataforma_id', 
      tipoEmisor: 'plataforma',
      fechaEmision: new Date(),
      fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
      conceptos,
      subtotal: Math.round(subtotal * 100) / 100,
      impuestosTotal: Math.round(impuestosTotal * 100) / 100,
      descuentoTotal: Math.round(descuentoTotal * 100) / 100,
      total: Math.round(total * 100) / 100,
      estado: 'pagada', 
      metodoPago: `${pago.metodoPago?.tipo || 'Tarjeta'} •••• ${pago.metodoPago?.detalles?.ultimosDigitos || '****'}`,
      pagosIds: [pago._id || pago.id].filter(Boolean) 
    };

    console.log('Factura generada:', facturaData);

    const camposRequeridos = ['numeroFactura', 'usuarioId', 'emisorId', 'tipoEmisor', 'fechaEmision', 'fechaVencimiento', 'conceptos', 'subtotal', 'impuestosTotal', 'total'];
    const camposFaltantes = camposRequeridos.filter(campo =>
      facturaData[campo] === undefined || facturaData[campo] === null
    );

    if (camposFaltantes.length > 0) {
      throw new Error(`Campos requeridos faltantes en factura: ${camposFaltantes.join(', ')}`);
    }

    if (facturaData.conceptos.length === 0) {
      throw new Error('La factura debe tener al menos un concepto');
    }

    return facturaData;

  } catch (error) {
    console.error('Error al crear datos de factura:', error);
    throw new Error(`Error al generar factura: ${error.message}`);
  }
};

const crearNotificacionPropietario = async (reserva, datosReserva, usuarioReservante, auth) => {
  try {
    const espacioDetalle = await obtenerDetalleEspacioPorId(datosReserva.espacioId, auth.token);
    const propietarioId = espacioDetalle?.datosCompletos?.propietarioId ||
      espacioDetalle?.datosCompletos?.usuarioId ||
      espacioDetalle?.usuarioId;

    const notificacionData = {
      tipoNotificacion: 'reserva',
      titulo: 'Nueva reserva en tu espacio',
      mensaje: `${usuarioReservante?.nombre || 'Un usuario'} ha reservado ${datosReserva.espacioNombre} para el ${datosReserva.fecha} de ${datosReserva.horaInicio} a ${datosReserva.horaFin}`,
      destinatarioId: propietarioId,
      remitenteId: usuarioReservante?.id || usuarioReservante?._id,
      entidadRelacionada: {
        tipo: 'reserva',
        id: reserva._id || reserva.id
      },
      prioridad: 'alta',
      accion: 'ver_reserva'
    };

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/v1/notificaciones`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificacionData)
      }
    );

  } catch (error) {
    console.error('A', error);
  }
};

const crearNotificacionUsuario = async (reserva, pago, factura, usuario, auth) => {
  try {
    const notificacionData = {
      tipoNotificacion: 'pago',
      titulo: 'Reserva confirmada',
      mensaje: `Tu reserva ha sido confirmada exitosamente. Número de reserva: ${reserva._id?.slice(-8) || reserva.id?.slice(-8)}.`,
      destinatarioId: usuario?.id || usuario?._id,
      entidadRelacionada: {
        tipo: 'reserva',
        id: reserva._id || reserva.id
      },
      prioridad: 'alta',
      accion: 'ver_comprobante'
    };

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/v1/notificaciones`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificacionData)
      }
    );

  } catch (error) {
    console.error('B', error);
  }
};

const obtenerDetalleEspacioPorId = async (espacioId, token) => {
  try {
    const endpoints = [
      '/v1/oficinas',
      '/v1/espacios',
      '/v1/escritorios-flexibles',
      '/v1/edificios',
      '/v1/salas-reunion'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}${endpoint}/${espacioId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          return { datosCompletos: data };
        }
      } catch (error) {
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('C', error);
    return null;
  }
};

const EstadoPago = ({
  estado,
  onContinuar,
  oficina,
  precio,
  onVerDetalles,
  onReportarProblema,
  modoSuscripcion,
  planSuscripcion,
  datosReserva,
  reservaCreada
}) => {
  const renderEstadoProcesando = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Loading indicator en la parte superior */}
      <View style={styles.topLoadingContainer}>
        <ActivityIndicator size="small" color="#4a90e2" />
        <Text style={styles.topLoadingText}>Procesando...</Text>
      </View>

      {/* Contenido principal centrado */}
      <View style={styles.estadoContainer}>
        <View style={styles.estadoIcono}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
        <Text style={styles.estadoTitulo}>Procesando pago...</Text>
        <Text style={styles.estadoSubtitulo}>
          Por favor espera mientras procesamos tu {modoSuscripcion ? 'suscripción' : 'reserva'}
        </Text>

        {/* Indicador de progreso adicional */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.progressText}>Validando información...</Text>
        </View>
      </View>
    </SafeAreaView>
  );

  const renderEstadoConfirmado = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView contentContainerStyle={styles.estadoContainer}>
        <View style={[styles.estadoIcono, styles.estadoExito]}>
          <Ionicons name="checkmark" size={60} color="#fff" />
        </View>
        <Text style={styles.estadoTitulo}>
          {modoSuscripcion ? '¡Suscripción Confirmada!' : '¡Reserva Confirmada!'}
        </Text>
        <Text style={styles.estadoSubtitulo}>
          {modoSuscripcion
            ? 'Tu suscripción ha sido activada exitosamente'
            : 'Tu reserva ha sido confirmada y registrada exitosamente'
          }
        </Text>

        {modoSuscripcion ? (
          <View style={styles.detallesSuscripcion}>
            <Text style={styles.detalleItem}>
              <Text style={{ fontWeight: 'bold' }}>Plan:</Text> {planSuscripcion?.nombre}
            </Text>
            <Text style={styles.detalleItem}>
              <Text style={{ fontWeight: 'bold' }}>Precio:</Text> {precio}
            </Text>
            <Text style={styles.detalleItem}>
              <Text style={{ fontWeight: 'bold' }}>Estado:</Text> Activo
            </Text>
            <Text style={styles.detalleItem}>
              <Text style={{ fontWeight: 'bold' }}>Fecha de activación:</Text> {new Date().toLocaleDateString('es-ES')}
            </Text>
          </View>
        ) : (
          <View style={styles.detallesReserva}>
            <Text style={styles.detalleItem}>
              <Text style={{ fontWeight: 'bold' }}>Espacio:</Text> {oficina?.nombre || datosReserva?.espacioNombre}
            </Text>
            <Text style={styles.detalleItem}>
              <Text style={{ fontWeight: 'bold' }}>Fecha:</Text> {datosReserva?.fecha || new Date().toLocaleDateString('es-ES')}
            </Text>
            <Text style={styles.detalleItem}>
              <Text style={{ fontWeight: 'bold' }}>Horario:</Text> {datosReserva?.horaInicio} - {datosReserva?.horaFin}
            </Text>
            <Text style={styles.detalleItem}>
              <Text style={{ fontWeight: 'bold' }}>Personas:</Text> {datosReserva?.cantidadPersonas}
            </Text>
            <Text style={styles.detalleItem}>
              <Text style={{ fontWeight: 'bold' }}>Precio:</Text> {precio}
            </Text>
            <Text style={styles.detalleItem}>
              <Text style={{ fontWeight: 'bold' }}>Estado:</Text> Confirmada
            </Text>

            <TouchableOpacity style={styles.botonDetalles} onPress={onVerDetalles}>
              <Text style={styles.textoBotonDetalles}>Ver detalles de la reserva</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.botonContinuar} onPress={onContinuar}>
          <Text style={styles.textoBotonContinuar}>Continuar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.problemaLink} onPress={onReportarProblema}>
          <Text style={styles.preguntaProblema}>¿Tienes algún problema con tu {modoSuscripcion ? 'suscripción' : 'reserva'}?</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  const renderEstadoError = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.estadoContainer}>
        <View style={[styles.estadoIcono, styles.estadoError]}>
          <Ionicons name="close" size={60} color="#fff" />
        </View>
        <Text style={styles.estadoTitulo}>Error en el pago</Text>
        <Text style={styles.estadoSubtitulo}>
          No pudimos procesar tu {modoSuscripcion ? 'suscripción' : 'reserva'}. Por favor intenta nuevamente.
        </Text>

        <TouchableOpacity style={styles.botonContinuar} onPress={onContinuar}>
          <Text style={styles.textoBotonContinuar}>Intentar nuevamente</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.problemaLink} onPress={onReportarProblema}>
          <Text style={styles.preguntaProblema}>¿Necesitas ayuda?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  switch (estado) {
    case 'procesando':
      return renderEstadoProcesando();
    case 'confirmado':
      return renderEstadoConfirmado();
    case 'error':
      return renderEstadoError();
    default:
      return null;
  }
};

const MetodosPago = ({ navigation, route }) => {
  const dispatch = useDispatch();

  const usuario = useSelector(state => state.auth.usuario);
  const auth = useSelector(state => state.auth);
  const metodosPago = useSelector(state => state.usuario.metodosPago);
  const loadingMetodosPago = useSelector(state => state.usuario.loadingMetodosPago);
  const errorMetodosPago = useSelector(state => state.usuario.errorMetodosPago);
  const { loading: loadingReserva } = useSelector(state => state.reservas);

  console.log('🔍 [MetodosPago] Estado completo de auth:', auth);
  console.log('🔍 [MetodosPago] Usuario del estado:', usuario);
  console.log('🔍 [MetodosPago] Tipo de usuario:', typeof usuario);
  console.log('🔍 [MetodosPago] Keys del usuario:', usuario ? Object.keys(usuario) : 'No hay usuario');

  const [estadoPago, setEstadoPago] = useState(null);
  const [transaccionActual, setTransaccionActual] = useState(null);
  const [reservaCreada, setReservaCreada] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    modoSeleccion = false,
    modoSuscripcion = false,
    planSuscripcion = null,
    oficina,
    precio,
    descripcion,
    datosReserva
  } = route?.params || {};

  const metodosPagoConIds = useMemo(() => {
    return metodosPago.map((metodo, index) => ({
      ...metodo,
      tempId: metodo._id || metodo.id || `temp-${index}-${Date.now()}-${Math.random()}`
    }));
  }, [metodosPago]);

  const mapearTipoTarjeta = (metodo) => {
    if (metodo.tipo === 'tarjeta_credito') return 'Tarjeta de Crédito';
    if (metodo.tipo === 'tarjeta_debito') return 'Tarjeta de Débito';
    if (metodo.tipo === 'cuenta_bancaria') return 'Cuenta Bancaria';
    if (metodo.tipo === 'paypal') return 'PayPal';
    return 'Tarjeta';
  };

  const detectarMarcaTarjeta = (metodo) => {
    if (metodo.marca) {
      return metodo.marca.charAt(0).toUpperCase() + metodo.marca.slice(1);
    }

    if (metodo.tipo === 'cuenta_bancaria') return 'Banco';
    if (metodo.tipo === 'paypal') return 'PayPal';

    const ultimosDigitos = metodo.ultimosDigitos || '';
    if (ultimosDigitos.length >= 1) {
      const primerDigito = ultimosDigitos.charAt(0);
      if (primerDigito === '4') return 'Visa';
      if (primerDigito === '5') return 'Mastercard';
      if (primerDigito === '3') return 'American Express';
    }

    return 'Visa';
  };

  useEffect(() => {
    loadMetodosPago();
  }, [usuario?.id, usuario?._id]);

  const loadMetodosPago = () => {
    if (usuario?.id || usuario?._id) {
      const userId = usuario.id || usuario._id;
      dispatch(obtenerMetodosPagoUsuario(userId));
    }
  };

  useEffect(() => {
    if (errorMetodosPago) {
      Alert.alert('Error', errorMetodosPago);
    }
  }, [errorMetodosPago]);

  const handleRefresh = async () => {
    setRefreshing(true);
    loadMetodosPago();
    setRefreshing(false);
  };

  const handleGoBack = () => {
    if (estadoPago) {
      setEstadoPago(null);
    } else {
      navigation.goBack();
    }
  };

  const handleAgregarTarjeta = () => {
    navigation.navigate('AgregarTarjeta', {
      usuarioId: usuario?.id || usuario?._id,
      onTarjetaAgregada: () => {
        loadMetodosPago();
      }
    });
  };

  const handleEliminarTarjeta = (metodoId, metodo) => {
    if (metodo.predeterminado) {
      Alert.alert(
        'No se puede eliminar',
        'No puedes eliminar tu método de pago predeterminado. Selecciona otro método como predeterminado primero.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    const tipoDisplay = mapearTipoTarjeta(metodo);
    const ultimosDigitos = metodo.ultimosDigitos || '****';

    Alert.alert(
      'Eliminar Método de Pago',
      `¿Estás seguro de que quieres eliminar ${tipoDisplay} •••• ${ultimosDigitos}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const userId = usuario?.id || usuario?._id;
            const originalId = metodo._id || metodo.id;
            if (userId && originalId) {
              dispatch(eliminarMetodoPago({
                usuarioId: userId,
                metodoId: originalId
              }));
            }
          },
        },
      ]
    );
  };

  const handleSeleccionarTarjeta = (metodo) => {
    if (!modoSeleccion) return;

    const tipoDisplay = mapearTipoTarjeta(metodo);
    const ultimosDigitos = metodo.ultimosDigitos || '****';

    const mensaje = modoSuscripcion
      ? `¿Confirmas la suscripción al plan ${planSuscripcion?.nombre} por ${precio} con ${tipoDisplay} •••• ${ultimosDigitos}?`
      : `¿Confirmas la reserva por ${precio} con ${tipoDisplay} •••• ${ultimosDigitos}?`;

    Alert.alert(
      modoSuscripcion ? 'Confirmar Suscripción' : 'Confirmar Reserva',
      mensaje,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => procesarPago(metodo) },
      ]
    );
  };

  const handleMarcarPredeterminado = (metodo) => {
    const userId = usuario?.id || usuario?._id;
    const originalId = metodo._id || metodo.id;
    if (userId && originalId) {
      dispatch(actualizarMetodoPagoPredeterminado({
        usuarioId: userId,
        metodoId: originalId
      }));
    }
  };

  const procesarPago = async (metodo) => {
    setEstadoPago('procesando');

    try {
      console.log('🔵 [MetodosPago] ===== INICIANDO PROCESO DE PAGO =====');
      console.log('🔵 [MetodosPago] Modo suscripción:', modoSuscripcion);
      console.log('🔵 [MetodosPago] Plan suscripción:', planSuscripcion);
      console.log('🔵 [MetodosPago] Datos reserva:', datosReserva);
      console.log('🔵 [MetodosPago] Método de pago:', metodo);
      console.log('🔵 [MetodosPago] Usuario completo:', usuario);

      await new Promise(resolve => setTimeout(resolve, 2000));
      const exitoPago = Math.random() > 0.05; 

      if (!exitoPago) {
        console.log('🔴 [MetodosPago] Simulación de fallo de pago');
        setEstadoPago('error');
        return;
      }

      if (!modoSuscripcion && datosReserva) {
        console.log('🔵 [MetodosPago] ===== PROCESANDO RESERVA =====');

        const reservaParaBackend = crearPayloadReservaLimpio(datosReserva, usuario, metodo);

        const erroresValidacion = validarPayloadLimpio(reservaParaBackend);
        if (erroresValidacion.length > 0) {
          console.error('Errores de validación en reserva:', erroresValidacion);
          Alert.alert(
            'Error en datos de reserva',
            `Errores encontrados:\n${erroresValidacion.join('\n')}`,
            [{ text: 'OK', onPress: () => setEstadoPago('error') }]
          );
          return;
        }

        try {
          console.log('Creando reserva con datos:', reservaParaBackend);
          const resultadoReserva = await dispatch(crearReserva(reservaParaBackend));

          if (!crearReserva.fulfilled.match(resultadoReserva)) {
            console.error('Error al crear reserva:', resultadoReserva);
            Alert.alert(
              'Error al crear reserva',
              resultadoReserva.error?.message || resultadoReserva.payload || 'Error desconocido',
              [{ text: 'OK', onPress: () => setEstadoPago('error') }]
            );
            return;
          }

          const reservaCreada = resultadoReserva.payload;
          const reservaActual = reservaCreada.reserva || reservaCreada;
          const reservaId = reservaActual._id || reservaActual.id;

          if (!reservaId) {
            console.error('No se pudo obtener ID de reserva:', reservaActual);
            Alert.alert(
              'Error interno',
              'No se pudo obtener el ID de la reserva creada',
              [{ text: 'OK', onPress: () => setEstadoPago('error') }]
            );
            return;
          }

          console.log('Reserva creada exitosamente:', { reservaId, reservaActual });
          setReservaCreada(reservaActual);

          const pagoData = crearDatosPagoCompatibles(datosReserva, reservaId, usuario, metodo);
          console.log('Creando pago con datos:', pagoData);

          const erroresPago = validarPayloadPagoBackend(pagoData);
          if (erroresPago.length > 0) {
            console.error('Errores de validación en pago:', erroresPago);
            Alert.alert(
              'Error en datos de pago',
              `Errores:\n${erroresPago.join('\n')}`,
              [{ text: 'OK', onPress: () => setEstadoPago('error') }]
            );
            return;
          }

          const resultadoPago = await dispatch(crearPago(pagoData));

          if (!crearPago.fulfilled.match(resultadoPago)) {
            const errorMessage = resultadoPago.payload || resultadoPago.error?.message || 'Error en el procesamiento del pago';
            console.error('Error al crear pago:', resultadoPago);
            Alert.alert(
              'Error al procesar pago',
              `Backend rechazó el pago: ${errorMessage}`,
              [{ text: 'OK', onPress: () => setEstadoPago('error') }]
            );
            return;
          }

          const pagoCreado = resultadoPago.payload;
          console.log('Pago creado exitosamente:', pagoCreado);

          let facturaCreada = null;
          try {
            console.log('Iniciando creación de factura...');
            const facturaData = await crearFacturaDesdeReserva(
              reservaActual,
              pagoCreado,
              usuario,
              datosReserva
            );

            console.log('Datos de factura generados:', facturaData);

            if (!facturaData.numeroFactura || !facturaData.usuarioId || !facturaData.total) {
              throw new Error('Datos de factura incompletos');
            }

            const resultadoFactura = await dispatch(crearFactura(facturaData));

            if (crearFactura.fulfilled.match(resultadoFactura)) {
              facturaCreada = resultadoFactura.payload;
              console.log('Factura creada exitosamente:', facturaCreada);

              try {
                const pagoCreado = resultadoPago.payload;
                const facturaCreada = resultadoFactura.payload;

                console.log('Pago creado completo:', JSON.stringify(pagoCreado, null, 2));
                console.log('Factura creada completa:', JSON.stringify(facturaCreada, null, 2));

                const pagoId = pagoCreado?._id ||
                  pagoCreado?.id ||
                  pagoCreado?.pago?._id ||
                  pagoCreado?.pago?.id ||
                  pagoCreado?.data?._id ||
                  pagoCreado?.data?.id;

                const facturaId = facturaCreada?._id ||
                  facturaCreada?.id ||
                  facturaCreada?.factura?._id ||
                  facturaCreada?.factura?.id ||
                  facturaCreada?.data?._id ||
                  facturaCreada?.data?.id;

                console.log('IDs extraídos:', { pagoId, facturaId });

                if (pagoId && facturaId) {
                  console.log('Vinculando factura al pago:', { pagoId, facturaId });

                  const resultadoVinculacion = await dispatch(vincularFacturaPago({
                    pagoId: pagoId.toString(),
                    facturaData: { facturaId: facturaId.toString() }
                  }));

                  if (vincularFacturaPago.fulfilled.match(resultadoVinculacion)) {
                    console.log('Factura vinculada exitosamente al pago');
                  } else {
                    console.error('Error al vincular factura al pago:', resultadoVinculacion.payload);
                  }
                } else {
                  console.error('IDs faltantes para vinculación:', {
                    pagoId,
                    facturaId,
                    pagoCreado: Object.keys(pagoCreado || {}),
                    facturaCreada: Object.keys(facturaCreada || {})
                  });

                  if (pagoCreado && typeof pagoCreado === 'object') {
                    console.log('Estructura de pagoCreado:', Object.keys(pagoCreado));
                    if (pagoCreado.pago) console.log('pagoCreado.pago keys:', Object.keys(pagoCreado.pago));
                    if (pagoCreado.data) console.log('pagoCreado.data keys:', Object.keys(pagoCreado.data));
                  }

                  if (facturaCreada && typeof facturaCreada === 'object') {
                    console.log('Estructura de facturaCreada:', Object.keys(facturaCreada));
                    if (facturaCreada.factura) console.log('facturaCreada.factura keys:', Object.keys(facturaCreada.factura));
                    if (facturaCreada.data) console.log('facturaCreada.data keys:', Object.keys(facturaCreada.data));
                  }
                }
              } catch (vinculacionError) {
                console.error('Error en vinculación factura-pago:', vinculacionError);
              }
            } else {
              console.error('Error al crear factura:', resultadoFactura);
              throw new Error(resultadoFactura.payload || 'Error al crear factura');
            }
          } catch (facturaError) {
            console.error('Error en proceso de facturación:', facturaError);
            Alert.alert(
              'Advertencia',
              'La reserva y pago se procesaron correctamente, pero hubo un problema al generar la factura. Puedes solicitar la factura más tarde desde el detalle de la transacción.',
              [{ text: 'Entendido' }]
            );
          }

          try {
            console.log('Creando notificaciones...');
            await Promise.all([
              crearNotificacionPropietario(reservaActual, datosReserva, usuario, auth),
              crearNotificacionUsuario(reservaActual, pagoCreado, facturaCreada, usuario, auth)
            ]);
            console.log('Notificaciones creadas exitosamente');
          } catch (notificacionError) {
            console.error('Error al crear notificaciones:', notificacionError);
          }

          try {
            const userId = usuario?.id || usuario?._id;
            if (userId && auth?.token) {
              console.log('Recargando notificaciones del usuario...');
              dispatch(cargarNotificacionesUsuario(userId, auth.token));
            }
          } catch (error) {
            console.error('Error al recargar notificaciones:', error);
          }

          setTransaccionActual({
            id: pagoCreado._id || pagoCreado.id,
            fecha: new Date().toLocaleDateString('es-ES'),
            precio: precio,
            oficina: oficina,
            metodo: metodo,
            usuario: {
              id: usuario?.id || usuario?._id,
              nombre: usuario?.nombre || usuario?.name || 'Usuario',
              email: usuario?.email || usuario?.correo
            },
            reserva: {
              id: reservaId,
              espacioNombre: datosReserva.espacioNombre,
              fecha: datosReserva.fecha,
              horaInicio: datosReserva.horaInicio,
              horaFin: datosReserva.horaFin,
              cantidadPersonas: datosReserva.cantidadPersonas,
              serviciosAdicionales: datosReserva.serviciosAdicionales,
              estado: 'confirmada',
              entidadReservada: {
                tipo: reservaParaBackend.entidadReservada.tipo,
                nombre: datosReserva.espacioNombre
              },
              tipoReserva: reservaParaBackend.tipoReserva
            },
            pago: pagoCreado,
            factura: facturaCreada 
          });

          console.log('Proceso de reserva completado exitosamente');
          setEstadoPago('confirmado');

        } catch (error) {
          console.error('Error general en procesamiento de reserva:', error);
          Alert.alert(
            'Error en reserva',
            `Error al procesar la reserva: ${error.message || 'Error desconocido'}`,
            [{ text: 'OK', onPress: () => setEstadoPago('error') }]
          );
        }

      } else if (modoSuscripcion && planSuscripcion) {
        console.log('🔵 [MetodosPago] ===== PROCESANDO SUSCRIPCIÓN =====');

        try {
          console.log('🔵 [MetodosPago] Validando usuario completo:', {
            usuario: !!usuario,
            usuarioKeys: usuario ? Object.keys(usuario) : [],
            usuarioCompleto: usuario, 
          });

          const usuarioId = usuario?._id || usuario?.id || usuario?.userId;

          console.log('🔵 [MetodosPago] IDs encontrados:', {
            _id: usuario?._id,
            id: usuario?.id,
            userId: usuario?.userId,
            usuarioIdFinal: usuarioId
          });

          if (!usuario) {
            console.error('🔴 [MetodosPago] Usuario no existe en el estado');
            throw new Error('Usuario no disponible. Por favor, inicia sesión nuevamente.');
          }

          if (!usuarioId) {
            console.error('🔴 [MetodosPago] Usuario sin ID válido:', {
              usuarioKeys: Object.keys(usuario),
              usuario: usuario
            });
            throw new Error('ID de usuario no encontrado. Por favor, inicia sesión nuevamente.');
          }

          const planId = planSuscripcion?.id || planSuscripcion?._id || planSuscripcion?.datosCompletos?._id;
          if (!planId) {
            console.error('🔴 [MetodosPago] Plan inválido:', {
              planSuscripcion: !!planSuscripcion,
              planKeys: planSuscripcion ? Object.keys(planSuscripcion) : [],
              id: planSuscripcion?.id,
              _id: planSuscripcion?._id,
              datosCompletos: planSuscripcion?.datosCompletos
            });
            throw new Error('Plan de suscripción no válido');
          }

          console.log('🟢 [MetodosPago] Validación exitosa:', {
            usuarioId,
            username: usuario.username || usuario.email,
            planId,
            planNombre: planSuscripcion.nombre
          });

          console.log('🔵 [MetodosPago] Datos de suscripción:', {
            usuario: usuario.username || usuario.email,
            usuarioId: usuarioId,
            plan: planSuscripcion.nombre,
            planId: planId,
            metodo: metodo.tipo,
            metodosUltimosDigitos: metodo.ultimosDigitos
          });

          const fechaInicio = new Date();

          const suscripcionData = {
            usuarioId: usuarioId, 
            membresiaId: planId,
            fechaInicio: fechaInicio.toISOString(),
            metodoPagoId: metodo._id || metodo.id || 'default',
            renovacionAutomatica: true,
          };

          console.log('🔵 [MetodosPago] Enviando datos de suscripción al backend:', suscripcionData);

          const resultadoSuscripcion = await dispatch(suscribirMembresia(suscripcionData));

          console.log('🔵 [MetodosPago] Resultado de suscripción:', {
            type: resultadoSuscripcion.type,
            isFulfilled: suscribirMembresia.fulfilled.match(resultadoSuscripcion),
            isRejected: suscribirMembresia.rejected.match(resultadoSuscripcion),
            payload: resultadoSuscripcion.payload
          });

          if (suscribirMembresia.fulfilled.match(resultadoSuscripcion)) {
            console.log('🟢 [MetodosPago] ===== SUSCRIPCIÓN EXITOSA =====');

            const { usuario: usuarioActualizado, suscripcion } = resultadoSuscripcion.payload;

            if (!usuarioActualizado) {
              throw new Error('No se recibió el usuario actualizado del servidor');
            }

            if (!usuarioActualizado.membresia || !usuarioActualizado.membresia.tipoMembresiaId) {
              throw new Error('La membresía no se asignó correctamente al usuario');
            }

            console.log('🟢 [MetodosPago] Usuario actualizado con membresía:', {
              id: usuarioActualizado._id,
              username: usuarioActualizado.username,
              membresiaId: usuarioActualizado.membresia.tipoMembresiaId,
              fechaInicio: usuarioActualizado.membresia.fechaInicio,
              fechaVencimiento: usuarioActualizado.membresia.fechaVencimiento,
              renovacionAutomatica: usuarioActualizado.membresia.renovacionAutomatica
            });

            console.log('🔵 [MetodosPago] Actualizando auth store...');
            dispatch(loguear({
              usuario: usuarioActualizado,
              token: auth.token,
              tipoUsuario: usuarioActualizado.tipoUsuario
            }));

            if (suscripcion) {
              dispatch(actualizarSuscripcionActual(suscripcion));
            }

            setTransaccionActual({
              id: `suscripcion_${Date.now()}`,
              fecha: new Date().toLocaleDateString('es-ES'),
              precio: precio,
              metodo: metodo,
              usuario: {
                id: usuarioId, 
                nombre: usuario.nombre || usuario.username || 'Usuario',
                email: usuario.email
              },
              suscripcion: {
                planId: planId,
                planNombre: planSuscripcion.nombre,
                fechaInicio: usuarioActualizado.membresia.fechaInicio,
                fechaVencimiento: usuarioActualizado.membresia.fechaVencimiento,
                renovacionAutomatica: usuarioActualizado.membresia.renovacionAutomatica,
                estado: 'activa'
              }
            });

            console.log('🟢 [MetodosPago] Proceso de suscripción completado exitosamente');
            setEstadoPago('confirmado');

          } else {
            console.error('🔴 [MetodosPago] Error en suscripción:', resultadoSuscripcion.payload);
            throw new Error(resultadoSuscripcion.payload || 'Error al procesar la suscripción');
          }

        } catch (suscripcionError) {
          console.error('🔴 [MetodosPago] Error en proceso de suscripción:', suscripcionError);
          Alert.alert(
            'Error en la suscripción',
            `No se pudo procesar la suscripción: ${suscripcionError.message}`,
            [{ text: 'OK', onPress: () => setEstadoPago('error') }]
          );
          return;
        }

      } else {
        console.log('🔵 [MetodosPago] Modo de pago genérico');
        setEstadoPago('confirmado');
        setTransaccionActual({
          id: `txn_${Date.now()}`,
          fecha: new Date().toLocaleDateString('es-ES'),
          precio: precio,
          oficina: oficina,
          metodo: metodo,
          usuario: {
            id: usuario?.id || usuario?._id,
            nombre: usuario?.nombre || usuario?.name || 'Usuario',
            email: usuario?.email || usuario?.correo
          }
        });
      }

    } catch (error) {
      console.error('🔴 [MetodosPago] Error crítico en procesarPago:', error);
      Alert.alert(
        'Error en el pago',
        `Ocurrió un error inesperado: ${error.message || 'Error desconocido'}`,
        [{ text: 'OK', onPress: () => setEstadoPago('error') }]
      );
    }
  };

  const handleContinuar = () => {
    console.log('🔵 [MetodosPago] handleContinuar llamado:', {
      estadoPago,
      modoSuscripcion,
      usuario: {
        id: usuario?.id || usuario?._id,
        username: usuario?.username
      }
    });

    if (estadoPago === 'confirmado') {
      const userId = usuario?.id || usuario?._id;
      if (userId && auth?.token) {
        console.log('🔵 [MetodosPago] Recargando notificaciones del usuario...');
        dispatch(cargarNotificacionesUsuario(userId, auth.token));
      }

      if (modoSuscripcion) {
        console.log('🔵 [MetodosPago] Navegando a Membresias después de suscripción exitosa');
        navigation.navigate('Membresias');
      } else {
        console.log('🔵 [MetodosPago] Navegando a Reservas después de reserva exitosa');
        navigation.navigate('Reservas');
      }
    } else if (estadoPago === 'error') {
      console.log('🔵 [MetodosPago] Limpiando estado de error y regresando');
      setEstadoPago(null);
    }
  };

  const handleVerDetalles = () => {
    navigation.navigate('Transacciones', {
      transaccion: transaccionActual
    });
  };

  const handleReportarProblema = () => {
    navigation.navigate('FormularioProblema', {
      reservaId: reservaCreada?._id || reservaCreada?.id,
      tipo: modoSuscripcion ? 'suscripcion' : 'reserva'
    });
  };

  const obtenerIconoTarjeta = (metodo) => {
    const marca = detectarMarcaTarjeta(metodo);

    switch (marca.toLowerCase()) {
      case 'visa':
        return (
          <View style={[styles.iconoTarjeta, styles.iconoVisa]}>
            <Text style={styles.textoIconoVisa}>VISA</Text>
          </View>
        );
      case 'mastercard':
        return (
          <View style={[styles.iconoTarjeta, styles.iconoMastercard]}>
            <View style={styles.circuloMastercard1} />
            <View style={styles.circuloMastercard2} />
          </View>
        );
      case 'paypal':
        return (
          <View style={[styles.iconoTarjeta, styles.iconoPaypal]}>
            <Text style={styles.textoIconoPaypal}>PP</Text>
          </View>
        );
      case 'banco':
        return (
          <View style={[styles.iconoTarjeta, styles.iconoBanco]}>
            <Ionicons name="business" size={20} color="#2c3e50" />
          </View>
        );
      default:
        return (
          <View style={[styles.iconoTarjeta, styles.iconoGenerico]}>
            <Ionicons name="card" size={20} color="#666" />
          </View>
        );
    }
  };

  if (estadoPago) {
    return (
      <EstadoPago
        estado={estadoPago}
        onContinuar={handleContinuar}
        oficina={oficina}
        precio={precio}
        onVerDetalles={handleVerDetalles}
        onReportarProblema={handleReportarProblema}
        modoSuscripcion={modoSuscripcion}
        planSuscripcion={planSuscripcion}
        datosReserva={datosReserva}
        reservaCreada={reservaCreada}
      />
    );
  }

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
        <Text style={styles.headerTitle}>
          {modoSeleccion ? 'Seleccionar método de pago' : 'Métodos de pago'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loadingMetodosPago}
            onRefresh={handleRefresh}
            colors={['#4a90e2']}
            tintColor="#4a90e2"
          />
        }
      >
        {modoSeleccion && (
          <View style={styles.reservaInfo}>
            <Text style={styles.reservaTitulo}>
              {modoSuscripcion ? 'Resumen de la suscripción' : 'Resumen de la reserva'}
            </Text>
            {modoSuscripcion ? (
              <>
                <Text style={styles.reservaDetalle}>Plan: {planSuscripcion?.nombre}</Text>
                <Text style={styles.reservaDetalle}>Precio: {precio}</Text>
                <Text style={styles.reservaDetalle}>Descripción: {descripcion}</Text>
              </>
            ) : (
              <>
                <Text style={styles.reservaDetalle}>Espacio: {oficina?.nombre || datosReserva?.espacioNombre}</Text>
                <Text style={styles.reservaDetalle}>Fecha: {datosReserva?.fecha}</Text>
                <Text style={styles.reservaDetalle}>Horario: {datosReserva?.horaInicio} - {datosReserva?.horaFin}</Text>
                <Text style={styles.reservaDetalle}>Personas: {datosReserva?.cantidadPersonas}</Text>
                <Text style={styles.reservaDetalle}>Precio: {precio}</Text>
              </>
            )}
          </View>
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>
            {modoSeleccion ? 'Selecciona un método de pago' : 'Métodos de pago guardados'}
          </Text>
          {!modoSeleccion && (
            <TouchableOpacity
              style={styles.botonAgregar}
              onPress={handleAgregarTarjeta}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {loadingMetodosPago && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4a90e2" />
            <Text style={styles.loadingText}>Cargando métodos de pago...</Text>
          </View>
        ) : (
          <View style={styles.tarjetasContainer}>
            {metodosPagoConIds.length > 0 ? (
              metodosPagoConIds.map((metodo, index) => (
                <TouchableOpacity
                  key={metodo.tempId}
                  style={[
                    styles.tarjetaItem,
                    modoSeleccion && styles.tarjetaItemSeleccionable,
                    metodo.predeterminado && styles.tarjetaItemPredeterminada
                  ]}
                  onPress={() => modoSeleccion ? handleSeleccionarTarjeta(metodo) : null}
                  activeOpacity={modoSeleccion ? 0.7 : 1}
                >
                  <View style={styles.tarjetaInfo}>
                    {obtenerIconoTarjeta(metodo)}
                    <View style={styles.tarjetaTexto}>
                      <View style={styles.tarjetaHeader}>
                        <Text style={styles.tipoTarjeta}>
                          {mapearTipoTarjeta(metodo)}
                        </Text>
                        {metodo.predeterminado && (
                          <View style={styles.badgePredeterminado}>
                            <Text style={styles.textoPredeterminado}>Predeterminado</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.numeroTarjeta}>•••• {metodo.ultimosDigitos || '****'}</Text>
                      {metodo.fechaVencimiento && (
                        <Text style={styles.fechaExpiracion}>Exp: {metodo.fechaVencimiento}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.accionesContainer}>
                    {modoSeleccion ? (
                      <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
                    ) : (
                      <View style={styles.botonesAcciones}>
                        {!metodo.predeterminado && (metodo._id || metodo.id) && (
                          <TouchableOpacity
                            style={styles.botonPredeterminado}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleMarcarPredeterminado(metodo);
                            }}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="star-outline" size={18} color="#f39c12" />
                          </TouchableOpacity>
                        )}
                        {(metodo._id || metodo.id) && (
                          <TouchableOpacity
                            style={styles.botonEliminar}
                            onPress={(e) => {
                              e.stopPropagation();
                              const originalId = metodo._id || metodo.id;
                              handleEliminarTarjeta(originalId, metodo);
                            }}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={48} color="#bdc3c7" />
                <Text style={styles.emptyStateTitle}>No tienes métodos de pago</Text>
                <Text style={styles.emptyStateSubtext}>
                  Agrega una tarjeta para realizar pagos más rápido
                </Text>
                <TouchableOpacity
                  style={styles.botonAgregarEmpty}
                  onPress={handleAgregarTarjeta}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color="#4a90e2" />
                  <Text style={styles.textoAgregarEmpty}>Agregar tarjeta</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {modoSeleccion && metodosPagoConIds.length > 0 && (
          <View style={styles.agregarTarjetaContainer}>
            <TouchableOpacity
              style={styles.botonAgregarNueva}
              onPress={handleAgregarTarjeta}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={24} color="#4a90e2" />
              <Text style={styles.textoAgregarNueva}>Agregar nueva tarjeta</Text>
            </TouchableOpacity>
          </View>
        )}
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
    fontSize: 18,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
  },
  reservaInfo: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  reservaTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: 'System',
  },
  reservaDetalle: {
    fontSize: 14,
    color: '#5a6c7d',
    marginBottom: 4,
    fontFamily: 'System',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
    flex: 1,
  },
  botonAgregar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tarjetasContainer: {
    paddingHorizontal: 20,
  },
  tarjetaItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  tarjetaItemSeleccionable: {
    borderColor: '#4a90e2',
    borderWidth: 1,
  },
  tarjetaItemPredeterminada: {
    borderColor: '#f39c12',
    borderWidth: 2,
  },
  tarjetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconoTarjeta: {
    width: 40,
    height: 28,
    borderRadius: 6,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoVisa: {
    backgroundColor: '#1a1f71',
  },
  textoIconoVisa: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  iconoMastercard: {
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circuloMastercard1: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#eb001b',
    marginRight: -4,
  },
  circuloMastercard2: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f79e1b',
  },
  iconoPaypal: {
    backgroundColor: '#003087',
  },
  textoIconoPaypal: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  iconoBanco: {
    backgroundColor: '#ecf0f1',
  },
  iconoGenerico: {
    backgroundColor: '#ecf0f1',
  },
  tarjetaTexto: {
    flex: 1,
  },
  tarjetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  tipoTarjeta: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
    marginRight: 8,
  },
  badgePredeterminado: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  textoPredeterminado: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  numeroTarjeta: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'System',
    marginBottom: 2,
  },
  fechaExpiracion: {
    fontSize: 12,
    color: '#95a5a6',
    fontFamily: 'System',
  },
  accionesContainer: {
    marginLeft: 16,
  },
  botonesAcciones: {
    flexDirection: 'row',
    gap: 8,
  },
  botonPredeterminado: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff3cd',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f39c12',
  },
  botonEliminar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8d7da',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
  },
  botonAgregarEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4a90e2',
    borderStyle: 'dashed',
  },
  textoAgregarEmpty: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
    marginLeft: 8,
  },
  agregarTarjetaContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  botonAgregarNueva: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4a90e2',
    borderStyle: 'dashed',
  },
  textoAgregarNueva: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'System',
  },
  estadoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  estadoIcono: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  estadoExito: {
    backgroundColor: '#27ae60',
  },
  estadoError: {
    backgroundColor: '#e74c3c',
  },
  estadoTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'System',
  },
  estadoSubtitulo: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'System',
  },
  detallesReserva: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginVertical: 20,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detallesSuscripcion: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginVertical: 20,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  detalleItem: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
    fontFamily: 'System',
  },
  botonDetalles: {
    marginBottom: 15,
  },
  textoBotonDetalles: {
    fontSize: 16,
    color: '#4a90e2',
    textDecorationLine: 'underline',
    fontFamily: 'System',
  },
  botonContinuar: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
  },
  textoBotonContinuar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
  problemaLink: {
    marginTop: 10,
    marginBottom: 10,
  },
  preguntaProblema: {
    fontSize: 14,
    color: '#4a90e2',
    textAlign: 'center',
    fontFamily: 'System',
    textDecorationLine: 'underline',
  },
  topLoadingContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 12,
  paddingHorizontal: 20,
  backgroundColor: 'rgba(74, 144, 226, 0.1)',
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(74, 144, 226, 0.2)',
},
topLoadingText: {
  fontSize: 14,
  color: '#4a90e2',
  marginLeft: 8,
  fontWeight: '500',
  fontFamily: 'System',
},
progressContainer: {
  alignItems: 'center',
  marginTop: 30,
},
progressDots: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12,
},
dot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#e0e0e0',
  marginHorizontal: 4,
},
dotActive: {
  backgroundColor: '#4a90e2',
  transform: [{ scale: 1.2 }],
},
progressText: {
  fontSize: 12,
  color: '#7f8c8d',
  fontFamily: 'System',
},
});

export default MetodosPago;