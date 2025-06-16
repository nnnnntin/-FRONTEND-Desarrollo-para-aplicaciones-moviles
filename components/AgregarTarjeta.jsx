import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
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

const AgregarTarjeta = ({ navigation, route }) => {
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [cvc, setCvc] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');

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

  const validarFormulario = () => {
    if (!numeroTarjeta || numeroTarjeta.replace(/\s/g, '').length < 16) {
      Alert.alert('Error', 'Por favor ingresa un número de tarjeta válido');
      return false;
    }
    
    if (!cvc || cvc.length < 3) {
      Alert.alert('Error', 'Por favor ingresa un CVC válido');
      return false;
    }
    
    if (!fechaExpiracion || fechaExpiracion.length < 5) {
      Alert.alert('Error', 'Por favor ingresa una fecha de expiración válida');
      return false;
    }
    
    return true;
  };

  const detectarTipoTarjeta = (numero) => {
    const primerDigito = numero.charAt(0);
    if (primerDigito === '4') return 'Visa';
    if (primerDigito === '5') return 'Mastercard';
    if (primerDigito === '3') return 'American Express';
    return 'Tarjeta';
  };

  const handleAgregar = () => {
    if (!validarFormulario()) return;

    const tipoTarjeta = detectarTipoTarjeta(numeroTarjeta);
    const ultimosCuatroDigitos = numeroTarjeta.replace(/\s/g, '').slice(-4);

    Alert.alert(
      'Tarjeta Agregada',
      `${tipoTarjeta} •••• ${ultimosCuatroDigitos} ha sido agregada exitosamente`,
      [
        { 
          text: 'OK', 
          onPress: () => navigation.goBack()
        }
      ]
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
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pago</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Agregue una tarjeta</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Número de tarjeta"
              placeholderTextColor="#bdc3c7"
              value={numeroTarjeta}
              onChangeText={(texto) => setNumeroTarjeta(formatearNumeroTarjeta(texto))}
              keyboardType="numeric"
              maxLength={19} 
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="CVC"
              placeholderTextColor="#bdc3c7"
              value={cvc}
              onChangeText={(texto) => setCvc(formatearCVC(texto))}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry={true}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="MM/AA"
              placeholderTextColor="#bdc3c7"
              value={fechaExpiracion}
              onChangeText={(texto) => setFechaExpiracion(formatearFecha(texto))}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          <TouchableOpacity 
            style={styles.agregarButton}
            onPress={handleAgregar}
          >
            <Text style={styles.agregarButtonText}>Agregar</Text>
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
    paddingVertical: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
  agregarButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  agregarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default AgregarTarjeta;