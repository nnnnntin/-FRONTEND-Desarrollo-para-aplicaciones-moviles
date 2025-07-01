import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import {
  obtenerEstadisticasGananciasCliente
} from '../store/slices/reservasSlice';

const reservaSchema = Yup.object({
  _id: Yup.string().required('ID de reserva es requerido'),
  estado: Yup.string()
    .test('estado-valido', 'Estado de reserva no válido', function(value) {
      const estadosValidos = ['pendiente', 'confirmada', 'completada', 'cancelada'];
      return estadosValidos.includes(value);
    })
    .required('Estado de reserva es requerido'),
  precioFinalPagado: Yup.number()
    .min(0, 'El precio no puede ser negativo')
    .max(999999, 'El precio no puede exceder $999,999')
    .typeError('El precio debe ser un número válido'),
  fechaInicio: Yup.date()
    .typeError('Fecha de inicio debe ser una fecha válida'),
  fecha: Yup.date()
    .typeError('Fecha debe ser una fecha válida'),
  createdAt: Yup.date()
    .typeError('Fecha de creación debe ser una fecha válida'),
  codigo: Yup.string()
    .max(50, 'El código no puede exceder 50 caracteres'),
  entidadReservada: Yup.object({
    nombre: Yup.string().max(200, 'El nombre no puede exceder 200 caracteres'),
    titulo: Yup.string().max(200, 'El título no puede exceder 200 caracteres'),
    name: Yup.string().max(200, 'El name no puede exceder 200 caracteres'),
    tipo: Yup.string()
      .test('tipo-entidad-valido', 'Tipo de entidad no válido', function(value) {
        if (!value) return true;
        const tiposValidos = ['oficina', 'espacio', 'escritorio', 'escritorio_flexible', 'sala', 'sala_reunion', 'edificio'];
        return tiposValidos.includes(value);
      })
  }).default({})
});

const gananciasSchema = Yup.object({
  disponible: Yup.number()
    .min(0, 'Disponible no puede ser negativo')
    .required('Disponible es requerido'),
  pendiente: Yup.number()
    .min(0, 'Pendiente no puede ser negativo')
    .required('Pendiente es requerido'),
  total: Yup.number()
    .min(0, 'Total no puede ser negativo')
    .required('Total es requerido'),
  proximoPago: Yup.string()
    .required('Próximo pago es requerido')
});

const cuentaBancariaSchema = Yup.object({
  banco: Yup.string()
    .test('banco-valido', 'Banco no válido', function(value) {
      const bancosValidos = ['brou', 'itau', 'santander', 'scotiabank', 'hsbc', 'bbva', 'heritage'];
      return bancosValidos.includes(value);
    })
    .required('El banco es requerido'),
  tipoCuenta: Yup.string()
    .test('tipo-cuenta-valido', 'Tipo de cuenta no válido', function(value) {
      const tiposValidos = ['ahorro', 'corriente'];
      return tiposValidos.includes(value);
    })
    .required('El tipo de cuenta es requerido'),
  numeroCuenta: Yup.string()
    .required('El número de cuenta es requerido')
    .matches(/^\d+$/, 'El número de cuenta debe contener solo números')
    .min(8, 'El número de cuenta debe tener al menos 8 dígitos')
    .max(20, 'El número de cuenta no puede exceder 20 dígitos'),
  titular: Yup.string()
    .required('El titular es requerido')
    .min(2, 'El titular debe tener al menos 2 caracteres')
    .max(100, 'El titular no puede exceder 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El titular solo puede contener letras y espacios')
    .trim()
});

const historialReservaSchema = Yup.object({
  id: Yup.string().required('ID es requerido'),
  fecha: Yup.string()
    .required('Fecha es requerida')
    .matches(/^\d{1,2}\/\d{1,2}\/\d{4}$/, 'Formato de fecha inválido (DD/MM/YYYY)'),
  monto: Yup.number()
    .min(0, 'El monto no puede ser negativo')
    .required('Monto es requerido'),
  estado: Yup.string()
    .test('estado-historial-valido', 'Estado no válido', function(value) {
      const estadosValidos = ['completada', 'confirmada', 'pendiente'];
      return estadosValidos.includes(value);
    })
    .required('Estado es requerido'),
  descripcion: Yup.string()
    .required('Descripción es requerida')
    .max(200, 'La descripción no puede exceder 200 caracteres'),
  codigo: Yup.string()
    .required('Código es requerido')
    .max(50, 'El código no puede exceder 50 caracteres'),
  tipoEntidad: Yup.string()
    .required('Tipo de entidad es requerido')
    .max(50, 'El tipo de entidad no puede exceder 50 caracteres')
});

