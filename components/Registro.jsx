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
  View
} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import { clearError, signupUsuario } from '../store/slices/authSlice';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const Registro = ({ navigation }) => {
  
  const [username, setUsername] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('usuario');

  
  const [telefono, setTelefono] = useState('');
  const [documentoIdentidad, setDocumentoIdentidad] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  
  const [calle, setCalle] = useState('');
  const [ciudad, setCiudad] = useState('Montevideo');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [pais, setPais] = useState('Uruguay');

  
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [tipoServicio, setTipoServicio] = useState('');

  
  const [uploadingImage, setUploadingImage] = useState(false);

  
  const dispatch = useDispatch();
  const { loading: isRegistering, error } = useSelector(state => state.auth);

  const irLogin = () => {
    navigation.navigate('Login');
  };

  const validarCampos = () => {
    if (!username.trim()) {
      Alert.alert('Error', 'El nombre de usuario es obligatorio');
      return false;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'El nombre de usuario debe tener al menos 3 caracteres');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'El correo electrónico es obligatorio');
      return false;
    }

    if (!password) {
      Alert.alert('Error', 'La contraseña es obligatoria');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    if (tipoUsuario === 'cliente' && !nombreEmpresa.trim()) {
      Alert.alert('Error', 'El nombre de la empresa es obligatorio para clientes');
      return false;
    }

    if (tipoUsuario === 'proveedor' && !tipoServicio.trim()) {
      Alert.alert('Error', 'El tipo de servicio es obligatorio para proveedores');
      return false;
    }

    return true;
  };

  const registrarse = async () => {
    if (!validarCampos()) {
      return;
    }

    if (isRegistering) {
      return;
    }

    try {
      
      dispatch(clearError());

      
      console.log('🔍 [Frontend] Estado de profileImage:', {
        profileImage,
        hasValue: !!profileImage,
        type: typeof profileImage,
        length: profileImage?.length,
        isCloudinaryUrl: profileImage?.includes('cloudinary.com')
      });

      
      const registrationData = {
        tipoUsuario,
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

      
      console.log('🔵 [Frontend] Despachando signupUsuario con:', registrationData);

      const result = await dispatch(signupUsuario(registrationData));

      if (signupUsuario.fulfilled.match(result)) {
        console.log('🟢 [Frontend] Registro exitoso:', result.payload);

        
        if (result.payload?.userId) {
          await actualizarDatosAdicionales(result.payload.userId);
        }

        
        Alert.alert(
          'Registro exitoso',
          `¡Bienvenido ${result.payload.username || username}! Tu cuenta como ${tipoUsuario} ha sido creada exitosamente.${profileImage ? '\n\n✅ Foto de perfil guardada' : '\n\n⚠️ Sin foto de perfil'}${(tipoUsuario === 'cliente' && nombreEmpresa) ? `\n\nEmpresa: ${nombreEmpresa}` : ''}${(tipoUsuario === 'proveedor' && tipoServicio) ? `\n\nServicio: ${tipoServicio}` : ''}`,
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
        console.log('🔴 [Frontend] Error en registro:', result.payload);
        Alert.alert('Error', result.payload || 'Error en el registro');
      }

    } catch (error) {
      console.log('🔴 [Frontend] Error de conexión:', error);
      Alert.alert('Error', 'Error de conexión. Por favor intenta nuevamente.');
    }
  };

  
  const actualizarDatosAdicionales = async (usuarioId) => {
    try {
      const updateData = {
        nombre: nombre.trim() || username.trim(),
        apellidos: apellidos.trim() || '',
        
        datosPersonales: {
          telefono: telefono.trim() || undefined,
          documentoIdentidad: documentoIdentidad.trim() || undefined,
        },

        direccion: {
          calle: calle.trim() || undefined,
          ciudad: ciudad.trim() || 'Montevideo',
          codigoPostal: codigoPostal.trim() || undefined,
          pais: pais.trim() || 'Uruguay',
        },

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

      
      if (profileImage && typeof profileImage === 'string' && profileImage.trim()) {
        updateData.imagen = profileImage.trim();
      }

      
      if (tipoUsuario === 'cliente' && nombreEmpresa.trim()) {
        updateData.datosEmpresa = {
          nombreEmpresa: nombreEmpresa.trim()
        };
      }

      if (tipoUsuario === 'proveedor' && tipoServicio.trim()) {
        updateData.datosEmpresa = {
          nombreEmpresa: tipoServicio.trim()
        };
      }

      
      Object.keys(updateData.datosPersonales).forEach(key => {
        if (updateData.datosPersonales[key] === undefined) {
          delete updateData.datosPersonales[key];
        }
      });

      Object.keys(updateData.direccion).forEach(key => {
        if (updateData.direccion[key] === undefined) {
          delete updateData.direccion[key];
        }
      });

      console.log('🔄 [Frontend] Actualizando perfil con datos adicionales...');

      const updateResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (updateResponse.ok) {
        console.log('🟢 [Frontend] Perfil actualizado con datos adicionales');
      } else {
        console.log('🟡 [Frontend] Usuario creado pero no se pudieron agregar datos adicionales');
      }
      
    } catch (updateError) {
      console.log('🟡 [Frontend] Usuario creado pero error al actualizar perfil:', updateError);
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
    const formData = new FormData();

    formData.append('file', {
      uri: imageUri,
      name: 'profile_registration.jpeg',
      type: 'image/jpeg'
    });

    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error('Error al subir imagen a Cloudinary');
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
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
        setProfileImage(cloudinaryUrl);
        Alert.alert('Éxito', 'Foto subida correctamente');
      }
    } catch (error) {
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
        setProfileImage(cloudinaryUrl);
        Alert.alert('Éxito', 'Foto subida correctamente');
      }
    } catch (error) {
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

          {/* 🔥 CAMBIO: Mostrar error si existe */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity onPress={showImageOptions} style={styles.photoContainer} disabled={uploadingImage}>
            {uploadingImage ? (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.uploadingText}>Subiendo...</Text>
              </View>
            ) : profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera" size={40} color="#7f8c8d" />
                <Text style={styles.photoText}>Agregar foto</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.tipoUsuarioContainer}>
            <Text style={styles.label}>Registrarse como:</Text>
            <View style={styles.tipoUsuarioButtons}>
              <TouchableOpacity
                style={[
                  styles.tipoUsuarioButton,
                  tipoUsuario === 'usuario' && styles.tipoUsuarioButtonActive
                ]}
                onPress={() => setTipoUsuario('usuario')}
                disabled={isRegistering}
              >
                <Text style={[
                  styles.tipoUsuarioButtonText,
                  tipoUsuario === 'usuario' && styles.tipoUsuarioButtonTextActive
                ]}>
                  Usuario
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tipoUsuarioButton,
                  tipoUsuario === 'cliente' && styles.tipoUsuarioButtonActive
                ]}
                onPress={() => setTipoUsuario('cliente')}
                disabled={isRegistering}
              >
                <Text style={[
                  styles.tipoUsuarioButtonText,
                  tipoUsuario === 'cliente' && styles.tipoUsuarioButtonTextActive
                ]}>
                  Cliente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tipoUsuarioButton,
                  tipoUsuario === 'proveedor' && styles.tipoUsuarioButtonActive
                ]}
                onPress={() => setTipoUsuario('proveedor')}
                disabled={isRegistering}
              >
                <Text style={[
                  styles.tipoUsuarioButtonText,
                  tipoUsuario === 'proveedor' && styles.tipoUsuarioButtonTextActive
                ]}>
                  Proveedor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Resto de los campos igual que antes */}
          <Text style={styles.label}>Nombre de usuario *</Text>
          <TextInput
            style={[styles.fullInput, isRegistering && styles.inputDisabled]}
            placeholder="Nombre de usuario único"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!isRegistering}
            autoCapitalize="none"
          />

          <View style={styles.rowContainer}>
            <View style={styles.halfInputContainer}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={[styles.input, isRegistering && styles.inputDisabled]}
                placeholder="Tu nombre"
                placeholderTextColor="#999"
                value={nombre}
                onChangeText={setNombre}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isRegistering}
              />
            </View>
            <View style={styles.halfInputContainer}>
              <Text style={styles.label}>Apellidos</Text>
              <TextInput
                style={[styles.input, isRegistering && styles.inputDisabled]}
                placeholder="Tus apellidos"
                placeholderTextColor="#999"
                value={apellidos}
                onChangeText={setApellidos}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isRegistering}
              />
            </View>
          </View>

          <View style={styles.rowContainer}>
            <View style={styles.halfInputContainer}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={[styles.input, isRegistering && styles.inputDisabled]}
                placeholder="+598 9X XXX XXX"
                placeholderTextColor="#999"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isRegistering}
              />
            </View>
            <View style={styles.halfInputContainer}>
              <Text style={styles.label}>Documento</Text>
              <TextInput
                style={[styles.input, isRegistering && styles.inputDisabled]}
                placeholder="C.I. o Pasaporte"
                placeholderTextColor="#999"
                value={documentoIdentidad}
                onChangeText={setDocumentoIdentidad}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isRegistering}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Dirección (opcional)</Text>

          <Text style={styles.label}>Calle</Text>
          <TextInput
            style={[styles.fullInput, isRegistering && styles.inputDisabled]}
            placeholder="Calle y número"
            placeholderTextColor="#999"
            value={calle}
            onChangeText={setCalle}
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!isRegistering}
          />

          <View style={styles.rowContainer}>
            <View style={styles.halfInputContainer}>
              <Text style={styles.label}>Ciudad</Text>
              <TextInput
                style={[styles.input, isRegistering && styles.inputDisabled]}
                placeholder="Ciudad"
                placeholderTextColor="#999"
                value={ciudad}
                onChangeText={setCiudad}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isRegistering}
              />
            </View>
            <View style={styles.halfInputContainer}>
              <Text style={styles.label}>Código Postal</Text>
              <TextInput
                style={[styles.input, isRegistering && styles.inputDisabled]}
                placeholder="Código postal"
                placeholderTextColor="#999"
                value={codigoPostal}
                onChangeText={setCodigoPostal}
                keyboardType="numeric"
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isRegistering}
              />
            </View>
          </View>

          {tipoUsuario === 'cliente' && (
            <>
              <Text style={styles.sectionTitle}>Información de Empresa</Text>
              <Text style={styles.label}>Nombre de la empresa *</Text>
              <TextInput
                style={[styles.fullInput, isRegistering && styles.inputDisabled]}
                placeholder="Nombre de tu empresa"
                placeholderTextColor="#999"
                value={nombreEmpresa}
                onChangeText={setNombreEmpresa}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isRegistering}
              />
            </>
          )}

          {tipoUsuario === 'proveedor' && (
            <>
              <Text style={styles.sectionTitle}>Información de Servicio</Text>
              <Text style={styles.label}>Tipo de servicio *</Text>
              <TextInput
                style={[styles.fullInput, isRegistering && styles.inputDisabled]}
                placeholder="Ej: Limpieza, Catering, Seguridad, etc."
                placeholderTextColor="#999"
                value={tipoServicio}
                onChangeText={setTipoServicio}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isRegistering}
              />
            </>
          )}

          <Text style={styles.sectionTitle}>Datos de Acceso</Text>

          <Text style={styles.label}>Correo electrónico *</Text>
          <TextInput
            style={[styles.fullInput, isRegistering && styles.inputDisabled]}
            placeholder="tu@email.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!isRegistering}
          />

          <Text style={styles.label}>Contraseña *</Text>
          <TextInput
            style={[styles.fullInput, isRegistering && styles.inputDisabled]}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!isRegistering}
          />

          <Text style={styles.label}>Confirmar contraseña *</Text>
          <TextInput
            style={[styles.fullInput, isRegistering && styles.inputDisabled]}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            returnKeyType="done"
            editable={!isRegistering}
          />

          <TouchableOpacity
            style={[
              styles.button,
              isRegistering && styles.buttonDisabled
            ]}
            onPress={registrarse}
            disabled={isRegistering}
          >
            <Text style={styles.buttonText}>
              {isRegistering ? 'Registrando...' : 'Registrarse'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={irLogin}
            style={styles.backContainer}
            disabled={isRegistering}
          >
            <Text style={[
              styles.backLink,
              isRegistering && styles.linkDisabled
            ]}>
              Volver al login
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
  errorText: {
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
    marginBottom: 20,
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    fontSize: 16,
    fontFamily: 'System',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
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