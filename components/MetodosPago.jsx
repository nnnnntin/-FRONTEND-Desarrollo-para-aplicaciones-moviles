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
import * as yup from 'yup';
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

const metodoPagoSchema = yup.object({
  _id: yup.string().optional(),
  id: yup.string().optional(),
  tipo: yup.string()
    .test('tipo-metodo-pago-valido', 'Tipo de método de pago inválido', function (value) {
      const tiposValidos = ['tarjeta_credito', 'tarjeta_debito', 'cuenta_bancaria', 'paypal', 'efectivo'];
      return tiposValidos.includes(value);
    })
    .required('El tipo de método de pago es requerido'),
  marca: yup.string().optional(),
  ultimosDigitos: yup.string()
    .matches(/^\d{4}$/, 'Los últimos dígitos deben ser 4 números')
    .optional(),
  fechaVencimiento: yup.string()
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato de fecha inválido (MM/YY)')
    .optional(),
  predeterminado: yup.boolean().default(false),
});

const datosReservaSchema = yup.object({
  espacioId: yup.string().required('El ID del espacio es requerido'),
  espacioNombre: yup.string().required('El nombre del espacio es requerido'),
  espacioTipo: yup.string()
    .test('tipo-espacio-valido', 'Tipo de espacio inválido', function (value) {
      const tiposValidos = ['oficina', 'sala', 'escritorio', 'espacio', 'edificio'];
      return tiposValidos.includes(value);
    })
    .required('El tipo de espacio es requerido'),
  clienteId: yup.string().optional(),
  propietarioId: yup.string().optional(),
  fechaHoraInicio: yup.date().required('La fecha de inicio es requerida'),
  fechaHoraFin: yup.date().required('La fecha de fin es requerida'),
  horaInicio: yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
    .required('La hora de inicio es requerida'),
  horaFin: yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
    .required('La hora de fin es requerida'),
  fecha: yup.string().required('La fecha es requerida'),
  precioTotal: yup.number()
    .positive('El precio debe ser positivo')
    .required('El precio total es requerido'),
  precioFinalPagado: yup.number()
    .positive('El precio final debe ser positivo')
    .optional(),
  cantidadPersonas: yup.number()
    .integer('La cantidad debe ser un número entero')
    .min(1, 'Debe ser al menos 1 persona')
    .required('La cantidad de personas es requerida'),
  serviciosAdicionales: yup.array().of(
    yup.object({
      id: yup.string().required('ID del servicio requerido'),
      nombre: yup.string().required('Nombre del servicio requerido'),
      precio: yup.number().min(0, 'El precio no puede ser negativo'),
      cantidad: yup.number().integer().min(1, 'La cantidad debe ser al menos 1').default(1)
    })
  ).optional(),
  descuento: yup.object({
    porcentaje: yup.number()
      .min(0, 'El porcentaje no puede ser negativo')
      .max(100, 'El porcentaje no puede ser mayor a 100'),
    codigo: yup.string().optional(),
    motivo: yup.string().optional()
  }).optional()
});

const entidadReservadaSchema = yup.object({
  tipo: yup.string()
    .test('tipo-entidad-reservada-valido', 'Tipo de entidad inválido', function (value) {
      const tiposValidos = ['oficina', 'sala_reunion', 'escritorio_flexible'];
      return tiposValidos.includes(value);
    })
    .required('El tipo de entidad es requerido'),
  id: yup.string().required('El ID de la entidad es requerido')
});

const payloadReservaSchema = yup.object({
  usuarioId: yup.string().required('El ID del usuario es requerido'),
  clienteId: yup.string().required('El ID del cliente es requerido'),
  entidadReservada: entidadReservadaSchema.required('La entidad reservada es requerida'),
  fechaInicio: yup.date().required('La fecha de inicio es requerida'),
  fechaFin: yup.date().required('La fecha de fin es requerida'),
  horaInicio: yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido')
    .required('La hora de inicio es requerida'),
  horaFin: yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido')
    .required('La hora de fin es requerida'),
  tipoReserva: yup.string()
    .test('tipo-reserva-valido', 'Tipo de reserva inválido', function (value) {
      const tiposValidos = ['hora', 'dia', 'semana', 'mes'];
      return tiposValidos.includes(value);
    })
    .required('El tipo de reserva es requerido'),
  precioTotal: yup.number()
    .min(0, 'El precio no puede ser negativo')
    .required('El precio total es requerido'),
  precioFinalPagado: yup.number()
    .min(0, 'El precio final no puede ser negativo')
    .required('El precio final pagado es requerido'),
  estado: yup.string()
    .test('estado-reserva-valido', 'Estado de reserva inválido', function (value) {
      if (!value) return true;
      const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio'];
      return estadosValidos.includes(value);
    })
    .default('confirmada'),
  cantidadPersonas: yup.number()
    .integer('Debe ser un número entero')
    .min(1, 'Debe ser al menos 1 persona')
    .default(1),
  esRecurrente: yup.boolean().default(false),
  proposito: yup.string().optional(),
  serviciosAdicionales: yup.array().of(yup.string()).optional(),
  descuento: yup.object({
    porcentaje: yup.number().min(0).max(100),
    codigo: yup.string(),
    motivo: yup.string()
  }).optional()
});

