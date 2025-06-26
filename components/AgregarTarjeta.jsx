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
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { agregarMetodoPago } from '../store/slices/usuarioSlice';

const AgregarTarjeta = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const loadingMetodosPago = useSelector(state => state.usuario.loadingMetodosPago);
  const usuario = useSelector(state => state.auth.usuario);

  const { usuarioId, onTarjetaAgregada } = route?.params || {};


  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [cvc, setCvc] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [predeterminado, setPredeterminado] = useState(false);

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

  const validarFormulario = () => {
    const errores = [];


    if (!numeroTarjeta || numeroTarjeta.replace(/\s/g, '').length < 16) {
      errores.push('Por favor ingresa un número de tarjeta válido (16 dígitos)');
    }


    if (!cvc || cvc.length < 3) {
      errores.push('Por favor ingresa un CVC válido (3-4 dígitos)');
    }


    if (!fechaExpiracion || fechaExpiracion.length < 5) {
      errores.push('Por favor ingresa una fecha de expiración válida (MM/AA)');
    } else {

      const [mes, año] = fechaExpiracion.split('/');
      const fechaActual = new Date();
      const añoCompleto = 2000 + parseInt(año);
      const fechaTarjeta = new Date(añoCompleto, parseInt(mes) - 1);

      if (fechaTarjeta < fechaActual) {
        errores.push('La tarjeta está vencida');
      }
    }


    if (!nombreTitular.trim()) {
      errores.push('Por favor ingresa el nombre del titular');
    }

    if (errores.length > 0) {
      Alert.alert('Error de validación', errores.join('\n'));
      return false;
    }

    return true;
  };

  const handleAgregar = async () => {

    if (!validarFormulario()) return;


    const tipoTarjeta = detectarTipoTarjeta(numeroTarjeta);
    const ultimosCuatroDigitos = numeroTarjeta.replace(/\s/g, '').slice(-4);
    const userId = usuarioId || usuario?.id || usuario?._id;

    if (!userId) {
      Alert.alert('Error', 'No se pudo identificar el usuario');
      return;
    }


    const metodoPagoData = {
      numeroTarjeta: numeroTarjeta.replace(/\s/g, ''),
      cvc,
      fechaExpiracion,
      nombreTitular: nombreTitular.trim(),
      predeterminado,

      ...(tipoTarjeta && { marca: tipoTarjeta }),
    };

    console.log('🏦 Agregando nuevo método de pago:', metodoPagoData);

    try {

      const resultAction = await dispatch(agregarMetodoPago({
        usuarioId: userId,
        metodoPago: metodoPagoData
      }));

      if (agregarMetodoPago.fulfilled.match(resultAction)) {

        Alert.alert(
          'Tarjeta Agregada',
          `${tipoTarjeta ? tipoTarjeta.toUpperCase() : 'Tarjeta'} •••• ${ultimosCuatroDigitos} ha sido agregada exitosamente`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (onTarjetaAgregada) onTarjetaAgregada();
                navigation.goBack();
              }
            }
          ]
        );
      } else {

        const errorMessage = resultAction.payload || 'Error al agregar la tarjeta';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error agregando tarjeta:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado');
    }
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
              style={styles.input}
              placeholder="Nombre como aparece en la tarjeta"
              placeholderTextColor="#bdc3c7"
              value={nombreTitular}
              onChangeText={setNombreTitular}
              autoCapitalize="words"
              editable={!loadingMetodosPago}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Número de tarjeta</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#bdc3c7"
                value={numeroTarjeta}
                onChangeText={(texto) => setNumeroTarjeta(formatearNumeroTarjeta(texto))}
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
          </View>

          <View style={styles.rowContainer}>
            <View style={styles.halfInputContainer}>
              <Text style={styles.inputLabel}>Fecha expiración</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/AA"
                placeholderTextColor="#bdc3c7"
                value={fechaExpiracion}
                onChangeText={(texto) => setFechaExpiracion(formatearFecha(texto))}
                keyboardType="numeric"
                maxLength={5}
                editable={!loadingMetodosPago}
              />
            </View>

            <View style={styles.halfInputContainer}>
              <Text style={styles.inputLabel}>CVC</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                placeholderTextColor="#bdc3c7"
                value={cvc}
                onChangeText={(texto) => setCvc(formatearCVC(texto))}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry={true}
                editable={!loadingMetodosPago}
              />
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

          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={20} color="#27ae60" />
            <Text style={styles.securityNoteText}>
              Tus datos están protegidos con encriptación de grado bancario
            </Text>
          </View>
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