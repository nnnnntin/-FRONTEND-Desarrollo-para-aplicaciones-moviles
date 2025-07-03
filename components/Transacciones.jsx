import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';

const metodoPagoSchema = Yup.object({
  tipo: Yup.string()
    .test('tipo-metodo-pago-valido', 'Tipo de método de pago no válido', function (value) {
      const tiposValidos = ['tarjeta_credito', 'tarjeta_debito', 'transferencia', 'efectivo'];
      return tiposValidos.includes(value);
    })
    .required('Tipo de método de pago es requerido'),
  detalles: Yup.object({
    ultimosDigitos: Yup.string()
      .matches(/^\d{4}$/, 'Los últimos dígitos deben ser 4 números')
      .required('Últimos dígitos son requeridos'),
    numeroAutorizacion: Yup.string()
      .max(50, 'Número de autorización no puede exceder 50 caracteres')
  })
});

const pagoSchema = Yup.object({
  id: Yup.string().required('ID del pago es requerido'),
  _id: Yup.string(),
  monto: Yup.number()
    .positive('El monto debe ser positivo')
    .max(999999, 'El monto no puede exceder $999,999')
    .required('Monto es requerido'),
  moneda: Yup.string()
    .test('moneda-valida', 'Moneda no válida', function (value) {
      if (!value) return true;
      const monedasValidas = ['USD', 'UYU', 'EUR'];
      return monedasValidas.includes(value);
    })
    .default('USD'),
  conceptoPago: Yup.string()
    .max(200, 'El concepto no puede exceder 200 caracteres')
    .default('Reserva'),
  fecha: Yup.date()
    .max(new Date(), 'La fecha no puede ser futura')
    .required('Fecha del pago es requerida'),
  estado: Yup.string()
    .test('estado-pago-valido', 'Estado de pago no válido', function (value) {
      if (!value) return true;
      const estadosValidos = ['pendiente', 'completado', 'fallido', 'cancelado'];
      return estadosValidos.includes(value);
    })
    .default('completado'),
  comprobante: Yup.string()
    .max(100, 'El comprobante no puede exceder 100 caracteres'),
  metodoPago: metodoPagoSchema
}).test('id-required', 'Se requiere ID del pago', function (value) {
  return value.id || value._id;
});

const facturaSchema = Yup.object({
  id: Yup.string().required('ID de la factura es requerido'),
  numeroFactura: Yup.string()
    .required('Número de factura es requerido')
    .matches(/^[A-Z0-9-]+$/, 'Formato de número de factura inválido')
    .max(50, 'Número de factura no puede exceder 50 caracteres'),
  fechaEmision: Yup.date()
    .max(new Date(), 'La fecha de emisión no puede ser futura')
    .required('Fecha de emisión es requerida'),
  fechaVencimiento: Yup.date()
    .test('fecha-vencimiento-valida', 'La fecha de vencimiento debe ser posterior a la emisión', function (value) {
      const { fechaEmision } = this.parent;
      if (!value || !fechaEmision) return true;
      return new Date(value) >= new Date(fechaEmision);
    })
    .required('Fecha de vencimiento es requerida'),
  estado: Yup.string()
    .test('estado-factura-valido', 'Estado de factura no válido', function (value) {
      if (!value) return true;
      const estadosValidos = ['pendiente', 'pagada', 'vencida', 'cancelada'];
      return estadosValidos.includes(value);
    })
    .default('pagada'),
  subtotal: Yup.number()
    .min(0, 'El subtotal no puede ser negativo')
    .max(999999, 'El subtotal no puede exceder $999,999')
    .required('Subtotal es requerido'),
  descuentoTotal: Yup.number()
    .min(0, 'El descuento no puede ser negativo')
    .test('descuento-valido', 'El descuento no puede ser mayor al subtotal', function (value) {
      const { subtotal } = this.parent;
      if (value === undefined || value === null || !subtotal) return true;
      return value <= subtotal;
    })
    .default(0),
  total: Yup.number()
    .min(0, 'El total no puede ser negativo')
    .max(999999, 'El total no puede exceder $999,999')
    .required('Total es requerido')
}).test('total-valido', 'El total debe ser igual al subtotal menos el descuento', function (value) {
  const { subtotal, descuentoTotal, total } = value;
  const totalCalculado = subtotal - descuentoTotal;
  return Math.abs(total - totalCalculado) < 0.01;
});

const entidadReservadaSchema = Yup.object({
  nombre: Yup.string()
    .required('Nombre de la entidad es requerido')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .trim(),
  tipo: Yup.string()
    .test('tipo-entidad-valido', 'Tipo de entidad no válido', function (value) {
      const tiposValidos = ['oficina', 'espacio', 'escritorio', 'sala', 'edificio'];
      return tiposValidos.includes(value);
    })
    .required('Tipo de entidad es requerido')
});

