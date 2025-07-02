import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch } from 'react-redux';
import * as yup from 'yup';
import { obtenerDetalleEspacio } from '../store/slices/espaciosSlice';

const reservaSchema = yup.object({
  codigoReserva: yup
    .string()
    .required('El código de reserva es obligatorio')
    .min(3, 'El código de reserva debe tener al menos 3 caracteres')
    .max(50, 'El código de reserva no puede exceder los 50 caracteres'),

  fechaReservaRaw: yup
    .date()
    .required('La fecha de reserva es obligatoria')
    .min(new Date('2020-01-01'), 'La fecha no puede ser anterior al año 2020')
    .max(new Date('2030-12-31'), 'La fecha no puede ser posterior al año 2030'),

  horario: yup
    .string()
    .nullable()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s*-\s*([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 
      'El horario debe tener el formato HH:MM - HH:MM'),

  cantidadPersonas: yup
    .number()
    .required('La cantidad de personas es obligatoria')
    .integer('La cantidad de personas debe ser un número entero')
    .min(1, 'Debe haber al menos 1 persona')
    .max(500, 'La cantidad de personas no puede exceder 500'),

  precio: yup
    .number()
    .required('El precio es obligatorio')
    .min(0, 'El precio no puede ser negativo')
    .max(999999, 'El precio no puede exceder $999,999'),

  estado: yup
    .string()
    .required('El estado de la reserva es obligatorio')
    .test('estado-valido', 'Estado de reserva inválido', function(value) {
      const estadosValidos = ['pendiente', 'confirmada', 'aprobada', 'finalizada', 'completada', 'cancelada', 'rechazada'];
      return estadosValidos.includes(value);
    }),

  metodoPago: yup
    .string()
    .nullable()
    .test('metodo-pago-valido', 'Método de pago inválido', function(value) {
      if (!value) return true; 
      const metodosValidos = ['tarjeta_credito', 'tarjeta_debito', 'efectivo', 'transferencia', 'paypal', 'tarjeta', 'credit_card', 'debit_card', 'cash', 'transfer'];
      return metodosValidos.includes(value);
    }),

  notas: yup
    .string()
    .nullable()
    .max(500, 'Las notas no pueden exceder los 500 caracteres'),

  duracion: yup
    .string()
    .nullable()
    .matches(/^\d+\s*(hora|horas|minuto|minutos|día|días)$/, 
      'La duración debe tener el formato: "2 horas", "30 minutos", etc.'),

  fechaCreacion: yup
    .date()
    .nullable()
    .max(new Date(), 'La fecha de creación no puede ser futura'),

  oficina: yup.object({
    id: yup
      .string()
      .required('El ID de la oficina es obligatorio'),
    
    nombre: yup
      .string()
      .required('El nombre de la oficina es obligatorio')
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder los 100 caracteres'),
    
    tipo: yup
      .string()
      .required('El tipo de oficina es obligatorio')
      .test('tipo-oficina-valido', 'Tipo de oficina inválido', function(value) {
        const tiposValidos = ['oficina', 'sala', 'escritorio', 'coworking', 'espacio', 'sala_reuniones'];
        return tiposValidos.includes(value);
      }),
    
    ubicacion: yup
      .string()
      .nullable()
      .max(200, 'La ubicación no puede exceder los 200 caracteres'),
    
    capacidad: yup
      .number()
      .nullable()
      .integer('La capacidad debe ser un número entero')
      .min(1, 'La capacidad debe ser mayor a 0')
      .max(500, 'La capacidad no puede exceder 500 personas'),
    
    imagen: yup
      .string()
      .nullable()
      .url('La imagen debe ser una URL válida')
  })
});

const edicionReservaSchema = yup.object({
  cantidadPersonas: yup
    .number()
    .required('La cantidad de personas es obligatoria')
    .integer('La cantidad de personas debe ser un número entero')
    .min(1, 'Debe haber al menos 1 persona')
    .max(500, 'La cantidad de personas no puede exceder 500'),

  notas: yup
    .string()
    .nullable()
    .max(500, 'Las notas no pueden exceder los 500 caracteres'),

  metodoPago: yup
    .string()
    .nullable()
    .test('metodo-pago-valido', 'Método de pago inválido', function(value) {
      if (!value) return true; 
      const metodosValidos = ['tarjeta_credito', 'tarjeta_debito', 'efectivo', 'transferencia', 'paypal'];
      return metodosValidos.includes(value);
    })
});

const DetalleReserva = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [detalleEspacio, setDetalleEspacio] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [validacionCompleta, setValidacionCompleta] = useState(false);
  
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState({
    cantidadPersonas: '',
    notas: '',
    metodoPago: ''
  });
  const [modalEdicion, setModalEdicion] = useState(false);
  const [guardandoCambios, setGuardandoCambios] = useState(false);

  useEffect(() => {
    if (!route?.params?.reserva) {
      Alert.alert('Error', 'No se encontraron los datos de la reserva', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }

    validarDatosReserva(route.params.reserva);
  }, [route?.params]);

  if (!route?.params?.reserva) {
    return null;
  }

  const { reserva, reservaCompleta } = route.params;

  const validarDatosReserva = async (datosReserva) => {
    try {
      await reservaSchema.validate(datosReserva, { abortEarly: false });
      setValidacionCompleta(true);
      setErroresValidacion({});
    } catch (error) {
      setValidacionCompleta(false);
      const errores = {};
      
      if (error.inner) {
        error.inner.forEach(err => {
          errores[err.path] = err.message;
        });
      } else {
        errores.general = error.message;
      }
      
      setErroresValidacion(errores);
      console.warn('Errores de validación en reserva:', errores);
    }
  };

  const validarDatosEdicion = async (datos) => {
    try {
      await edicionReservaSchema.validate(datos, { abortEarly: false });
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

  useEffect(() => {
    const cargarDetalleEspacio = async () => {
      if (reservaCompleta?.entidadReservada) {
        const entidad = reservaCompleta.entidadReservada;

        if (entidad.fotos || entidad.imagenes || entidad.nombre || entidad.titulo) {
          setDetalleEspacio(entidad);
          return;
        }
      }

      const entidadId = reserva?.oficina?.id || reservaCompleta?.entidadReservada?.id;
      const entidadTipo = reserva?.oficina?.tipo || reservaCompleta?.entidadReservada?.tipo;

      if (entidadId && entidadTipo) {
        try {
          setLoadingDetalle(true);

          const result = await dispatch(obtenerDetalleEspacio({
            id: entidadId,
            tipo: entidadTipo
          }));

          if (obtenerDetalleEspacio.fulfilled.match(result)) {
            setDetalleEspacio(result.payload.data);
          }
        } catch (error) {
          console.error('Error cargando detalle del espacio:', error);
          Alert.alert('Error', 'No se pudo cargar la información del espacio');
        } finally {
          setLoadingDetalle(false);
        }
      }
    };

    cargarDetalleEspacio();
  }, [reserva, reservaCompleta, dispatch]);

  const obtenerImagenEspacio = () => {
    if (reserva.oficina.imagen) {
      return reserva.oficina.imagen;
    }

    if (detalleEspacio) {
      if (Array.isArray(detalleEspacio.fotos) && detalleEspacio.fotos.length > 0) {
        return detalleEspacio.fotos[0];
      }
      if (Array.isArray(detalleEspacio.imagenes) && detalleEspacio.imagenes.length > 0) {
        return detalleEspacio.imagenes[0];
      }
      if (Array.isArray(detalleEspacio.fotosPrincipales) && detalleEspacio.fotosPrincipales.length > 0) {
        return detalleEspacio.fotosPrincipales[0];
      }
      if (typeof detalleEspacio.imagen === 'string' && detalleEspacio.imagen.trim()) {
        return detalleEspacio.imagen;
      }
    }

    if (reservaCompleta?.entidadReservada) {
      const entidad = reservaCompleta.entidadReservada;

      if (Array.isArray(entidad.fotos) && entidad.fotos.length > 0) {
        return entidad.fotos[0];
      }
      if (Array.isArray(entidad.imagenes) && entidad.imagenes.length > 0) {
        return entidad.imagenes[0];
      }
      if (Array.isArray(entidad.fotosPrincipales) && entidad.fotosPrincipales.length > 0) {
        return entidad.fotosPrincipales[0];
      }
      if (typeof entidad.imagen === 'string' && entidad.imagen.trim()) {
        return entidad.imagen;
      }
    }

    return null;
  };

  const obtenerNombreEspacio = () => {
    if (detalleEspacio?.nombre) {
      return detalleEspacio.nombre;
    }
    if (detalleEspacio?.titulo) {
      return detalleEspacio.titulo;
    }

    return reserva.oficina.nombre;
  };

  const obtenerUbicacionEspacio = () => {
    if (detalleEspacio?.direccionCompleta) {
      const { calle, numero, ciudad, departamento, pais } = detalleEspacio.direccionCompleta;
      return [
        calle + (numero ? ' ' + numero : ''),
        ciudad,
        departamento,
        pais
      ].filter(Boolean).join(', ');
    }

    if (detalleEspacio?.ubicacion) {
      const { piso, numero, zona, sector } = detalleEspacio.ubicacion;
      const ubicacionParts = [];

      if (piso) ubicacionParts.push(`Piso ${piso}`);
      if (numero) ubicacionParts.push(`Número ${numero}`);
      if (zona) ubicacionParts.push(`Zona ${zona}`);
      if (sector) ubicacionParts.push(`Sector ${sector}`);

      return ubicacionParts.length > 0 ? ubicacionParts.join(', ') : reserva.oficina.ubicacion;
    }

    return reserva.oficina.ubicacion;
  };

  const imagenEspacio = obtenerImagenEspacio();
  const nombreEspacio = obtenerNombreEspacio();
  const ubicacionEspacio = obtenerUbicacionEspacio();

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) return 'No disponible';

    return fechaObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearPrecio = (precio) => {
    if (!precio || precio === 0) return 'Gratuito';
    return `$${precio.toLocaleString('es-UY')}`;
  };

  const getEstadoInfo = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return { color: '#f39c12', texto: 'Pendiente de confirmación' };
      case 'confirmada':
      case 'aprobada':
        return { color: '#3498db', texto: 'Confirmada' };
      case 'finalizada':
      case 'completada':
        return { color: '#27ae60', texto: 'Finalizada' };
      case 'cancelada':
        return { color: '#e74c3c', texto: 'Cancelada' };
      case 'rechazada':
        return { color: '#95a5a6', texto: 'Rechazada' };
      default:
        return { color: '#95a5a6', texto: estado || 'Sin estado' };
    }
  };

  const getTipoMetodoPago = (metodo) => {
    if (!metodo) return 'No especificado';

    switch (metodo.toLowerCase()) {
      case 'tarjeta_credito':
      case 'tarjeta':
      case 'credit_card':
        return 'Tarjeta de crédito';
      case 'tarjeta_debito':
      case 'debit_card':
        return 'Tarjeta de débito';
      case 'efectivo':
      case 'cash':
        return 'Efectivo';
      case 'transferencia':
      case 'transfer':
        return 'Transferencia bancaria';
      case 'paypal':
        return 'PayPal';
      default:
        return metodo;
    }
  };

  const estadoInfo = getEstadoInfo(reserva.estado);
  const fechaReservaLarga = formatearFecha(reserva.fechaReservaRaw);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const ErroresValidacionComponent = () => {
    if (validacionCompleta || Object.keys(erroresValidacion).length === 0) {
      return null;
    }

    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorHeader}>
          <Ionicons name="warning" size={20} color="#e74c3c" />
          <Text style={styles.errorTitle}>Datos de reserva incompletos</Text>
        </View>
        <Text style={styles.errorDescription}>
          Algunos datos de la reserva presentan inconsistencias. La funcionalidad puede verse limitada.
        </Text>
        {Object.keys(erroresValidacion).slice(0, 3).map((campo, index) => (
          <Text key={index} style={styles.errorItem}>
            • {erroresValidacion[campo]}
          </Text>
        ))}
        {Object.keys(erroresValidacion).length > 3 && (
          <Text style={styles.errorMore}>
            ...y {Object.keys(erroresValidacion).length - 3} errores más
          </Text>
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
          <Ionicons name="chevron-back" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>
          Detalle de reserva
        </Text>
        {!(reserva.estado === 'pendiente' || reserva.estado === 'confirmada') && (
          <View style={styles.placeholder} />
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ErroresValidacionComponent />

        <View style={styles.imageContainer}>
          {loadingDetalle ? (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.loadingImageText}>Cargando imagen...</Text>
            </View>
          ) : imagenEspacio ? (
            <Image
              source={{ uri: imagenEspacio }}
              style={styles.imageDetalle}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name={
                  reserva.oficina.tipo === 'sala' || reserva.oficina.tipo === 'sala_reuniones'
                    ? 'people'
                    : reserva.oficina.tipo === 'escritorio'
                      ? 'desktop'
                      : reserva.oficina.tipo === 'coworking'
                        ? 'laptop'
                        : 'business'
                }
                size={40}
                color="white"
              />
            </View>
          )}
          <View style={styles.imageOverlay}>
            <Text style={styles.imageText}>{nombreEspacio}</Text>
          </View>
          
          {/* Badge de estado */}
          <View style={[styles.estadoBadgeDetalle, { backgroundColor: estadoInfo.color }]}>
            <Text style={styles.estadoTextDetalle}>{estadoInfo.texto}</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.oficinaTitle}>{nombreEspacio}</Text>
          <Text style={styles.oficinaSubtitle}>
            {reserva.oficina.tipo.charAt(0).toUpperCase() + reserva.oficina.tipo.slice(1)}
            {(detalleEspacio?.capacidad || reserva.oficina.capacidad) &&
              ` • Capacidad: ${detalleEspacio?.capacidad || reserva.oficina.capacidad} personas`}
          </Text>
        </View>

        <View style={styles.codigoContainer}>
          <Text style={styles.codigoLabel}>Código de reserva</Text>
          <Text style={styles.codigoText}>{reserva.codigoReserva}</Text>
          {erroresValidacion.codigoReserva && (
            <Text style={styles.codigoError}>⚠️ {erroresValidacion.codigoReserva}</Text>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>Información de la reserva:</Text>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#4a90e2" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Fecha</Text>
                <Text style={styles.infoValue}>{fechaReservaLarga}</Text>
                {erroresValidacion.fechaReservaRaw && (
                  <Text style={styles.infoError}>⚠️ {erroresValidacion.fechaReservaRaw}</Text>
                )}
              </View>
            </View>

            {reserva.horario && (
              <View style={styles.infoRow}>
                <Ionicons name="time" size={20} color="#4a90e2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Horario</Text>
                  <Text style={styles.infoValue}>{reserva.horario}</Text>
                  {reserva.duracion && (
                    <Text style={styles.infoDuracion}>Duración: {reserva.duracion}</Text>
                  )}
                  {erroresValidacion.horario && (
                    <Text style={styles.infoError}>⚠️ {erroresValidacion.horario}</Text>
                  )}
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#4a90e2" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Ubicación</Text>
                <Text style={styles.infoValue}>{ubicacionEspacio}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="people" size={20} color="#4a90e2" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Cantidad de personas</Text>
                <Text style={styles.infoValue}>{reserva.cantidadPersonas} persona{reserva.cantidadPersonas !== 1 ? 's' : ''}</Text>
                {erroresValidacion.cantidadPersonas && (
                  <Text style={styles.infoError}>⚠️ {erroresValidacion.cantidadPersonas}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="card" size={20} color="#4a90e2" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Precio</Text>
                <Text style={styles.infoValue}>{formatearPrecio(reserva.precio)}</Text>
                {erroresValidacion.precio && (
                  <Text style={styles.infoError}>⚠️ {erroresValidacion.precio}</Text>
                )}
              </View>
            </View>

            {reserva.metodoPago && (
              <View style={styles.infoRow}>
                <Ionicons name="wallet" size={20} color="#4a90e2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Método de pago</Text>
                  <Text style={styles.infoValue}>{getTipoMetodoPago(reserva.metodoPago)}</Text>
                  {erroresValidacion.metodoPago && (
                    <Text style={styles.infoError}>⚠️ {erroresValidacion.metodoPago}</Text>
                  )}
                </View>
              </View>
            )}

            {reserva.notas && (
              <View style={styles.infoRow}>
                <Ionicons name="document-text" size={20} color="#4a90e2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Notas</Text>
                  <Text style={styles.infoValue}>{reserva.notas}</Text>
                  {erroresValidacion.notas && (
                    <Text style={styles.infoError}>⚠️ {erroresValidacion.notas}</Text>
                  )}
                </View>
              </View>
            )}

            {reserva.fechaCreacion && (
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Reserva creada</Text>
                  <Text style={styles.infoValue}>
                    {new Date(reserva.fechaCreacion).toLocaleString('es-ES')}
                  </Text>
                  {erroresValidacion.fechaCreacion && (
                    <Text style={styles.infoError}>⚠️ {erroresValidacion.fechaCreacion}</Text>
                  )}
                </View>
              </View>
            )}
          </View>
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
    minHeight: 60,
  },
  backButton: {
    padding: 5,
  },
  editButton: {
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
  
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    margin: 20,
    marginBottom: 10,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginLeft: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#7f1d1d',
    marginBottom: 8,
    lineHeight: 18,
  },
  errorItem: {
    fontSize: 12,
    color: '#991b1b',
    marginBottom: 2,
    marginLeft: 8,
  },
  errorMore: {
    fontSize: 12,
    color: '#991b1b',
    fontStyle: 'italic',
    marginLeft: 8,
    marginTop: 4,
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
  imageDetalle: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  estadoBadgeDetalle: {
    position: 'absolute',
    top: 15,
    right: 35,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  estadoTextDetalle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
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
  oficinaSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'System',
    marginTop: 4,
  },
  codigoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#e8f4fd',
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  codigoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
    marginBottom: 4,
  },
  codigoText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  codigoError: {
    fontSize: 11,
    color: '#e74c3c',
    marginTop: 4,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
    lineHeight: 20,
  },
  infoDuracion: {
    fontSize: 13,
    color: '#95a5a6',
    marginTop: 2,
    fontStyle: 'italic',
  },
  infoError: {
    fontSize: 11,
    color: '#e74c3c',
    marginTop: 4,
  },
  
  validacionExitosa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f4',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 20,
    marginTop: 10,
  },
  validacionExitosaText: {
    fontSize: 14,
    color: '#065f46',
    marginLeft: 8,
    fontWeight: '500',
  },
  
  loadingImageText: {
    color: 'white',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalSaveButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  modalSaveButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    color: '#2c3e50',
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalInputHelp: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 6,
    fontStyle: 'italic',
  },
  modalCharacterCount: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'right',
    marginTop: 4,
  },
  metodoPagoContainer: {
    gap: 8,
  },
  metodoPagoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  metodoPagoOptionActive: {
    borderColor: '#4a90e2',
    backgroundColor: '#f0f8ff',
  },
  metodoPagoText: {
    fontSize: 15,
    color: '#2c3e50',
    marginLeft: 12,
    fontWeight: '500',
  },
  metodoPagoTextActive: {
    color: '#4a90e2',
    fontWeight: '600',
  },
});

export default DetalleReserva;