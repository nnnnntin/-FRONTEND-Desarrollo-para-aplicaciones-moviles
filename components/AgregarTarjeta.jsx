import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { agregarMetodoPago, clearErrorMetodosPago } from '../store/slices/usuarioSlice';

const tarjetaSchema = Yup.object({
  numeroTarjeta: Yup.string()
    .required('El número de tarjeta es requerido')
    .test('tarjeta-valida', 'El número de tarjeta debe tener entre 13 y 19 dígitos', function(value) {
      if (!value) return false;
      const numeroLimpio = value.replace(/\s/g, '');
      return /^\d{13,19}$/.test(numeroLimpio);
    }),
  
  cvc: Yup.string()
    .required('El CVC es requerido')
    .matches(/^\d{3,4}$/, 'El CVC debe tener exactamente 3 o 4 dígitos'),
  
  fechaExpiracion: Yup.string()
    .required('La fecha de expiración es requerida')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'El formato debe ser MM/AA con mes válido (01-12)')
    .test('fecha-valida', 'La tarjeta está vencida', function(value) {
      if (!value || !value.includes('/')) return false;
      
      const [mes, año] = value.split('/');
      const mesNum = parseInt(mes);
      const añoNum = parseInt(año);
      
      if (mesNum < 1 || mesNum > 12) {
        return this.createError({ message: 'El mes debe estar entre 01 y 12' });
      }
      
      const fechaActual = new Date();
      const añoCompleto = 2000 + añoNum;
      const fechaTarjeta = new Date(añoCompleto, mesNum - 1);
      
      return fechaTarjeta >= fechaActual;
    }),
  
  nombreTitular: Yup.string()
    .required('El nombre del titular es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  predeterminado: Yup.boolean()
});

const validarDatosMetodoPago = (metodoPagoData) => {
  const errores = [];
  
  if (!metodoPagoData.numeroTarjeta) {
    errores.push('Número de tarjeta es requerido');
  } else {
    const numeroLimpio = metodoPagoData.numeroTarjeta.replace(/\s/g, '');
    if (numeroLimpio.length !== 16 || !/^\d+$/.test(numeroLimpio)) {
      errores.push('Número de tarjeta debe tener 16 dígitos');
    }
  }
  
  if (!metodoPagoData.nombreTitular || metodoPagoData.nombreTitular.trim().length < 2) {
    errores.push('Nombre del titular debe tener al menos 2 caracteres');
  }
  
  if (!metodoPagoData.fechaExpiracion) {
    errores.push('Fecha de expiración es requerida');
  } else if (!/^\d{2}\/\d{2}$/.test(metodoPagoData.fechaExpiracion)) {
    errores.push('Formato de fecha inválido (debe ser MM/AA)');
  } else {
    const [mes, año] = metodoPagoData.fechaExpiracion.split('/');
    const fechaActual = new Date();
    const fechaTarjeta = new Date(2000 + parseInt(año), parseInt(mes) - 1);
    
    if (fechaTarjeta < fechaActual) {
      errores.push('La tarjeta está vencida');
    }
  }
  
  if (!metodoPagoData.cvc) {
    errores.push('CVC es requerido');
  } else if (metodoPagoData.cvc.length < 3 || metodoPagoData.cvc.length > 4) {
    errores.push('CVC debe tener 3 o 4 dígitos');
  } else if (!/^\d+$/.test(metodoPagoData.cvc)) {
    errores.push('CVC solo puede contener números');
  }
  
  return errores;
};

const verificarConectividad = async () => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

