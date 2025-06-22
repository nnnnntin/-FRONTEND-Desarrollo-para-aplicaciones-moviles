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

const FormularioProblema = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleVolver = () => {
    navigation.goBack();
  };

  const handleEnviar = async () => {
    if (!email || !asunto || !mensaje) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setEnviando(true);

    setTimeout(() => {
      setEnviando(false);
      Alert.alert(
        'Mensaje enviado',
        'Hemos recibido tu reporte. Te contactaremos pronto.',
        [
          {
            text: 'OK',
            onPress: () => {
              setEmail('');
              setAsunto('');
              setMensaje('');
              navigation.goBack();
            }
          }
        ]
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleVolver}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportar Problema</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formularioContainer}>
          <Text style={styles.formularioTitulo}>
            Cuéntanos qué problema has tenido
          </Text>
          <Text style={styles.formularioSubtitulo}>
            Te ayudaremos a resolverlo lo antes posible
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email de contacto *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!enviando}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Asunto *</Text>
            <TextInput
              style={styles.input}
              value={asunto}
              onChangeText={setAsunto}
              placeholder="Describe brevemente el problema"
              autoCapitalize="sentences"
              editable={!enviando}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mensaje *</Text>
            <TextInput
              style={[styles.input, styles.inputMultilinea]}
              value={mensaje}
              onChangeText={setMensaje}
              placeholder="Describe detalladamente el problema que has experimentado..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoCapitalize="sentences"
              editable={!enviando}
            />
          </View>

          <View style={styles.notaContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#7f8c8d" />
            <Text style={styles.notaTexto}>
              Los campos marcados con * son obligatorios
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.botonEnviar, enviando && styles.botonEnviandoDisabled]}
            onPress={handleEnviar}
            disabled={enviando}
            activeOpacity={0.7}
          >
            {enviando ? (
              <View style={styles.enviandoContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.textoBotonEnviar}>Enviando...</Text>
              </View>
            ) : (
              <Text style={styles.textoBotonEnviar}>Enviar reporte</Text>
            )}
          </TouchableOpacity>

          <View style={styles.ayudaContainer}>
            <Text style={styles.ayudaTitulo}>¿Necesitas ayuda inmediata?</Text>
            <Text style={styles.ayudaTexto}>
              También puedes contactarnos por teléfono al +598 2XXX-XXXX o por email a soporte@empresa.com
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
  formularioContainer: {
    padding: 20,
  },
  formularioTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'System',
  },
  formularioSubtitulo: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'System',
    lineHeight: 22,
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'System',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputMultilinea: {
    height: 120,
    textAlignVertical: 'top',
  },
  notaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  notaTexto: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'System',
    marginLeft: 6,
  },
  botonEnviar: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  botonEnviandoDisabled: {
    backgroundColor: '#bdc3c7',
    elevation: 0,
  },
  textoBotonEnviar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
  enviandoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayudaContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  ayudaTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: 'System',
  },
  ayudaTexto: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 20,
    fontFamily: 'System',
  },
});

export default FormularioProblema;