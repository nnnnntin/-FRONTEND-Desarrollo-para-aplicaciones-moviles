import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import {
  obtenerReservasPorUsuario
} from '../store/slices/reservasSlice';

const reservaBackendSchema = yup.object({
  _id: yup.string().nullable(),
  id: yup.string().nullable(),
  
  
  fechaInicio: yup.date().nullable(),
  fecha: yup.date().nullable(), 
  fechaReserva: yup.date().nullable(),
  
  horaInicio: yup
    .string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido')
    .nullable(),
  
  horaFin: yup
    .string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido')
    .nullable(),
  
  estado: yup
    .string()
    .test('estado-reserva-valido', 'Estado de reserva no válido', function(value) {
      if (!value) return true; 
      const estadosValidos = [
        'pendiente', 'confirmada', 'aprobada', 'finalizada', 
        'completada', 'cancelada', 'rechazada'
      ];
      return estadosValidos.includes(value);
    })
    .default('pendiente'),
  
  cantidadPersonas: yup
    .number()
    .min(1, 'Debe haber al menos 1 persona')
    .max(100, 'Cantidad de personas excesiva')
    .integer('Debe ser un número entero')
    .default(1),
  
  precioTotal: yup.number().min(0, 'El precio no puede ser negativo').nullable(),
  montoTotal: yup.number().min(0, 'El monto no puede ser negativo').nullable(),
  precio: yup.number().min(0, 'El precio no puede ser negativo').nullable(),
  
  entidadReservada: yup.object({
    id: yup.string().nullable(),
    nombre: yup.string().nullable(),
    tipo: yup.string().nullable(),
    ubicacion: yup.string().nullable(),
    capacidad: yup.number().min(1).nullable(),
    imagen: yup.string().url('URL de imagen inválida').nullable(),
    fotos: yup.array().of(yup.string().url()).nullable(),
    imagenes: yup.array().of(yup.string().url()).nullable(),
  }).nullable(),
  
  metodoPago: yup.string().nullable(),
  notas: yup.string().max(1000, 'Las notas no pueden exceder 1000 caracteres').nullable(),
  observaciones: yup.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').nullable(),
  
  reseña: yup.boolean().nullable(),
  calificacion: yup.number().min(1).max(5).nullable(),
  yaReseñada: yup.boolean().nullable(),
});


const reservaMapeadaSchema = yup.object({
  id: yup.string().required('ID de reserva es requerido'),
  
  fechaReserva: yup
    .string()
    .required('Fecha de reserva es requerida'),
  
  fechaReservaRaw: yup
    .date()
    .required('Fecha raw es requerida'),
  
  estado: yup
    .string()
    .test('estado-mapeado-valido', 'Estado no válido', function(value) {
      const estadosValidos = [
        'pendiente', 'confirmada', 'aprobada', 'finalizada', 
        'completada', 'cancelada', 'rechazada'
      ];
      return estadosValidos.includes(value);
    })
    .required('Estado es requerido'),
  
  oficina: yup.object({
    id: yup.string().required('ID de oficina es requerido'),
    nombre: yup.string().required('Nombre de oficina es requerido'),
    tipo: yup.string().required('Tipo de oficina es requerido'),
    ubicacion: yup.string().required('Ubicación es requerida'),
    imagen: yup.string().url('URL de imagen inválida').nullable(),
    capacidad: yup.number().min(1).required('Capacidad es requerida'),
  }).required('Datos de oficina son requeridos'),
  
  precio: yup.number().min(0).required('Precio es requerido'),
  cantidadPersonas: yup.number().min(1).required('Cantidad de personas es requerida'),
  
  horario: yup.string().nullable(),
  duracion: yup.string().nullable(),
  puedeReseñar: yup.boolean().required('Flag de reseña es requerido'),
  yaReseñada: yup.boolean().required('Flag de ya reseñada es requerido'),
  
  codigoReserva: yup.string().required('Código de reserva es requerido'),
});


const reseñaSchema = yup.object({
  calificacion: yup
    .number()
    .required('La calificación es obligatoria')
    .min(1, 'La calificación mínima es 1 estrella')
    .max(5, 'La calificación máxima es 5 estrellas')
    .integer('La calificación debe ser un número entero'),
  
  comentario: yup
    .string()
    .max(500, 'El comentario no puede exceder 500 caracteres')
    .nullable(),
  
  reservaId: yup
    .string()
    .required('ID de reserva es requerido'),
});


