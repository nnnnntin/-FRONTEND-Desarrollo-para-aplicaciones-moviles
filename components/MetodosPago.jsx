import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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

const EstadoPago = ({ estado, onContinuar, oficina, precio, onVerDetalles, onReportarProblema }) => {
  const renderContent = () => {
    switch (estado) {
      case 'procesando':
        return (
          <View style={styles.estadoContainer}>
            <ActivityIndicator size={80} color="#4a90e2" />
            <Text style={styles.estadoTitulo}>Procesando pago...</Text>
            <Text style={styles.estadoSubtitulo}>Por favor espere</Text>
          </View>
        );

      case 'confirmado':
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
              <Text style={styles.detalleItem}>Ubicación: Montevideo, Ciudad Vieja ***</Text>
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

      case 'error':
        return (
          <View style={styles.estadoContainer}>
            <View style={[styles.estadoIcono, styles.estadoError]}>
              <Ionicons name="close" size={50} color="white" />
            </View>
            <Text style={styles.estadoTitulo}>Error en el pago</Text>
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
  const [tarjetas, setTarjetas] = useState([
    {
      id: 1,
      tipo: 'Visa',
      ultimosCuatroDigitos: '1234',
      icono: 'card'
    },
    {
      id: 2,
      tipo: 'Mastercard',
      ultimosCuatroDigitos: '5678',
      icono: 'card'
    }
  ]);

  const [estadoPago, setEstadoPago] = useState(null);
  const [transaccionActual, setTransaccionActual] = useState(null);

  const { modoSeleccion = false, oficina, precio } = route?.params || {};

  const handleGoBack = () => {
    if (estadoPago) {
      setEstadoPago(null);
    } else {
      navigation.goBack();
    }
  };

  const handleAgregarTarjeta = () => {
    navigation.navigate('AgregarTarjeta');
  };

  const handleEliminarTarjeta = (id, tipo, ultimosCuatroDigitos) => {
    Alert.alert(
      'Eliminar Tarjeta',
      `¿Estás seguro de que quieres eliminar la tarjeta ${tipo} •••• ${ultimosCuatroDigitos}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setTarjetas(tarjetas.filter(tarjeta => tarjeta.id !== id));
          },
        },
      ]
    );
  };

  const handleSeleccionarTarjeta = (tarjeta) => {
    if (modoSeleccion) {
      Alert.alert(
        'Confirmar Pago',
        `¿Confirmas el pago de ${precio} con la tarjeta ${tarjeta.tipo} •••• ${tarjeta.ultimosCuatroDigitos}?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Confirmar',
            onPress: () => procesarPago(tarjeta),
          },
        ]
      );
    }
  };

  const procesarPago = (tarjeta) => {
    setEstadoPago('procesando');

    setTimeout(() => {
      const exito = Math.random() > 0.2;

      if (exito) {
        setEstadoPago('confirmado');
        setTransaccionActual({
          fecha: new Date().toLocaleDateString('es-ES'),
          precio: precio,
          oficina: oficina,
          tarjeta: tarjeta
        });
      } else {
        setEstadoPago('error');
      }
    }, 3000);
  };

  const handleContinuar = () => {
    if (estadoPago === 'confirmado') {
      navigation.navigate('InicioMain');
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

  const obtenerIconoTarjeta = (tipo) => {
    switch (tipo) {
      case 'Visa':
        return (
          <View style={[styles.iconoTarjeta, styles.iconoVisa]}>
            <Text style={styles.textoIconoVisa}>VISA</Text>
          </View>
        );
      case 'Mastercard':
        return (
          <View style={[styles.iconoTarjeta, styles.iconoMastercard]}>
            <View style={styles.circuloMastercard1} />
            <View style={styles.circuloMastercard2} />
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {modoSeleccion && oficina && (
          <View style={styles.reservaInfo}>
            <Text style={styles.reservaTitulo}>Resumen de la reserva</Text>
            <Text style={styles.reservaDetalle}>Oficina: {oficina.nombre}</Text>
            <Text style={styles.reservaDetalle}>Precio: {precio}</Text>
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

        <View style={styles.tarjetasContainer}>
          {tarjetas.map((tarjeta) => (
            <TouchableOpacity
              key={tarjeta.id}
              style={[
                styles.tarjetaItem,
                modoSeleccion && styles.tarjetaItemSeleccionable
              ]}
              onPress={() => modoSeleccion ? handleSeleccionarTarjeta(tarjeta) : null}
              activeOpacity={modoSeleccion ? 0.7 : 1}
            >
              <View style={styles.tarjetaInfo}>
                {obtenerIconoTarjeta(tarjeta.tipo)}
                <View style={styles.tarjetaTexto}>
                  <Text style={styles.tipoTarjeta}>{tarjeta.tipo}</Text>
                  <Text style={styles.numeroTarjeta}>•••• {tarjeta.ultimosCuatroDigitos}</Text>
                </View>
              </View>

              {modoSeleccion ? (
                <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
              ) : (
                <TouchableOpacity
                  style={styles.botonEliminar}
                  onPress={() => handleEliminarTarjeta(tarjeta.id, tarjeta.tipo, tarjeta.ultimosCuatroDigitos)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {modoSeleccion && (
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
  iconoGenerico: {
    backgroundColor: '#ecf0f1',
  },
  tarjetaTexto: {
    flex: 1,
  },
  tipoTarjeta: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
    marginBottom: 2,
  },
  numeroTarjeta: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  botonEliminar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  agregarTarjetaContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
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