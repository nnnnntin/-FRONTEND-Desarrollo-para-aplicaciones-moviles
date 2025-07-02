import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

import { clearError, signupUsuario } from '../store/slices/authSlice';
import { crearEmpresaInmobiliaria, crearProveedor } from '../store/slices/usuarioSlice';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;


const usuarioBaseSchema = yup.object({
  username: yup
    .string()
    .required('El nombre de usuario es obligatorio')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
    .matches(/^[a-zA-Z0-9_-]+$/, 'Solo se permiten letras, números, guiones y guiones bajos')
    .trim(),
  
  nombre: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/, 'El nombre solo puede contener letras y espacios')
    .trim()
    .when('username', {
      is: (username) => !username || username.length === 0,
      then: (schema) => schema.required('El nombre es obligatorio si no hay nombre de usuario'),
      otherwise: (schema) => schema,
    }),
  
  apellidos: yup
    .string()
    .max(50, 'Los apellidos no pueden exceder 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]*$/, 'Los apellidos solo pueden contener letras y espacios')
    .trim(),
  
  email: yup
    .string()
    .email('El formato del correo electrónico no es válido')
    .required('El correo electrónico es obligatorio')
    .lowercase()
    .trim(),
  
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
    ),
  
  confirmPassword: yup
    .string()
    .required('Debe confirmar la contraseña')
    .test('passwords-match', 'Las contraseñas no coinciden', function(value) {
      return value === this.parent.password;
    }),
  
  tipoUsuario: yup
    .string()
    .test('tipo-usuario-valido', 'Tipo de usuario no válido', function(value) {
      const tiposValidos = ['usuario', 'cliente', 'proveedor'];
      return tiposValidos.includes(value);
    })
    .required('Debe seleccionar un tipo de usuario'),
});


const datosPersonalesSchema = yup.object({
  telefono: yup
    .string()
    .matches(/^(\+598\s?)?[0-9\s\-()]{8,15}$/, 'Formato de teléfono inválido (+598 9X XXX XXX)')
    .nullable(),
  
  documentoIdentidad: yup
    .string()
    .min(7, 'El documento debe tener al menos 7 caracteres')
    .max(15, 'El documento no puede exceder 15 caracteres')
    .matches(/^[0-9A-Z\-]+$/, 'El documento solo puede contener números, letras mayúsculas y guiones')
    .nullable(),
  
  profileImage: yup
    .string()
    .url('La URL de la imagen no es válida')
    .nullable(),
});