const metodoPagoDetallesSchema = yup.object({
  marca: yup.string().default('N/A'),
  ultimosDigitos: yup.string().default('****'),
  metodoId: yup.string().required('ID del método requerido'),
  numeroAutorizacion: yup.string().required('Número de autorización requerido'),
  referencia: yup.string().required('Referencia requerida')
});

const entidadRelacionadaSchema = yup.object({
  tipo: yup.string()
    .test('tipo-entidad-relacionada-valido', 'Tipo de entidad inválido', function (value) {
      const tiposValidos = ['reserva', 'membresia'];
      return tiposValidos.includes(value);
    })
    .required('El tipo de entidad es requerido'),
  id: yup.string().required('El ID de la entidad es requerido')
});

const metodoPagoPagoSchema = yup.object({
  tipo: yup.string()
    .test('tipo-metodo-pago-pago-valido', 'Tipo de método de pago inválido', function (value) {
      const tiposValidos = ['tarjeta', 'transferencia', 'efectivo', 'paypal', 'otro'];
      return tiposValidos.includes(value);
    })
    .required('El tipo de método de pago es requerido'),
  detalles: metodoPagoDetallesSchema.required('Los detalles del método son requeridos')
});

const payloadPagoSchema = yup.object({
  usuarioId: yup.string().required('El ID del usuario es requerido'),
  monto: yup.number()
    .min(0, 'El monto no puede ser negativo')
    .required('El monto es requerido'),
  moneda: yup.string().default('USD'),
  conceptoPago: yup.string()
    .test('concepto-pago-valido', 'Concepto de pago inválido', function (value) {
      const conceptosValidos = ['reserva', 'membresia', 'multa', 'otro'];
      return conceptosValidos.includes(value);
    })
    .required('El concepto de pago es requerido'),
  entidadRelacionada: entidadRelacionadaSchema.required('La entidad relacionada es requerida'),
  fecha: yup.date().default(() => new Date()),
  metodoPago: metodoPagoPagoSchema.required('El método de pago es requerido'),
  estado: yup.string()
    .test('estado-pago-valido', 'Estado de pago inválido', function (value) {
      if (!value) return true;
      const estadosValidos = ['pendiente', 'completado', 'fallido', 'reembolsado'];
      return estadosValidos.includes(value);
    })
    .default('completado'),
  comprobante: yup.string().required('El comprobante es requerido')
});

const conceptoFacturaSchema = yup.object({
  descripcion: yup.string().required('La descripción es requerida'),
  cantidad: yup.number()
    .integer('Debe ser un número entero')
    .min(1, 'La cantidad debe ser al menos 1')
    .required('La cantidad es requerida'),
  precioUnitario: yup.number()
    .min(0, 'El precio no puede ser negativo')
    .required('El precio unitario es requerido'),
  impuesto: yup.number()
    .min(0, 'El impuesto no puede ser negativo')
    .default(0),
  descuento: yup.number()
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede ser mayor a 100')
    .default(0),
  subtotal: yup.number()
    .min(0, 'El subtotal no puede ser negativo')
    .required('El subtotal es requerido')
});

