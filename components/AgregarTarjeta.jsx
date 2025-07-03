import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const AgregarTarjeta = ({ navigation, route }) => {
  const { t } = useTranslation();
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

  const tarjetaSchema = Yup.object({
    numeroTarjeta: Yup.string()
      .required(t('addPaymentMethodForm.validation.cardNumberRequired'))
      .test('tarjeta-valida', t('addPaymentMethodForm.validation.cardNumberInvalid'), function (value) {
        if (!value) return false;
        const numeroLimpio = value.replace(/\s/g, '');
        return /^\d{13,19}$/.test(numeroLimpio);
      }),

    cvc: Yup.string()
      .required(t('addPaymentMethodForm.validation.cvcRequired'))
      .matches(/^\d{3,4}$/, t('addPaymentMethodForm.validation.cvcInvalid')),

    fechaExpiracion: Yup.string()
      .required(t('addPaymentMethodForm.validation.expirationDateRequired'))
      .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, t('addPaymentMethodForm.validation.expirationDateFormat'))
      .test('fecha-valida', t('addPaymentMethodForm.validation.cardExpired'), function (value) {
        if (!value || !value.includes('/')) return false;

        const [mes, año] = value.split('/');
        const mesNum = parseInt(mes);
        const añoNum = parseInt(año);

        if (mesNum < 1 || mesNum > 12) {
          return this.createError({ message: t('addPaymentMethodForm.validation.invalidMonth') });
        }

        const fechaActual = new Date();
        const añoCompleto = 2000 + añoNum;
        const fechaTarjeta = new Date(añoCompleto, mesNum - 1);

        return fechaTarjeta >= fechaActual;
      }),

    nombreTitular: Yup.string()
      .required(t('addPaymentMethodForm.validation.cardHolderNameRequired'))
      .min(2, t('addPaymentMethodForm.validation.cardHolderNameMin'))
      .max(100, t('addPaymentMethodForm.validation.cardHolderNameMax'))
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, t('addPaymentMethodForm.validation.cardHolderNameInvalid')),

    predeterminado: Yup.boolean()
  });

  const validarDatosMetodoPago = (metodoPagoData) => {
    const errores = [];

    if (!metodoPagoData.numeroTarjeta) {
      errores.push(t('addPaymentMethodForm.validation.cardNumberRequired'));
    } else {
      const numeroLimpio = metodoPagoData.numeroTarjeta.replace(/\s/g, '');
      if (numeroLimpio.length !== 16 || !/^\d+$/.test(numeroLimpio)) {
        errores.push(t('addPaymentMethodForm.validation.cardNumberLength'));
      }
    }

    if (!metodoPagoData.nombreTitular || metodoPagoData.nombreTitular.trim().length < 2) {
      errores.push(t('addPaymentMethodForm.validation.cardHolderNameMinLength'));
    }

    if (!metodoPagoData.fechaExpiracion) {
      errores.push(t('addPaymentMethodForm.validation.expirationDateRequired'));
    } else if (!/^\d{2}\/\d{2}$/.test(metodoPagoData.fechaExpiracion)) {
      errores.push(t('addPaymentMethodForm.validation.expirationDateInvalid'));
    } else {
      const [mes, año] = metodoPagoData.fechaExpiracion.split('/');
      const fechaActual = new Date();
      const fechaTarjeta = new Date(2000 + parseInt(año), parseInt(mes) - 1);

      if (fechaTarjeta < fechaActual) {
        errores.push(t('addPaymentMethodForm.validation.cardExpired'));
      }
    }

    if (!metodoPagoData.cvc) {
      errores.push(t('addPaymentMethodForm.validation.cvcRequired'));
    } else if (metodoPagoData.cvc.length < 3 || metodoPagoData.cvc.length > 4) {
      errores.push(t('addPaymentMethodForm.validation.cvcDigits'));
    } else if (!/^\d+$/.test(metodoPagoData.cvc)) {
      errores.push(t('addPaymentMethodForm.validation.cvcNumeric'));
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
        Alert.alert(t('addPaymentMethodForm.alerts.validationError'), primerError.message);
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
        t('addPaymentMethodForm.alerts.validationError'),
        erroresValidacion.join('\n'),
        [{ text: t('addPaymentMethodForm.common.ok') }]
      );
      return;
    }

    const tipoTarjeta = detectarTipoTarjeta(numeroTarjeta);
    const ultimosCuatroDigitos = numeroTarjeta.replace(/\s/g, '').slice(-4);
    const userId = usuarioId || usuario?.id || usuario?._id;

    if (!userId) {
      return Alert.alert(t('addPaymentMethodForm.common.error'), t('addPaymentMethodForm.alerts.userError'));
    }

    const fechaRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!fechaRegex.test(fechaExpiracion)) {
      Alert.alert(
        t('addPaymentMethodForm.alerts.formatError'),
        t('addPaymentMethodForm.alerts.dateFormatError'),
        [{ text: t('addPaymentMethodForm.common.ok') }]
      );
      return;
    }

    try {
      const payload = await dispatch(
        agregarMetodoPago({ usuarioId: userId, metodoPago: metodoPagoData })
      ).unwrap();

      Alert.alert(
        t('addPaymentMethodForm.alerts.cardAdded'),
        `${(tipoTarjeta || 'Tarjeta').toUpperCase()} •••• ${ultimosCuatroDigitos} ${t('addPaymentMethodForm.alerts.cardAddedSuccess')}`,
        [{
          text: t('addPaymentMethodForm.common.ok'), onPress: () => {
            if (onTarjetaAgregada) {
              onTarjetaAgregada();
            }
            navigation.goBack();
          }
        }]
      );

    } catch (error) {

      let mensaje = t('addPaymentMethodForm.alerts.unknownError');

      if (typeof error === 'string') {
        if (error.includes('Error de validación')) {
          mensaje = error;
        } else if (error.includes('fetch') || error.includes('network')) {
          mensaje = t('addPaymentMethodForm.alerts.connectionError');
        } else if (error.includes('401') || error.includes('Unauthorized')) {
          mensaje = t('addPaymentMethodForm.alerts.sessionExpired');
        } else if (error.includes('400') || error.includes('Bad Request')) {
          mensaje = t('addPaymentMethodForm.alerts.invalidCardData');
        } else if (error.includes('500') || error.includes('Internal Server Error')) {
          mensaje = t('addPaymentMethodForm.alerts.serverError');
        } else {
          mensaje = error;
        }
      } else if (error?.message) {
        mensaje = error.message;
      }

      Alert.alert(
        t('addPaymentMethodForm.alerts.addCardError'),
        mensaje,
        [
          {
            text: t('addPaymentMethodForm.buttons.retry'),
            onPress: () => {
              handleAgregar();
            }
          },
          {
            text: t('addPaymentMethodForm.buttons.cancel'),
            style: 'cancel'
          }
        ]
      );
    }
  };

  const handleAgregarConVerificacion = async () => {
    const hayConectividad = await verificarConectividad();

    if (!hayConectividad) {
      Alert.alert(
        t('addPaymentMethodForm.alerts.noConnection'),
        t('addPaymentMethodForm.alerts.noConnectionMessage'),
        [
          {
            text: t('addPaymentMethodForm.buttons.retry'),
            onPress: () => handleAgregarConVerificacion()
          },
          {
            text: t('addPaymentMethodForm.buttons.cancel'),
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
        <Text style={styles.headerTitle}>{t('addPaymentMethodForm.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>{t('addPaymentMethodForm.sectionTitle')}</Text>
          <Text style={styles.sectionSubtitle}>
            {t('addPaymentMethodForm.sectionSubtitle')}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('addPaymentMethodForm.labels.cardHolderName')}</Text>
            <TextInput
              style={[
                styles.input,
                errores.nombreTitular && styles.inputError
              ]}
              placeholder={t('addPaymentMethodForm.placeholders.cardHolderName')}
              placeholderTextColor="#bdc3c7"
              value={nombreTitular}
              onChangeText={handleCambioNombre}
              autoCapitalize="words"
              editable={!loadingMetodosPago}
            />
            {renderErrorText('nombreTitular')}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('addPaymentMethodForm.labels.cardNumber')}</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[
                  styles.input,
                  errores.numeroTarjeta && styles.inputError
                ]}
                placeholder={t('addPaymentMethodForm.placeholders.cardNumber')}
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
              <Text style={styles.inputLabel}>{t('addPaymentMethodForm.labels.expirationDate')}</Text>
              <TextInput
                style={[
                  styles.input,
                  errores.fechaExpiracion && styles.inputError
                ]}
                placeholder={t('addPaymentMethodForm.placeholders.expirationDate')}
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
              <Text style={styles.inputLabel}>{t('addPaymentMethodForm.labels.cvc')}</Text>
              <TextInput
                style={[
                  styles.input,
                  errores.cvc && styles.inputError
                ]}
                placeholder={t('addPaymentMethodForm.placeholders.cvc')}
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
              {t('addPaymentMethodForm.labels.setAsDefault')}
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
              <Text style={styles.agregarButtonText}>{t('addPaymentMethodForm.buttons.addCard')}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginTop: 20,
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