const servicioAdicionalSchema = Yup.object({
  nombre: Yup.string()
    .required('Nombre del servicio es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  precio: Yup.number()
    .positive('El precio debe ser positivo')
    .max(10000, 'El precio no puede exceder $10,000')
    .required('Precio es requerido'),
  unidadPrecio: Yup.string()
    .test('unidad-precio-valida', 'Unidad de precio no válida', function (value) {
      const unidadesValidas = ['persona', 'día', 'hora', 'servicio'];
      return unidadesValidas.includes(value);
    })
    .required('Unidad de precio es requerida')
});

const reservaSchema = Yup.object({
  id: Yup.string().required('ID de la reserva es requerido'),
  espacioNombre: Yup.string()
    .max(200, 'El nombre del espacio no puede exceder 200 caracteres')
    .trim(),
  entidadReservada: entidadReservadaSchema,
  fecha: Yup.string()
    .required('Fecha de la reserva es requerida')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  horaInicio: Yup.string()
    .required('Hora de inicio es requerida')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  horaFin: Yup.string()
    .required('Hora de fin es requerida')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  cantidadPersonas: Yup.number()
    .integer('La cantidad de personas debe ser un número entero')
    .min(1, 'La cantidad de personas debe ser al menos 1')
    .max(1000, 'La cantidad de personas no puede exceder 1000')
    .required('Cantidad de personas es requerida'),
  estado: Yup.string()
    .test('estado-reserva-valido', 'Estado de reserva no válido', function (value) {
      if (!value) return true;
      const estadosValidos = ['pendiente', 'confirmada', 'completada', 'cancelada'];
      return estadosValidos.includes(value);
    })
    .default('confirmada'),
  tipoReserva: Yup.string()
    .max(50, 'El tipo de reserva no puede exceder 50 caracteres'),
  serviciosAdicionales: Yup.array()
    .of(servicioAdicionalSchema)
    .max(20, 'No puede tener más de 20 servicios adicionales')
    .default([])
}).test('horario-valido', 'La hora de fin debe ser posterior a la hora de inicio', function (value) {
  if (!value.horaInicio || !value.horaFin) return true;
  const [inicioH, inicioM] = value.horaInicio.split(':').map(Number);
  const [finH, finM] = value.horaFin.split(':').map(Number);
  const inicio = inicioH * 60 + inicioM;
  const fin = finH * 60 + finM;
  return fin > inicio;
});

const usuarioSchema = Yup.object({
  nombre: Yup.string().max(100, 'El nombre no puede exceder 100 caracteres').trim(),
  name: Yup.string().max(100, 'El nombre no puede exceder 100 caracteres').trim(),
  firstName: Yup.string().max(50, 'El nombre no puede exceder 50 caracteres').trim(),
  lastName: Yup.string().max(50, 'El apellido no puede exceder 50 caracteres').trim(),
  email: Yup.string().email('Formato de email inválido').max(255, 'El email no puede exceder 255 caracteres'),
  correo: Yup.string().email('Formato de correo inválido').max(255, 'El correo no puede exceder 255 caracteres')
}).test('nombre-required', 'Se requiere al menos un nombre', function (value) {
  return value.nombre || value.name || value.firstName ||
    (value.firstName && value.lastName && `${value.firstName} ${value.lastName}`.trim());
});

const transaccionSchema = Yup.object({
  id: Yup.string().max(100, 'El ID no puede exceder 100 caracteres'),
  fecha: Yup.string()
    .test('fecha-valida', 'Formato de fecha inválido', function (value) {
      if (!value) return false;
      return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value);
    })
    .required('Fecha de la transacción es requerida'),
  precio: Yup.string()
    .test('precio-valido', 'Formato de precio inválido', function (value) {
      if (!value) return false;
      return /^(\$)?\d+(\.\d{1,2})?$/.test(value);
    })
    .required('Precio es requerido'),
  usuario: usuarioSchema,
  reserva: reservaSchema,
  pago: pagoSchema,
  factura: facturaSchema,
  oficina: Yup.object({
    nombre: Yup.string()
      .max(200, 'El nombre de la oficina no puede exceder 200 caracteres')
      .trim()
  }),
  metodo: Yup.object({
    ultimosDigitos: Yup.string()
      .matches(/^\d{4}$/, 'Los últimos dígitos deben ser 4 números')
  })
});

const navigationParamsSchema = Yup.object({
  reservaId: Yup.string().max(100, 'ID de reserva no puede exceder 100 caracteres'),
  pagoId: Yup.string().max(100, 'ID de pago no puede exceder 100 caracteres'),
  facturaId: Yup.string().max(100, 'ID de factura no puede exceder 100 caracteres'),
  transaccionId: Yup.string().max(100, 'ID de transacción no puede exceder 100 caracteres'),
  tipo: Yup.string()
    .test('tipo-navegacion-valido', 'Tipo no válido', function (value) {
      const tiposValidos = ['reserva', 'pago', 'factura', 'transaccion'];
      return tiposValidos.includes(value);
    })
    .required('Tipo es requerido')
});