const direccionSchema = yup.object({
  calle: yup
    .string()
    .max(100, 'La dirección no puede exceder 100 caracteres')
    .nullable(),
  
  ciudad: yup
    .string()
    .max(50, 'La ciudad no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]*$/, 'La ciudad solo puede contener letras y espacios')
    .default('Montevideo')
    .nullable(),
  
  codigoPostal: yup
    .string()
    .matches(/^[0-9]{4,6}$/, 'El código postal debe tener entre 4 y 6 dígitos')
    .nullable(),
  
  pais: yup
    .string()
    .max(50, 'El país no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]*$/, 'El país solo puede contener letras y espacios')
    .default('Uruguay')
    .nullable(),
});


const empresaSchema = yup.object({
  nombreEmpresa: yup
    .string()
    .when('tipoUsuario', {
      is: 'cliente',
      then: (schema) => schema
        .required('El nombre de la empresa es obligatorio para clientes')
        .min(3, 'El nombre de la empresa debe tener al menos 3 caracteres')
        .max(100, 'El nombre de la empresa no puede exceder 100 caracteres'),
      otherwise: (schema) => schema.nullable(),
    })
    .trim(),
  
  identificacionFiscal: yup
    .string()
    .when('tipoUsuario', {
      is: (tipo) => ['cliente', 'proveedor'].includes(tipo),
      then: (schema) => schema
        .required('La identificación fiscal es obligatoria para empresas y proveedores')
        .min(8, 'La identificación fiscal debe tener al menos 8 caracteres')
        .max(20, 'La identificación fiscal no puede exceder 20 caracteres')
        .matches(/^[0-9\-]+$/, 'La identificación fiscal solo puede contener números y guiones'),
      otherwise: (schema) => schema.nullable(),
    })
    .trim(),
});


const proveedorSchema = yup.object({
  tipoServicio: yup
    .string()
    .when('tipoUsuario', {
      is: 'proveedor',
      then: (schema) => schema
        .required('El tipo de servicio es obligatorio para proveedores')
        .min(3, 'El tipo de servicio debe tener al menos 3 caracteres')
        .max(100, 'El tipo de servicio no puede exceder 100 caracteres'),
      otherwise: (schema) => schema.nullable(),
    })
    .trim(),
  
  tipoProveedor: yup
    .string()
    .test('tipo-proveedor-valido', 'Tipo de proveedor no válido', function(value) {
      if (!value) return true; 
      const tiposValidos = ['empresa', 'persona'];
      return tiposValidos.includes(value);
    })
    .default('empresa'),
});


const registroCompletoSchema = usuarioBaseSchema
  .concat(datosPersonalesSchema)
  .concat(direccionSchema)
  .concat(empresaSchema)
  .concat(proveedorSchema);

const Registro = ({ navigation }) => {
  
  const [formData, setFormData] = useState({
    username: '',
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipoUsuario: 'usuario',
    telefono: '',
    documentoIdentidad: '',
    profileImage: null,
    calle: '',
    ciudad: 'Montevideo',
    codigoPostal: '',
    pais: 'Uruguay',
    nombreEmpresa: '',
    tipoServicio: '',
    tipoEmpresa: 'inmobiliaria',
    tipoProveedor: 'empresa',
    identificacionFiscal: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);

  const dispatch = useDispatch();
  const { loading: isRegistering, error } = useSelector(state => state.auth);
  const { loadingEmpresa, loadingProveedor } = useSelector(state => state.usuario);

  
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    
    const timeoutId = setTimeout(() => {
      validateField(field, value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  
  const validateField = async (fieldName, value) => {
    try {
      await yup.reach(registroCompletoSchema, fieldName).validate(value);
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

  
  const validateForm = async () => {
    try {
      await registroCompletoSchema.validate(formData, { abortEarly: false });
      setValidationErrors({});
      return true;
    } catch (error) {
      const errors = {};
      error.inner.forEach(err => {
        errors[err.path] = err.message;
      });
      setValidationErrors(errors);
      return false;
    }
  };

  
  const validarCamposAdicionales = () => {
    const errores = {};

    
    if (formData.username.includes(' ')) {
      errores.username = 'El nombre de usuario no puede contener espacios';
    }

    
    const emailsProhibidos = ['admin@test.com', 'test@test.com'];
    if (emailsProhibidos.includes(formData.email.toLowerCase())) {
      errores.email = 'Este email no está disponible';
    }

    
    if (formData.tipoUsuario === 'cliente' && !formData.nombreEmpresa.trim()) {
      errores.nombreEmpresa = 'El nombre de la empresa es obligatorio para clientes';
    }

    if (formData.tipoUsuario === 'proveedor' && !formData.tipoServicio.trim()) {
      errores.tipoServicio = 'El tipo de servicio es obligatorio para proveedores';
    }

    if (Object.keys(errores).length > 0) {
      setValidationErrors(prev => ({ ...prev, ...errores }));
      return false;
    }

    return true;
  };

  const irLogin = () => {
    navigation.navigate('Login');
  };

  const crearEmpresaInmobiliariaAutomatica = async (usuarioId) => {
    try {
      
      const empresaData = {
        nombre: formData.nombreEmpresa.trim(),
        identificacionFiscal: formData.identificacionFiscal.trim(),
      };

      await yup.object().shape({
        nombre: yup.string().required().min(3),
        identificacionFiscal: yup.string().required().min(8),
      }).validate(empresaData);

      const datosEmpresa = {
        nombre: formData.nombreEmpresa.trim(),
        tipo: formData.tipoEmpresa,
        descripcion: `Empresa inmobiliaria ${formData.nombreEmpresa.trim()}`,
        contacto: {
          nombreContacto: `${formData.nombre.trim()} ${formData.apellidos.trim()}`.trim() || formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          telefono: formData.telefono.trim() || 'Sin especificar',
          cargo: 'Propietario'
        },
        identificacionFiscal: formData.identificacionFiscal.trim(),
        direccion: {
          calle: formData.calle.trim() || 'Sin especificar',
          ciudad: formData.ciudad.trim() || 'Montevideo',
          codigoPostal: formData.codigoPostal.trim() || '11000',
          pais: formData.pais.trim() || 'Uruguay'
        },
        activo: true,
        verificado: false
      };

      const result = await dispatch(crearEmpresaInmobiliaria({
        usuarioId,
        datosEmpresa
      }));

      if (crearEmpresaInmobiliaria.fulfilled.match(result)) {
        return result.payload;
      } else {
        throw new Error(result.payload || 'Error al crear empresa inmobiliaria');
      }
    } catch (error) {
      console.error('Error creando empresa:', error);
      if (error.message.includes('validation')) {
        Alert.alert('Error de validación', 'Los datos de la empresa no son válidos');
      }
      throw error;
    }
  };

  const crearProveedorAutomatico = async (usuarioId) => {
    try {
      
      const proveedorData = {
        tipoServicio: formData.tipoServicio.trim(),
        identificacionFiscal: formData.identificacionFiscal.trim(),
      };

      await yup.object().shape({
        tipoServicio: yup.string().required().min(3),
        identificacionFiscal: yup.string().required().min(8),
      }).validate(proveedorData);

      const datosProveedor = {
        nombre: formData.tipoServicio.trim(),
        tipo: formData.tipoProveedor,
        descripcion: `Proveedor de servicios: ${formData.tipoServicio.trim()}`,
        contacto: {
          nombreContacto: `${formData.nombre.trim()} ${formData.apellidos.trim()}`.trim() || formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          telefono: formData.telefono.trim() || 'Sin especificar'
        },
        identificacionFiscal: formData.identificacionFiscal.trim(),
        direccion: {
          calle: formData.calle.trim() || 'Sin especificar',
          ciudad: formData.ciudad.trim() || 'Montevideo',
          codigoPostal: formData.codigoPostal.trim() || '11000',
          pais: formData.pais.trim() || 'Uruguay'
        },
        activo: true,
        verificado: false
      };

      const result = await dispatch(crearProveedor({
        usuarioId,
        datosProveedor
      }));

      if (crearProveedor.fulfilled.match(result)) {
        return result.payload;
      } else {
        throw new Error(result.payload || 'Error al crear proveedor');
      }
    } catch (error) {
      console.error('Error creando proveedor:', error);
      if (error.message.includes('validation')) {
        Alert.alert('Error de validación', 'Los datos del proveedor no son válidos');
      }
      throw error;
    }
  };

  const registrarse = async () => {
    
    const isFormValid = await validateForm();
    const isAdditionalValid = validarCamposAdicionales();
    
    if (!isFormValid || !isAdditionalValid) {
      Alert.alert('Error de validación', 'Por favor corrige los errores en el formulario');
      return;
    }

    if (isRegistering || loadingEmpresa || loadingProveedor) {
      return;
    }

    try {
      dispatch(clearError());
      
      const registrationData = {
        tipoUsuario: formData.tipoUsuario,
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        nombre: formData.nombre.trim() || formData.username.trim(),
        apellidos: formData.apellidos.trim() || '',
        datosPersonales: {
          telefono: formData.telefono.trim() || undefined,
          documentoIdentidad: formData.documentoIdentidad.trim() || undefined,
        },
        direccion: {
          calle: formData.calle.trim() || undefined,
          ciudad: formData.ciudad.trim() || 'Montevideo',
          codigoPostal: formData.codigoPostal.trim() || undefined,
          pais: formData.pais.trim() || 'Uruguay',
        },
        imagen: formData.profileImage && typeof formData.profileImage === 'string' && formData.profileImage.trim() ? formData.profileImage.trim() : undefined,
        preferencias: {
          idiomaPreferido: 'es',
          monedaPreferida: 'UYU',
          notificaciones: {
            email: true,
            push: true,
            sms: false
          }
        },
      };

      if (formData.tipoUsuario === 'cliente' && formData.nombreEmpresa.trim()) {
        registrationData.datosEmpresa = {
          nombreEmpresa: formData.nombreEmpresa.trim()
        };
      }

      if (formData.tipoUsuario === 'proveedor' && formData.tipoServicio.trim()) {
        registrationData.datosEmpresa = {
          nombreEmpresa: formData.tipoServicio.trim()
        };
      }

      
      if (registrationData.datosPersonales) {
        Object.keys(registrationData.datosPersonales).forEach(key => {
          if (registrationData.datosPersonales[key] === undefined) {
            delete registrationData.datosPersonales[key];
          }
        });

        if (Object.keys(registrationData.datosPersonales).length === 0) {
          delete registrationData.datosPersonales;
        }
      }

      if (registrationData.direccion) {
        Object.keys(registrationData.direccion).forEach(key => {
          if (registrationData.direccion[key] === undefined) {
            delete registrationData.direccion[key];
          }
        });

        if (Object.keys(registrationData.direccion).length === 0) {
          delete registrationData.direccion;
        }
      }

      const result = await dispatch(signupUsuario(registrationData));

      if (signupUsuario.fulfilled.match(result)) {
        const usuarioId = result.payload?.userId;
        let empresa = null;
        let proveedor = null;

        if (usuarioId) {
          try {
            if (formData.tipoUsuario === 'cliente') {
              empresa = await crearEmpresaInmobiliariaAutomatica(usuarioId);
            } else if (formData.tipoUsuario === 'proveedor') {
              proveedor = await crearProveedorAutomatico(usuarioId);
            }
          } catch (error) {
            console.error('Error creando entidad asociada:', error);
          }
        }

        Alert.alert(
          'Registro exitoso',
          `¡Bienvenido ${result.payload.username || formData.username}! Tu cuenta como ${formData.tipoUsuario} ha sido creada exitosamente`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('Login');
              }
            }
          ]
        );

      } else if (signupUsuario.rejected.match(result)) {
        Alert.alert('Error', result.payload || 'Error en el registro');
      }

    } catch (error) {
      console.error('Error en registro:', error);
      Alert.alert('Error', 'Error de conexión. Por favor intenta nuevamente.');
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Se necesitan permisos de cámara para tomar fotos',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Se necesitan permisos de galería para seleccionar fotos',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const uploadToCloudinary = async (imageUri) => {
    const formDataUpload = new FormData();

    formDataUpload.append('file', {
      uri: imageUri,
      name: 'profile_registration.jpeg',
      type: 'image/jpeg'
    });

    formDataUpload.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error('Error al subir imagen a Cloudinary');
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw error;
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      setUploadingImage(true);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const cloudinaryUrl = await uploadToCloudinary(result.assets[0].uri);
        updateFormData('profileImage', cloudinaryUrl);
        Alert.alert('Éxito', 'Foto subida correctamente');
      }
    } catch (error) {
      console.error('Error tomando foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    } finally {
      setUploadingImage(false);
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      setUploadingImage(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const cloudinaryUrl = await uploadToCloudinary(result.assets[0].uri);
        updateFormData('profileImage', cloudinaryUrl);
        Alert.alert('Éxito', 'Foto subida correctamente');
      }
    } catch (error) {
      console.error('Error seleccionando foto:', error);
      Alert.alert('Error', 'No se pudo seleccionar la foto');
    } finally {
      setUploadingImage(false);
    }
  };

  const showImageOptions = () => {
    if (uploadingImage) return;

    Alert.alert(
      'Seleccionar foto de perfil',
      'Selecciona una opción',
      [
        {
          text: 'Cámara',
          onPress: takePhoto,
        },
        {
          text: 'Galería',
          onPress: pickFromGallery,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const isLoading = isRegistering || loadingEmpresa || loadingProveedor;

  
  const ErrorText = ({ error }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Officereserve</Text>
          <Text style={styles.subtitle}>Registrarse</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTextContainer}>{error}</Text>
            </View>
          )}

          <View style={styles.tipoUsuarioContainer}>
            <Text style={styles.label}>Registrarse como:</Text>
            <View style={styles.tipoUsuarioButtons}>
              <TouchableOpacity
                style={[
                  styles.tipoUsuarioButton,
                  formData.tipoUsuario === 'usuario' && styles.tipoUsuarioButtonActive
                ]}
                onPress={() => updateFormData('tipoUsuario', 'usuario')}
                disabled={isLoading}
              >
                <Text style={[
                  styles.tipoUsuarioButtonText,
                  formData.tipoUsuario === 'usuario' && styles.tipoUsuarioButtonTextActive
                ]}>
                  Usuario
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tipoUsuarioButton,
                  formData.tipoUsuario === 'cliente' && styles.tipoUsuarioButtonActive
                ]}
                onPress={() => updateFormData('tipoUsuario', 'cliente')}
                disabled={isLoading}
              >
                <Text style={[
                  styles.tipoUsuarioButtonText,
                  formData.tipoUsuario === 'cliente' && styles.tipoUsuarioButtonTextActive
                ]}>
                  Cliente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tipoUsuarioButton,
                  formData.tipoUsuario === 'proveedor' && styles.tipoUsuarioButtonActive
                ]}
                onPress={() => updateFormData('tipoUsuario', 'proveedor')}
                disabled={isLoading}
              >
                <Text style={[
                  styles.tipoUsuarioButtonText,
                  formData.tipoUsuario === 'proveedor' && styles.tipoUsuarioButtonTextActive
                ]}>
                  Proveedor
                </Text>
              </TouchableOpacity>
            </View>
            <ErrorText error={validationErrors.tipoUsuario} />
          </View>

          <Text style={styles.sectionTitle}>Información Personal</Text>

          <Text style={styles.label}>Nombre de usuario *</Text>
          <TextInput
            style={[
              styles.fullInput,
              isLoading && styles.inputDisabled,
              validationErrors.username && styles.inputError
            ]}
            placeholder="Nombre de usuario único"
            placeholderTextColor="#999"
            value={formData.username}
            onChangeText={(text) => updateFormData('username', text)}
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!isLoading}
            autoCapitalize="none"
          />
          <ErrorText error={validationErrors.username} />

          <View style={styles.rowContainer}>
            <View style={styles.halfInputContainer}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={[
                  styles.input,
                  isLoading && styles.inputDisabled,
                  validationErrors.nombre && styles.inputError
                ]}
                placeholder="Tu nombre"
                placeholderTextColor="#999"
                value={formData.nombre}
                onChangeText={(text) => updateFormData('nombre', text)}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isLoading}
              />
              <ErrorText error={validationErrors.nombre} />
            </View>
            <View style={styles.halfInputContainer}>
              <Text style={styles.label}>Apellidos</Text>
              <TextInput
                style={[
                  styles.input,
                  isLoading && styles.inputDisabled,
                  validationErrors.apellidos && styles.inputError
                ]}
                placeholder="Tus apellidos"
                placeholderTextColor="#999"
                value={formData.apellidos}
                onChangeText={(text) => updateFormData('apellidos', text)}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isLoading}
              />
              <ErrorText error={validationErrors.apellidos} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Foto de Perfil (opcional)</Text>
          <TouchableOpacity
            onPress={showImageOptions}
            style={styles.photoContainer}
            disabled={uploadingImage || isLoading}
          >
            {uploadingImage ? (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.uploadingText}>Subiendo...</Text>
              </View>
            ) : formData.profileImage ? (
              <Image source={{ uri: formData.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera" size={40} color="#7f8c8d" />
                <Text style={styles.photoText}>Agregar foto</Text>
              </View>
            )}
          </TouchableOpacity>
          <ErrorText error={validationErrors.profileImage} />

          <Text style={styles.sectionTitle}>Información de Contacto</Text>

          <View style={styles.rowContainer}>
            <View style={styles.halfInputContainer}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={[
                  styles.input,
                  isLoading && styles.inputDisabled,
                  validationErrors.telefono && styles.inputError
                ]}
                placeholder="+598 9X XXX XXX"
                placeholderTextColor="#999"
                value={formData.telefono}
                onChangeText={(text) => updateFormData('telefono', text)}
                keyboardType="phone-pad"
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isLoading}
              />
              <ErrorText error={validationErrors.telefono} />
            </View>
            <View style={styles.halfInputContainer}>
              <Text style={styles.label}>Documento</Text>
              <TextInput
                style={[
                  styles.input,
                  isLoading && styles.inputDisabled,
                  validationErrors.documentoIdentidad && styles.inputError
                ]}
                placeholder="C.I. o Pasaporte"
                placeholderTextColor="#999"
                value={formData.documentoIdentidad}
                onChangeText={(text) => updateFormData('documentoIdentidad', text)}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isLoading}
              />
              <ErrorText error={validationErrors.documentoIdentidad} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Dirección (opcional)</Text>

          <Text style={styles.label}>Calle</Text>
          <TextInput
            style={[
              styles.fullInput,
              isLoading && styles.inputDisabled,
              validationErrors.calle && styles.inputError
            ]}
            placeholder="Calle y número"
            placeholderTextColor="#999"
            value={formData.calle}
            onChangeText={(text) => updateFormData('calle', text)}
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!isLoading}
          />
          <ErrorText error={validationErrors.calle} />

          <View style={styles.rowContainer}>
            <View style={styles.halfInputContainer}>
              <Text style={styles.label}>Ciudad</Text>
              <TextInput
                style={[
                  styles.input,
                  isLoading && styles.inputDisabled,
                  validationErrors.ciudad && styles.inputError
                ]}
                placeholder="Ciudad"
                placeholderTextColor="#999"
                value={formData.ciudad}
                onChangeText={(text) => updateFormData('ciudad', text)}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isLoading}
              />
              <ErrorText error={validationErrors.ciudad} />
            </View>
            <View style={styles.halfInputContainer}>
              <Text style={styles.label}>Código Postal</Text>
              <TextInput
                style={[
                  styles.input,
                  isLoading && styles.inputDisabled,
                  validationErrors.codigoPostal && styles.inputError
                ]}
                placeholder="Código postal"
                placeholderTextColor="#999"
                value={formData.codigoPostal}
                onChangeText={(text) => updateFormData('codigoPostal', text)}
                keyboardType="numeric"
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isLoading}
              />
              <ErrorText error={validationErrors.codigoPostal} />
            </View>
          </View>

          {formData.tipoUsuario === 'cliente' && (
            <>
              <Text style={styles.sectionTitle}>Información de Empresa Inmobiliaria</Text>

              <Text style={styles.label}>Nombre de la empresa *</Text>
              <TextInput
                style={[
                  styles.fullInput,
                  isLoading && styles.inputDisabled,
                  validationErrors.nombreEmpresa && styles.inputError
                ]}
                placeholder="Nombre de tu empresa inmobiliaria"
                placeholderTextColor="#999"
                value={formData.nombreEmpresa}
                onChangeText={(text) => updateFormData('nombreEmpresa', text)}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isLoading}
              />
              <ErrorText error={validationErrors.nombreEmpresa} />

              <Text style={styles.label}>ID Fiscal *</Text>
              <TextInput
                style={[
                  styles.fullInput,
                  isLoading && styles.inputDisabled,
                  validationErrors.identificacionFiscal && styles.inputError
                ]}
                placeholder="RUT o identificación fiscal"
                placeholderTextColor="#999"
                value={formData.identificacionFiscal}
                onChangeText={(text) => updateFormData('identificacionFiscal', text)}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isLoading}
              />
              <ErrorText error={validationErrors.identificacionFiscal} />
            </>
          )}

          {formData.tipoUsuario === 'proveedor' && (
            <>
              <Text style={styles.sectionTitle}>Información de Proveedor</Text>

              <Text style={styles.label}>Tipo de servicio *</Text>
              <TextInput
                style={[
                  styles.fullInput,
                  isLoading && styles.inputDisabled,
                  validationErrors.tipoServicio && styles.inputError
                ]}
                placeholder="Ej: Limpieza, Catering, Seguridad, Mantenimiento, etc."
                placeholderTextColor="#999"
                value={formData.tipoServicio}
                onChangeText={(text) => updateFormData('tipoServicio', text)}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isLoading}
              />
              <ErrorText error={validationErrors.tipoServicio} />

              <Text style={styles.label}>ID Fiscal *</Text>
              <TextInput
                style={[
                  styles.fullInput,
                  isLoading && styles.inputDisabled,
                  validationErrors.identificacionFiscal && styles.inputError
                ]}
                placeholder="RUT o identificación fiscal"
                placeholderTextColor="#999"
                value={formData.identificacionFiscal}
                onChangeText={(text) => updateFormData('identificacionFiscal', text)}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isLoading}
              />
              <ErrorText error={validationErrors.identificacionFiscal} />
            </>
          )}

          <Text style={styles.sectionTitle}>Datos de Acceso</Text>

          <Text style={styles.label}>Correo electrónico *</Text>
          <TextInput
            style={[
              styles.fullInput,
              isLoading && styles.inputDisabled,
              validationErrors.email && styles.inputError
            ]}
            placeholder="tu@email.com"
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

          <Text style={styles.label}>Contraseña *</Text>
          <TextInput
            style={[
              styles.fullInput,
              isLoading && styles.inputDisabled,
              validationErrors.password && styles.inputError
            ]}
            placeholder="Mínimo 8 caracteres (mayúscula, minúscula y número)"
            placeholderTextColor="#999"
            value={formData.password}
            onChangeText={(text) => updateFormData('password', text)}
            secureTextEntry
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!isLoading}
          />
          <ErrorText error={validationErrors.password} />

          <Text style={styles.label}>Confirmar contraseña *</Text>
          <TextInput
            style={[
              styles.fullInput,
              isLoading && styles.inputDisabled,
              validationErrors.confirmPassword && styles.inputError
            ]}
            placeholder="Repite tu contraseña"
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
            onPress={registrarse}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isRegistering ? 'Registrando usuario...' :
                loadingEmpresa ? 'Creando empresa...' :
                  loadingProveedor ? 'Creando proveedor...' :
                    'Registrarse'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backContainer}
            onPress={irLogin}
            disabled={isLoading}
          >
            <Text style={[styles.backLink, isLoading && styles.linkDisabled]}>
              ¿Ya tienes cuenta? Inicia sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 20,
    fontFamily: 'System',
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#fee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorTextContainer: {
    color: '#c33',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'System',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 15,
    alignSelf: 'flex-start',
    fontFamily: 'System',
  },
  photoContainer: {
    marginBottom: 20,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1e5e9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderStyle: 'dashed',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
    fontFamily: 'System',
  },
  uploadingText: {
    fontSize: 14,
    color: '#4a90e2',
    fontFamily: 'System',
  },
  tipoUsuarioContainer: {
    width: '100%',
    marginBottom: 20,
  },
  tipoUsuarioButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  tipoUsuarioButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    alignItems: 'center',
  },
  tipoUsuarioButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  tipoUsuarioButtonText: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '600',
    fontFamily: 'System',
  },
  tipoUsuarioButtonTextActive: {
    color: '#fff',
  },
  rowContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  halfInputContainer: {
    width: '48%',
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
  fullInput: {
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
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginBottom: 15,
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
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'System',
  },
  backContainer: {
    marginTop: 20,
  },
  backLink: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
    fontFamily: 'System',
  },
  linkDisabled: {
    color: '#9CA3AF',
  },
});

export default Registro;