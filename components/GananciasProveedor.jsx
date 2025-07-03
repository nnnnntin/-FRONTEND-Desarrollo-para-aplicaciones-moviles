import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import * as yup from 'yup';

const resumenGananciasSchema = yup.object({
  totalMes: yup
    .number()
    .required('El total del mes es obligatorio')
    .min(0, 'El total del mes no puede ser negativo')
    .max(999999, 'El total del mes no puede exceder $999,999'),

  totalSemana: yup
    .number()
    .required('El total de la semana es obligatorio')
    .min(0, 'El total de la semana no puede ser negativo')
    .max(99999, 'El total de la semana no puede exceder $99,999'),

  serviciosCompletados: yup
    .number()
    .required('El número de servicios completados es obligatorio')
    .integer('El número de servicios debe ser un entero')
    .min(0, 'El número de servicios no puede ser negativo')
    .max(1000, 'El número de servicios no puede exceder 1000'),

  calificacionPromedio: yup
    .number()
    .required('La calificación promedio es obligatoria')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5'),

  proximoPago: yup
    .string()
    .required('La fecha del próximo pago es obligatoria')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'El formato de fecha debe ser DD/MM/YYYY')
});

const servicioSchema = yup.object({
  id: yup
    .number()
    .required('El ID del servicio es obligatorio')
    .positive('El ID debe ser un número positivo'),

  servicio: yup
    .string()
    .required('El nombre del servicio es obligatorio')
    .min(3, 'El nombre del servicio debe tener al menos 3 caracteres')
    .max(100, 'El nombre del servicio no puede exceder los 100 caracteres'),

  espacio: yup
    .string()
    .required('El nombre del espacio es obligatorio')
    .min(3, 'El nombre del espacio debe tener al menos 3 caracteres')
    .max(100, 'El nombre del espacio no puede exceder los 100 caracteres'),

  fecha: yup
    .string()
    .required('La fecha es obligatoria')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'El formato de fecha debe ser DD/MM/YYYY'),

  monto: yup
    .number()
    .required('El monto es obligatorio')
    .positive('El monto debe ser un número positivo')
    .max(99999, 'El monto no puede exceder $99,999'),

  estado: yup
    .string()
    .required('El estado es obligatorio')
    .test('estado-valido', 'Estado inválido', function (value) {
      const estadosValidos = ['pagado', 'pendiente', 'cancelado'];
      return estadosValidos.includes(value);
    })
});

const retiroFondosSchema = yup.object({
  monto: yup
    .number()
    .required('El monto a retirar es obligatorio')
    .min(100, 'El monto mínimo para retirar es $100')
    .max(50000, 'El monto máximo para retirar es $50,000')
    .test('fondos-disponibles', 'No tienes suficientes fondos disponibles', function (value) {
      const fondosDisponibles = this.options.context?.fondosDisponibles || 0;
      return value <= fondosDisponibles;
    }),

  metodoPago: yup
    .string()
    .required('El método de pago es obligatorio')
    .test('metodo-pago-valido', 'Método de pago inválido', function (value) {
      const metodosValidos = ['transferencia', 'paypal', 'cheque'];
      return metodosValidos.includes(value);
    }),

  cuentaDestino: yup
    .string()
    .required('La cuenta destino es obligatoria')
    .min(10, 'La cuenta destino debe tener al menos 10 caracteres')
    .max(50, 'La cuenta destino no puede exceder los 50 caracteres')
});