const Transacciones = ({ navigation, route }) => {
  const { transaccion } = route?.params || {};
  const usuario = useSelector(state => state.auth.usuario);
  const [transaccionValidada, setTransaccionValidada] = useState(null);
  const [usuarioValidado, setUsuarioValidado] = useState(null);
  const [erroresValidacion, setErroresValidacion] = useState({});

  const validarTransaccion = useCallback((data) => {
    try {
      if (!data) return null;
      transaccionSchema.validateSync(data);
      return data;
    } catch (error) {
      setErroresValidacion(prev => ({ ...prev, transaccion: error.message }));
      return null;
    }
  }, []);

  const validarUsuario = useCallback((data) => {
    try {
      if (!data) return null;
      usuarioSchema.validateSync(data);
      return data;
    } catch (error) {
      setErroresValidacion(prev => ({ ...prev, usuario: error.message }));
      return null;
    }
  }, []);

  const validarNavigationParams = useCallback((params) => {
    try {
      navigationParamsSchema.validateSync(params);
      return true;
    } catch (error) {
      setErroresValidacion(prev => ({ ...prev, navigation: error.message }));
      return false;
    }
  }, []);

  useEffect(() => {
    try {
      if (transaccion) {
        const transaccionValida = validarTransaccion(transaccion);
        setTransaccionValidada(transaccionValida);
      }

      if (usuario) {
        const usuarioValido = validarUsuario(usuario);
        setUsuarioValidado(usuarioValido);
      }
    } catch (error) {
      console.error(error);
    }
  }, [transaccion, usuario, validarTransaccion, validarUsuario]);

  const handleVolver = () => {
    navigation.goBack();
  };

  const handleReportarProblema = () => {
    try {
      const params = {
        reservaId: transaccionValidada?.reserva?.id,
        tipo: 'reserva',
        transaccionId: transaccionValidada?.id,
        pagoId: transaccionValidada?.pago?.id || transaccionValidada?.pago?._id,
        facturaId: transaccionValidada?.factura?.id
      };

      if (validarNavigationParams(params)) {
        navigation.navigate('FormularioProblema', params);
      } else {
        Alert.alert('Error', 'Datos insuficientes para reportar el problema');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al abrir formulario de problema: ' + error.message);
    }
  };

  const obtenerNombreUsuario = useCallback(() => {
    try {
      const transaccionUser = transaccionValidada?.usuario;
      const userAuth = usuarioValidado;

      return transaccionUser?.nombre ||
        transaccionUser?.name ||
        (transaccionUser?.firstName && transaccionUser?.lastName ?
          `${transaccionUser.firstName} ${transaccionUser.lastName}`.trim() : '') ||
        userAuth?.nombre ||
        userAuth?.name ||
        (userAuth?.firstName && userAuth?.lastName ?
          `${userAuth.firstName} ${userAuth.lastName}`.trim() : '') ||
        'Usuario';
    } catch (error) {
      console.error('Error obteniendo nombre usuario:', error);
      return 'Usuario';
    }
  }, [transaccionValidada, usuarioValidado]);

  const obtenerEmailUsuario = useCallback(() => {
    try {
      const transaccionUser = transaccionValidada?.usuario;
      const userAuth = usuarioValidado;

      return transaccionUser?.email ||
        transaccionUser?.correo ||
        userAuth?.email ||
        userAuth?.correo ||
        '';
    } catch (error) {
      console.error('Error obteniendo email usuario:', error);
      return '';
    }
  }, [transaccionValidada, usuarioValidado]);

  const validarDatosTransaccion = (transaccion) => {
    const errores = [];

    if (!transaccion.id) errores.push('ID de transacción faltante');
    if (!transaccion.fecha) errores.push('Fecha de transacción faltante');
    if (!transaccion.precio) errores.push('Precio de transacción faltante');

    if (transaccion.fecha && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(transaccion.fecha)) {
      errores.push('Formato de fecha inválido');
    }

    if (transaccion.precio && !/^(\$)?\d+(\.\d{1,2})?$/.test(transaccion.precio)) {
      errores.push('Formato de precio inválido');
    }

    return true;
  };


  const normalizarDatosTransaccion = (transaccion) => {
    if (!transaccion) return null;

    try {
      let fechaNormalizada = transaccion.fecha;
      if (fechaNormalizada && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fechaNormalizada)) {
        const fecha = new Date(fechaNormalizada);
        if (!isNaN(fecha.getTime())) {
          fechaNormalizada = fecha.toLocaleDateString('es-ES');
        } else {
          fechaNormalizada = new Date().toLocaleDateString('es-ES');
        }
      }

      let precioNormalizado = transaccion.precio;
      if (precioNormalizado) {
        if (/^\$\d+(\.\d{2})?$/.test(precioNormalizado)) {
        } else if (/^\d+(\.\d{1,2})?$/.test(precioNormalizado)) {
          const numero = parseFloat(precioNormalizado);
          precioNormalizado = `$${numero.toFixed(2)}`;
        } else {
          const numero = parseFloat(precioNormalizado.toString().replace(/[^0-9.]/g, ''));
          if (!isNaN(numero)) {
            precioNormalizado = `$${numero.toFixed(2)}`;
          } else {
            precioNormalizado = '$0.00';
          }
        }
      } else {
        precioNormalizado = '$0.00';
      }

      return {
        ...transaccion,
        fecha: fechaNormalizada,
        precio: precioNormalizado,

        usuario: transaccion.usuario || {
          nombre: 'Usuario desconocido',
          email: ''
        },

        reserva: transaccion.reserva ? {
          ...transaccion.reserva,
          espacioNombre: transaccion.reserva.espacioNombre ||
            transaccion.reserva.entidadReservada?.nombre ||
            'Espacio no especificado',
          entidadReservada: transaccion.reserva.entidadReservada || {
            nombre: transaccion.reserva.espacioNombre || 'Espacio no especificado',
            tipo: 'oficina'
          },
          serviciosAdicionales: transaccion.reserva.serviciosAdicionales || []
        } : null,

        pago: transaccion.pago ? {
          ...transaccion.pago,
          monto: transaccion.pago.monto || 0,
          moneda: transaccion.pago.moneda || 'USD',
          estado: transaccion.pago.estado || 'completado',
          metodoPago: transaccion.pago.metodoPago || {
            tipo: 'tarjeta',
            detalles: { ultimosDigitos: '****' }
          }
        } : null,

        factura: transaccion.factura ? {
          ...transaccion.factura,
          estado: transaccion.factura.estado || 'pagada'
        } : null,

        oficina: transaccion.oficina || {
          nombre: transaccion.reserva?.espacioNombre || 'Oficina'
        },

        metodo: transaccion.metodo || {
          ultimosDigitos: transaccion.pago?.metodoPago?.detalles?.ultimosDigitos || '****'
        }
      };
    } catch (error) {
      console.error('Error normalizando transacción:', error);
      return null;
    }
  };

  useEffect(() => {
    try {

      if (transaccion) {
        const transaccionNormalizada = normalizarDatosTransaccion(transaccion);

        if (!transaccionNormalizada) {
          setErroresValidacion(prev => ({
            ...prev,
            transaccion: 'Error al normalizar datos de transacción'
          }));
          setTransaccionValidada(null);
          return;
        }

        const esValidaBasica = validarDatosTransaccion(transaccionNormalizada);

        if (!esValidaBasica) {
          setErroresValidacion(prev => ({
            ...prev,
            transaccion: 'Datos de transacción inválidos'
          }));
          setTransaccionValidada(null);
          return;
        }

        let transaccionValidadaEsquema = null;
        try {
          transaccionValidadaEsquema = validarTransaccion(transaccionNormalizada);
        } catch (error) {
          transaccionValidadaEsquema = transaccionNormalizada;
        }

        setTransaccionValidada(transaccionValidadaEsquema || transaccionNormalizada);

      } else {
        setTransaccionValidada(null);
      }

      if (usuario) {
        const usuarioValido = validarUsuario(usuario);
        setUsuarioValidado(usuarioValido);
      }

    } catch (error) {
      setErroresValidacion(prev => ({
        ...prev,
        transaccion: `Error de procesamiento: ${error.message}`
      }));
      setTransaccionValidada(null);
    }
  }, [transaccion, usuario, validarTransaccion, validarUsuario]);

  const generarPDFContent = useCallback(() => {
    try {
      if (!transaccionValidada) {
        throw new Error('No hay datos de transacción válidos para generar el PDF');
      }

      const fecha = transaccionValidada.fecha || new Date().toLocaleDateString('es-ES');
      const precio = transaccionValidada.precio || '$0.00';
      const nombreUsuario = obtenerNombreUsuario();
      const emailUsuario = obtenerEmailUsuario();

      const reserva = transaccionValidada.reserva;
      const pago = transaccionValidada.pago;
      const factura = transaccionValidada.factura;

      if (pago) {
        try {
          pagoSchema.validateSync(pago);
        } catch (error) {
          console.warn('Advertencia en esquema de pago:', error.message);
        }
      }

      if (factura) {
        try {
          facturaSchema.validateSync(factura);
        } catch (error) {
          console.warn('Advertencia en esquema de factura:', error.message);
        }
      }

      if (reserva) {
        try {
          reservaSchema.validateSync(reserva);
        } catch (error) {
          console.warn('Advertencia en esquema de reserva:', error.message);
        }
      }

      return `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              background-color: #f8f9fa;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #4a90e2;
              padding-bottom: 20px;
            }
            .title {
              color: #2c3e50;
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .subtitle {
              color: #7f8c8d;
              font-size: 16px;
              margin: 5px 0 0 0;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              color: #2c3e50;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
              border-bottom: 1px solid #ecf0f1;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 8px 0;
            }
            .label {
              color: #7f8c8d;
              font-weight: bold;
              width: 40%;
            }
            .value {
              color: #2c3e50;
              font-weight: 600;
              width: 60%;
              text-align: right;
            }
            .highlight {
              background-color: #e3f2fd;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
            }
            .payment-section {
              background-color: #f0f9ff;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
              border-left: 4px solid #27ae60;
            }
            .invoice-section {
              background-color: #fff9f0;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
              border-left: 4px solid #f39c12;
            }
            .services-list {
              margin-top: 10px;
            }
            .service-item {
              margin-bottom: 5px;
              padding: 5px 0;
              border-bottom: 1px dotted #ddd;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #7f8c8d;
              font-size: 12px;
              border-top: 1px solid #ecf0f1;
              padding-top: 20px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              color: white;
              background-color: #27ae60;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">Comprobante de Pago y Reserva</h1>
              <p class="subtitle">Transacción completada exitosamente</p>
              ${transaccionValidada?.id ? `<p class="subtitle">ID Transacción: ${transaccionValidada.id}</p>` : ''}
              ${pago?.id ? `<p class="subtitle">ID Pago: ${pago.id}</p>` : ''}
              ${factura?.numeroFactura ? `<p class="subtitle">Factura: ${factura.numeroFactura}</p>` : ''}
            </div>
            
            <div class="section">
              <h2 class="section-title">Información de la Transacción</h2>
              <div class="info-row">
                <span class="label">Fecha de transacción:</span>
                <span class="value">${fecha}</span>
              </div>
              <div class="info-row">
                <span class="label">Importe total:</span>
                <span class="value">${precio}</span>
              </div>
              <div class="info-row">
                <span class="label">Usuario:</span>
                <span class="value">${nombreUsuario}</span>
              </div>
              ${emailUsuario ? `
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${emailUsuario}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="label">Método de Pago:</span>
                <span class="value">${pago?.metodoPago?.tipo || 'N/A'} •••• ${transaccionValidada?.metodo?.ultimosDigitos || pago?.metodoPago?.detalles?.ultimosDigitos || '****'}</span>
              </div>
              <div class="info-row">
                <span class="label">Estado:</span>
                <span class="value"><span class="status-badge">${pago?.estado || 'Completado'}</span></span>
              </div>
            </div>

            ${pago ? `
            <div class="section">
              <h2 class="section-title">Detalles del Pago</h2>
              <div class="payment-section">
                <div class="info-row">
                  <span class="label">ID de Pago:</span>
                  <span class="value">${pago.id || pago._id}</span>
                </div>
                <div class="info-row">
                  <span class="label">Monto:</span>
                  <span class="value">${pago.monto} ${pago.moneda || 'USD'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Concepto:</span>
                  <span class="value">${pago.conceptoPago || 'Reserva'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Fecha de pago:</span>
                  <span class="value">${new Date(pago.fecha).toLocaleDateString('es-ES')}</span>
                </div>
                ${pago.comprobante ? `
                <div class="info-row">
                  <span class="label">Comprobante:</span>
                  <span class="value">${pago.comprobante}</span>
                </div>
                ` : ''}
                ${pago.metodoPago?.detalles?.numeroAutorizacion ? `
                <div class="info-row">
                  <span class="label">Autorización:</span>
                  <span class="value">${pago.metodoPago.detalles.numeroAutorizacion}</span>
                </div>
                ` : ''}
              </div>
            </div>
            ` : ''}

            ${factura ? `
            <div class="section">
              <h2 class="section-title">Información de Facturación</h2>
              <div class="invoice-section">
                <div class="info-row">
                  <span class="label">Número de Factura:</span>
                  <span class="value">${factura.numeroFactura}</span>
                </div>
                <div class="info-row">
                  <span class="label">Fecha de Emisión:</span>
                  <span class="value">${new Date(factura.fechaEmision).toLocaleDateString('es-ES')}</span>
                </div>
                <div class="info-row">
                  <span class="label">Fecha de Vencimiento:</span>
                  <span class="value">${new Date(factura.fechaVencimiento).toLocaleDateString('es-ES')}</span>
                </div>
                <div class="info-row">
                  <span class="label">Estado:</span>
                  <span class="value"><span class="status-badge">${factura.estado || 'Pagada'}</span></span>
                </div>
                <div class="info-row">
                  <span class="label">Subtotal:</span>
                  <span class="value">${factura.subtotal}</span>
                </div>
                ${factura.descuentoTotal > 0 ? `
                <div class="info-row">
                  <span class="label">Descuento:</span>
                  <span class="value">-${factura.descuentoTotal}</span>
                </div>
                ` : ''}
                <div class="info-row">
                  <span class="label">Total:</span>
                  <span class="value"><strong>${factura.total}</strong></span>
                </div>
              </div>
            </div>
            ` : ''}

            ${reserva ? `
            <div class="section">
              <h2 class="section-title">Detalles de la Reserva</h2>
              <div class="highlight">
                <div class="info-row">
                  <span class="label">Espacio:</span>
                  <span class="value">${reserva.espacioNombre || reserva.entidadReservada?.nombre || transaccionValidada?.oficina?.nombre}</span>
                </div>
                <div class="info-row">
                  <span class="label">Tipo de espacio:</span>
                  <span class="value">${reserva.entidadReservada?.tipo || 'Espacio'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Fecha de reserva:</span>
                  <span class="value">${reserva.fecha}</span>
                </div>
                <div class="info-row">
                  <span class="label">Horario:</span>
                  <span class="value">${reserva.horaInicio} - ${reserva.horaFin}</span>
                </div>
                <div class="info-row">
                  <span class="label">Número de personas:</span>
                  <span class="value">${reserva.cantidadPersonas}</span>
                </div>
                <div class="info-row">
                  <span class="label">Estado:</span>
                  <span class="value"><span class="status-badge">${reserva.estado || 'Confirmada'}</span></span>
                </div>
                <div class="info-row">
                  <span class="label">Tipo de reserva:</span>
                  <span class="value">${reserva.tipoReserva || 'N/A'}</span>
                </div>
              </div>
              
              ${reserva.serviciosAdicionales && reserva.serviciosAdicionales.length > 0 ? `
              <h3 style="color: #2c3e50; margin-top: 20px; margin-bottom: 10px;">Servicios Adicionales</h3>
              <div class="services-list">
                ${reserva.serviciosAdicionales.map(servicio => `
                  <div class="service-item">
                    <div class="info-row">
                      <span class="label">${servicio.nombre}:</span>
                      <span class="value">${servicio.precio}/${servicio.unidadPrecio}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
              ` : ''}
            </div>
            ` : ''}
            
            <div class="footer">
              <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
              <p>Para cualquier consulta, contacta a nuestro equipo de soporte</p>
              ${emailUsuario ? `<p>Email de contacto: ${emailUsuario}</p>` : ''}
              ${pago?.id ? `<p>Referencia de pago: ${pago.id}</p>` : ''}
              ${factura?.numeroFactura ? `<p>Número de factura: ${factura.numeroFactura}</p>` : ''}
            </div>
          </div>
        </body>
      </html>
    `;
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error(`Error al generar el comprobante: ${error.message}`);
    }
  }, [transaccionValidada, obtenerNombreUsuario, obtenerEmailUsuario]);

  const handleImprimir = async () => {
    try {

      if (!transaccionValidada) {
        Alert.alert('Error', 'Datos de transacción no válidos para imprimir');
        return;
      }

      const htmlContent = generarPDFContent();

      if (!htmlContent || htmlContent.trim().length === 0) {
        throw new Error('El contenido HTML está vacío');
      }

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      if (!uri) {
        throw new Error('No se pudo generar el archivo PDF');
      }

      await Print.printAsync({ uri });

    } catch (error) {
      const msg = error?.message ?? '';
    }
  };

  const handleCompartir = async () => {
    try {

      if (!transaccionValidada) {
        console.error('No hay transacción validada para compartir');
        Alert.alert('Error', 'Datos de transacción no válidos para compartir');
        return;
      }

      const htmlContent = generarPDFContent();

      if (!htmlContent || htmlContent.trim().length === 0) {
        throw new Error('El contenido HTML está vacío');
      }

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      if (!uri) {
        throw new Error('No se pudo generar el archivo PDF temporal');
      }

      const reservaId = transaccionValidada?.reserva?.id ?
        `_${transaccionValidada.reserva.id.slice(-6)}` : '';
      const pagoId = transaccionValidada?.pago?.id ?
        `_${transaccionValidada.pago.id.slice(-6)}` : '';
      const fechaLimpia = transaccionValidada?.fecha?.replace(/\//g, '-') ||
        new Date().toLocaleDateString('es-ES').replace(/\//g, '-');

      const fileName = `comprobante${reservaId}${pagoId}_${fechaLimpia}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });

      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir comprobante de pago y reserva',
        });
      } else {
        console.warn('Función de compartir no disponible en este dispositivo');
        Alert.alert(
          'Compartir no disponible',
          'La función de compartir no está disponible en este dispositivo.',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('Error en handleCompartir:', error);
      const msg = error?.message || '';

      Alert.alert(
        'Error al Compartir',
        `No se pudo compartir el comprobante: ${msg || 'Error desconocido'}`,
        [{ text: 'OK' }]
      );
    }
  };

  if (!transaccionValidada && !erroresValidacion.transaccion) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleVolver} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#4a90e2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#e74c3c" />
          <Text style={styles.errorText}>No se encontraron datos de transacción válidos</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleVolver}>
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleVolver}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {transaccionValidada?.reserva ? 'Comprobante de Pago' : 'Transacción'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.transaccionContainer}>
          <Text style={styles.sectionTitle}>Información de la transacción</Text>

          <View style={styles.transaccionItem}>
            <View style={styles.transaccionIcono}>
              <Ionicons name="calendar-outline" size={20} color="#4a90e2" />
            </View>
            <View style={styles.transaccionInfo}>
              <Text style={styles.transaccionLabel}>Fecha de transacción</Text>
              <Text style={styles.transaccionValor}>
                {transaccionValidada?.fecha || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.transaccionItem}>
            <View style={styles.transaccionIcono}>
              <Ionicons name="card-outline" size={20} color="#4a90e2" />
            </View>
            <View style={styles.transaccionInfo}>
              <Text style={styles.transaccionLabel}>Importe total</Text>
              <Text style={styles.transaccionValor}>
                {transaccionValidada?.precio || '$0.00'}
              </Text>
            </View>
          </View>

          <View style={styles.transaccionItem}>
            <View style={styles.transaccionIcono}>
              <Ionicons name="person-outline" size={20} color="#4a90e2" />
            </View>
            <View style={styles.transaccionInfo}>
              <Text style={styles.transaccionLabel}>Usuario</Text>
              <Text style={styles.transaccionValor}>
                {obtenerNombreUsuario()}
              </Text>
            </View>
          </View>

          {obtenerEmailUsuario() && (
            <View style={styles.transaccionItem}>
              <View style={styles.transaccionIcono}>
                <Ionicons name="mail-outline" size={20} color="#4a90e2" />
              </View>
              <View style={styles.transaccionInfo}>
                <Text style={styles.transaccionLabel}>Email</Text>
                <Text style={styles.transaccionValor}>
                  {obtenerEmailUsuario()}
                </Text>
              </View>
            </View>
          )}

          <View style={[styles.transaccionItem, styles.lastItem]}>
            <View style={styles.transaccionIcono}>
              <Ionicons name="card" size={20} color="#4a90e2" />
            </View>
            <View style={styles.transaccionInfo}>
              <Text style={styles.transaccionLabel}>Método de pago</Text>
              <Text style={styles.transaccionValor}>
                {transaccionValidada?.pago?.metodoPago?.tipo || 'Tarjeta'} {transaccionValidada?.metodo?.ultimosDigitos || transaccionValidada?.pago?.metodoPago?.detalles?.ultimosDigitos || '****'}
              </Text>
            </View>
          </View>
        </View>

        {transaccionValidada?.pago && (
          <View style={styles.pagoContainer}>
            <Text style={styles.sectionTitle}>Detalles del Pago</Text>

            <View style={styles.pagoHighlight}>
              <View style={styles.pagoItem}>
                <View style={styles.pagoIcono}>
                  <Ionicons name="cash-outline" size={20} color="#27ae60" />
                </View>
                <View style={styles.pagoInfo}>
                  <Text style={styles.pagoLabel}>ID de Pago</Text>
                  <Text style={styles.pagoValor}>
                    {transaccionValidada.pago.id || transaccionValidada.pago._id}
                  </Text>
                </View>
              </View>

              <View style={styles.pagoItem}>
                <View style={styles.pagoIcono}>
                  <Ionicons name="pricetag-outline" size={20} color="#27ae60" />
                </View>
                <View style={styles.pagoInfo}>
                  <Text style={styles.pagoLabel}>Monto</Text>
                  <Text style={styles.pagoValor}>
                    ${transaccionValidada.pago.monto} {transaccionValidada.pago.moneda || 'USD'}
                  </Text>
                </View>
              </View>

              <View style={styles.pagoItem}>
                <View style={styles.pagoIcono}>
                  <Ionicons name="document-text-outline" size={20} color="#27ae60" />
                </View>
                <View style={styles.pagoInfo}>
                  <Text style={styles.pagoLabel}>Concepto</Text>
                  <Text style={styles.pagoValor}>
                    {transaccionValidada.pago.conceptoPago || 'Reserva'}
                  </Text>
                </View>
              </View>

              <View style={styles.pagoItem}>
                <View style={styles.pagoIcono}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#27ae60" />
                </View>
                <View style={styles.pagoInfo}>
                  <Text style={styles.pagoLabel}>Estado</Text>
                  <Text style={styles.pagoValor}>
                    {transaccionValidada.pago.estado || 'Completado'}
                  </Text>
                </View>
              </View>

              {transaccionValidada.pago.comprobante && (
                <View style={styles.pagoItem}>
                  <View style={styles.pagoIcono}>
                    <Ionicons name="receipt-outline" size={20} color="#27ae60" />
                  </View>
                  <View style={styles.pagoInfo}>
                    <Text style={styles.pagoLabel}>Comprobante</Text>
                    <Text style={styles.pagoValor}>
                      {transaccionValidada.pago.comprobante}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {transaccionValidada?.factura && (
          <View style={styles.facturaContainer}>
            <Text style={styles.sectionTitle}>Información de Facturación</Text>

            <View style={styles.facturaHighlight}>
              <View style={styles.facturaItem}>
                <View style={styles.facturaIcono}>
                  <Ionicons name="document-outline" size={20} color="#f39c12" />
                </View>
                <View style={styles.facturaInfo}>
                  <Text style={styles.facturaLabel}>Número de Factura</Text>
                  <Text style={styles.facturaValor}>
                    {transaccionValidada.factura.numeroFactura}
                  </Text>
                </View>
              </View>

              <View style={styles.facturaItem}>
                <View style={styles.facturaIcono}>
                  <Ionicons name="calendar-outline" size={20} color="#f39c12" />
                </View>
                <View style={styles.facturaInfo}>
                  <Text style={styles.facturaLabel}>Fecha de Emisión</Text>
                  <Text style={styles.facturaValor}>
                    {new Date(transaccionValidada.factura.fechaEmision).toLocaleDateString('es-ES')}
                  </Text>
                </View>
              </View>

              <View style={styles.facturaItem}>
                <View style={styles.facturaIcono}>
                  <Ionicons name="time-outline" size={20} color="#f39c12" />
                </View>
                <View style={styles.facturaInfo}>
                  <Text style={styles.facturaLabel}>Fecha de Vencimiento</Text>
                  <Text style={styles.facturaValor}>
                    {new Date(transaccionValidada.factura.fechaVencimiento).toLocaleDateString('es-ES')}
                  </Text>
                </View>
              </View>

              <View style={styles.facturaItem}>
                <View style={styles.facturaIcono}>
                  <Ionicons name="pricetag-outline" size={20} color="#f39c12" />
                </View>
                <View style={styles.facturaInfo}>
                  <Text style={styles.facturaLabel}>Total</Text>
                  <Text style={styles.facturaValor}>
                    ${transaccionValidada.factura.total}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {transaccionValidada?.reserva && (
          <View style={styles.reservaContainer}>
            <Text style={styles.sectionTitle}>Detalles de la reserva</Text>

            <View style={styles.reservaHighlight}>
              <View style={styles.reservaItem}>
                <View style={styles.reservaIcono}>
                  <Ionicons name="business-outline" size={20} color="#4a90e2" />
                </View>
                <View style={styles.reservaInfo}>
                  <Text style={styles.reservaLabel}>Espacio reservado</Text>
                  <Text style={styles.reservaValor}>
                    {transaccionValidada.reserva.espacioNombre ||
                      transaccionValidada.reserva.entidadReservada?.nombre ||
                      transaccionValidada?.oficina?.nombre ||
                      'N/A'}
                  </Text>
                </View>
              </View>

              {transaccionValidada.reserva.entidadReservada?.tipo && (
                <View style={styles.reservaItem}>
                  <View style={styles.reservaIcono}>
                    <Ionicons name="albums-outline" size={20} color="#4a90e2" />
                  </View>
                  <View style={styles.reservaInfo}>
                    <Text style={styles.reservaLabel}>Tipo de espacio</Text>
                    <Text style={styles.reservaValor}>
                      {transaccionValidada.reserva.entidadReservada.tipo}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.reservaItem}>
                <View style={styles.reservaIcono}>
                  <Ionicons name="today-outline" size={20} color="#4a90e2" />
                </View>
                <View style={styles.reservaInfo}>
                  <Text style={styles.reservaLabel}>Fecha de reserva</Text>
                  <Text style={styles.reservaValor}>{transaccionValidada.reserva.fecha}</Text>
                </View>
              </View>

              <View style={styles.reservaItem}>
                <View style={styles.reservaIcono}>
                  <Ionicons name="time-outline" size={20} color="#4a90e2" />
                </View>
                <View style={styles.reservaInfo}>
                  <Text style={styles.reservaLabel}>Horario</Text>
                  <Text style={styles.reservaValor}>
                    {transaccionValidada.reserva.horaInicio} - {transaccionValidada.reserva.horaFin}
                  </Text>
                </View>
              </View>

              <View style={styles.reservaItem}>
                <View style={styles.reservaIcono}>
                  <Ionicons name="people-outline" size={20} color="#4a90e2" />
                </View>
                <View style={styles.reservaInfo}>
                  <Text style={styles.reservaLabel}>Número de personas</Text>
                  <Text style={styles.reservaValor}>{transaccionValidada.reserva.cantidadPersonas}</Text>
                </View>
              </View>

              <View style={styles.reservaItem}>
                <View style={styles.reservaIcono}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#4a90e2" />
                </View>
                <View style={styles.reservaInfo}>
                  <Text style={styles.reservaLabel}>Estado</Text>
                  <Text style={styles.reservaValor}>
                    {transaccionValidada.reserva.estado || 'Confirmada'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.botonesContainer}>
          <TouchableOpacity
            style={styles.botonImprimir}
            onPress={handleImprimir}
            activeOpacity={0.7}
          >
            <Ionicons name="print-outline" size={20} color="#fff" style={styles.iconoBoton} />
            <Text style={styles.textoBotonImprimir}>Imprimir comprobante</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonCompartir}
            onPress={handleCompartir}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={20} color="#fff" style={styles.iconoBoton} />
            <Text style={styles.textoBotonCompartir}>Compartir comprobante</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoAdicionalContainer}>
          <Text style={styles.infoAdicionalTitulo}>Información adicional</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcono}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#666" />
            </View>
            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>Estado</Text>
              <Text style={styles.infoValor}>Transacción completada</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcono}>
              <Ionicons name="pricetag-outline" size={16} color="#666" />
            </View>
            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>Categoría</Text>
              <Text style={styles.infoValor}>
                {transaccionValidada?.reserva ? 'Reserva de espacio' : 'Compra'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcono}>
              <Ionicons name="time-outline" size={16} color="#666" />
            </View>
            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>Procesado</Text>
              <Text style={styles.infoValor}>
                {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          {transaccionValidada?.pago?.id && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcono}>
                <Ionicons name="card-outline" size={16} color="#666" />
              </View>
              <View style={styles.infoTexto}>
                <Text style={styles.infoLabel}>ID de Pago</Text>
                <Text style={styles.infoValor}>
                  {transaccionValidada.pago.id || transaccionValidada.pago._id}
                </Text>
              </View>
            </View>
          )}

          {transaccionValidada?.factura?.numeroFactura && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcono}>
                <Ionicons name="document-outline" size={16} color="#666" />
              </View>
              <View style={styles.infoTexto}>
                <Text style={styles.infoLabel}>Factura</Text>
                <Text style={styles.infoValor}>
                  {transaccionValidada.factura.numeroFactura}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.problemaContainer}>
          <TouchableOpacity
            style={styles.problemaLink}
            onPress={handleReportarProblema}
            activeOpacity={0.7}
          >
            <Text style={styles.problemaTexto}>
              ¿Tienes un problema con esta {transaccionValidada?.reserva ? 'reserva' : 'transacción'}?
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.botonContinuarTransaccion}
          onPress={handleVolver}
          activeOpacity={0.7}
        >
          <Text style={styles.textoBotonContinuar}>Continuar</Text>
        </TouchableOpacity>
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
  transaccionContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    fontFamily: 'System',
  },
  transaccionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  transaccionIcono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transaccionInfo: {
    flex: 1,
  },
  transaccionLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'System',
    marginBottom: 2,
  },
  transaccionValor: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    fontFamily: 'System',
  },

  pagoContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pagoHighlight: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  pagoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1f5fe',
  },
  pagoIcono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pagoInfo: {
    flex: 1,
  },
  pagoLabel: {
    fontSize: 13,
    color: '#27ae60',
    fontFamily: 'System',
    marginBottom: 2,
    fontWeight: '600',
  },
  pagoValor: {
    fontSize: 15,
    color: '#1565c0',
    fontWeight: '600',
    fontFamily: 'System',
  },

  facturaContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  facturaHighlight: {
    backgroundColor: '#fff9f0',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  facturaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fef5e7',
  },
  facturaIcono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  facturaInfo: {
    flex: 1,
  },
  facturaLabel: {
    fontSize: 13,
    color: '#f39c12',
    fontFamily: 'System',
    marginBottom: 2,
    fontWeight: '600',
  },
  facturaValor: {
    fontSize: 15,
    color: '#d68910',
    fontWeight: '600',
    fontFamily: 'System',
  },

  reservaContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reservaHighlight: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  reservaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1f5fe',
  },
  reservaIcono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reservaInfo: {
    flex: 1,
  },
  reservaLabel: {
    fontSize: 13,
    color: '#4a90e2',
    fontFamily: 'System',
    marginBottom: 2,
    fontWeight: '600',
  },
  reservaValor: {
    fontSize: 15,
    color: '#1565c0',
    fontWeight: '600',
    fontFamily: 'System',
  },
  serviciosContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#fafafa',
    borderRadius: 8,
  },
  serviciosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    fontFamily: 'System',
  },
  servicioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  servicioInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicioNombre: {
    fontSize: 14,
    color: '#2c3e50',
    fontFamily: 'System',
  },
  servicioPrecio: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
    fontFamily: 'System',
  },

  botonVerDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#e3e3e3',
  },
  textoBotonVerDetalle: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'System',
  },

  botonesContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  botonImprimir: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotonImprimir: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
  botonCompartir: {
    backgroundColor: '#2c3e50',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotonCompartir: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
  iconoBoton: {
    marginRight: 8,
  },
  infoAdicionalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoAdicionalTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    fontFamily: 'System',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcono: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTexto: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  infoValor: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    fontFamily: 'System',
  },
  problemaContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  problemaLink: {
    padding: 10,
  },
  problemaTexto: {
    fontSize: 14,
    color: '#4a90e2',
    fontFamily: 'System',
    textDecorationLine: 'underline',
  },
  botonContinuarTransaccion: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textoBotonContinuar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 20,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 10,
    flex: 1,
  },
  facturaContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  facturaHighlight: {
    backgroundColor: '#fff9f0',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  facturaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fef5e7',
  },
  facturaIcono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  facturaInfo: {
    flex: 1,
  },
  facturaLabel: {
    fontSize: 13,
    color: '#f39c12',
    fontFamily: 'System',
    marginBottom: 2,
    fontWeight: '600',
  },
  facturaValor: {
    fontSize: 15,
    color: '#d68910',
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default Transacciones;