const usuarioSchema = Yup.object({
  _id: Yup.string(),
  id: Yup.string()
}).test('id-required', 'Se requiere ID de usuario', function (value) {
  return value._id || value.id;
});

const GestionGanancias = ({ navigation }) => {
  const dispatch = useDispatch();

  const { usuario: datosUsuario } = useSelector(state => state.auth);

  const {
    reservasCliente,
    resumenCliente,
    estadisticasCliente,
    loadingReservasCliente,
    loadingEstadisticas,
    errorReservasCliente,
    errorEstadisticas
  } = useSelector(state => state.reservas);

  const [modalVisible, setModalVisible] = useState(false);
  const [cuentaBancaria, setCuentaBancaria] = useState({
    banco: '',
    tipoCuenta: 'ahorro',
    numeroCuenta: '',
    titular: ''
  });
  const [cuentaGuardada, setCuentaGuardada] = useState(null);
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [reservasValidadas, setReservasValidadas] = useState([]);

  const authToken = useSelector(state => state.auth.token);

  const validarReservas = (reservasArray) => {
    try {
      if (!Array.isArray(reservasArray)) {
        console.warn('Las reservas no son un array válido');
        return [];
      }

      return reservasArray.filter(reserva => {
        try {
          reservaSchema.validateSync(reserva);
          return true;
        } catch (error) {
          console.warn(`Reserva inválida filtrada (${reserva._id}):`, error.message);
          return false;
        }
      });
    } catch (error) {
      console.error('Error al validar reservas:', error);
      return [];
    }
  };

  const validarGanancias = (ganancias) => {
    try {
      gananciasSchema.validateSync(ganancias);
      return ganancias;
    } catch (error) {
      console.warn('Ganancias inválidas, usando valores por defecto:', error.message);
      return {
        disponible: 0,
        pendiente: 0,
        total: 0,
        proximoPago: 'N/A'
      };
    }
  };

  const validarCuentaBancaria = async (cuenta) => {
    try {
      await cuentaBancariaSchema.validate(cuenta, { abortEarly: false });
      setErroresValidacion({});
      return true;
    } catch (error) {
      const errores = {};
      if (error.inner) {
        error.inner.forEach(err => {
          errores[err.path] = err.message;
        });
      } else {
        errores.general = error.message;
      }
      setErroresValidacion(errores);
      return false;
    }
  };

  const validarHistorial = (historial) => {
    try {
      if (!Array.isArray(historial)) {
        return [];
      }

      return historial.filter(item => {
        try {
          historialReservaSchema.validateSync(item);
          return true;
        } catch (error) {
          console.warn(`Item de historial inválido filtrado:`, error.message);
          return false;
        }
      });
    } catch (error) {
      console.error('Error al validar historial:', error);
      return [];
    }
  };

  useEffect(() => {
    try {
      if (datosUsuario) {
        usuarioSchema.validateSync(datosUsuario);
        const usuarioId = datosUsuario?._id || datosUsuario?.id;

        if (usuarioId) {
          dispatch(obtenerEstadisticasGananciasCliente({
            clienteId: usuarioId
          }));
        }
      }
    } catch (error) {
      console.error('Error de validación de usuario:', error.message);
      Alert.alert('Error', 'Datos de usuario inválidos');
    }
  }, [dispatch, datosUsuario, authToken]);

  useEffect(() => {
    if (reservasCliente) {
      const reservasValidas = validarReservas(reservasCliente);
      setReservasValidadas(reservasValidas);
    }
  }, [reservasCliente]);

  const calcularGanancias = () => {
    try {
      if (!reservasValidadas || reservasValidadas.length === 0) {
        return validarGanancias({
          disponible: 0,
          pendiente: 0,
          total: 0,
          proximoPago: 'N/A'
        });
      }

      let disponible = 0;
      let pendiente = 0;
      let total = 0;

      const ahora = new Date();
      const hace30Dias = new Date(ahora.getTime() - (30 * 24 * 60 * 60 * 1000));

      reservasValidadas.forEach((reserva) => {
        const precioFinal = Number(reserva.precioFinalPagado) || 0;

        if (isNaN(precioFinal) || precioFinal < 0) {
          console.warn(`Precio inválido en reserva ${reserva._id}: ${precioFinal}`);
          return;
        }

        const fechaReserva = new Date(reserva.fechaInicio || reserva.fecha || reserva.createdAt);

        if (isNaN(fechaReserva.getTime())) {
          console.warn(`Fecha inválida en reserva ${reserva._id}`);
          return;
        }

        total += precioFinal;

        if (reserva.estado === 'completada' && fechaReserva < hace30Dias) {
          disponible += precioFinal;
        }
        else if (reserva.estado === 'confirmada' || reserva.estado === 'completada') {
          pendiente += precioFinal;
        }
      });

      const proximoPago = new Date();
      proximoPago.setMonth(proximoPago.getMonth() + 1);
      proximoPago.setDate(1);

      const ganancias = {
        disponible,
        pendiente,
        total,
        proximoPago: proximoPago.toLocaleDateString('es-UY')
      };

      return validarGanancias(ganancias);
    } catch (error) {
      console.error('Error al calcular ganancias:', error);
      return validarGanancias({
        disponible: 0,
        pendiente: 0,
        total: 0,
        proximoPago: 'N/A'
      });
    }
  };

  const generarHistorialReservas = () => {
    try {
      if (!reservasValidadas || reservasValidadas.length === 0) {
        return [];
      }

      const historial = reservasValidadas
        .filter(reserva => ['completada', 'confirmada'].includes(reserva.estado))
        .sort((a, b) => new Date(b.fechaInicio || b.fecha || b.createdAt) -
          new Date(a.fechaInicio || a.fecha || a.createdAt))
        .slice(0, 10)
        .map(reserva => {
          const entidad = reserva.entidadReservada || {};
          const nombreEntidad = entidad.nombre || entidad.titulo || entidad.name || 'Entidad';
          const tipoEntidad = entidad.tipo || 'espacio';

          const tiposMapeados = {
            'oficina': 'Oficina',
            'espacio': 'Espacio',
            'escritorio': 'Escritorio',
            'escritorio_flexible': 'Escritorio',
            'sala': 'Sala',
            'sala_reunion': 'Sala de Reunión',
            'edificio': 'Edificio'
          };

          const tipoDisplay = tiposMapeados[tipoEntidad] || 'Espacio';

          return {
            id: reserva._id,
            fecha: new Date(reserva.fechaInicio || reserva.fecha || reserva.createdAt).toLocaleDateString('es-UY'),
            monto: reserva.precioFinalPagado || 0,
            estado: reserva.estado,
            descripcion: `Reserva de ${tipoDisplay}`,
            codigo: reserva.codigo || reserva._id?.slice(-6) || 'N/A',
            tipoEntidad: tipoDisplay
          };
        });

      return validarHistorial(historial);
    } catch (error) {
      console.error('Error al generar historial:', error);
      return [];
    }
  };

  const ganancias = useMemo(() => calcularGanancias(), [reservasValidadas]);
  const historialReservas = useMemo(() => generarHistorialReservas(), [reservasValidadas]);

  const bancos = [
    { id: 'brou', nombre: 'Banco República (BROU)', color: '#0066CC' },
    { id: 'itau', nombre: 'Itaú', color: '#FF6600' },
    { id: 'santander', nombre: 'Santander', color: '#EC0000' },
    { id: 'scotiabank', nombre: 'Scotiabank', color: '#E60000' },
    { id: 'hsbc', nombre: 'HSBC', color: '#DC0000' },
    { id: 'bbva', nombre: 'BBVA', color: '#004B93' },
    { id: 'heritage', nombre: 'Banco Heritage', color: '#1B4F72' },
  ];

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleGuardarCuenta = async () => {
    try {
      const esValida = await validarCuentaBancaria(cuentaBancaria);

      if (!esValida) {
        const primerError = Object.values(erroresValidacion)[0];
        Alert.alert('Error de validación', primerError);
        return;
      }

      const bancoSeleccionado = bancos.find(b => b.id === cuentaBancaria.banco);
      setCuentaGuardada({
        ...cuentaBancaria,
        banco: bancoSeleccionado?.nombre || cuentaBancaria.banco
      });
      setModalVisible(false);
      setErroresValidacion({});
      Alert.alert('Éxito', 'Cuenta bancaria guardada correctamente');
    } catch (error) {
      Alert.alert('Error', 'Error al guardar cuenta bancaria: ' + error.message);
    }
  };

  const formatearNumero = (numero) => {
    try {
      const num = Number(numero);
      if (isNaN(num)) {
        return '$0.00';
      }
      return `$${num.toLocaleString('es-UY', { minimumFractionDigits: 2 })}`;
    } catch (error) {
      console.error('Error al formatear número:', error);
      return '$0.00';
    }
  };

  const getEstadoColor = (estado) => {
    const estadosValidos = {
      'completada': '#27ae60',
      'confirmada': '#f39c12',
      'pendiente': '#3498db'
    };
    return estadosValidos[estado] || '#95a5a6';
  };

  const getEstadoText = (estado) => {
    const estadosTexto = {
      'completada': 'Completada',
      'confirmada': 'Confirmada',
      'pendiente': 'Pendiente'
    };
    return estadosTexto[estado] || estado;
  };

  const handleInputChange = (campo, valor) => {
    try {
      setCuentaBancaria({ ...cuentaBancaria, [campo]: valor });

      if (erroresValidacion[campo]) {
        setErroresValidacion({ ...erroresValidacion, [campo]: null });
      }
    } catch (error) {
      console.error('Error al cambiar input:', error);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setErroresValidacion({});
  };

  if (loadingReservasCliente || loadingEstadisticas) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ganancias</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando ganancias...</Text>
        </View>
      </SafeAreaView>
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
        <Text style={styles.headerTitle}>Ganancias</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.resumenContainer}>
          <View style={styles.gananciaPrincipal}>
            <Text style={styles.gananciaLabel}>Disponible para transferir</Text>
            <Text style={styles.gananciaValor}>{formatearNumero(ganancias.disponible)}</Text>
          </View>

          <View style={styles.gananciaSecundaria}>
            <View style={styles.gananciaItem}>
              <Text style={styles.gananciaItemLabel}>Pendiente</Text>
              <Text style={styles.gananciaItemValor}>{formatearNumero(ganancias.pendiente)}</Text>
            </View>
            <View style={styles.gananciaItem}>
              <Text style={styles.gananciaItemLabel}>Total generado</Text>
              <Text style={styles.gananciaItemValor}>{formatearNumero(ganancias.total)}</Text>
            </View>
          </View>

          <Text style={styles.proximoPago}>
            Próximo pago disponible: {ganancias.proximoPago}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de reservas</Text>

          {historialReservas.length > 0 ? (
            historialReservas.map((reserva) => (
              <View key={reserva.id} style={styles.transaccionItem}>
                <View style={styles.transaccionLeft}>
                  <Text style={styles.transaccionFecha}>{reserva.fecha}</Text>
                  <Text style={styles.transaccionDescripcion}>{reserva.descripcion}</Text>
                  <Text style={styles.transaccionCodigo}>#{reserva.codigo}</Text>
                </View>
                <View style={styles.transaccionRight}>
                  <Text style={styles.transaccionMonto}>
                    {formatearNumero(reserva.monto)}
                  </Text>
                  <View style={[
                    styles.estadoBadge,
                    { backgroundColor: `${getEstadoColor(reserva.estado)}15` }
                  ]}>
                    <Text style={[
                      styles.estadoText,
                      { color: getEstadoColor(reserva.estado) }
                    ]}>
                      {getEstadoText(reserva.estado)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#bdc3c7" />
              <Text style={styles.emptyText}>No hay reservas registradas</Text>
              <Text style={styles.emptySubtext}>
                Las ganancias aparecerán aquí cuando tengas reservas completadas en tus espacios
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {cuentaGuardada ? 'Editar cuenta bancaria' : 'Agregar cuenta bancaria'}
              </Text>
              <TouchableOpacity onPress={handleModalClose}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Banco</Text>
              <View style={styles.bancosList}>
                {bancos.map((banco) => (
                  <TouchableOpacity
                    key={banco.id}
                    style={[
                      styles.bancoOption,
                      cuentaBancaria.banco === banco.id && styles.bancoOptionSelected,
                      erroresValidacion.banco && styles.inputError
                    ]}
                    onPress={() => handleInputChange('banco', banco.id)}
                  >
                    <View style={[styles.bancoColor, { backgroundColor: banco.color }]} />
                    <Text style={[
                      styles.bancoOptionText,
                      cuentaBancaria.banco === banco.id && styles.bancoOptionTextSelected
                    ]}>
                      {banco.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {erroresValidacion.banco && (
                <Text style={styles.errorText}>{erroresValidacion.banco}</Text>
              )}

              <Text style={styles.inputLabel}>Tipo de cuenta</Text>
              <View style={styles.tipoCuentaContainer}>
                <TouchableOpacity
                  style={[
                    styles.tipoCuentaButton,
                    cuentaBancaria.tipoCuenta === 'ahorro' && styles.tipoCuentaButtonActive
                  ]}
                  onPress={() => handleInputChange('tipoCuenta', 'ahorro')}
                >
                  <Text style={[
                    styles.tipoCuentaText,
                    cuentaBancaria.tipoCuenta === 'ahorro' && styles.tipoCuentaTextActive
                  ]}>
                    Caja de ahorro
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tipoCuentaButton,
                    cuentaBancaria.tipoCuenta === 'corriente' && styles.tipoCuentaButtonActive
                  ]}
                  onPress={() => handleInputChange('tipoCuenta', 'corriente')}
                >
                  <Text style={[
                    styles.tipoCuentaText,
                    cuentaBancaria.tipoCuenta === 'corriente' && styles.tipoCuentaTextActive
                  ]}>
                    Cuenta corriente
                  </Text>
                </TouchableOpacity>
              </View>
              {erroresValidacion.tipoCuenta && (
                <Text style={styles.errorText}>{erroresValidacion.tipoCuenta}</Text>
              )}

              <Text style={styles.inputLabel}>Número de cuenta</Text>
              <TextInput
                style={[
                  styles.input,
                  erroresValidacion.numeroCuenta && styles.inputError
                ]}
                placeholder="Ingresa el número de cuenta"
                value={cuentaBancaria.numeroCuenta}
                onChangeText={(text) => handleInputChange('numeroCuenta', text)}
                keyboardType="numeric"
                maxLength={20}
              />
              {erroresValidacion.numeroCuenta && (
                <Text style={styles.errorText}>{erroresValidacion.numeroCuenta}</Text>
              )}

              <Text style={styles.inputLabel}>Titular de la cuenta</Text>
              <TextInput
                style={[
                  styles.input,
                  erroresValidacion.titular && styles.inputError
                ]}
                placeholder="Nombre completo del titular"
                value={cuentaBancaria.titular}
                onChangeText={(text) => handleInputChange('titular', text)}
                maxLength={100}
              />
              {erroresValidacion.titular && (
                <Text style={styles.errorText}>{erroresValidacion.titular}</Text>
              )}

              <TouchableOpacity
                style={styles.guardarButton}
                onPress={handleGuardarCuenta}
              >
                <Text style={styles.guardarButtonText}>Guardar cuenta</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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
    fontSize: 20,
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
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  resumenContainer: {
    backgroundColor: '#4a90e2',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gananciaPrincipal: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gananciaLabel: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    fontFamily: 'System',
  },
  gananciaValor: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
    fontFamily: 'System',
  },
  gananciaSecundaria: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 15,
  },
  gananciaItem: {
    alignItems: 'center',
  },
  gananciaItemLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    fontFamily: 'System',
  },
  gananciaItemValor: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 4,
    fontFamily: 'System',
  },
  proximoPago: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 15,
    fontFamily: 'System',
  },
  section: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
    marginBottom: 15,
  },
  transaccionItem: {
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
  },
  transaccionLeft: {
    flex: 1,
  },
  transaccionFecha: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  transaccionDescripcion: {
    fontSize: 16,
    color: '#2c3e50',
    marginTop: 2,
    fontFamily: 'System',
  },
  transaccionCodigo: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
    fontFamily: 'System',
  },
  transaccionRight: {
    alignItems: 'flex-end',
  },
  transaccionMonto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    fontFamily: 'System',
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  estadoText: {
    fontSize: 12,
    fontFamily: 'System',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'System',
  },
  bottomSpacing: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    marginTop: 15,
    fontFamily: 'System',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  bancosList: {
    marginBottom: 15,
  },
  bancoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  bancoOptionSelected: {
    backgroundColor: '#e8f4fd',
    borderColor: '#4a90e2',
  },
  bancoColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  bancoOptionText: {
    fontSize: 16,
    color: '#2c3e50',
    fontFamily: 'System',
  },
  bancoOptionTextSelected: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  tipoCuentaContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  tipoCuentaButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    alignItems: 'center',
  },
  tipoCuentaButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  tipoCuentaText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
    fontFamily: 'System',
  },
  tipoCuentaTextActive: {
    color: '#fff',
  },
  guardarButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  guardarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
});

export default GestionGanancias;