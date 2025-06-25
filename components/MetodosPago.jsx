import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
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
import {
  actualizarMetodoPagoPredeterminado,
  eliminarMetodoPago,
  obtenerMetodosPagoUsuario
} from '../store/slices/usuarioSlice';

const EstadoPago = ({ estado, onContinuar, oficina, precio, onVerDetalles, onReportarProblema, modoSuscripcion, planSuscripcion }) => {
  const renderContent = () => {
    switch (estado) {
      case 'procesando':
        return (
          <View style={styles.estadoContainer}>
            <ActivityIndicator size={80} color="#4a90e2" />
            <Text style={styles.estadoTitulo}>
              {modoSuscripcion ? 'Procesando suscripción...' : 'Procesando pago...'}
            </Text>
            <Text style={styles.estadoSubtitulo}>Por favor espere</Text>
          </View>
        );

      case 'confirmado':
        if (modoSuscripcion) {
          return (
            <View style={styles.estadoContainer}>
              <View style={[styles.estadoIcono, styles.estadoExito]}>
                <Ionicons name="checkmark" size={50} color="white" />
              </View>
              <Text style={styles.estadoTitulo}>¡Suscripción completada!</Text>
              <Text style={styles.estadoSubtitulo}>
                Ahora tienes acceso al plan {planSuscripcion?.nombre}
              </Text>
              <View style={styles.detallesSuscripcion}>
                <Text style={styles.detalleItem}>Plan: {planSuscripcion?.nombre}</Text>
                <Text style={styles.detalleItem}>Precio: {planSuscripcion?.precio}/{planSuscripcion?.periodo}</Text>
                <Text style={styles.detalleItem}>Próximo cobro: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity
                style={styles.botonContinuar}
                onPress={onContinuar}
              >
                <Text style={styles.textoBotonContinuar}>Continuar</Text>
              </TouchableOpacity>
            </View>
          );
        } else {
          return (
            <View style={styles.estadoContainer}>
              <View style={[styles.estadoIcono, styles.estadoExito]}>
                <Ionicons name="checkmark" size={50} color="white" />
              </View>
              <Text style={styles.estadoTitulo}>Pago confirmado</Text>
              <View style={styles.detallesReserva}>
                <Text style={styles.detalleItem}>Reservaste: {oficina?.nombre}</Text>
                <Text style={styles.detalleItem}>Capacidad: 8 personas</Text>
                <Text style={styles.detalleItem}>Horario: 13:00 - 18:00</Text>
                <Text style={styles.detalleItem}>Ubicación: Montevideo, Ciudad Vieja</Text>
              </View>
              <TouchableOpacity
                style={styles.botonDetalles}
                onPress={onVerDetalles}
                activeOpacity={0.7}
              >
                <Text style={styles.textoBotonDetalles}>Ver detalles</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonContinuar}
                onPress={onContinuar}
              >
                <Text style={styles.textoBotonContinuar}>Continuar</Text>
              </TouchableOpacity>
            </View>
          );
        }

      case 'error':
        return (
          <View style={styles.estadoContainer}>
            <View style={[styles.estadoIcono, styles.estadoError]}>
              <Ionicons name="close" size={50} color="white" />
            </View>
            <Text style={styles.estadoTitulo}>
              {modoSuscripcion ? 'Error en la suscripción' : 'Error en el pago'}
            </Text>
            <Text style={styles.estadoSubtitulo}>Reintentar</Text>
            <TouchableOpacity
              style={styles.problemaLink}
              onPress={onReportarProblema}
              activeOpacity={0.7}
            >
              <Text style={styles.preguntaProblema}>¿Tienes un problema?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botonContinuar}
              onPress={onContinuar}
            >
              <Text style={styles.textoBotonContinuar}>Volver a intentar</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Estado</Text>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const MetodosPago = ({ navigation, route }) => {
  const dispatch = useDispatch();
  
  
  const usuario = useSelector(state => state.auth.usuario);
  const metodosPago = useSelector(state => state.usuario.metodosPago);
  const loadingMetodosPago = useSelector(state => state.usuario.loadingMetodosPago);
  const errorMetodosPago = useSelector(state => state.usuario.errorMetodosPago);

  const [estadoPago, setEstadoPago] = useState(null);
  const [transaccionActual, setTransaccionActual] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const { 
    modoSeleccion = false, 
    modoSuscripcion = false, 
    planSuscripcion = null,
    oficina, 
    precio,
    descripcion
  } = route?.params || {};

  
  useEffect(() => {
    loadMetodosPago();
  }, []);

  const loadMetodosPago = () => {
    if (usuario?.id || usuario?._id) {
      const userId = usuario.id || usuario._id;
      console.log('🔄 Cargando métodos de pago para usuario:', userId);
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

  const handleEliminarTarjeta = (metodoId, tipo, ultimosDigitos) => {
    const tipoDisplay = mapearTipoTarjeta(tipo);
    Alert.alert(
      'Eliminar Tarjeta',
      `¿Estás seguro de que quieres eliminar la tarjeta ${tipoDisplay} •••• ${ultimosDigitos}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const userId = usuario?.id || usuario?._id;
            if (userId) {
              dispatch(eliminarMetodoPago({ usuarioId: userId, metodoId }));
            }
          },
        },
      ]
    );
  };

  const handleSeleccionarTarjeta = (metodo) => {
    if (modoSeleccion) {
      const tipoDisplay = mapearTipoTarjeta(metodo.tipo);
      const mensaje = modoSuscripcion 
        ? `¿Confirmas la suscripción al plan ${planSuscripcion?.nombre} por ${precio} con la tarjeta ${tipoDisplay} •••• ${metodo.ultimosDigitos}?`
        : `¿Confirmas el pago de ${precio} con la tarjeta ${tipoDisplay} •••• ${metodo.ultimosDigitos}?`;

      Alert.alert(
        modoSuscripcion ? 'Confirmar Suscripción' : 'Confirmar Pago',
        mensaje,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Confirmar',
            onPress: () => procesarPago(metodo),
          },
        ]
      );
    }
  };

  const handleMarcarPredeterminado = (metodoId) => {
    const userId = usuario?.id || usuario?._id;
    if (userId) {
      dispatch(actualizarMetodoPagoPredeterminado({ usuarioId: userId, metodoId }));
    }
  };

  const procesarPago = (metodo) => {
    setEstadoPago('procesando');

    
    setTimeout(() => {
      const exito = Math.random() > 0.2;

      if (exito) {
        setEstadoPago('confirmado');
        if (!modoSuscripcion) {
          setTransaccionActual({
            fecha: new Date().toLocaleDateString('es-ES'),
            precio: precio,
            oficina: oficina,
            metodo: metodo
          });
        }
      } else {
        setEstadoPago('error');
      }
    }, 3000);
  };

  const handleContinuar = () => {
    if (estadoPago === 'confirmado') {
      if (modoSuscripcion) {
        navigation.navigate('Membresias');
      } else {
        navigation.navigate('InicioMain');
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
    navigation.navigate('FormularioProblema');
  };

  
  const mapearTipoTarjeta = (tipo) => {
    switch (tipo) {
      case 'tarjeta':
        return 'Tarjeta';
      case 'paypal':
        return 'PayPal';
      case 'cuenta_bancaria':
        return 'Cuenta Bancaria';
      default:
        return tipo || 'Tarjeta';
    }
  };

  
  const detectarMarcaTarjeta = (metodo) => {
    
    if (metodo.tipo === 'paypal') return 'PayPal';
    if (metodo.tipo === 'cuenta_bancaria') return 'Banco';
    
    
    
    const ultimosDigitos = metodo.ultimosDigitos || '';
    
    
    if (ultimosDigitos.startsWith('4')) return 'Visa';
    if (ultimosDigitos.startsWith('5')) return 'Mastercard';
    
    return 'Visa'; 
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
                <Text style={styles.reservaDetalle}>Oficina: {oficina?.nombre}</Text>
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
            {metodosPago.length > 0 ? (
              metodosPago.map((metodo) => (
                <TouchableOpacity
                  key={metodo.id || metodo._id}
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
                          {mapearTipoTarjeta(metodo.tipo)}
                        </Text>
                        {metodo.predeterminado && (
                          <View style={styles.badgePredeterminado}>
                            <Text style={styles.textoPredeterminado}>Predeterminado</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.numeroTarjeta}>•••• {metodo.ultimosDigitos}</Text>
                      {metodo.fechaExpiracion && (
                        <Text style={styles.fechaExpiracion}>Exp: {metodo.fechaExpiracion}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.accionesContainer}>
                    {modoSeleccion ? (
                      <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
                    ) : (
                      <View style={styles.botonesAcciones}>
                        {!metodo.predeterminado && (
                          <TouchableOpacity
                            style={styles.botonPredeterminado}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleMarcarPredeterminado(metodo.id || metodo._id);
                            }}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="star-outline" size={18} color="#f39c12" />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={styles.botonEliminar}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleEliminarTarjeta(
                              metodo.id || metodo._id, 
                              metodo.tipo, 
                              metodo.ultimosDigitos
                            );
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                        </TouchableOpacity>
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

        {modoSeleccion && metodosPago.length > 0 && (
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
});

export default MetodosPago;