const filtroReservasSchema = yup.object({
  tipo: yup
    .string()
    .test('tipo-filtro-valido', 'Tipo de filtro no válido', function(value) {
      if (!value) return true; 
      const tiposValidos = ['todas', 'proximas', 'pasadas'];
      return tiposValidos.includes(value);
    })
    .default('todas'),
  
  estado: yup
    .string()
    .test('estado-filtro-valido', 'Estado de filtro no válido', function(value) {
      if (!value) return true; 
      const estadosValidos = [
        'todos', 'pendiente', 'confirmada', 'aprobada', 
        'finalizada', 'completada', 'cancelada', 'rechazada'
      ];
      return estadosValidos.includes(value);
    })
    .default('todos'),
  
  fechaDesde: yup.date().nullable(),
  fechaHasta: yup.date().nullable(),
});

const Reservas = ({ navigation }) => {
  const dispatch = useDispatch();
  const usuario = useSelector(state => state.auth.usuario);
  const reservasRaw = useSelector(state => state.reservas.reservas);
  const loading = useSelector(state => state.reservas.loading);

  
  const [modalReseña, setModalReseña] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [datosReseña, setDatosReseña] = useState({
    calificacion: 0,
    comentario: '',
  });
  const [filtroActivo, setFiltroActivo] = useState('todas');
  const [enviandoReseña, setEnviandoReseña] = useState(false);
  
  
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (usuario?.id || usuario?._id) {
      const userId = usuario.id || usuario._id;
      dispatch(obtenerReservasPorUsuario(userId));
    }
  }, [usuario, dispatch]);

  
  useEffect(() => {
    validarUsuario();
  }, [usuario]);

  
  const validarUsuario = async () => {
    try {
      await yup.object().shape({
        id: yup.string().nullable(),
        _id: yup.string().nullable(),
      }).test('tiene-id', 'Usuario debe tener ID', function(value) {
        return value.id || value._id;
      }).validate(usuario);
      
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.usuario;
        return newErrors;
      });
    } catch (error) {
      setValidationErrors(prev => ({
        ...prev,
        usuario: error.message
      }));
    }
  };

  
  const validarReservaBackend = async (reserva) => {
    try {
      await reservaBackendSchema.validate(reserva);
      return { valida: true, errores: null };
    } catch (error) {
      console.warn('Reserva inválida del backend:', reserva, error.message);
      return { valida: false, errores: error.message };
    }
  };

  
  const validarReservaMapeada = async (reserva) => {
    try {
      await reservaMapeadaSchema.validate(reserva);
      return { valida: true, errores: null };
    } catch (error) {
      console.warn('Reserva mapeada inválida:', reserva, error.message);
      return { valida: false, errores: error.message };
    }
  };

  
  const validarReseña = async (datos) => {
    try {
      await reseñaSchema.validate(datos);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        ['calificacion', 'comentario'].forEach(field => {
          delete newErrors[field];
        });
        return newErrors;
      });
      return true;
    } catch (error) {
      const errors = {};
      if (error.inner) {
        error.inner.forEach(err => {
          errors[err.path] = err.message;
        });
      } else {
        errors.general = error.message;
      }
      setValidationErrors(prev => ({ ...prev, ...errors }));
      return false;
    }
  };

  
  const updateDatosReseña = (field, value) => {
    setDatosReseña(prev => ({ ...prev, [field]: value }));
    
    
    const timeoutId = setTimeout(() => {
      const datosCompletos = { 
        ...datosReseña, 
        [field]: value,
        reservaId: reservaSeleccionada?.id || ''
      };
      validarReseña(datosCompletos);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const formatearFecha = fecha => {
    if (!fecha) return 'Fecha no disponible';
    
    
    try {
      yup.date().required().validateSync(fecha);
    } catch (error) {
      return 'Fecha no disponible';
    }
    
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) return 'Fecha no disponible';

    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearHorario = (horaInicio, horaFin) => {
    
    const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!horaInicio || !horaFin) return '';
    if (!horaRegex.test(horaInicio) || !horaRegex.test(horaFin)) return '';
    
    return `${horaInicio} - ${horaFin}`;
  };

  const calcularDuracion = (horaInicio, horaFin) => {
    if (!horaInicio || !horaFin) return '';

    
    const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(horaInicio) || !horaRegex.test(horaFin)) return '';

    try {
      const inicio = horaInicio.split(':');
      const fin = horaFin.split(':');
      const horaInicioNum = parseInt(inicio[0]);
      const horaFinNum = parseInt(fin[0]);
      const minutoInicioNum = parseInt(inicio[1] || 0);
      const minutoFinNum = parseInt(fin[1] || 0);

      const totalMinutosInicio = horaInicioNum * 60 + minutoInicioNum;
      const totalMinutosFin = horaFinNum * 60 + minutoFinNum;
      const duracionMinutos = totalMinutosFin - totalMinutosInicio;

      if (duracionMinutos <= 0) return '';

      const horas = Math.floor(duracionMinutos / 60);
      const minutos = duracionMinutos % 60;

      if (horas > 0 && minutos > 0) {
        return `${horas}h ${minutos}m`;
      } else if (horas > 0) {
        return `${horas} hora${horas !== 1 ? 's' : ''}`;
      } else {
        return `${minutos} minutos`;
      }
    } catch (error) {
      console.error('Error calculando duración:', error);
      return '';
    }
  };

  const obtenerNombreEspacio = (entidadReservada) => {
    if (!entidadReservada) return 'Espacio no especificado';

    
    try {
      yup.object().shape({
        nombre: yup.string().nullable(),
        tipo: yup.string().nullable(),
        id: yup.string().nullable(),
      }).validateSync(entidadReservada);
    } catch (error) {
      return 'Espacio inválido';
    }

    const { tipo, nombre, id } = entidadReservada;

    if (nombre && nombre.trim()) return nombre.trim();

    const idCorto = id ? id.slice(-4) : 'XXXX';

    switch (tipo?.toLowerCase()) {
      case 'oficina':
        return `Oficina ${idCorto}`;
      case 'sala':
      case 'sala_reuniones':
        return `Sala de reuniones ${idCorto}`;
      case 'escritorio':
        return `Escritorio ${idCorto}`;
      case 'sala_conferencias':
        return `Sala de conferencias ${idCorto}`;
      case 'coworking':
        return `Espacio coworking ${idCorto}`;
      default:
        return `${tipo || 'Espacio'} ${idCorto}`;
    }
  };

  const obtenerImagenEspacio = (entidadReservada) => {
    if (!entidadReservada) return null;

    const imageArrays = ['fotos', 'imagenes', 'fotosPrincipales'];

    
    for (const arrayName of imageArrays) {
      if (Array.isArray(entidadReservada[arrayName]) && entidadReservada[arrayName].length > 0) {
        const imagen = entidadReservada[arrayName][0];
        
        
        try {
          if (typeof imagen === 'string' && imagen.trim()) {
            yup.string().url().validateSync(imagen.trim());
            return imagen.trim();
          }
          if (typeof imagen === 'object' && imagen !== null) {
            if (imagen.url && typeof imagen.url === 'string' && imagen.url.trim()) {
              yup.string().url().validateSync(imagen.url.trim());
              return imagen.url.trim();
            }
            if (imagen.uri && typeof imagen.uri === 'string' && imagen.uri.trim()) {
              yup.string().url().validateSync(imagen.uri.trim());
              return imagen.uri.trim();
            }
          }
        } catch (error) {
          console.warn('URL de imagen inválida:', imagen);
          continue;
        }
      }
    }

    const imageProperties = ['imagen', 'foto', 'picture', 'thumbnail'];

    
    for (const propName of imageProperties) {
      if (entidadReservada[propName]) {
        const imagen = entidadReservada[propName];
        
        try {
          if (typeof imagen === 'string' && imagen.trim()) {
            yup.string().url().validateSync(imagen.trim());
            return imagen.trim();
          }
          if (typeof imagen === 'object' && imagen !== null) {
            if (imagen.url && typeof imagen.url === 'string' && imagen.url.trim()) {
              yup.string().url().validateSync(imagen.url.trim());
              return imagen.url.trim();
            }
            if (imagen.uri && typeof imagen.uri === 'string' && imagen.uri.trim()) {
              yup.string().url().validateSync(imagen.uri.trim());
              return imagen.uri.trim();
            }
          }
        } catch (error) {
          console.warn('URL de imagen inválida:', imagen);
          continue;
        }
      }
    }

    return null;
  };

  const mapearReserva = async (reservaBackend) => {
    
    const validacionBackend = await validarReservaBackend(reservaBackend);
    if (!validacionBackend.valida) {
      console.warn('Reserva del backend inválida:', validacionBackend.errores);
      return null;
    }

    try {
      const fuente = reservaBackend.fechaInicio || reservaBackend.fecha || reservaBackend.fechaReserva;
      const fechaReserva = formatearFecha(fuente);
      const fechaReservaRaw = fuente ? new Date(fuente) : new Date();

      const nombreEspacio = obtenerNombreEspacio(reservaBackend.entidadReservada);
      const tipoEspacio = reservaBackend.entidadReservada?.tipo || 'oficina';
      const ubicacionEspacio = reservaBackend.entidadReservada?.ubicacion ||
        reservaBackend.ubicacion ||
        'Ubicación no especificada';

      const imagenEspacio = obtenerImagenEspacio(reservaBackend.entidadReservada);

      const horario = formatearHorario(reservaBackend.horaInicio, reservaBackend.horaFin);
      const duracion = calcularDuracion(reservaBackend.horaInicio, reservaBackend.horaFin);

      const estado = reservaBackend.estado || 'pendiente';
      const yaReseñada = reservaBackend.reseña ||
        reservaBackend.calificacion ||
        reservaBackend.yaReseñada ||
        false;
      const puedeReseñar = ['completada', 'finalizada'].includes(estado) && !yaReseñada;

      const precio = reservaBackend.precioTotal ||
        reservaBackend.montoTotal ||
        reservaBackend.precio ||
        0;

      const reservaMapeada = {
        id: reservaBackend._id || reservaBackend.id || `temp-${Date.now()}`,
        fechaReserva,
        fechaReservaRaw,
        duracion,
        horario,
        oficina: {
          id: reservaBackend.entidadReservada?.id || '',
          nombre: nombreEspacio,
          tipo: tipoEspacio,
          ubicacion: ubicacionEspacio,
          imagen: imagenEspacio,
          capacidad: reservaBackend.entidadReservada?.capacidad || reservaBackend.cantidadPersonas || 1
        },
        estado,
        puedeReseñar,
        yaReseñada,
        precio,
        metodoPago: reservaBackend.metodoPago || '',
        notas: reservaBackend.notas ||
          reservaBackend.observaciones ||
          reservaBackend.proposito ||
          '',
        cantidadPersonas: reservaBackend.cantidadPersonas || 1,
        tipoReserva: reservaBackend.tipoReserva || 'dia',
        descuento: reservaBackend.descuento || null,
        codigoReserva: reservaBackend.codigoReserva ||
          reservaBackend.numeroReserva ||
          `RES-${(reservaBackend._id || reservaBackend.id || '').slice(-6).toUpperCase()}`,
        fechaCreacion: reservaBackend.fechaCreacion || reservaBackend.createdAt,
        fechaActualizacion: reservaBackend.fechaActualizacion || reservaBackend.updatedAt,
        datosCompletos: reservaBackend
      };

      
      const validacionMapeada = await validarReservaMapeada(reservaMapeada);
      if (!validacionMapeada.valida) {
        console.warn('Reserva mapeada inválida:', validacionMapeada.errores);
        return null;
      }

      return reservaMapeada;
    } catch (error) {
      console.error('Error mapeando reserva:', error);
      return null;
    }
  };

  const reservas = useMemo(async () => {
    if (!Array.isArray(reservasRaw)) {
      return [];
    }

    const reservasMapeadas = await Promise.all(
      reservasRaw.map(async (reserva) => {
        const reservaMapeada = await mapearReserva(reserva);
        return reservaMapeada;
      })
    );

    
    const reservasValidas = reservasMapeadas
      .filter(reserva => reserva !== null)
      .sort((a, b) => b.fechaReservaRaw - a.fechaReservaRaw);

    return reservasValidas;
  }, [reservasRaw]);

  
  const [reservasProcesadas, setReservasProcesadas] = useState([]);

  
  useEffect(() => {
    const procesarReservas = async () => {
      const reservasResult = await reservas;
      setReservasProcesadas(reservasResult);
    };
    
    procesarReservas();
  }, [reservas]);

  const esFechaProxima = fecha => {
    try {
      yup.date().required().validateSync(fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaReserva = new Date(fecha);
      fechaReserva.setHours(0, 0, 0, 0);
      return fechaReserva >= hoy;
    } catch (error) {
      return false;
    }
  };

  const getReservasFiltradas = () => {
    
    try {
      filtroReservasSchema.fields.tipo.validateSync(filtroActivo);
    } catch (error) {
      console.warn('Filtro inválido, usando "todas":', error.message);
      setFiltroActivo('todas');
      return reservasProcesadas;
    }

    if (filtroActivo === 'proximas') {
      return reservasProcesadas.filter(r =>
        esFechaProxima(r.fechaReservaRaw) &&
        !['finalizada', 'completada', 'cancelada'].includes(r.estado)
      );
    }
    if (filtroActivo === 'pasadas') {
      return reservasProcesadas.filter(r =>
        !esFechaProxima(r.fechaReservaRaw) ||
        ['finalizada', 'completada', 'cancelada'].includes(r.estado)
      );
    }
    return reservasProcesadas;
  };

  const handleVolver = () => navigation.popToTop();

  const handleReservaPress = reserva => {
    
    validarReservaMapeada(reserva).then(resultado => {
      if (resultado.valida) {
        navigation.navigate('DetalleReserva', {
          reserva,
          reservaCompleta: reserva.datosCompletos
        });
      } else {
        Alert.alert('Error', 'Datos de reserva inválidos');
      }
    });
  };

  const handleReseñar = reserva => {
    
    if (!reserva.puedeReseñar) {
      Alert.alert('Error', 'Esta reserva no se puede reseñar');
      return;
    }

    if (reserva.yaReseñada) {
      Alert.alert('Error', 'Ya has reseñado esta reserva');
      return;
    }

    setReservaSeleccionada(reserva);
    setModalReseña(true);
    setDatosReseña({
      calificacion: 0,
      comentario: '',
    });
    setValidationErrors({});
  };

  const handleEnviarReseña = async () => {
    
    const datosCompletos = {
      ...datosReseña,
      reservaId: reservaSeleccionada?.id || ''
    };

    const esValida = await validarReseña(datosCompletos);
    if (!esValida) {
      Alert.alert('Error de validación', 'Por favor corrige los errores en el formulario');
      return;
    }

    if (datosReseña.calificacion === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    try {
      setEnviandoReseña(true);
      
      
      await new Promise(res => setTimeout(res, 1000));

      Alert.alert('Reseña enviada', 'Gracias por tu opinión', [
        {
          text: 'OK', onPress: () => {
            setModalReseña(false);
            const userId = usuario?.id || usuario?._id;
            if (userId) {
              dispatch(obtenerReservasPorUsuario(userId));
            }
          }
        }
      ]);
    } catch (error) {
      console.error('Error enviando reseña:', error);
      Alert.alert('Error', 'No se pudo enviar la reseña');
    } finally {
      setEnviandoReseña(false);
    }
  };

  const handleFiltroChange = async (filtro) => {
    
    try {
      await filtroReservasSchema.fields.tipo.validate(filtro);
      setFiltroActivo(filtro);
    } catch (error) {
      Alert.alert('Error', 'Filtro no válido');
    }
  };

  const getEstadoBadge = estado => {
    
    const estadosValidos = [
      'pendiente', 'confirmada', 'aprobada', 'finalizada', 
      'completada', 'cancelada', 'rechazada'
    ];

    const estadoLower = estado?.toLowerCase();
    if (!estadosValidos.includes(estadoLower)) {
      return { backgroundColor: '#95a5a6', text: 'Estado inválido' };
    }

    switch (estadoLower) {
      case 'pendiente':
        return { backgroundColor: '#f39c12', text: 'Pendiente' };
      case 'confirmada':
      case 'aprobada':
        return { backgroundColor: '#3498db', text: 'Confirmada' };
      case 'finalizada':
      case 'completada':
        return { backgroundColor: '#27ae60', text: 'Finalizada' };
      case 'cancelada':
        return { backgroundColor: '#e74c3c', text: 'Cancelada' };
      case 'rechazada':
        return { backgroundColor: '#95a5a6', text: 'Rechazada' };
      default:
        return { backgroundColor: '#95a5a6', text: estado || 'Sin estado' };
    }
  };

  const getIconoTipoEspacio = (tipo) => {
    
    if (!tipo || typeof tipo !== 'string') {
      return 'business';
    }

    switch (tipo.toLowerCase()) {
      case 'sala':
      case 'sala_reuniones':
      case 'sala_conferencias':
        return 'people';
      case 'escritorio':
        return 'desktop';
      case 'coworking':
        return 'laptop';
      default:
        return 'business';
    }
  };

  
  const ErrorText = ({ error }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  const ReservaItem = ({ reserva }) => {
    const estadoInfo = getEstadoBadge(reserva.estado);
    const puedeCancel = ['pendiente', 'confirmada', 'aprobada'].includes(reserva.estado) &&
      esFechaProxima(reserva.fechaReservaRaw);

    return (
      <TouchableOpacity
        style={styles.reservaItem}
        onPress={() => handleReservaPress(reserva)}
        activeOpacity={0.7}
      >
        <View style={styles.imagenContainer}>
          {reserva.oficina.imagen ? (
            <Image
              source={{ uri: reserva.oficina.imagen }}
              style={styles.imagenReserva}
              resizeMode="cover"
              onError={() => console.warn('Error cargando imagen de reserva')}
            />
          ) : (
            <View style={styles.imagenPlaceholder}>
              <Ionicons
                name={getIconoTipoEspacio(reserva.oficina.tipo)}
                size={24}
                color="#4a90e2"
              />
            </View>
          )}
        </View>

        <View style={styles.reservaInfo}>
          <View style={styles.reservaHeader}>
            <Text style={styles.fechaReserva}>
              {reserva.fechaReserva}
              {reserva.duracion && <Text style={styles.duracion}> • {reserva.duracion}</Text>}
            </Text>
            <View style={[styles.estadoBadge, { backgroundColor: estadoInfo.backgroundColor }]}>
              <Text style={styles.estadoText}>{estadoInfo.text}</Text>
            </View>
          </View>

          <Text style={styles.nombreOficina}>{reserva.oficina.nombre}</Text>

          {reserva.horario && (
            <Text style={styles.horarioText}>🕒 {reserva.horario}</Text>
          )}

          {reserva.precio > 0 && (
            <Text style={styles.precio}>
              ${reserva.precio.toLocaleString('es-UY')}
            </Text>
          )}

          <View style={styles.accionesContainer}>
            {reserva.puedeReseñar && !reserva.yaReseñada && (
              <TouchableOpacity
                style={styles.reseñarButton}
                onPress={e => {
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
        </View>
      </TouchableOpacity>
    );
  };

  const reservasFiltradas = getReservasFiltradas();
  const proximasCount = reservasProcesadas.filter(r =>
    esFechaProxima(r.fechaReservaRaw) &&
    !['finalizada', 'completada', 'cancelada'].includes(r.estado)
  ).length;
  const pasadasCount = reservasProcesadas.filter(r =>
    !esFechaProxima(r.fechaReservaRaw) ||
    ['finalizada', 'completada', 'cancelada'].includes(r.estado)
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleVolver} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Reservas</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Mostrar errores de validación */}
      {validationErrors.usuario && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={16} color="#e74c3c" />
          <Text style={styles.errorContainerText}>Usuario: {validationErrors.usuario}</Text>
        </View>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              const userId = usuario?.id || usuario?._id;
              if (userId) {
                dispatch(obtenerReservasPorUsuario(userId));
              }
            }}
          />
        }
      >
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, filtroActivo === 'todas' && styles.tabActive]}
            onPress={() => handleFiltroChange('todas')}
          >
            <Text style={[styles.tabText, filtroActivo === 'todas' && styles.tabTextActive]}>
              Todas ({reservasProcesadas.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, filtroActivo === 'proximas' && styles.tabActive]}
            onPress={() => handleFiltroChange('proximas')}
          >
            <Text style={[styles.tabText, filtroActivo === 'proximas' && styles.tabTextActive]}>
              Próximas ({proximasCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, filtroActivo === 'pasadas' && styles.tabActive]}
            onPress={() => handleFiltroChange('pasadas')}
          >
            <Text style={[styles.tabText, filtroActivo === 'pasadas' && styles.tabTextActive]}>
              Pasadas ({pasadasCount})
            </Text>
          </TouchableOpacity>
        </View>

        {loading && reservasProcesadas.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4a90e2" />
            <Text style={styles.loadingText}>Cargando reservas...</Text>
          </View>
        ) : (
          <View style={styles.reservasContainer}>
            {reservasFiltradas.length > 0 ? (
              reservasFiltradas.map(reserva => (
                <ReservaItem key={reserva.id} reserva={reserva} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#bdc3c7" />
                <Text style={styles.emptyStateText}>
                  No tienes reservas{' '}
                  {filtroActivo === 'proximas'
                    ? 'próximas'
                    : filtroActivo === 'pasadas'
                      ? 'pasadas'
                      : ''}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {filtroActivo === 'todas'
                    ? 'Explora espacios disponibles y haz tu primera reserva'
                    : 'Las reservas aparecerán aquí cuando las tengas'}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
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

            <Text style={styles.modalFecha}>
              Reserva del {reservaSeleccionada?.fechaReserva}
            </Text>

            <View style={styles.starsContainer}>
              <Text style={styles.starsLabel}>Calificación</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => updateDatosReseña('calificacion', star)}
                    disabled={enviandoReseña}
                  >
                    <Ionicons
                      name={star <= datosReseña.calificacion ? 'star' : 'star-outline'}
                      size={32}
                      color="#f39c12"
                      style={styles.star}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <ErrorText error={validationErrors.calificacion} />
            </View>

            <Text style={styles.inputLabel}>Comentario (opcional)</Text>
            <TextInput
              style={[
                styles.input, 
                styles.textArea,
                validationErrors.comentario && styles.inputError
              ]}
              placeholder="Cuéntanos tu experiencia..."
              value={datosReseña.comentario}
              onChangeText={(text) => updateDatosReseña('comentario', text)}
              multiline
              numberOfLines={4}
              editable={!enviandoReseña}
              maxLength={500}
            />
            <ErrorText error={validationErrors.comentario} />
            <Text style={styles.characterCount}>
              {datosReseña.comentario.length}/500 caracteres
            </Text>

            {validationErrors.general && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorContainerText}>{validationErrors.general}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.enviarButton,
                enviandoReseña && styles.enviarButtonDisabled
              ]}
              onPress={handleEnviarReseña}
              disabled={enviandoReseña}
            >
              {enviandoReseña ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.enviarButtonText}>Enviar reseña</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
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
    shadowRadius: 2
  },
  backButton: { padding: 5 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'center'
  },
  placeholder: { width: 30 },
  content: { flex: 1 },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabActive: { borderBottomColor: '#4a90e2' },
  tabText: { fontSize: 16, color: '#7f8c8d' },
  tabTextActive: { color: '#4a90e2', fontWeight: '600' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  loadingText: { fontSize: 16, color: '#7f8c8d', marginTop: 10 },
  reservasContainer: { paddingHorizontal: 20, paddingTop: 10 },
  reservaItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#ecf0f1'
  },
  imagenContainer: { marginRight: 16 },
  imagenPlaceholder: {
    width: 60,
    height: 45,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  reservaInfo: { flex: 1 },
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  fechaReserva: { fontSize: 14, color: '#7f8c8d' },
  duracion: { fontSize: 12, color: '#95a5a6' },
  estadoBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  estadoText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  nombreOficina: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4
  },
  precio: { fontSize: 14, color: '#27ae60', fontWeight: '600', marginBottom: 8 },
  accionesContainer: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  reseñarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffbf0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  reseñarText: { fontSize: 12, color: '#f39c12', fontWeight: '600' },
  cancelarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fdf2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  cancelarText: { fontSize: 12, color: '#e74c3c', fontWeight: '600' },
  yaReseñadaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  yaReseñadaText: { fontSize: 12, color: '#27ae60' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyStateText: { fontSize: 16, color: '#7f8c8d', marginTop: 12, textAlign: 'center' },
  emptyStateSubtext: { fontSize: 14, color: '#bdc3c7', marginTop: 8, textAlign: 'center' },
  bottomSpacing: { height: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  modalSubtitle: { fontSize: 16, color: '#7f8c8d', marginBottom: 20 },
  starsContainer: { marginBottom: 20 },
  starsLabel: { fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 10 },
  stars: { flexDirection: 'row', justifyContent: 'center' },
  star: { marginHorizontal: 5 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 8 },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9'
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top', marginBottom: 5 },
  characterCount: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'right',
    marginBottom: 15,
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
    shadowRadius: 4
  },
  enviarButtonDisabled: { backgroundColor: '#bdc3c7' },
  enviarButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  horarioText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  imagenReserva: {
    width: 60,
    height: 45,
    borderRadius: 8,
  },
  modalFecha: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  starsContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  starsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  star: {
    marginHorizontal: 2,
  },
  
  
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffeaa7',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 8,
  },
  errorContainerText: {
    fontSize: 14,
    color: '#e74c3c',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'System',
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 4,
    fontFamily: 'System',
  },
});

export default Reservas;