const GananciasProveedor = ({ navigation }) => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [validacionCompleta, setValidacionCompleta] = useState(false);
  const [modalRetiro, setModalRetiro] = useState(false);
  const [datosRetiro, setDatosRetiro] = useState({
    monto: '',
    metodoPago: '',
    cuentaDestino: ''
  });
  const [procesandoRetiro, setProcesandoRetiro] = useState(false);
  const [erroresRetiro, setErroresRetiro] = useState({});

  const resumenGanancias = {
    totalMes: 2850,
    totalSemana: 680,
    serviciosCompletados: 18,
    calificacionPromedio: 4.8,
    proximoPago: '25/06/2025'
  };

  const serviciosRecientes = [
    {
      id: 1,
      servicio: 'Limpieza profunda',
      espacio: 'Oficina Skyview',
      fecha: '15/06/2025',
      monto: 150,
      estado: 'pagado'
    },
    {
      id: 2,
      servicio: 'Mantenimiento AC',
      espacio: 'Sala Premium',
      fecha: '14/06/2025',
      monto: 200,
      estado: 'pagado'
    },
    {
      id: 3,
      servicio: 'Limpieza regular',
      espacio: 'Oficina Centro',
      fecha: '13/06/2025',
      monto: 80,
      estado: 'pendiente'
    },
    {
      id: 4,
      servicio: 'Reparación eléctrica',
      espacio: 'Espacio Coworking',
      fecha: '12/06/2025',
      monto: 250,
      estado: 'pagado'
    }
  ];

  useEffect(() => {
    validarDatos();
  }, []);

  const validarDatos = async () => {
    try {
      await resumenGananciasSchema.validate(resumenGanancias, { abortEarly: false });

      for (const servicio of serviciosRecientes) {
        await servicioSchema.validate(servicio, { abortEarly: false });
      }

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
    }
  };

  const validarDatosRetiro = async () => {
    try {
      const fondosDisponibles = calcularFondosDisponibles();

      await retiroFondosSchema.validate({
        ...datosRetiro,
        monto: parseFloat(datosRetiro.monto)
      }, {
        abortEarly: false,
        context: { fondosDisponibles }
      });

      setErroresRetiro({});
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

      setErroresRetiro(errores);
      return false;
    }
  };

  const calcularFondosDisponibles = () => {
    return serviciosRecientes
      .filter(servicio => servicio.estado === 'pagado')
      .reduce((total, servicio) => total + servicio.monto, 0);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const calcularTotal = (periodo) => {
    switch (periodo) {
      case 'semana': return resumenGanancias.totalSemana;
      case 'mes': return resumenGanancias.totalMes;
      case 'año': return resumenGanancias.totalMes * 12;
      default: return 0;
    }
  };

  const abrirModalRetiro = () => {
    const fondosDisponibles = calcularFondosDisponibles();

    if (fondosDisponibles < 100) {
      Alert.alert(
        'Fondos insuficientes',
        'Necesitas al menos $100 para realizar un retiro. Actualmente tienes $' + fondosDisponibles + ' disponibles.',
        [{ text: 'OK' }]
      );
      return;
    }

    setModalRetiro(true);
  };

  const cerrarModalRetiro = () => {
    setModalRetiro(false);
    setDatosRetiro({
      monto: '',
      metodoPago: '',
      cuentaDestino: ''
    });
    setErroresRetiro({});
  };

  const procesarRetiro = async () => {
    const esValido = await validarDatosRetiro();

    if (!esValido) {
      const erroresTexto = Object.values(erroresRetiro)
        .filter(error => error)
        .join('\n');

      Alert.alert('Datos incorrectos', erroresTexto);
      return;
    }

    setProcesandoRetiro(true);

    setTimeout(() => {
      setProcesandoRetiro(false);
      Alert.alert(
        'Retiro procesado',
        `Tu retiro de $${datosRetiro.monto} ha sido procesado exitosamente. Los fondos llegarán a tu cuenta en 2-3 días hábiles.`,
        [
          {
            text: 'OK',
            onPress: () => cerrarModalRetiro()
          }
        ]
      );
    }, 2000);
  };

  const handleInputRetiro = (campo, valor) => {
    setDatosRetiro(prev => ({
      ...prev,
      [campo]: valor
    }));

    if (erroresRetiro[campo]) {
      setErroresRetiro(prev => ({
        ...prev,
        [campo]: null
      }));
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pagado': return '#27ae60';
      case 'pendiente': return '#f39c12';
      case 'cancelado': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const fondosDisponibles = calcularFondosDisponibles();

  const AlertaValidacion = () => {
    if (validacionCompleta) {
      return (
        <View style={styles.alertaExito}>
          <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
          <Text style={styles.alertaExitoTexto}>
            Todos los datos financieros son válidos
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
              Algunos datos financieros presentan inconsistencias. Contacta soporte si persisten los problemas.
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  const ModalRetiroFondos = () => (
    <Modal
      visible={modalRetiro}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={cerrarModalRetiro}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={cerrarModalRetiro} style={styles.modalCancelButton}>
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Retirar Fondos</Text>
          <TouchableOpacity
            onPress={procesarRetiro}
            style={[styles.modalSaveButton, procesandoRetiro && styles.modalSaveButtonDisabled]}
            disabled={procesandoRetiro}
          >
            {procesandoRetiro ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.modalSaveText}>Retirar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.fondosDisponiblesCard}>
            <Text style={styles.fondosDisponiblesLabel}>Fondos disponibles</Text>
            <Text style={styles.fondosDisponiblesValor}>${fondosDisponibles}</Text>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Monto a retirar</Text>
            <TextInput
              style={[styles.modalInput, erroresRetiro.monto && styles.modalInputError]}
              value={datosRetiro.monto}
              onChangeText={(text) => handleInputRetiro('monto', text)}
              placeholder="Monto mínimo: $100"
              keyboardType="numeric"
              maxLength={8}
            />
            {erroresRetiro.monto && <Text style={styles.modalErrorText}>{erroresRetiro.monto}</Text>}
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Método de pago</Text>
            <View style={styles.metodosPagoContainer}>
              {[
                { id: 'transferencia', nombre: 'Transferencia bancaria', icon: 'card' },
                { id: 'paypal', nombre: 'PayPal', icon: 'logo-paypal' },
                { id: 'cheque', nombre: 'Cheque', icon: 'document-text' }
              ].map(metodo => (
                <TouchableOpacity
                  key={metodo.id}
                  style={[
                    styles.metodoPagoOption,
                    datosRetiro.metodoPago === metodo.id && styles.metodoPagoOptionActive
                  ]}
                  onPress={() => handleInputRetiro('metodoPago', metodo.id)}
                >
                  <Ionicons
                    name={metodo.icon}
                    size={20}
                    color={datosRetiro.metodoPago === metodo.id ? '#4a90e2' : '#7f8c8d'}
                  />
                  <Text style={[
                    styles.metodoPagoText,
                    datosRetiro.metodoPago === metodo.id && styles.metodoPagoTextActive
                  ]}>
                    {metodo.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {erroresRetiro.metodoPago && <Text style={styles.modalErrorText}>{erroresRetiro.metodoPago}</Text>}
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Cuenta destino</Text>
            <TextInput
              style={[styles.modalInput, erroresRetiro.cuentaDestino && styles.modalInputError]}
              value={datosRetiro.cuentaDestino}
              onChangeText={(text) => handleInputRetiro('cuentaDestino', text)}
              placeholder={
                datosRetiro.metodoPago === 'transferencia' ? 'Número de cuenta bancaria' :
                  datosRetiro.metodoPago === 'paypal' ? 'Email de PayPal' :
                    datosRetiro.metodoPago === 'cheque' ? 'Dirección de envío' :
                      'Selecciona un método de pago primero'
              }
              editable={!!datosRetiro.metodoPago}
              maxLength={50}
            />
            {erroresRetiro.cuentaDestino && <Text style={styles.modalErrorText}>{erroresRetiro.cuentaDestino}</Text>}
          </View>

          <View style={styles.infoRetiroCard}>
            <Ionicons name="information-circle" size={20} color="#3498db" />
            <Text style={styles.infoRetiroText}>
              Los retiros se procesan en 2-3 días hábiles. Se aplicará una comisión del 2% sobre el monto retirado.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

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
        <Text style={styles.headerTitle}>Mis ganancias</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <AlertaValidacion />

        <View style={styles.resumenCard}>
          <Text style={styles.resumenTitulo}>Resumen de ganancias</Text>

          <View style={styles.periodosContainer}>
            {['semana', 'mes', 'año'].map((periodo) => (
              <TouchableOpacity
                key={periodo}
                style={[
                  styles.periodoButton,
                  periodoSeleccionado === periodo && styles.periodoButtonActive
                ]}
                onPress={() => setPeriodoSeleccionado(periodo)}
              >
                <Text style={[
                  styles.periodoText,
                  periodoSeleccionado === periodo && styles.periodoTextActive
                ]}>
                  {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.montoContainer}>
            <Text style={styles.montoLabel}>Total {periodoSeleccionado}</Text>
            <Text style={styles.montoValor}>${calcularTotal(periodoSeleccionado)}</Text>
            {erroresValidacion.totalMes && periodoSeleccionado === 'mes' && (
              <Text style={styles.montoError}>⚠️ {erroresValidacion.totalMes}</Text>
            )}
            {erroresValidacion.totalSemana && periodoSeleccionado === 'semana' && (
              <Text style={styles.montoError}>⚠️ {erroresValidacion.totalSemana}</Text>
            )}
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="briefcase" size={24} color="#4a90e2" />
              <Text style={styles.statValor}>{resumenGanancias.serviciosCompletados}</Text>
              <Text style={styles.statLabel}>Servicios</Text>
              {erroresValidacion.serviciosCompletados && (
                <Text style={styles.statError}>⚠️</Text>
              )}
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={24} color="#f39c12" />
              <Text style={styles.statValor}>{resumenGanancias.calificacionPromedio}</Text>
              <Text style={styles.statLabel}>Calificación</Text>
              {erroresValidacion.calificacionPromedio && (
                <Text style={styles.statError}>⚠️</Text>
              )}
            </View>
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={24} color="#27ae60" />
              <Text style={styles.statValor}>{resumenGanancias.proximoPago}</Text>
              <Text style={styles.statLabel}>Próximo pago</Text>
              {erroresValidacion.proximoPago && (
                <Text style={styles.statError}>⚠️</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Servicios recientes</Text>

          {serviciosRecientes.map((servicio, index) => (
            <View key={servicio.id} style={styles.servicioCard}>
              <View style={styles.servicioInfo}>
                <Text style={styles.servicioNombre}>{servicio.servicio}</Text>
                <Text style={styles.servicioEspacio}>{servicio.espacio}</Text>
                <Text style={styles.servicioFecha}>{servicio.fecha}</Text>
                {erroresValidacion[`${index}.servicio`] && (
                  <Text style={styles.servicioError}>⚠️ Datos del servicio inconsistentes</Text>
                )}
              </View>
              <View style={styles.servicioMonto}>
                <Text style={styles.montoTexto}>${servicio.monto}</Text>
                <View style={[
                  styles.estadoBadge,
                  { backgroundColor: getEstadoColor(servicio.estado) }
                ]}>
                  <Text style={styles.estadoTexto}>
                    {servicio.estado.charAt(0).toUpperCase() + servicio.estado.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.fondosDisponiblesSection}>
          <Text style={styles.fondosDisponiblesTitulo}>Fondos disponibles para retiro</Text>
          <Text style={styles.fondosDisponiblesValorGrande}>${fondosDisponibles}</Text>
        </View>

        <TouchableOpacity style={styles.retirarButton} onPress={abrirModalRetiro}>
          <Ionicons name="cash" size={24} color="#fff" />
          <Text style={styles.retirarButtonText}>Retirar fondos</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3498db" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitulo}>Información sobre pagos</Text>
            <Text style={styles.infoTexto}>
              Los pagos se procesan automáticamente cada 15 días.
              Puedes retirar tus fondos en cualquier momento con un mínimo de $100.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <ModalRetiroFondos />
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

  resumenCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resumenTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    fontFamily: 'System',
  },
  periodosContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  periodoButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodoButtonActive: {
    backgroundColor: '#4a90e2',
  },
  periodoText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
    fontFamily: 'System',
  },
  periodoTextActive: {
    color: '#fff',
  },
  montoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  montoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
    fontFamily: 'System',
  },
  montoValor: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#27ae60',
    fontFamily: 'System',
  },
  montoError: {
    fontSize: 11,
    color: '#e74c3c',
    marginTop: 4,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    position: 'relative',
  },
  statValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginVertical: 5,
    fontFamily: 'System',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  statError: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 12,
    color: '#e74c3c',
  },
  seccion: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    fontFamily: 'System',
  },
  servicioCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  servicioInfo: {
    flex: 1,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
    fontFamily: 'System',
  },
  servicioEspacio: {
    fontSize: 14,
    color: '#5a6c7d',
    marginBottom: 2,
    fontFamily: 'System',
  },
  servicioFecha: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  servicioError: {
    fontSize: 10,
    color: '#e74c3c',
    marginTop: 2,
  },
  servicioMonto: {
    alignItems: 'flex-end',
  },
  montoTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
    fontFamily: 'System',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoTexto: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'System',
  },

  fondosDisponiblesSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#27ae60',
  },
  fondosDisponiblesTitulo: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'System',
  },
  fondosDisponiblesValorGrande: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#27ae60',
    fontFamily: 'System',
  },

  retirarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  retirarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e8f4fd',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
    fontFamily: 'System',
  },
  infoTexto: {
    fontSize: 13,
    color: '#5a6c7d',
    lineHeight: 18,
    fontFamily: 'System',
  },
  bottomSpacing: {
    height: 30,
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
    backgroundColor: '#27ae60',
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
  fondosDisponiblesCard: {
    backgroundColor: '#f0f9f4',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  fondosDisponiblesLabel: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '500',
    marginBottom: 4,
  },
  fondosDisponiblesValor: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#047857',
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
  modalInputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
    backgroundColor: '#fef8f8',
  },
  modalErrorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 4,
  },
  metodosPagoContainer: {
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
  infoRetiroCard: {
    flexDirection: 'row',
    backgroundColor: '#e8f4fd',
    padding: 16,
    borderRadius: 8,
    gap: 12,
    marginTop: 20,
  },
  infoRetiroText: {
    flex: 1,
    fontSize: 13,
    color: '#5a6c7d',
    lineHeight: 18,
  },
});

export default GananciasProveedor;