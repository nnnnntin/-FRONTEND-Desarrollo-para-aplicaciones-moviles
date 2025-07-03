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
import * as yup from 'yup';

const problemaSchema = yup.object({
  email: yup
    .string()
    .required('El email es obligatorio')
    .email('Por favor ingresa un email válido')
    .max(100, 'El email no puede exceder los 100 caracteres')
    .trim()
    .lowercase(),

  asunto: yup
    .string()
    .required('El asunto es obligatorio')
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(100, 'El asunto no puede exceder los 100 caracteres')
    .trim(),

  mensaje: yup
    .string()
    .required('El mensaje es obligatorio')
    .min(20, 'El mensaje debe tener al menos 20 caracteres')
    .max(1000, 'El mensaje no puede exceder los 1000 caracteres')
    .trim()
});

const FormularioProblema = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState({});
  const [validacionEnCurso, setValidacionEnCurso] = useState(false);

  const validarCampo = async (campo, valor) => {
    try {
      const datosCompletos = {
        email: campo === 'email' ? valor : email,
        asunto: campo === 'asunto' ? valor : asunto,
        mensaje: campo === 'mensaje' ? valor : mensaje
      };

      await problemaSchema.validateAt(campo, datosCompletos);

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
    setValidacionEnCurso(true);

    try {
      const datosValidacion = {
        email: email.trim(),
        asunto: asunto.trim(),
        mensaje: mensaje.trim()
      };

      await problemaSchema.validate(datosValidacion, { abortEarly: false });

      setErrores({});
      setValidacionEnCurso(false);
      return true;

    } catch (error) {
      const nuevosErrores = {};

      if (error.inner) {
        error.inner.forEach(err => {
          nuevosErrores[err.path] = err.message;
        });
      } else {
        nuevosErrores.general = error.message;
      }

      setErrores(nuevosErrores);
      setValidacionEnCurso(false);
      return false;
    }
  };

  const handleVolver = () => {
    navigation.goBack();
  };

  const handleEmailChange = (text) => {
    setEmail(text);

    setTimeout(() => {
      validarCampo('email', text);
    }, 500);
  };

  const handleAsuntoChange = (text) => {
    setAsunto(text);

    setTimeout(() => {
      validarCampo('asunto', text);
    }, 500);
  };

  const handleMensajeChange = (text) => {
    setMensaje(text);

    setTimeout(() => {
      validarCampo('mensaje', text);
    }, 500);
  };

  const handleEnviar = async () => {
    const esValido = await validarFormulario();

    if (!esValido) {
      const erroresTexto = Object.values(errores)
        .filter(error => error)
        .join('\n');

      Alert.alert('Formulario incompleto', erroresTexto || 'Por favor corrige los errores antes de continuar');
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
              setErrores({});
              navigation.goBack();
            }
          }
        ]
      );
    }, 2000);
  };

  const getError = (campo) => {
    return errores[campo];
  };

  const tieneErrores = Object.values(errores).some(error => error);

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

          {errores.general && (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={20} color="#e74c3c" />
              <Text style={styles.errorAlertText}>{errores.general}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email de contacto *</Text>
            <TextInput
              style={[styles.input, getError('email') && styles.inputError]}
              value={email}
              onChangeText={handleEmailChange}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!enviando}
              maxLength={100}
            />
            {getError('email') && <Text style={styles.errorText}>{getError('email')}</Text>}
            <Text style={styles.characterCounter}>{email.length}/100</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Asunto *</Text>
            <TextInput
              style={[styles.input, getError('asunto') && styles.inputError]}
              value={asunto}
              onChangeText={handleAsuntoChange}
              placeholder="Describe brevemente el problema"
              autoCapitalize="sentences"
              editable={!enviando}
              maxLength={100}
            />
            {getError('asunto') && <Text style={styles.errorText}>{getError('asunto')}</Text>}
            <Text style={styles.characterCounter}>{asunto.length}/100</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mensaje *</Text>
            <TextInput
              style={[styles.input, styles.inputMultilinea, getError('mensaje') && styles.inputError]}
              value={mensaje}
              onChangeText={handleMensajeChange}
              placeholder="Describe detalladamente el problema que has experimentado..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoCapitalize="sentences"
              editable={!enviando}
              maxLength={1000}
            />
            {getError('mensaje') && <Text style={styles.errorText}>{getError('mensaje')}</Text>}
            <Text style={styles.characterCounter}>{mensaje.length}/1000</Text>
          </View>

          <View style={styles.notaContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#7f8c8d" />
            <Text style={styles.notaTexto}>
              Los campos marcados con * son obligatorios
            </Text>
          </View>

          {!tieneErrores && email && asunto && mensaje && (
            <View style={styles.validacionExitosa}>
              <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
              <Text style={styles.validacionExitosaText}>
                Todos los campos son válidos
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.botonEnviar,
              (enviando || validacionEnCurso) && styles.botonEnviandoDisabled
            ]}
            onPress={handleEnviar}
            disabled={enviando || validacionEnCurso}
            activeOpacity={0.7}
          >
            {enviando ? (
              <View style={styles.enviandoContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.textoBotonEnviar}>Enviando...</Text>
              </View>
            ) : validacionEnCurso ? (
              <View style={styles.enviandoContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.textoBotonEnviar}>Validando...</Text>
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

          <View style={styles.consejosContainer}>
            <Text style={styles.consejosTitulo}>💡 Consejos para un mejor reporte</Text>
            <View style={styles.consejoItem}>
              <Text style={styles.consejoTexto}>• Sé específico sobre cuándo ocurrió el problema</Text>
            </View>
            <View style={styles.consejoItem}>
              <Text style={styles.consejoTexto}>• Incluye los pasos que realizaste antes del error</Text>
            </View>
            <View style={styles.consejoItem}>
              <Text style={styles.consejoTexto}>• Menciona el dispositivo y navegador que usas</Text>
            </View>
            <View style={styles.consejoItem}>
              <Text style={styles.consejoTexto}>• Describe el comportamiento esperado vs. el actual</Text>
            </View>
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
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffeaea',
    borderColor: '#e74c3c',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorAlertText: {
    fontSize: 14,
    color: '#e74c3c',
    flex: 1,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 4,
    lineHeight: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
    backgroundColor: '#fef8f8',
  },
  characterCounter: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'right',
    marginTop: 4,
    fontStyle: 'italic',
  },
  validacionExitosa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f4',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  validacionExitosaText: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '500',
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
    gap: 8,
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
  consejosContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  consejosTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    fontFamily: 'System',
  },
  consejoItem: {
    marginBottom: 6,
  },
  consejoTexto: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 18,
    fontFamily: 'System',
  },
});

export default FormularioProblema;