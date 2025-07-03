import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

import { actualizarUsuario } from '../store/slices/usuarioSlice';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const userProfileSchema = yup.object({
  nombre: yup
    .string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/, 'El nombre solo puede contener letras y espacios'),

  apellidos: yup
    .string()
    .max(50, 'Los apellidos no pueden exceder 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]*$/, 'Los apellidos solo pueden contener letras y espacios'),

  email: yup
    .string()
    .email('Ingrese un email válido')
    .required('El email es obligatorio'),

  telefono: yup
    .string()
    .matches(/^(\+598\s?)?[0-9\s\-()]{8,15}$/, 'Ingrese un teléfono válido (+598 9X XXX XXX)')
    .nullable(),

  documentoIdentidad: yup
    .string()
    .min(7, 'El documento debe tener al menos 7 caracteres')
    .max(15, 'El documento no puede exceder 15 caracteres')
    .matches(/^[0-9A-Z\-]+$/, 'El documento solo puede contener números, letras mayúsculas y guiones')
    .nullable(),

  calle: yup
    .string()
    .max(100, 'La dirección no puede exceder 100 caracteres')
    .nullable(),

  ciudad: yup
    .string()
    .max(50, 'La ciudad no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]*$/, 'La ciudad solo puede contener letras y espacios')
    .nullable(),

  codigoPostal: yup
    .string()
    .matches(/^[0-9]{4,6}$/, 'El código postal debe tener entre 4 y 6 dígitos')
    .nullable(),

  pais: yup
    .string()
    .max(50, 'El país no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]*$/, 'El país solo puede contener letras y espacios')
    .nullable(),

  password: yup
    .string()
    .nullable()
    .test('password-optional', 'La contraseña debe tener al menos 8 caracteres', function (value) {
      if (!value || value.length === 0) {
        return true;
      }
      return value.length >= 8;
    })
    .test('password-max', 'La contraseña no puede exceder 128 caracteres', function (value) {
      if (!value || value.length === 0) {
        return true;
      }
      return value.length <= 128;
    })
    .test('password-pattern', 'La contraseña debe contener al menos una minúscula, una mayúscula y un número', function (value) {
      if (!value || value.length === 0) {
        return true;
      }
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value);
    }),

  confirmPassword: yup
    .string()
    .nullable()
    .test('passwords-match', 'Las contraseñas deben coincidir', function (value) {
      const { password } = this.parent;
      if (!password || password.length === 0) {
        return true;
      }
      if (!value) {
        return this.createError({
          message: 'Debe confirmar la contraseña'
        });
      }
      return value === password;
    }),
});

const MiCuenta = ({ navigation }) => {
  const dispatch = useDispatch();

  const { usuario, token, tipoUsuario } = useSelector(state => state.auth);
  const { loading: usuarioLoading } = useSelector(state => state.usuario);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    username: '',
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    documentoIdentidad: '',
    calle: '',
    ciudad: '',
    codigoPostal: '',
    pais: '',
    imagen: '',
    password: '',
    confirmPassword: ''
  });

  const [editData, setEditData] = useState({ ...formData });

  useEffect(() => {
  if (usuario) {
    console.log('=== DEBUG USUARIO RECIBIDO ===');
    console.log('Usuario completo:', JSON.stringify(usuario, null, 2));
    console.log('Teléfono directo:', usuario.telefono);
    console.log('Documento directo:', usuario.documentoIdentidad);
    console.log('DatosPersonales:', usuario.datosPersonales);
    
    const data = {
      username: usuario.username || '',
      nombre: usuario.nombre || '',
      apellidos: usuario.apellidos || '',
      email: usuario.email || '',
      telefono: usuario.datosPersonales?.telefono || usuario.telefono || '',
      documentoIdentidad: usuario.datosPersonales?.documentoIdentidad || usuario.documentoIdentidad || '',
      imagen: usuario.imagen || '',
      calle: usuario.direccion?.calle || usuario.calle || '',
      ciudad: usuario.direccion?.ciudad || usuario.ciudad || '',
      codigoPostal: usuario.direccion?.codigoPostal || usuario.codigoPostal || '',
      pais: usuario.direccion?.pais || usuario.pais || 'Uruguay',
      password: '',
      confirmPassword: ''
    };

    console.log('=== DATOS MAPEADOS ===');
    console.log('FormData resultante:', JSON.stringify(data, null, 2));
    
    setFormData(data);
    setEditData(data);
  }
}, [usuario]);

  const validateField = async (fieldName, value) => {
    try {
      await yup.reach(userProfileSchema, fieldName).validate(value);
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

  const validateForm = async (data) => {
    try {
      await userProfileSchema.validate(data, { abortEarly: false });
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

  const handleInputChange = (fieldName, value) => {
    if (!isEditing) return;

    setEditData(prev => ({ ...prev, [fieldName]: value }));

    const timeoutId = setTimeout(() => {
      validateField(fieldName, value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleEdit = async () => {
    if (isEditing) {
      const dataToValidate = { ...editData };

      if (!editData.password || editData.password.trim() === '') {
        delete dataToValidate.password;
        delete dataToValidate.confirmPassword;
      }

      const isValid = await validateForm(dataToValidate);

      if (!isValid) {
        Alert.alert('Error de validación', 'Por favor corrige los errores en el formulario');
        return;
      }

      if (!editData.nombre.trim() || !editData.email.trim()) {
        Alert.alert('Error', 'El nombre y email son obligatorios');
        return;
      }

      if (editData.password && editData.password.trim() !== '') {
        if (editData.password !== editData.confirmPassword) {
          Alert.alert('Error', 'Las contraseñas no coinciden');
          return;
        }

        if (editData.password.length < 8) {
          Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
          return;
        }
      }

      try {
        setIsLoading(true);

        const updateData = {
          nombre: editData.nombre.trim(),
          apellidos: editData.apellidos.trim(),
        };

        if (editData.imagen) {
          updateData.imagen = editData.imagen;
        }

        const datosPersonales = {};
        if (editData.telefono.trim()) datosPersonales.telefono = editData.telefono.trim();
        if (editData.documentoIdentidad.trim()) datosPersonales.documentoIdentidad = editData.documentoIdentidad.trim();

        if (Object.keys(datosPersonales).length > 0) {
          updateData.datosPersonales = datosPersonales;
        }

        const direccion = {};
        if (editData.calle.trim()) direccion.calle = editData.calle.trim();
        if (editData.ciudad.trim()) direccion.ciudad = editData.ciudad.trim();
        if (editData.codigoPostal.trim()) direccion.codigoPostal = editData.codigoPostal.trim();
        if (editData.pais.trim()) direccion.pais = editData.pais.trim();

        if (Object.keys(direccion).length > 0) {
          updateData.direccion = direccion;
        }

        if (editData.password && editData.password.trim() !== '') {
          updateData.password = editData.password;
        }

        const result = await dispatch(actualizarUsuario({
          usuarioId: usuario.id || usuario._id,
          datosActualizacion: updateData
        }));

        if (actualizarUsuario.fulfilled.match(result)) {
          const updatedFormData = {
            ...editData,
            password: '',
            confirmPassword: ''
          };
          setFormData(updatedFormData);
          setEditData(updatedFormData);
          setValidationErrors({});

          setIsEditing(false);
          Alert.alert('Éxito', 'Perfil actualizado correctamente');
        } else {
          throw new Error(result.payload || 'Error al actualizar el perfil');
        }

      } catch (error) {
        console.error(error);
        Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
      } finally {
        setIsLoading(false);
      }
    } else {
      setEditData({ ...formData });
      setValidationErrors({});
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setEditData({ ...formData });
    setValidationErrors({});
    setIsEditing(false);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
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
    const formDataCloudinary = new FormData();

    formDataCloudinary.append('file', {
      uri: imageUri,
      name: 'profile_image.jpeg',
      type: 'image/jpeg'
    });

    formDataCloudinary.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formDataCloudinary
      });

      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error('Error al subir imagen a Cloudinary');
      }
    } catch (error) {
      console.error(error);
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

        await updateProfileImage(cloudinaryUrl);

        setEditData(prev => ({ ...prev, imagen: cloudinaryUrl }));
        setFormData(prev => ({ ...prev, imagen: cloudinaryUrl }));

        Alert.alert('Éxito', 'Foto actualizada correctamente');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar la foto');
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

        await updateProfileImage(cloudinaryUrl);

        setEditData(prev => ({ ...prev, imagen: cloudinaryUrl }));
        setFormData(prev => ({ ...prev, imagen: cloudinaryUrl }));

        Alert.alert('Éxito', 'Foto actualizada correctamente');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar la foto');
    } finally {
      setUploadingImage(false);
    }
  };

  const updateProfileImage = async (imageUrl) => {
    try {
      const result = await dispatch(actualizarUsuario({
        usuarioId: usuario.id || usuario._id,
        datosActualizacion: { imagen: imageUrl }
      }));

      if (!actualizarUsuario.fulfilled.match(result)) {
        throw new Error('Error al actualizar imagen');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const showImageOptions = () => {
    if (uploadingImage) return;

    if (!isEditing) {
      Alert.alert(
        'Modo de edición requerido',
        'Para cambiar tu foto de perfil, primero debes activar el modo de edición.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Cambiar foto de perfil',
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

  const handleBackPress = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('Inicio');
    }
  };

  const renderImageContainer = () => {
    const imageSource = editData.imagen
      ? { uri: editData.imagen }
      : require('../assets/images/logo.png');

    return (
      <View style={styles.profileImageContainer}>
        {uploadingImage ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color="#4a90e2" />
            <Text style={styles.uploadingText}>Subiendo...</Text>
          </View>
        ) : (
          <Image
            source={imageSource}
            style={styles.profileImage}
            onError={() => {
              setEditData(prev => ({ ...prev, imagen: '' }));
            }}
          />
        )}
        <TouchableOpacity
          style={[
            styles.editPhotoButton,
            !isEditing && styles.editPhotoButtonDisabled
          ]}
          onPress={showImageOptions}
          disabled={uploadingImage || !isEditing}
        >
          <Ionicons
            name="camera"
            size={20}
            color={isEditing ? "#4a90e2" : "#95a5a6"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const ErrorText = ({ error }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.menuButton}>
          <Ionicons name="arrow-back" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi cuenta</Text>
        <View style={styles.placeholder} />
      </View>

      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.profileContainer}>
            {renderImageContainer()}
            <Text style={styles.userTypeText}>
              {tipoUsuario?.charAt(0).toUpperCase() + tipoUsuario?.slice(1) || 'Usuario'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre de usuario</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.username}
                editable={false}
                placeholder="Nombre de usuario"
              />
              <Text style={styles.helpText}>El nombre de usuario no se puede cambiar</Text>
            </View>

            <Text style={styles.sectionTitle}>Información Personal</Text>

            <View style={styles.rowContainer}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={[
                    styles.input,
                    !isEditing && styles.inputDisabled,
                    validationErrors.nombre && styles.inputError
                  ]}
                  value={isEditing ? editData.nombre : formData.nombre}
                  onChangeText={(text) => handleInputChange('nombre', text)}
                  editable={isEditing}
                  placeholder="Tu nombre"
                />
                <ErrorText error={validationErrors.nombre} />
              </View>

              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Apellidos</Text>
                <TextInput
                  style={[
                    styles.input,
                    !isEditing && styles.inputDisabled,
                    validationErrors.apellidos && styles.inputError
                  ]}
                  value={isEditing ? editData.apellidos : formData.apellidos}
                  onChangeText={(text) => handleInputChange('apellidos', text)}
                  editable={isEditing}
                  placeholder="Tus apellidos"
                />
                <ErrorText error={validationErrors.apellidos} />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico *</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.email}
                editable={false}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.helpText}>El email no se puede cambiar desde aquí</Text>
            </View>

            <Text style={styles.sectionTitle}>Información de Contacto</Text>

            <View style={styles.rowContainer}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={[
                    styles.input,
                    !isEditing && styles.inputDisabled,
                    validationErrors.telefono && styles.inputError
                  ]}
                  value={isEditing ? editData.telefono : formData.telefono}
                  onChangeText={(text) => handleInputChange('telefono', text)}
                  editable={isEditing}
                  placeholder="+598 9X XXX XXX"
                  keyboardType="phone-pad"
                />
                <ErrorText error={validationErrors.telefono} />
              </View>

              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Documento</Text>
                <TextInput
                  style={[
                    styles.input,
                    !isEditing && styles.inputDisabled,
                    validationErrors.documentoIdentidad && styles.inputError
                  ]}
                  value={isEditing ? editData.documentoIdentidad : formData.documentoIdentidad}
                  onChangeText={(text) => handleInputChange('documentoIdentidad', text)}
                  editable={isEditing}
                  placeholder="C.I. o Pasaporte"
                />
                <ErrorText error={validationErrors.documentoIdentidad} />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Dirección</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Calle y número</Text>
              <TextInput
                style={[
                  styles.input,
                  !isEditing && styles.inputDisabled,
                  validationErrors.calle && styles.inputError
                ]}
                value={isEditing ? editData.calle : formData.calle}
                onChangeText={(text) => handleInputChange('calle', text)}
                editable={isEditing}
                placeholder="Av. 18 de Julio 1234"
              />
              <ErrorText error={validationErrors.calle} />
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Ciudad</Text>
                <TextInput
                  style={[
                    styles.input,
                    !isEditing && styles.inputDisabled,
                    validationErrors.ciudad && styles.inputError
                  ]}
                  value={isEditing ? editData.ciudad : formData.ciudad}
                  onChangeText={(text) => handleInputChange('ciudad', text)}
                  editable={isEditing}
                  placeholder="Montevideo"
                />
                <ErrorText error={validationErrors.ciudad} />
              </View>

              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Código Postal</Text>
                <TextInput
                  style={[
                    styles.input,
                    !isEditing && styles.inputDisabled,
                    validationErrors.codigoPostal && styles.inputError
                  ]}
                  value={isEditing ? editData.codigoPostal : formData.codigoPostal}
                  onChangeText={(text) => handleInputChange('codigoPostal', text)}
                  editable={isEditing}
                  placeholder="11000"
                  keyboardType="numeric"
                />
                <ErrorText error={validationErrors.codigoPostal} />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>País</Text>
              <TextInput
                style={[
                  styles.input,
                  !isEditing && styles.inputDisabled,
                  validationErrors.pais && styles.inputError
                ]}
                value={isEditing ? editData.pais : formData.pais}
                onChangeText={(text) => handleInputChange('pais', text)}
                editable={isEditing}
                placeholder="Uruguay"
              />
              <ErrorText error={validationErrors.pais} />
            </View>

            {isEditing && (
              <>
                <Text style={styles.sectionTitle}>Cambiar Contraseña (opcional)</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nueva contraseña</Text>
                  <TextInput
                    style={[
                      styles.input,
                      validationErrors.password && styles.inputError
                    ]}
                    value={editData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    placeholder="Mínimo 8 caracteres (mayúscula, minúscula y número)"
                    secureTextEntry
                  />
                  <ErrorText error={validationErrors.password} />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirmar nueva contraseña</Text>
                  <TextInput
                    style={[
                      styles.input,
                      validationErrors.confirmPassword && styles.inputError
                    ]}
                    value={editData.confirmPassword}
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    placeholder="Repite la nueva contraseña"
                    secureTextEntry
                  />
                  <ErrorText error={validationErrors.confirmPassword} />
                </View>
              </>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                (isLoading || uploadingImage || usuarioLoading) && styles.buttonDisabled
              ]}
              onPress={handleEdit}
              disabled={isLoading || uploadingImage || usuarioLoading}
            >
              {(isLoading || usuarioLoading) ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isEditing ? 'Guardar cambios' : 'Editar perfil'}
                </Text>
              )}
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleCancel}
                disabled={isLoading || usuarioLoading}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },

  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 4,
    fontFamily: 'System',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e9ecef',
  },
  uploadingContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 12,
    color: '#4a90e2',
    marginTop: 5,
    fontFamily: 'System',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  userTypeText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 10,
    fontWeight: '600',
    fontFamily: 'System',
  },
  formContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 15,
    fontFamily: 'System',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfInputContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: 'System',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  inputDisabled: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
  },
  helpText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    fontStyle: 'italic',
    fontFamily: 'System',
  },
  buttonContainer: {
    paddingVertical: 20,
    gap: 10,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#4a90e2',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  secondaryButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  editPhotoButtonDisabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
    opacity: 0.7,
  },
});

export default MiCuenta;