const facturaSchema = yup.object({
  numeroFactura: yup.string().required('El número de factura es requerido'),
  usuarioId: yup.string().required('El ID del usuario es requerido'),
  emisorId: yup.string().required('El ID del emisor es requerido'),
  tipoEmisor: yup.string().required('El tipo de emisor es requerido'),
  fechaEmision: yup.date().required('La fecha de emisión es requerida'),
  fechaVencimiento: yup.date().required('La fecha de vencimiento es requerida'),
  conceptos: yup.array()
    .of(conceptoFacturaSchema)
    .min(1, 'Debe haber al menos un concepto')
    .required('Los conceptos son requeridos'),
  subtotal: yup.number()
    .min(0, 'El subtotal no puede ser negativo')
    .required('El subtotal es requerido'),
  impuestosTotal: yup.number()
    .min(0, 'Los impuestos no pueden ser negativos')
    .required('El total de impuestos es requerido'),
  descuentoTotal: yup.number()
    .min(0, 'El descuento no puede ser negativo')
    .default(0),
  total: yup.number()
    .min(0, 'El total no puede ser negativo')
    .required('El total es requerido'),
  estado: yup.string().default('pagada'),
  metodoPago: yup.string().required('El método de pago es requerido'),
  pagosIds: yup.array().of(yup.string()).default([])
});

const suscripcionDataSchema = yup.object({
  usuarioId: yup.string().required('El ID del usuario es requerido'),
  membresiaId: yup.string().required('El ID de la membresía es requerido'),
  fechaInicio: yup.string().required('La fecha de inicio es requerida'),
  metodoPagoId: yup.string().required('El ID del método de pago es requerido'),
  renovacionAutomatica: yup.boolean().default(true)
});

const notificacionSchema = yup.object({
  tipoNotificacion: yup.string()
    .test('tipo-notificacion-valido', 'Tipo de notificación inválido', function (value) {
      const tiposValidos = ['reserva', 'pago', 'membresia', 'general'];
      return tiposValidos.includes(value);
    })
    .required('El tipo de notificación es requerido'),
  titulo: yup.string().required('El título es requerido'),
  mensaje: yup.string().required('El mensaje es requerido'),
  destinatarioId: yup.string().required('El ID del destinatario es requerido'),
  remitenteId: yup.string().optional(),
  entidadRelacionada: yup.object({
    tipo: yup.string().required('El tipo de entidad es requerido'),
    id: yup.string().required('El ID de la entidad es requerido')
  }).optional(),
  prioridad: yup.string()
    .test('prioridad-valida', 'Prioridad inválida', function (value) {
      if (!value) return true;
      const prioridadesValidas = ['baja', 'media', 'alta'];
      return prioridadesValidas.includes(value);
    })
    .default('media'),
  accion: yup.string().optional()
});

const validarMetodoPago = async (metodo) => {
  try {
    await metodoPagoSchema.validate(metodo, { abortEarly: false });
    return { valido: true, errores: [] };
  } catch (error) {
    return {
      valido: false,
      errores: error.inner.map(err => err.message)
    };
  }
};

const validarDatosReserva = async (datos) => {
  try {
    await datosReservaSchema.validate(datos, { abortEarly: false });
    return { valido: true, errores: [] };
  } catch (error) {
    return {
      valido: false,
      errores: error.inner.map(err => err.message)
    };
  }
};

const validarPayloadReserva = async (payload) => {
  try {
    await payloadReservaSchema.validate(payload, { abortEarly: false });
    return { valido: true, errores: [] };
  } catch (error) {
    return {
      valido: false,
      errores: error.inner.map(err => err.message)
    };
  }
};

const validarPayloadPago = async (payload) => {
  try {
    await payloadPagoSchema.validate(payload, { abortEarly: false });
    return { valido: true, errores: [] };
  } catch (error) {
    return {
      valido: false,
      errores: error.inner.map(err => err.message)
    };
  }
};

const validarFactura = async (factura) => {
  try {
    await facturaSchema.validate(factura, { abortEarly: false });
    return { valido: true, errores: [] };
  } catch (error) {
    return {
      valido: false,
      errores: error.inner.map(err => err.message)
    };
  }
};

const validarSuscripcionData = async (data) => {
  try {
    await suscripcionDataSchema.validate(data, { abortEarly: false });
    return { valido: true, errores: [] };
  } catch (error) {
    return {
      valido: false,
      errores: error.inner.map(err => err.message)
    };
  }
};