const AgregarTarjeta = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const loadingMetodosPago = useSelector(state => state.usuario.loadingMetodosPago);
  const errorMetodosPago = useSelector(state => state.usuario.errorMetodosPago);
  const usuario = useSelector(state => state.auth.usuario);
  const auth = useSelector(state => state.auth);

  const { usuarioId, onTarjetaAgregada } = route?.params || {};

  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [cvc, setCvc] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [predeterminado, setPredeterminado] = useState(false);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (errorMetodosPago) {
      console.log('Error previo en métodos pago:', errorMetodosPago);
    }
  }, [usuario, usuarioId, auth?.token, loadingMetodosPago, errorMetodosPago]);

  useEffect(() => {
    limpiarErrores();
  }, []);

  const limpiarErrores = () => {
    setErrores({});
    dispatch(clearErrorMetodosPago());
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const formatearNumeroTarjeta = (texto) => {
    const numeros = texto.replace(/\D/g, '');
    const numerosLimitados = numeros.slice(0, 16);
    const numeroFormateado = numerosLimitados.replace(/(\d{4})(?=\d)/g, '$1 ');
    return numeroFormateado;
  };

  const formatearFecha = (texto) => {
    const numeros = texto.replace(/\D/g, '');
    const numerosLimitados = numeros.slice(0, 4);

    if (numerosLimitados.length >= 2) {
      return numerosLimitados.slice(0, 2) + '/' + numerosLimitados.slice(2);
    }

    return numerosLimitados;
  };

  const formatearCVC = (texto) => {
    return texto.replace(/\D/g, '').slice(0, 4);
  };

  const detectarTipoTarjeta = (numero) => {
    const numeroLimpio = numero.replace(/\s/g, '');

    if (numeroLimpio.startsWith('4')) return 'Visa';

    if (numeroLimpio.startsWith('5') ||
      (numeroLimpio.startsWith('2') &&
        parseInt(numeroLimpio.substring(0, 4)) >= 2221 &&
        parseInt(numeroLimpio.substring(0, 4)) <= 2720)) {
      return 'Mastercard';
    }

    if (numeroLimpio.startsWith('34') || numeroLimpio.startsWith('37')) {
      return 'American Express';
    }

    if (numeroLimpio.startsWith('6')) return 'Discover';

    if (numeroLimpio.startsWith('30') ||
      numeroLimpio.startsWith('36') ||
      numeroLimpio.startsWith('38')) {
      return 'Diners Club';
    }

    if (numeroLimpio.startsWith('35')) return 'JCB';

    return null;
  };

  const validarCampo = async (campo, valor, todosLosDatos = null) => {
    try {
      if (todosLosDatos) {
        await tarjetaSchema.validateAt(campo, todosLosDatos);
      } else {
        const datosTemp = {
          numeroTarjeta,
          cvc,
          fechaExpiracion,
          nombreTitular,
          predeterminado,
          [campo]: valor
        };
        await tarjetaSchema.validateAt(campo, datosTemp);
      }
      
      setErrores(prev => ({
        ...prev,
        [campo]: null
      }));
      return true;
    } catch (error) {
      setErrores(prev => ({
        ...prev,
        [campo]: error.message
      }));
      return false;
    }
  };

  const validarFormulario = async () => {
    const datosFormulario = {
      numeroTarjeta,
      cvc,
      fechaExpiracion,
      nombreTitular,
      predeterminado
    };

    try {
      await tarjetaSchema.validate(datosFormulario, { abortEarly: false });
      setErrores({});
      return true;
    } catch (error) {
      const nuevosErrores = {};
      error.inner.forEach(err => {
        nuevosErrores[err.path] = err.message;
      });
      setErrores(nuevosErrores);
      
      const primerError = error.inner[0];
      if (primerError) {
        Alert.alert('Error de validación', primerError.message);
      }
      
      return false;
    }
  };

  const handleCambioNumeroTarjeta = (texto) => {
    const numeroFormateado = formatearNumeroTarjeta(texto);
    setNumeroTarjeta(numeroFormateado);
    validarCampo('numeroTarjeta', numeroFormateado);
  };

  const handleCambioCVC = (texto) => {
    const cvcFormateado = formatearCVC(texto);
    setCvc(cvcFormateado);
    validarCampo('cvc', cvcFormateado);
  };

  const handleCambioFecha = (texto) => {
    const fechaFormateada = formatearFecha(texto);
    setFechaExpiracion(fechaFormateada);
    validarCampo('fechaExpiracion', fechaFormateada);
  };

  const handleCambioNombre = (texto) => {
    setNombreTitular(texto);
    validarCampo('nombreTitular', texto);
  };

 const handleAgregar = async () => {
  const esValido = await validarFormulario();
  if (!esValido) return;

  const metodoPagoData = {
    numeroTarjeta: numeroTarjeta,
    cvc,
    fechaExpiracion,
    nombreTitular: nombreTitular.trim(),
    predeterminado,
    marca: detectarTipoTarjeta(numeroTarjeta),
  };

  const erroresValidacion = validarDatosMetodoPago(metodoPagoData);
  if (erroresValidacion.length > 0) {
    Alert.alert(
      'Error de validación', 
      erroresValidacion.join('\n'),
      [{ text: 'OK' }]
    );
    return;
  }

  const tipoTarjeta = detectarTipoTarjeta(numeroTarjeta);
  const ultimosCuatroDigitos = numeroTarjeta.replace(/\s/g, '').slice(-4);
  const userId = usuarioId || usuario?.id || usuario?._id;
  
  if (!userId) {
    return Alert.alert('Error', 'No se pudo identificar el usuario');
  }

  const fechaRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!fechaRegex.test(fechaExpiracion)) {
    Alert.alert(
      'Error de formato',
      'La fecha debe estar en formato MM/AA con mes válido (01-12)',
      [{ text: 'OK' }]
    );
    return;
  }

  try {
    const payload = await dispatch(
      agregarMetodoPago({ usuarioId: userId, metodoPago: metodoPagoData })
    ).unwrap();

    Alert.alert(
      'Tarjeta Agregada',
      `${(tipoTarjeta || 'Tarjeta').toUpperCase()} •••• ${ultimosCuatroDigitos} ha sido agregada exitosamente`,
      [{
        text: 'OK', onPress: () => {
          if (onTarjetaAgregada) {
            onTarjetaAgregada();
          }
          navigation.goBack();
        }
      }]
    );

  } catch (error) {
    console.error('=== ERROR AL AGREGAR TARJETA ===');
    console.error('Error type:', typeof error);
    console.error('Error content:', error);
    
    let mensaje = 'Error desconocido al agregar la tarjeta';
    
    if (typeof error === 'string') {
      if (error.includes('Error de validación')) {
        mensaje = error;
      } else if (error.includes('fetch') || error.includes('network')) {
        mensaje = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
      } else if (error.includes('401') || error.includes('Unauthorized')) {
        mensaje = 'Sesión expirada. Por favor inicia sesión nuevamente.';
      } else if (error.includes('400') || error.includes('Bad Request')) {
        mensaje = 'Datos de tarjeta inválidos. Verifica la información ingresada.';
      } else if (error.includes('500') || error.includes('Internal Server Error')) {
        mensaje = 'Error del servidor. Intenta nuevamente en unos minutos.';
      } else {
        mensaje = error;
      }
    } else if (error?.message) {
      mensaje = error.message;
    }
    
    Alert.alert(
      'Error al agregar tarjeta', 
      mensaje,
      [
        { 
          text: 'Reintentar', 
          onPress: () => {
            handleAgregar(); 
          }
        },
        { 
          text: 'Cancelar', 
          style: 'cancel',
          onPress: () => {
            console.log('Usuario canceló después del error');
          }
        }
      ]
    );
  }
};

  const handleAgregarConVerificacion = async () => {
    const hayConectividad = await verificarConectividad();
    
    if (!hayConectividad) {
      Alert.alert(
        'Sin conexión',
        'No se puede conectar con el servidor. Verifica tu conexión a internet.',
        [
          { 
            text: 'Reintentar', 
            onPress: () => handleAgregarConVerificacion()
          },
          { 
            text: 'Cancelar', 
            style: 'cancel'
          }
        ]
      );
      return;
    }
    
    handleAgregar();
  };

  const renderErrorText = (campo) => {
    if (errores[campo]) {
      return (
        <Text style={styles.errorText}>
          {errores[campo]}
        </Text>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          activeOpacity={0.7}
          disabled={loadingMetodosPago}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar Tarjeta</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Agregue una tarjeta</Text>
          <Text style={styles.sectionSubtitle}>
            Ingresa los datos de tu tarjeta de forma segura
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nombre del titular</Text>
            <TextInput
              style={[
                styles.input,
                errores.nombreTitular && styles.inputError
              ]}
              placeholder="Nombre como aparece en la tarjeta"
              placeholderTextColor="#bdc3c7"
              value={nombreTitular}
              onChangeText={handleCambioNombre}
              autoCapitalize="words"
              editable={!loadingMetodosPago}
            />
            {renderErrorText('nombreTitular')}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Número de tarjeta</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[
                  styles.input,
                  errores.numeroTarjeta && styles.inputError
                ]}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#bdc3c7"
                value={numeroTarjeta}
                onChangeText={handleCambioNumeroTarjeta}
                keyboardType="numeric"
                maxLength={19}
                editable={!loadingMetodosPago}
              />
              {numeroTarjeta.length > 0 && (
                <View style={styles.tipoTarjetaContainer}>
                  <Text style={styles.tipoTarjetaTexto}>
                    {detectarTipoTarjeta(numeroTarjeta)}
                  </Text>
                </View>
              )}
            </View>
            {renderErrorText('numeroTarjeta')}
          </View>

          <View style={styles.rowContainer}>
            <View style={styles.halfInputContainer}>
              <Text style={styles.inputLabel}>Fecha expiración</Text>
              <TextInput
                style={[
                  styles.input,
                  errores.fechaExpiracion && styles.inputError
                ]}
                placeholder="MM/AA"
                placeholderTextColor="#bdc3c7"
                value={fechaExpiracion}
                onChangeText={handleCambioFecha}
                keyboardType="numeric"
                maxLength={5}
                editable={!loadingMetodosPago}
              />
              {renderErrorText('fechaExpiracion')}
            </View>

            <View style={styles.halfInputContainer}>
              <Text style={styles.inputLabel}>CVC</Text>
              <TextInput
                style={[
                  styles.input,
                  errores.cvc && styles.inputError
                ]}
                placeholder="123"
                placeholderTextColor="#bdc3c7"
                value={cvc}
                onChangeText={handleCambioCVC}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry={true}
                editable={!loadingMetodosPago}
              />
              {renderErrorText('cvc')}
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setPredeterminado(!predeterminado)}
            activeOpacity={0.7}
            disabled={loadingMetodosPago}
          >
            <View style={[styles.checkbox, predeterminado && styles.checkboxSelected]}>
              {predeterminado && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              Establecer como método de pago predeterminado
            </Text>
          </TouchableOpacity>

          {errorMetodosPago && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorGeneralText}>
                {errorMetodosPago}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.agregarButton, loadingMetodosPago && styles.agregarButtonDisabled]}
            onPress={handleAgregar} 
            disabled={loadingMetodosPago}
          >
            {loadingMetodosPago ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.agregarButtonText}>Agregar Tarjeta</Text>
            )}
          </TouchableOpacity>
        </View>
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
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'System',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
  },
  errorGeneralText: {
    color: '#e74c3c',
    fontSize: 14,
    fontFamily: 'System',
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
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: 'System',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2c3e50',
    fontFamily: 'System',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  inputWithIcon: {
    position: 'relative',
  },
  tipoTarjetaContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tipoTarjetaTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a90e2',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  halfInputContainer: {
    flex: 1,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#2c3e50',
    fontFamily: 'System',
    flex: 1,
  },
  agregarButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  agregarButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  agregarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  securityNoteText: {
    fontSize: 12,
    color: '#27ae60',
    fontFamily: 'System',
    marginLeft: 8,
    flex: 1,
  },
});

export default AgregarTarjeta;