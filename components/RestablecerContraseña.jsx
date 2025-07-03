import { useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import * as yup from 'yup';

const emailSchema = yup.object({
  email: yup
    .string()
    .required('El correo electrónico es obligatorio')
    .email('Ingrese un correo electrónico válido')
    .max(254, 'El correo electrónico es demasiado largo')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Formato de correo electrónico inválido'
    )
    .trim()
    .lowercase(),
});

const codigoSchema = yup.object({
  securityCode: yup
    .string()
    .required('El código de verificación es obligatorio')
    .matches(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos')
    .length(6, 'El código debe tener exactamente 6 dígitos'),
});

const passwordSchema = yup.object({
  newPassword: yup
    .string()
    .required('La nueva contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
    ),

  confirmPassword: yup
    .string()
    .required('Debe confirmar la nueva contraseña')
    .test('passwords-match', 'Las contraseñas deben coincidir', function (value) {
      return value === this.parent.newPassword;
    }),
});

const resetPasswordSchema = yup.object({
  email: yup
    .string()
    .required('El correo electrónico es obligatorio')
    .email('Ingrese un correo electrónico válido')
    .max(254, 'El correo electrónico es demasiado largo')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Formato de correo electrónico inválido'
    )
    .trim()
    .lowercase(),

  securityCode: yup
    .string()
    .required('El código de verificación es obligatorio')
    .matches(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos')
    .length(6, 'El código debe tener exactamente 6 dígitos'),

  newPassword: yup
    .string()
    .required('La nueva contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
    ),

  confirmPassword: yup
    .string()
    .required('Debe confirmar la nueva contraseña')
    .test('passwords-match', 'Las contraseñas deben coincidir', function (value) {
      return value === this.parent.newPassword;
    }),
});

const RestablecerContraseña = ({ onBack, onSuccess, onForgotEmail }) => {

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    securityCode: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    const timeoutId = setTimeout(() => {
      validateField(field, value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const validateField = async (fieldName, value) => {
    try {
      let schema;
      switch (fieldName) {
        case 'email':
          schema = emailSchema;
          break;
        case 'securityCode':
          schema = codigoSchema;
          break;
        case 'newPassword':
        case 'confirmPassword':
          schema = passwordSchema;
          break;
        default:
          return true;
      }

      await yup.reach(schema, fieldName).validate(value);

      if (fieldName === 'confirmPassword') {
        await schema.validate({
          newPassword: formData.newPassword,
          confirmPassword: value
        });
      }

      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });

      return true;
    } catch (error) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: error.message
      }));
      return false;
    }
  };

  const validateStep = async (step) => {
    try {
      switch (step) {
        case 1:
          await emailSchema.validate({ email: formData.email });
          break;
        case 2:
          await codigoSchema.validate({ securityCode: formData.securityCode });
          break;
        case 3:
          await passwordSchema.validate({
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword
          });
          break;
        default:
          return false;
      }

      const fieldsToClean = {
        1: ['email'],
        2: ['securityCode'],
        3: ['newPassword', 'confirmPassword']
      };

      setValidationErrors(prev => {
        const newErrors = { ...prev };
        fieldsToClean[step].forEach(field => {
          delete newErrors[field];
        });
        return newErrors;
      });

      return true;
    } catch (error) {
      if (error.inner) {
        const errors = {};
        error.inner.forEach(err => {
          errors[err.path] = err.message;
        });
        setValidationErrors(prev => ({ ...prev, ...errors }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          [error.path]: error.message
        }));
      }
      return false;
    }
  };

  const validacionesAdicionales = (step) => {
    const errores = {};

    if (step === 1) {

      const emailsProhibidos = ['test@test.com', 'admin@admin.com', 'fake@fake.com'];
      if (emailsProhibidos.includes(formData.email.toLowerCase())) {
        errores.email = 'Este correo electrónico no está registrado en el sistema';
      }

      const dominiosPermitidos = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'empresa.com'];
      const dominio = formData.email.split('@')[1];
      if (dominio && !dominiosPermitidos.includes(dominio)) {
        errores.email = 'Solo se permiten correos de dominios autorizados';
      }
    }

    if (step === 2) {

      const codigosProhibidos = ['123456', '000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999'];
      if (codigosProhibidos.includes(formData.securityCode)) {
        errores.securityCode = 'Código de seguridad inválido';
      }

      if (formData.securityCode === '000001') {
        errores.securityCode = 'Código de verificación incorrecto';
      }
    }

    if (step === 3) {

      if (formData.newPassword.toLowerCase().includes(formData.email.split('@')[0].toLowerCase())) {
        errores.newPassword = 'La contraseña no puede contener partes de tu correo electrónico';
      }

      const passwordsComunes = ['password123', '12345678', 'qwerty123', 'abc123456'];
      if (passwordsComunes.includes(formData.newPassword.toLowerCase())) {
        errores.newPassword = 'Esta contraseña es demasiado común, elige una más segura';
      }

      if (/(.)\1{2,}/.test(formData.newPassword)) {
        errores.newPassword = 'La contraseña no puede tener más de 2 caracteres idénticos consecutivos';
      }
    }

    if (Object.keys(errores).length > 0) {
      setValidationErrors(prev => ({ ...prev, ...errores }));
      return false;
    }

    return true;
  };

  const handleStep1 = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const stepValid = await validateStep(1);
      const additionalValid = validacionesAdicionales(1);

      if (!stepValid || !additionalValid) {
        Alert.alert('Error de validación', 'Por favor corrige los errores en el formulario');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      const emailMasked = `${formData.email.substring(0, 2)}****@${formData.email.split('@')[1]}`;
      Alert.alert(
        'Código enviado',
        `Se envió un código de seguridad a tu correo:\n${emailMasked}\n\nEl código expira en 10 minutos.`
      );

      setCurrentStep(2);
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el código. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const stepValid = await validateStep(2);
      const additionalValid = validacionesAdicionales(2);

      if (!stepValid || !additionalValid) {
        Alert.alert('Error de validación', 'Por favor corrige los errores en el formulario');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 800));

      setCurrentStep(3);
    } catch (error) {
      Alert.alert('Error', 'Error al verificar el código. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3 = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const stepValid = await validateStep(3);
      const additionalValid = validacionesAdicionales(3);

      if (!stepValid || !additionalValid) {
        Alert.alert('Error de validación', 'Por favor corrige los errores en el formulario');
        return;
      }

      await resetPasswordSchema.validate(formData);

      await new Promise(resolve => setTimeout(resolve, 1200));

      Alert.alert(
        'Éxito',
        'Contraseña restablecida correctamente.\n\nYa puedes iniciar sesión con tu nueva contraseña.',
        [{ text: 'OK', onPress: onSuccess }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo restablecer la contraseña. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {

      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert('Código reenviado', 'Se ha enviado un nuevo código a tu correo electrónico');
    } catch (error) {
      Alert.alert('Error', 'No se pudo reenviar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const ErrorText = ({ error }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: '#e1e5e9' };

    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 1;
    else feedback.push('Al menos 8 caracteres');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Una minúscula');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Una mayúscula');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Un número');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else feedback.push('Un carácter especial');

    const strengthLevels = {
      0: { text: 'Muy débil', color: '#e74c3c' },
      1: { text: 'Débil', color: '#e67e22' },
      2: { text: 'Regular', color: '#f39c12' },
      3: { text: 'Buena', color: '#2ecc71' },
      4: { text: 'Fuerte', color: '#27ae60' },
      5: { text: 'Muy fuerte', color: '#16a085' },
    };

    return {
      score,
      ...strengthLevels[score],
      feedback: feedback.length > 0 ? `Falta: ${feedback.join(', ')}` : 'Contraseña segura'
    };
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text style={styles.subtitle}>Recuperación de cuenta</Text>
            <Text style={styles.description}>
              Ingresa tu correo electrónico para recibir un código de verificación
            </Text>

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.email && styles.inputError
              ]}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit={false}
              editable={!isLoading}
            />
            <ErrorText error={validationErrors.email} />

            <TouchableOpacity
              style={[
                styles.button,
                isLoading && styles.buttonDisabled
              ]}
              onPress={handleStep1}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Enviando...' : 'Enviar código'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backText}>Volver al inicio de sesión</Text>
            </TouchableOpacity>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.subtitle}>Verificación de código</Text>
            <Text style={styles.description}>
              Se envió un código de seguridad a tu correo:
            </Text>
            <Text style={styles.emailDisplay}>
              {formData.email.substring(0, 2)}****@{formData.email.split('@')[1]}
            </Text>

            <Text style={styles.label}>Código de seguridad (6 dígitos)</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.securityCode && styles.inputError
              ]}
              placeholder="123456"
              placeholderTextColor="#999"
              value={formData.securityCode}
              onChangeText={(text) => updateFormData('securityCode', text)}
              keyboardType="numeric"
              returnKeyType="done"
              maxLength={6}
              editable={!isLoading}
            />
            <ErrorText error={validationErrors.securityCode} />

            <TouchableOpacity
              style={[
                styles.button,
                isLoading && styles.buttonDisabled
              ]}
              onPress={handleStep2}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Verificando...' : 'Verificar código'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleResendCode}
              style={styles.resendButton}
              disabled={isLoading}
            >
              <Text style={[
                styles.resendText,
                isLoading && styles.textDisabled
              ]}>
                ¿No recibiste el código? Reenviar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePreviousStep} style={styles.backButton}>
              <Text style={styles.backText}>Cambiar correo electrónico</Text>
            </TouchableOpacity>
          </>
        );

      case 3:
        const passwordStrength = getPasswordStrength(formData.newPassword);

        return (
          <>
            <Text style={styles.subtitle}>Nueva contraseña</Text>
            <Text style={styles.description}>
              Crea una contraseña segura para tu cuenta
            </Text>

            <Text style={styles.label}>Nueva contraseña</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.newPassword && styles.inputError
              ]}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="#999"
              value={formData.newPassword}
              onChangeText={(text) => updateFormData('newPassword', text)}
              secureTextEntry
              returnKeyType="next"
              blurOnSubmit={false}
              editable={!isLoading}
            />

            {formData.newPassword.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={[
                  styles.passwordStrengthBar,
                  { backgroundColor: passwordStrength.color, width: `${(passwordStrength.score / 5) * 100}%` }
                ]} />
                <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.text}
                </Text>
                <Text style={styles.passwordFeedback}>
                  {passwordStrength.feedback}
                </Text>
              </View>
            )}

            <ErrorText error={validationErrors.newPassword} />

            <Text style={styles.label}>Confirmar contraseña</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.confirmPassword && styles.inputError
              ]}
              placeholder="Repite tu nueva contraseña"
              placeholderTextColor="#999"
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData('confirmPassword', text)}
              secureTextEntry
              returnKeyType="done"
              editable={!isLoading}
            />
            <ErrorText error={validationErrors.confirmPassword} />

            <TouchableOpacity
              style={[
                styles.button,
                isLoading && styles.buttonDisabled
              ]}
              onPress={handleStep3}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Actualizando...' : 'Restablecer contraseña'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePreviousStep} style={styles.backButton}>
              <Text style={styles.backText}>Verificar código nuevamente</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.progressContainer}>
            {[1, 2, 3].map((step) => (
              <View
                key={step}
                style={[
                  styles.progressStep,
                  currentStep >= step && styles.progressStepActive
                ]}
              />
            ))}
          </View>

          {renderStep()}
        </View>
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
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 8,
  },
  progressStep: {
    width: 60,
    height: 4,
    backgroundColor: '#e1e5e9',
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#4a90e2',
  },
  subtitle: {
    fontSize: 20,
    color: '#2c3e50',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'System',
    lineHeight: 22,
  },
  emailDisplay: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'System',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e8f4fd',
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
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    fontSize: 16,
    fontFamily: 'System',
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    alignSelf: 'flex-start',
    marginBottom: 15,
    fontFamily: 'System',
  },
  passwordStrengthContainer: {
    width: '100%',
    marginBottom: 10,
  },
  passwordStrengthBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 5,
    backgroundColor: '#e1e5e9',
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'System',
  },
  passwordFeedback: {
    fontSize: 11,
    color: '#7f8c8d',
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
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'System',
  },
  backButton: {
    marginTop: 15,
  },
  backText: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
  },
  resendButton: {
    marginTop: 15,
    paddingVertical: 10,
  },
  resendText: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
  },
  textDisabled: {
    color: '#bdc3c7',
  },
});

export default RestablecerContraseña;