const validarNotificacion = async (notificacion) => {
  try {
    await notificacionSchema.validate(notificacion, { abortEarly: false });
    return { valido: true, errores: [] };
  } catch (error) {
    return {
      valido: false,
      errores: error.inner.map(err => err.message)
    };
  }
};

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

  const calcularPrecioFinal = (precioTotal, descuento) => {
    if (!descuento || !descuento.porcentaje || descuento.porcentaje <= 0) {
      return precioTotal;
    }
    const montoDescuento = precioTotal * (descuento.porcentaje / 100);
    return Math.round((precioTotal - montoDescuento) * 100) / 100;
  };

  const precioTotal = parseFloat(datosReserva.precioTotal);
  const precioFinalPagado = datosReserva.precioFinalPagado
    ? parseFloat(datosReserva.precioFinalPagado)
    : calcularPrecioFinal(precioTotal, datosReserva.descuento);

  const payload = {
    usuarioId: (usuario?.id || usuario?._id)?.toString(),
    clienteId: datosReserva.clienteId?.toString() || datosReserva.propietarioId?.toString(),
    entidadReservada: {
      tipo: mapearTipoEspacio(datosReserva.espacioTipo),
      id: datosReserva.espacioId?.toString()
    },
    fechaInicio: new Date(datosReserva.fechaHoraInicio),
    fechaFin: new Date(datosReserva.fechaHoraFin),
    horaInicio: datosReserva.horaInicio,
    horaFin: datosReserva.horaFin,
    tipoReserva: determinarTipoReserva(datosReserva.horaInicio, datosReserva.horaFin),
    precioTotal: precioTotal,
    precioFinalPagado: datosReserva.precioFinalPagado ? parseFloat(datosReserva.precioFinalPagado) : precioTotal,
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
  if (!payload.clienteId) errores.push('clienteId es requerido');
  if (!payload.entidadReservada?.tipo) errores.push('entidadReservada.tipo es requerido');
  if (!payload.entidadReservada?.id) errores.push('entidadReservada.id es requerido');
  if (!payload.fechaInicio) errores.push('fechaInicio es requerido');
  if (!payload.fechaFin) errores.push('fechaFin es requerido');
  if (!payload.horaInicio) errores.push('horaInicio es requerido');
  if (!payload.horaFin) errores.push('horaFin es requerido');
  if (!payload.tipoReserva) errores.push('tipoReserva es requerido');
  if (payload.precioTotal === undefined || payload.precioTotal === null) errores.push('precioTotal es requerido');

  if (!payload.clienteId) errores.push('clienteId es requerido');

  if (payload.precioFinalPagado === undefined || payload.precioFinalPagado === null) {
    errores.push('precioFinalPagado es requerido');
  }

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

  if (payload.precioFinalPagado !== undefined && payload.precioFinalPagado < 0) {
    errores.push('precioFinalPagado no puede ser negativo');
  }

  if (payload.precioFinalPagado !== undefined && payload.precioTotal !== undefined) {
    if (payload.precioFinalPagado > payload.precioTotal) {
      errores.push('precioFinalPagado no puede ser mayor a precioTotal');
    }
  }

  if (payload.cantidadPersonas !== undefined && payload.cantidadPersonas < 1) {
    errores.push('cantidadPersonas debe ser al menos 1');
  }

  if (payload.descuento && payload.descuento.porcentaje > 0) {
    const descuentoEsperado = payload.precioTotal * (payload.descuento.porcentaje / 100);
    const precioFinalEsperado = payload.precioTotal - descuentoEsperado;
    const diferencia = Math.abs(payload.precioFinalPagado - precioFinalEsperado);

    if (diferencia > 0.01) {
      errores.push(`Inconsistencia en precios: esperado ${precioFinalEsperado.toFixed(2)}, recibido ${payload.precioFinalPagado}`);
    }
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
    throw new Error(`Error al generar factura: ${error.message}`);
  }
};

const enviarNotificacion = async (tipo, titulo, mensaje, entidadRelacionada, auth) => {
  try {
    const USUARIO_HARDCODED = '685dc0ada569cd95307eab86';

    const notificacionData = {
      tipoNotificacion: tipo || 'general',
      titulo: ` ${titulo}`,
      mensaje: `${mensaje}`,
      destinatarioId: USUARIO_HARDCODED,
      entidadRelacionada: entidadRelacionada || undefined,
      prioridad: 'media'
    };

    const validacion = await validarNotificacion(notificacionData);
    if (!validacion.valido) {
      console.error('Validación falló para notificación de prueba:', validacion.errores);
      return false;
    }

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

    if (response.ok) {
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error enviando notificación de prueba:', errorData);
      return false;
    }

  } catch (error) {
    console.error('Error en enviarNotificacionPrueba:', error);
    return false;
  }
};

