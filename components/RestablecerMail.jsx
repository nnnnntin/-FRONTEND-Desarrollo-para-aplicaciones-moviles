import { useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const RestablecerMail = ({ onBack, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [cedula, setCedula] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');

  const handleStep1 = () => {
    if (!cedula) {
      Alert.alert('Error', 'Por favor ingrese su cédula');
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2 = () => {
    if (!newEmail) {
      Alert.alert('Error', 'Por favor ingrese su nuevo correo electrónico');
      return;
    }

    Alert.alert('Código enviado', `Se envió un código de seguridad a tu correo:\n${newEmail.substring(0, 2)}****@${newEmail.split('@')[1] || 'gmail.com'}`);
    setCurrentStep(3);
  };

  const handleStep3 = () => {
    if (!emailCode) {
      Alert.alert('Error', 'Por favor ingrese el código de verificación');
      return;
    }

    Alert.alert('Éxito', 'Correo electrónico actualizado correctamente', [
      { text: 'OK', onPress: onSuccess }
    ]);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text style={styles.subtitle}>Recuperación de cuenta</Text>
            <Text style={styles.description}>Cédula</Text>

            <Text style={styles.label}>Introduce tu cédula</Text>
            <TextInput
              style={styles.input}
              placeholder="Introduce tu cédula"
              placeholderTextColor="#999"
              value={cedula}
              onChangeText={setCedula}
              keyboardType="numeric"
              returnKeyType="done"
              maxLength={10}
            />

            <TouchableOpacity style={styles.button} onPress={handleStep1}>
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.subtitle}>Recuperación de cuenta</Text>
            <Text style={styles.description}>Correo electrónico</Text>

            <Text style={styles.label}>Introduce tu correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="Introduce tu correo electrónico"
              placeholderTextColor="#999"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
            />

            <TouchableOpacity style={styles.button} onPress={handleStep2}>
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.subtitle}>Recuperación de cuenta</Text>
            <Text style={styles.description}>
              Se envió un código de seguridad a tu correo:
            </Text>
            <Text style={styles.emailDisplay}>
              {newEmail.substring(0, 2)}****@{newEmail.split('@')[1] || 'gmail.com'}
            </Text>

            <Text style={styles.label}>Código de verificación</Text>
            <TextInput
              style={styles.input}
              placeholder="Introduce el código"
              placeholderTextColor="#999"
              value={emailCode}
              onChangeText={setEmailCode}
              keyboardType="numeric"
              returnKeyType="done"
              maxLength={6}
            />

            <TouchableOpacity style={styles.button} onPress={handleStep3}>
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <View style={styles.content}>
          {renderStep()}
        </View>

        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 0,
    minHeight: 400,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  description: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'System',
  },
  emailDisplay: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'System',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
    fontWeight: '500',
    fontFamily: 'System',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    fontSize: 16,
    fontFamily: 'System',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'System',
  },
  backButton: {
    marginTop: 30,
    paddingVertical: 10,
  },
  backText: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default RestablecerMail;