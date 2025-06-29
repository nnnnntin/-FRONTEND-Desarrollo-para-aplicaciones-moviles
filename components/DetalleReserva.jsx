import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch } from 'react-redux';
import { obtenerDetalleEspacio } from '../store/slices/espaciosSlice';

const DetalleReserva = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [detalleEspacio, setDetalleEspacio] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  if (!route?.params?.reserva) {
    Alert.alert('Error', 'No se encontraron los datos de la reserva', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
    return null;
  }

  const { reserva, reservaCompleta } = route.params;

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
          } else {
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingDetalle(false);
        }
      } else {
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

  const handleGoBack = () => {
    navigation.goBack();
  };

  const fechaReservaLarga = formatearFecha(reserva.fechaReservaRaw);

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
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>Información de la reserva:</Text>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#4a90e2" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Fecha</Text>
                <Text style={styles.infoValue}>{fechaReservaLarga}</Text>
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
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="card" size={20} color="#4a90e2" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Precio</Text>
                <Text style={styles.infoValue}>{formatearPrecio(reserva.precio)}</Text>
              </View>
            </View>

            {reserva.metodoPago && (
              <View style={styles.infoRow}>
                <Ionicons name="wallet" size={20} color="#4a90e2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Método de pago</Text>
                  <Text style={styles.infoValue}>{getTipoMetodoPago(reserva.metodoPago)}</Text>
                </View>
              </View>
            )}

            {reserva.notas && (
              <View style={styles.infoRow}>
                <Ionicons name="document-text" size={20} color="#4a90e2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Notas</Text>
                  <Text style={styles.infoValue}>{reserva.notas}</Text>
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
  infoText: {
    fontSize: 14,
    color: '#5a6c7d',
    fontFamily: 'System',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoBold: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  verPublicacionContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  verPublicacionText: {
    fontSize: 16,
    color: '#4a90e2',
    fontFamily: 'System',
    textDecorationLine: 'underline',
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
  inicioButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  inicioButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
  imageDetalle: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  estadoBadgeDetalle: {
    position: 'absolute',
    top: 10,
    right: 10,
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
  verPublicacionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  verPublicacionText: {
    fontSize: 16,
    color: '#4a90e2',
    fontFamily: 'System',
    fontWeight: '600',
    marginLeft: 8,
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
    flexDirection: 'row',
    gap: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
    marginLeft: 8,
  },
  inicioButtonSecondary: {
    flex: 1,
  },
  inicioButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
    marginLeft: 8,
  },
  inicioButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loadingImageText: {
    color: 'white',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  }
});

export default DetalleReserva;