const crearNotificacionPropietario = async (reserva, datosReserva, usuarioReservante, auth) => {
  try {
    const espacioDetalle = await obtenerDetalleEspacioPorId(datosReserva.espacioId, auth.token);

    let propietarioId = null;

    if (espacioDetalle?.datosCompletos?.propietarioId) {
      propietarioId = espacioDetalle.datosCompletos.propietarioId;
    } else if (espacioDetalle?.datosCompletos?.usuarioId) {
      propietarioId = espacioDetalle.datosCompletos.usuarioId;
    } else if (espacioDetalle?.usuarioId) {
      propietarioId = espacioDetalle.usuarioId;
    }

    if (propietarioId) {

      if (typeof propietarioId === 'object') {
        propietarioId = propietarioId._id || propietarioId.id;
      }

      propietarioId = propietarioId.toString();

      if (!propietarioId || propietarioId === 'undefined' || propietarioId === 'null') {
        return;
      }
    } else {
      return;
    }

    const remitenteId = usuarioReservante?.id || usuarioReservante?._id;
    if (!remitenteId) {
      return;
    }

    const reservaId = reserva._id || reserva.id;

    const notificacionData = {
      tipoNotificacion: 'reserva',
      titulo: 'Nueva reserva en tu espacio',
      mensaje: `${usuarioReservante?.nombre || 'Un usuario'} ha reservado ${datosReserva.espacioNombre} para el ${datosReserva.fecha} de ${datosReserva.horaInicio} a ${datosReserva.horaFin}`,
      destinatarioId: propietarioId,
      remitenteId: remitenteId.toString(),
      entidadRelacionada: {
        tipo: 'reserva',
        id: reservaId.toString()
      },
      prioridad: 'alta',
      accion: 'ver_reserva'
    };

    const validacion = await validarNotificacion(notificacionData);
    if (!validacion.valido) {
      console.error(validacion.errores);
      return;
    }

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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(errorData);
      return;
    }

  } catch (error) {
    console.error(error.message);
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

    const validacion = await validarNotificacion(notificacionData);
    if (!validacion.valido) {
      console.error(validacion.errores);
      return;
    }

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
    console.error(error);
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
    console.error(error);
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

      <View style={styles.topLoadingContainer}>
        <ActivityIndicator size="small" color="#4a90e2" />
        <Text style={styles.topLoadingText}>Procesando...</Text>
      </View>

      <View style={styles.estadoContainer}>
        <View style={styles.estadoIcono}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
        <Text style={styles.estadoTitulo}>Procesando pago...</Text>
        <Text style={styles.estadoSubtitulo}>
          Por favor espera mientras procesamos tu {modoSuscripcion ? 'suscripción' : 'reserva'}
        </Text>

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

  const handleEliminarTarjeta = async (metodoId, metodo) => {

    const validacion = await validarMetodoPago(metodo);
    if (!validacion.valido) {
      Alert.alert('Error', `Método de pago inválido: ${validacion.errores.join(', ')}`);
      return;
    }

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

  const handleSeleccionarTarjeta = async (metodo) => {
    if (!modoSeleccion) return;

    const validacion = await validarMetodoPago(metodo);
    if (!validacion.valido) {
      Alert.alert('Error', `Método de pago inválido: ${validacion.errores.join(', ')}`);
      return;
    }

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

  const handleMarcarPredeterminado = async (metodo) => {

    const validacion = await validarMetodoPago(metodo);
    if (!validacion.valido) {
      Alert.alert('Error', `Método de pago inválido: ${validacion.errores.join(', ')}`);
      return;
    }

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
      await new Promise(resolve => setTimeout(resolve, 2000));
      const exitoPago = Math.random() > 0.05;

      if (!exitoPago) {
        setEstadoPago('error');
        return;
      }

      if (!modoSuscripcion && datosReserva) {
        const validacionReserva = await validarDatosReserva(datosReserva);
        if (!validacionReserva.valido) {
          Alert.alert(
            'Error en datos de reserva',
            `Errores encontrados:\n${validacionReserva.errores.join('\n')}`,
            [{ text: 'OK', onPress: () => setEstadoPago('error') }]
          );
          return;
        }

        const reservaParaBackend = crearPayloadReservaLimpio(datosReserva, usuario, metodo);

        const validacionPayload = await validarPayloadReserva(reservaParaBackend);
        if (!validacionPayload.valido) {
          Alert.alert(
            'Error en payload de reserva',
            `Errores encontrados:\n${validacionPayload.errores.join('\n')}`,
            [{ text: 'OK', onPress: () => setEstadoPago('error') }]
          );
          return;
        }

        const erroresValidacion = validarPayloadLimpio(reservaParaBackend);
        if (erroresValidacion.length > 0) {
          Alert.alert(
            'Error en datos de reserva',
            `Errores encontrados:\n${erroresValidacion.join('\n')}`,
            [{ text: 'OK', onPress: () => setEstadoPago('error') }]
          );
          return;
        }

        try {
          const resultadoReserva = await dispatch(crearReserva(reservaParaBackend));

          if (!crearReserva.fulfilled.match(resultadoReserva)) {
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
            Alert.alert(
              'Error interno',
              'No se pudo obtener el ID de la reserva creada',
              [{ text: 'OK', onPress: () => setEstadoPago('error') }]
            );
            return;
          }

          setReservaCreada(reservaActual);

          const pagoData = crearDatosPagoCompatibles(datosReserva, reservaId, usuario, metodo);

          const validacionPago = await validarPayloadPago(pagoData);
          if (!validacionPago.valido) {
            Alert.alert(
              'Error en datos de pago',
              `Errores:\n${validacionPago.errores.join('\n')}`,
              [{ text: 'OK', onPress: () => setEstadoPago('error') }]
            );
            return;
          }

          const erroresPago = validarPayloadPagoBackend(pagoData);
          if (erroresPago.length > 0) {
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
            Alert.alert(
              'Error al procesar pago',
              `Backend rechazó el pago: ${errorMessage}`,
              [{ text: 'OK', onPress: () => setEstadoPago('error') }]
            );
            return;
          }

          const pagoCreado = resultadoPago.payload;
          const pagoActual = pagoCreado.pago || pagoCreado;

          let facturaCreada = null;
          try {
            const facturaData = await crearFacturaDesdeReserva(
              reservaActual,
              pagoActual,
              usuario,
              datosReserva
            );

            const validacionFactura = await validarFactura(facturaData);
            if (!validacionFactura.valido) {
              throw new Error(`Datos de factura inválidos: ${validacionFactura.errores.join(', ')}`);
            }

            if (!facturaData.numeroFactura || !facturaData.usuarioId || !facturaData.total) {
              throw new Error('Datos de factura incompletos');
            }

            const resultadoFactura = await dispatch(crearFactura(facturaData));

            if (crearFactura.fulfilled.match(resultadoFactura)) {
              facturaCreada = resultadoFactura.payload;
              const facturaActual = facturaCreada.factura || facturaCreada;

              try {
                const pagoId = pagoActual._id || pagoActual.id;
                const facturaId = facturaActual._id || facturaActual.id;

                if (pagoId && facturaId) {
                  const resultadoVinculacion = await dispatch(vincularFacturaPago({
                    pagoId: pagoId.toString(),
                    facturaData: { facturaId: facturaId.toString() }
                  }));
                }
              } catch (error) {
                console.error('Error vinculando factura con pago:', error);
              }
            } else {
              throw new Error(resultadoFactura.payload || 'Error al crear factura');
            }
          } catch (facturaError) {
            console.warn('Error en factura:', facturaError);
            Alert.alert(
              'Advertencia',
              'La reserva y pago se procesaron correctamente, pero hubo un problema al generar la factura. Puedes solicitar la factura más tarde desde el detalle de la transacción.',
              [{ text: 'Entendido' }]
            );
          }

          const transaccionCompleta = {
            id: `TRANS_${Date.now()}_${reservaId}`,
            fecha: new Date().toLocaleDateString('es-ES'),
            precio: `${parseFloat(datosReserva.precioTotal || 0).toFixed(2)}`,

            usuario: {
              nombre: usuario?.nombre || usuario?.name ||
                `${usuario?.firstName || ''} ${usuario?.lastName || ''}`.trim() || 'Usuario',
              name: usuario?.name || usuario?.nombre,
              firstName: usuario?.firstName,
              lastName: usuario?.lastName,
              email: usuario?.email || usuario?.correo || '',
              correo: usuario?.correo || usuario?.email || ''
            },

            reserva: {
              id: reservaId,
              espacioNombre: datosReserva.espacioNombre || 'Espacio no especificado',
              entidadReservada: {
                nombre: datosReserva.espacioNombre || 'Espacio no especificado',
                tipo: reservaParaBackend.entidadReservada?.tipo || 'oficina'
              },
              fecha: datosReserva.fecha,
              horaInicio: datosReserva.horaInicio,
              horaFin: datosReserva.horaFin,
              cantidadPersonas: parseInt(datosReserva.cantidadPersonas) || 1,
              estado: reservaActual.estado || 'confirmada',
              tipoReserva: reservaParaBackend.tipoReserva || 'hora',
              serviciosAdicionales: (datosReserva.serviciosAdicionales || []).map(servicio => ({
                nombre: servicio.nombre || 'Servicio adicional',
                precio: parseFloat(servicio.precio || 0),
                unidadPrecio: servicio.unidadPrecio || 'servicio',
                cantidad: parseInt(servicio.cantidad || 1)
              }))
            },

            pago: {
              id: pagoActual._id || pagoActual.id,
              _id: pagoActual._id || pagoActual.id,
              monto: parseFloat(datosReserva.precioTotal || 0),
              moneda: 'USD',
              conceptoPago: 'Reserva',
              fecha: new Date(),
              estado: pagoActual.estado || 'completado',
              comprobante: pagoActual.comprobante || `comp_${Date.now()}_${reservaId}`,
              metodoPago: {
                tipo: mapearTipoMetodoPago(metodo.tipo),
                detalles: {
                  ultimosDigitos: metodo.ultimosDigitos || '****',
                  numeroAutorizacion: pagoActual.metodoPago?.detalles?.numeroAutorizacion ||
                    `AUTH_${Date.now()}`
                }
              }
            },

            factura: facturaCreada ? {
              id: (facturaCreada.factura || facturaCreada)._id ||
                (facturaCreada.factura || facturaCreada).id,
              numeroFactura: (facturaCreada.factura || facturaCreada).numeroFactura,
              fechaEmision: new Date(),
              fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              estado: 'pagada',
              subtotal: parseFloat(datosReserva.precioTotal || 0),
              descuentoTotal: datosReserva.descuento?.porcentaje ?
                (parseFloat(datosReserva.precioTotal || 0) * (datosReserva.descuento.porcentaje / 100)) : 0,
              total: parseFloat(datosReserva.precioTotal || 0)
            } : null,

            oficina: {
              nombre: datosReserva.espacioNombre || oficina?.nombre || 'Espacio'
            },

            metodo: {
              ultimosDigitos: metodo.ultimosDigitos || '****'
            }
          };

          const limpiarObjeto = (obj) => {
            if (Array.isArray(obj)) {
              return obj.map(limpiarObjeto).filter(item => item !== null && item !== undefined);
            } else if (obj && typeof obj === 'object') {
              const cleaned = {};
              Object.keys(obj).forEach(key => {
                if (obj[key] !== undefined && obj[key] !== null) {
                  if (typeof obj[key] === 'object') {
                    const cleanedNested = limpiarObjeto(obj[key]);
                    if (cleanedNested && (Array.isArray(cleanedNested) ? cleanedNested.length > 0 : Object.keys(cleanedNested).length > 0)) {
                      cleaned[key] = cleanedNested;
                    }
                  } else {
                    cleaned[key] = obj[key];
                  }
                }
              });
              return cleaned;
            }
            return obj;
          };

          const transaccionLimpia = limpiarObjeto(transaccionCompleta);

          if (!transaccionLimpia.id || !transaccionLimpia.fecha || !transaccionLimpia.precio) {
            console.error('Campos críticos faltantes en transacción:', {
              id: transaccionLimpia.id,
              fecha: transaccionLimpia.fecha,
              precio: transaccionLimpia.precio
            });
            Alert.alert(
              'Error interno',
              'No se pudieron generar correctamente los datos de la transacción',
              [{ text: 'OK', onPress: () => setEstadoPago('error') }]
            );
            return;
          }

          setTransaccionActual(transaccionLimpia);

          try {
            await Promise.all([
              crearNotificacionPropietario(reservaActual, datosReserva, usuario, auth),
              crearNotificacionUsuario(reservaActual, pagoActual, facturaCreada, usuario, auth),
              enviarNotificacion(
                'reserva',
                'Nueva reserva creada',
                `Reserva de ${datosReserva.espacioNombre} por ${usuario?.nombre || 'Usuario'} el ${datosReserva.fecha}`,
                {
                  tipo: 'reserva',
                  id: (reservaActual._id || reservaActual.id).toString()
                },
                auth
              )
            ]);
          } catch (error) {
            console.error('Error creando notificaciones:', error);
          }

          try {
            const userId = usuario?.id || usuario?._id;
            if (userId && auth?.token) {
              dispatch(cargarNotificacionesUsuario(userId, auth.token));
            }
          } catch (error) {
            console.error('Error cargando notificaciones:', error);
          }

          setEstadoPago('confirmado');

        } catch (error) {
          console.error('Error en procesamiento de reserva:', error);
          Alert.alert(
            'Error en reserva',
            `Error al procesar la reserva: ${error.message || 'Error desconocido'}`,
            [{ text: 'OK', onPress: () => setEstadoPago('error') }]
          );
        }

      } else if (modoSuscripcion && planSuscripcion) {
        try {
          const usuarioId = usuario?._id || usuario?.id || usuario?.userId;

          if (!usuario) {
            throw new Error('Usuario no disponible. Por favor, inicia sesión nuevamente.');
          }

          if (!usuarioId) {
            throw new Error('ID de usuario no encontrado. Por favor, inicia sesión nuevamente.');
          }

          const planId = planSuscripcion?.id || planSuscripcion?._id || planSuscripcion?.datosCompletos?._id;
          if (!planId) {
            throw new Error('Plan de suscripción no válido');
          }

          const fechaInicio = new Date();

          const suscripcionData = {
            usuarioId: usuarioId,
            membresiaId: planId,
            fechaInicio: fechaInicio.toISOString(),
            metodoPagoId: metodo._id || metodo.id || 'default',
            renovacionAutomatica: true,
          };

          const validacionSuscripcion = await validarSuscripcionData(suscripcionData);
          if (!validacionSuscripcion.valido) {
            Alert.alert(
              'Error en datos de suscripción',
              `Errores:\n${validacionSuscripcion.errores.join('\n')}`,
              [{ text: 'OK', onPress: () => setEstadoPago('error') }]
            );
            return;
          }

          const resultadoSuscripcion = await dispatch(suscribirMembresia(suscripcionData));

          if (suscribirMembresia.fulfilled.match(resultadoSuscripcion)) {
            const { usuario: usuarioActualizado, suscripcion } = resultadoSuscripcion.payload;

            if (!usuarioActualizado) {
              throw new Error('No se recibió el usuario actualizado del servidor');
            }

            if (!usuarioActualizado.membresia || !usuarioActualizado.membresia.tipoMembresiaId) {
              throw new Error('La membresía no se asignó correctamente al usuario');
            }

            dispatch(loguear({
              usuario: usuarioActualizado,
              token: auth.token,
              tipoUsuario: usuarioActualizado.tipoUsuario
            }));

            if (suscripcion) {
              dispatch(actualizarSuscripcionActual(suscripcion));
            }

            const transaccionSuscripcion = {
              id: `SUBS_${Date.now()}_${planId}`,
              fecha: new Date().toLocaleDateString('es-ES'),
              precio: precio || '$0.00',

              usuario: {
                nombre: usuario.nombre || usuario.username || 'Usuario',
                name: usuario.name || usuario.nombre,
                email: usuario.email || usuario.correo || '',
                correo: usuario.correo || usuario.email || ''
              },

              suscripcion: {
                planId: planId,
                planNombre: planSuscripcion.nombre,
                fechaInicio: usuarioActualizado.membresia.fechaInicio,
                fechaVencimiento: usuarioActualizado.membresia.fechaVencimiento,
                renovacionAutomatica: usuarioActualizado.membresia.renovacionAutomatica,
                estado: 'activa'
              },

              metodo: {
                ultimosDigitos: metodo.ultimosDigitos || '****'
              }
            };

            setTransaccionActual(transaccionSuscripcion);
            setEstadoPago('confirmado');

          } else {
            throw new Error(resultadoSuscripcion.payload || 'Error al procesar la suscripción');
          }

        } catch (suscripcionError) {
          console.error('Error en suscripción:', suscripcionError);
          Alert.alert(
            'Error en la suscripción',
            `No se pudo procesar la suscripción: ${suscripcionError.message}`,
            [{ text: 'OK', onPress: () => setEstadoPago('error') }]
          );
          return;
        }
      }

    } catch (error) {
      console.error('Error general en procesarPago:', error);
      Alert.alert(
        'Error en el pago',
        `Ocurrió un error inesperado: ${error.message || 'Error desconocido'}`,
        [{ text: 'OK', onPress: () => setEstadoPago('error') }]
      );
    }
  };

  const handleContinuar = () => {
    if (estadoPago === 'confirmado') {
      const userId = usuario?.id || usuario?._id;
      if (userId && auth?.token) {
        dispatch(cargarNotificacionesUsuario(userId, auth.token));
      }

      if (modoSuscripcion) {
        navigation.navigate('Membresias');
      } else {
        navigation.navigate('Reservas');
      }
    } else if (estadoPago === 'error') {
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

        {modoSeleccion && metodosPagoConIds.length == 0 && (
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