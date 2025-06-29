
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
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
import { crearPublicacion } from '../store/slices/espaciosSlice';
import MapSelector from './MapSelector';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const CrearPublicacion = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.espacios);
  const { usuario } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'oficina',
    descripcion: '',

    ubicacion: {
      edificioId: '',
      piso: '',
      numero: '',
      zona: '',
      sector: '',
      coordenadas: {
        lat: null,
        lng: null
      },
      direccionCompleta: {
        calle: '',
        numero: '',
        ciudad: '',
        departamento: '',
        codigoPostal: '',
        pais: 'Uruguay'
      }
    },
    capacidad: '',

    precios: {
      porHora: '',
      porDia: '',
      porMes: ''
    },

    disponibilidad: {
      horario: {
        apertura: '09:00',
        cierre: '18:00'
      },
      dias: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes']
    },

    configuracion: '',
    superficieM2: '',
    codigo: '',

    amenidades: [],
    equipamiento: [],
    estado: 'disponible',
    activo: true
  });

  const [imagenes, setImagenes] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(false);

  const tipos = [
    {
      id: 'oficina',
      nombre: 'Oficina',
      icono: 'business',
      endpoint: 'oficinas',
      subtipos: ['privada', 'compartida', 'coworking'],
      requiereCodigo: true,
      requiereCapacidad: true,
      requiereNumero: true
    },
    {
      id: 'espacio',
      nombre: 'Espacio',
      icono: 'square',
      endpoint: 'espacios',
      subtipos: [],
      requiereCodigo: false,
      requiereCapacidad: true,
      requiereSector: true
    },
    {
      id: 'escritorio',
      nombre: 'Escritorio',
      icono: 'desktop',
      endpoint: 'escritorios-flexibles',
      subtipos: ['individual', 'compartido', 'standing'],
      requiereCodigo: true,
      requiereCapacidad: false,
      requiereZona: true,
      requiereNumero: true
    },
    {
      id: 'sala',
      nombre: 'Sala de reuniones',
      icono: 'people',
      endpoint: 'salas-reunion',
      subtipos: ['mesa_redonda', 'auditorio', 'en_u', 'aula', 'flexible'],
      requiereCodigo: true,
      requiereCapacidad: true,
      requiereNumero: true,
      requierePrecioHora: true
    }
  ];

  const amenidadesDisponibles = {
    oficina: ['wifi', 'aire_acondicionado', 'seguridad', 'parking', 'cocina', 'baño_privado'],
    espacio: ['wifi', 'aire_acondicionado', 'seguridad', 'parking', 'flexible'],
    escritorio: ['monitor', 'teclado', 'mouse', 'reposapiés', 'lampara'],
    sala: ['proyector', 'videoconferencia', 'pizarra', 'tv', 'aire_acondicionado']
  };

  const tipoActual = tipos.find(t => t.id === formData.tipo);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleLocationSelect = (coordenadas) => {
    setFormData(prev => ({
      ...prev,
      ubicacion: {
        ...prev.ubicacion,
        coordenadas: coordenadas
      }
    }));
  };

  const abrirMapa = () => {
    setMostrarMapa(true);
  };

  const cerrarMapa = () => {
    setMostrarMapa(false);
  };

  const toggleAmenidad = (amenidad) => {
    setFormData(prev => ({
      ...prev,
      amenidades: prev.amenidades.includes(amenidad)
        ? prev.amenidades.filter(a => a !== amenidad)
        : [...prev.amenidades, amenidad]
    }));
  };

  const toggleDia = (dia) => {
    setFormData(prev => ({
      ...prev,
      disponibilidad: {
        ...prev.disponibilidad,
        dias: prev.disponibilidad.dias.includes(dia)
          ? prev.disponibilidad.dias.filter(d => d !== dia)
          : [...prev.disponibilidad.dias, dia]
      }
    }));
  };

  const uploadToCloudinary = async (imageUri) => {
    const formDataImage = new FormData();

    formDataImage.append('file', {
      uri: imageUri,
      name: `${formData.tipo}_${Date.now()}.jpeg`,
      type: 'image/jpeg'
    });

    formDataImage.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formDataImage
      });

      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error('Error al subir imagen a Cloudinary');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets) {
        setUploadingImage(true);

        try {
          const uploadPromises = result.assets.map(asset => uploadToCloudinary(asset.uri));
          const cloudinaryUrls = await Promise.all(uploadPromises);

          setImagenes([...imagenes, ...cloudinaryUrls]);
          Alert.alert('Éxito', 'Imágenes subidas correctamente');
        } catch (error) {
          console.error(error);
          Alert.alert('Error', 'No se pudieron subir las imágenes');
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const removeImage = (index) => {
    setImagenes(imagenes.filter((_, i) => i !== index));
  };

  const construirPayload = () => {
    const basePayload = {
      nombre: formData.nombre,
      imagenes: imagenes,
      usuarioId: usuario.id || usuario._id,
      estado: formData.estado,
      activo: formData.activo
    };

    const buildUbicacion = () => {
      const ubicacion = {
        piso: parseInt(formData.ubicacion.piso),
        coordenadas: {
          lat: formData.ubicacion.coordenadas.lat,
          lng: formData.ubicacion.coordenadas.lng
        },
        direccionCompleta: {
          calle: formData.ubicacion.direccionCompleta.calle,
          numero: formData.ubicacion.direccionCompleta.numero,
          ciudad: formData.ubicacion.direccionCompleta.ciudad,
          departamento: formData.ubicacion.direccionCompleta.departamento,
          codigoPostal: formData.ubicacion.direccionCompleta.codigoPostal,
          pais: formData.ubicacion.direccionCompleta.pais
        }
      };

      if (tipoActual.requiereNumero) {
        ubicacion.numero = formData.ubicacion.numero;
      }
      if (tipoActual.requiereZona) {
        ubicacion.zona = formData.ubicacion.zona;
      }
      if (tipoActual.requiereSector) {
        ubicacion.sector = formData.ubicacion.sector;
      }

      if (formData.ubicacion.edificioId && formData.ubicacion.edificioId.trim() !== '') {
        ubicacion.edificioId = formData.ubicacion.edificioId;
      }

      return ubicacion;
    };

    const buildPrecios = () => {
      const precios = {};

      if (formData.precios.porHora) {
        precios.porHora = parseFloat(formData.precios.porHora);
      }
      if (formData.precios.porDia) {
        precios.porDia = parseFloat(formData.precios.porDia);
      }
      if (formData.precios.porMes) {
        precios.porMes = parseFloat(formData.precios.porMes);
      }

      return precios;
    };

    switch (formData.tipo) {
      case 'oficina':
        const oficinaPayload = {
          ...basePayload,
          codigo: `OF-${Date.now()}`,
          tipo: formData.configuracion || 'privada',
          ubicacion: buildUbicacion(),
          capacidad: parseInt(formData.capacidad),
          precios: buildPrecios(),
          amenidades: formData.amenidades,
          disponibilidad: formData.disponibilidad
        };

        if (formData.superficieM2) {
          oficinaPayload.superficieM2 = parseFloat(formData.superficieM2);
        }

        return oficinaPayload;

      case 'sala':
        const salaPayload = {
          ...basePayload,
          codigo: `SR-${Date.now()}`,
          configuracion: formData.configuracion,
          ubicacion: buildUbicacion(),
          capacidad: parseInt(formData.capacidad),
          precios: buildPrecios(),
          equipamiento: formData.amenidades.map(amenidad => ({
            tipo: amenidad,
            descripcion: `${amenidad} disponible`
          })),
          disponibilidad: formData.disponibilidad
        };

        return salaPayload;

      case 'escritorio':
        const escritorioUbicacion = buildUbicacion();

        const escritorioPayload = {
          codigo: `EF-${Date.now()}`,

          tipo: formData.configuracion || 'individual',

          ubicacion: {
            ...(formData.ubicacion.edificioId && { edificioId: formData.ubicacion.edificioId }),

            piso: parseInt(formData.ubicacion.piso, 10),
            numero: formData.ubicacion.numero,
            zona: formData.ubicacion.zona,

            coordenadas: {
              lat: formData.ubicacion.coordenadas.lat,
              lng: formData.ubicacion.coordenadas.lng
            },
            direccionCompleta: {
              calle: formData.ubicacion.direccionCompleta.calle,
              numero: formData.ubicacion.direccionCompleta.numero,
              ciudad: formData.ubicacion.direccionCompleta.ciudad,
              departamento: formData.ubicacion.direccionCompleta.departamento,
              codigoPostal: formData.ubicacion.direccionCompleta.codigoPostal,
              pais: formData.ubicacion.direccionCompleta.pais
            }
          },

          precios: {
            porDia: parseFloat(formData.precios.porDia),
            ...(formData.precios.porHora && { porHora: parseFloat(formData.precios.porHora) }),
            ...(formData.precios.porMes && { porMes: parseFloat(formData.precios.porMes) })
          },

          amenidades: formData.amenidades.map(amenidad => ({
            tipo: amenidad,
            descripcion: `${amenidad} incluido`
          })),

          imagenes,

          usuarioId: usuario.id || usuario._id,

          estado: formData.estado,
          activo: formData.activo
        };


        return escritorioPayload;

      case 'espacio':
        const espacioUbicacion = buildUbicacion();

        const espacioPayload = {
          ...basePayload,
          tipo: 'otro',
          ubicacion: espacioUbicacion,
          capacidad: parseInt(formData.capacidad),
          precios: buildPrecios(),
          amenidades: formData.amenidades,
          disponibilidad: {
            horarioApertura: formData.disponibilidad.horario.apertura,
            horarioCierre: formData.disponibilidad.horario.cierre,
            diasDisponibles: formData.disponibilidad.dias
          }
        };

        return espacioPayload;

      default:
        return basePayload;
    }
  };

  const validarFormulario = () => {
    const errores = [];

    if (!formData.nombre.trim()) {
      errores.push('El nombre es obligatorio');
    }

    if (!formData.ubicacion.direccionCompleta.calle.trim()) {
      errores.push('La calle es obligatoria');
    }

    if (!formData.ubicacion.direccionCompleta.numero.trim()) {
      errores.push('El número de dirección es obligatorio');
    }

    if (!formData.ubicacion.direccionCompleta.ciudad.trim()) {
      errores.push('La ciudad es obligatoria');
    }

    if (!formData.ubicacion.direccionCompleta.departamento.trim()) {
      errores.push('El departamento es obligatorio');
    }

    if (!formData.ubicacion.direccionCompleta.codigoPostal.trim()) {
      errores.push('El código postal es obligatorio');
    }

    if (!formData.ubicacion.piso || formData.ubicacion.piso.trim() === '') {
      errores.push('El piso es obligatorio');
    }

    if (tipoActual.requiereCapacidad && (!formData.capacidad || parseInt(formData.capacidad) < 1)) {
      errores.push('La capacidad es obligatoria y debe ser mayor a 0');
    }

    if (tipoActual.requiereNumero && !formData.ubicacion.numero.trim()) {
      errores.push('El número de oficina/sala es obligatorio');
    }

    if (tipoActual.requiereZona && !formData.ubicacion.zona.trim()) {
      errores.push('La zona es obligatoria para escritorios');
    }

    if (tipoActual.requiereSector && !formData.ubicacion.sector.trim()) {
      errores.push('El sector es obligatorio para espacios');
    }

    if (tipoActual.requierePrecioHora && (!formData.precios.porHora || parseFloat(formData.precios.porHora) <= 0)) {
      errores.push('El precio por hora es obligatorio para salas de reunión');
    }

    if (formData.tipo === 'escritorio' && (!formData.precios.porDia || parseFloat(formData.precios.porDia) <= 0)) {
      errores.push('El precio por día es obligatorio para escritorios');
    }

    if (!formData.ubicacion.coordenadas.lat || !formData.ubicacion.coordenadas.lng) {
      errores.push('Debes seleccionar la ubicación en el mapa');
    }

    if (imagenes.length === 0) {
      errores.push('Debes agregar al menos una imagen');
    }

    if (tipoActual.subtipos.length > 0 && !formData.configuracion) {
      errores.push(`Debes seleccionar un tipo de ${formData.tipo}`);
    }

    if (!formData.precios.porDia && !formData.precios.porHora && !formData.precios.porMes) {
      errores.push('Debes indicar al menos un precio');
    }

    return errores;
  };

  const handleGuardar = async () => {
    const errores = validarFormulario();

    if (errores.length > 0) {
      Alert.alert('Errores de validación', errores.join('\n'));
      return;
    }

    try {
      const payload = construirPayload();
      const endpoint = tipoActual.endpoint;

      const result = await dispatch(crearPublicacion({
        payload,
        endpoint,
        tipo: formData.tipo
      }));

      if (crearPublicacion.fulfilled.match(result)) {
        Alert.alert(
          'Publicación creada',
          'Tu publicación se ha creado exitosamente',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        throw new Error(result.payload || 'Error al crear la publicación');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'No se pudo crear la publicación. Inténtalo de nuevo.');
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
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear publicación</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de espacio</Text>
          <View style={styles.tiposContainer}>
            {tipos.map(tipo => (
              <TouchableOpacity
                key={tipo.id}
                style={[
                  styles.tipoButton,
                  formData.tipo === tipo.id && styles.tipoButtonActive
                ]}
                onPress={() => setFormData({ ...formData, tipo: tipo.id })}
              >
                <Ionicons
                  name={tipo.icono}
                  size={24}
                  color={formData.tipo === tipo.id ? '#fff' : '#4a90e2'}
                />
                <Text style={[
                  styles.tipoText,
                  formData.tipo === tipo.id && styles.tipoTextActive
                ]}>
                  {tipo.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nombre del espacio *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Oficina Ejecutiva Centro"
            value={formData.nombre}
            onChangeText={(text) => setFormData({ ...formData, nombre: text })}
          />

          {tipoActual?.subtipos.length > 0 && (
            <>
              <Text style={styles.label}>
                {formData.tipo === 'sala' ? 'Configuración' : 'Tipo'} *
              </Text>
              <View style={styles.subtiposContainer}>
                {tipoActual.subtipos.map(subtipo => (
                  <TouchableOpacity
                    key={subtipo}
                    style={[
                      styles.subtipoButton,
                      formData.configuracion === subtipo && styles.subtipoButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, configuracion: subtipo })}
                  >
                    <Text style={[
                      styles.subtipoText,
                      formData.configuracion === subtipo && styles.subtipoTextActive
                    ]}>
                      {subtipo.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={styles.row}>
            {tipoActual.requiereCapacidad && (
              <View style={formData.tipo === 'oficina' ? styles.halfInput : styles.input}>
                <Text style={styles.label}>Capacidad *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Personas"
                  value={formData.capacidad}
                  onChangeText={(text) => setFormData({ ...formData, capacidad: text })}
                  keyboardType="numeric"
                />
              </View>
            )}
            {formData.tipo === 'oficina' && (
              <View style={styles.halfInput}>
                <Text style={styles.label}>Superficie (m²)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Metros cuadrados"
                  value={formData.superficieM2}
                  onChangeText={(text) => setFormData({ ...formData, superficieM2: text })}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>

          <Text style={styles.label}>Calle *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la calle"
            value={formData.ubicacion.direccionCompleta.calle}
            onChangeText={(text) => setFormData({
              ...formData,
              ubicacion: {
                ...formData.ubicacion,
                direccionCompleta: {
                  ...formData.ubicacion.direccionCompleta,
                  calle: text
                }
              }
            })}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Número *</Text>
              <TextInput
                style={styles.input}
                placeholder="1234"
                value={formData.ubicacion.direccionCompleta.numero}
                onChangeText={(text) => setFormData({
                  ...formData,
                  ubicacion: {
                    ...formData.ubicacion,
                    direccionCompleta: {
                      ...formData.ubicacion.direccionCompleta,
                      numero: text
                    }
                  }
                })}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Piso *</Text>
              <TextInput
                style={styles.input}
                placeholder="1, 2, 3..."
                value={formData.ubicacion.piso}
                onChangeText={(text) => setFormData({
                  ...formData,
                  ubicacion: {
                    ...formData.ubicacion,
                    piso: text
                  }
                })}
                keyboardType="numeric"
              />
            </View>
          </View>

          {tipoActual.requiereNumero && (
            <>
              <Text style={styles.label}>
                Número de {formData.tipo === 'oficina' ? 'oficina' : formData.tipo === 'sala' ? 'sala' : 'escritorio'} *
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 101, A-5, etc."
                value={formData.ubicacion.numero}
                onChangeText={(text) => setFormData({
                  ...formData,
                  ubicacion: {
                    ...formData.ubicacion,
                    numero: text
                  }
                })}
              />
            </>
          )}

          {tipoActual.requiereZona && (
            <>
              <Text style={styles.label}>Zona *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Zona A, Open Space, etc."
                value={formData.ubicacion.zona}
                onChangeText={(text) => setFormData({
                  ...formData,
                  ubicacion: {
                    ...formData.ubicacion,
                    zona: text
                  }
                })}
              />
            </>
          )}

          {tipoActual.requiereSector && (
            <>
              <Text style={styles.label}>Sector *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Norte, Sur, Principal, etc."
                value={formData.ubicacion.sector}
                onChangeText={(text) => setFormData({
                  ...formData,
                  ubicacion: {
                    ...formData.ubicacion,
                    sector: text
                  }
                })}
              />
            </>
          )}

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Ciudad *</Text>
              <TextInput
                style={styles.input}
                placeholder="Montevideo"
                value={formData.ubicacion.direccionCompleta.ciudad}
                onChangeText={(text) => setFormData({
                  ...formData,
                  ubicacion: {
                    ...formData.ubicacion,
                    direccionCompleta: {
                      ...formData.ubicacion.direccionCompleta,
                      ciudad: text
                    }
                  }
                })}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Departamento *</Text>
              <TextInput
                style={styles.input}
                placeholder="Montevideo"
                value={formData.ubicacion.direccionCompleta.departamento}
                onChangeText={(text) => setFormData({
                  ...formData,
                  ubicacion: {
                    ...formData.ubicacion,
                    direccionCompleta: {
                      ...formData.ubicacion.direccionCompleta,
                      departamento: text
                    }
                  }
                })}
              />
            </View>
          </View>

          <Text style={styles.label}>Código Postal *</Text>
          <TextInput
            style={styles.input}
            placeholder="11000"
            value={formData.ubicacion.direccionCompleta.codigoPostal}
            onChangeText={(text) => setFormData({
              ...formData,
              ubicacion: {
                ...formData.ubicacion,
                direccionCompleta: {
                  ...formData.ubicacion.direccionCompleta,
                  codigoPostal: text
                }
              }
            })}
          />

          <View style={styles.mapSection}>
            <View style={styles.mapSectionHeader}>
              <Ionicons name="location" size={20} color="#4a90e2" />
              <Text style={styles.mapSectionTitle}>Ubicación en el mapa *</Text>
            </View>

            {formData.ubicacion.coordenadas.lat && formData.ubicacion.coordenadas.lng ? (
              <View style={styles.locationSelected}>
                <View style={styles.locationInfo}>
                  <View style={styles.locationIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                  </View>
                  <View style={styles.locationDetails}>
                    <Text style={styles.locationLabel}>Coordenadas confirmadas</Text>
                    <Text style={styles.locationCoords}>
                      {formData.ubicacion.coordenadas.lat.toFixed(6)}, {formData.ubicacion.coordenadas.lng.toFixed(6)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.editLocationBtn}
                  onPress={abrirMapa}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil" size={16} color="#4a90e2" />
                  <Text style={styles.editLocationText}>Editar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectLocationCard}
                onPress={abrirMapa}
                activeOpacity={0.7}
              >
                <View style={styles.selectLocationContent}>
                  <View style={styles.mapIconContainer}>
                    <Ionicons name="map" size={32} color="#4a90e2" />
                  </View>
                  <View style={styles.selectLocationTexts}>
                    <Text style={styles.selectLocationTitle}>Seleccionar en el mapa</Text>
                    <Text style={styles.selectLocationSubtitle}>
                      Toca para abrir el mapa y marcar la ubicación exacta
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precios</Text>
          <View style={styles.row}>
            <View style={styles.thirdInput}>
              <Text style={styles.label}>
                Por hora {tipoActual.requierePrecioHora ? '*' : ''}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="USD"
                value={formData.precios.porHora}
                onChangeText={(text) => setFormData({
                  ...formData,
                  precios: { ...formData.precios, porHora: text }
                })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.thirdInput}>
              <Text style={styles.label}>
                Por día {formData.tipo === 'escritorio' ? '*' : ''}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="USD"
                value={formData.precios.porDia}
                onChangeText={(text) => setFormData({
                  ...formData,
                  precios: { ...formData.precios, porDia: text }
                })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.thirdInput}>
              <Text style={styles.label}>Por mes</Text>
              <TextInput
                style={styles.input}
                placeholder="USD"
                value={formData.precios.porMes}
                onChangeText={(text) => setFormData({
                  ...formData,
                  precios: { ...formData.precios, porMes: text }
                })}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horario disponible</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Apertura</Text>
              <TextInput
                style={styles.input}
                placeholder="09:00"
                value={formData.disponibilidad.horario.apertura}
                onChangeText={(text) => setFormData({
                  ...formData,
                  disponibilidad: {
                    ...formData.disponibilidad,
                    horario: { ...formData.disponibilidad.horario, apertura: text }
                  }
                })}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Cierre</Text>
              <TextInput
                style={styles.input}
                placeholder="18:00"
                value={formData.disponibilidad.horario.cierre}
                onChangeText={(text) => setFormData({
                  ...formData,
                  disponibilidad: {
                    ...formData.disponibilidad,
                    horario: { ...formData.disponibilidad.horario, cierre: text }
                  }
                })}
              />
            </View>
          </View>

          <Text style={styles.label}>Días disponibles</Text>
          <View style={styles.diasContainer}>
            {['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map(dia => (
              <TouchableOpacity
                key={dia}
                style={[
                  styles.diaButton,
                  formData.disponibilidad.dias.includes(dia) && styles.diaButtonActive
                ]}
                onPress={() => toggleDia(dia)}
              >
                <Text style={[
                  styles.diaText,
                  formData.disponibilidad.dias.includes(dia) && styles.diaTextActive
                ]}>
                  {dia.charAt(0).toUpperCase() + dia.slice(1, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imágenes *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.addImageButton, uploadingImage && styles.addImageButtonDisabled]}
              onPress={selectImage}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <Text style={styles.uploadingText}>Subiendo...</Text>
              ) : (
                <>
                  <Ionicons name="camera" size={32} color="#4a90e2" />
                  <Text style={styles.addImageText}>Agregar</Text>
                </>
              )}
            </TouchableOpacity>
            {imagenes.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {formData.tipo === 'sala' ? 'Equipamiento' : 'Amenidades'}
          </Text>
          <View style={styles.amenidadesContainer}>
            {amenidadesDisponibles[formData.tipo]?.map(amenidad => (
              <TouchableOpacity
                key={amenidad}
                style={[
                  styles.amenidadButton,
                  formData.amenidades.includes(amenidad) && styles.amenidadButtonActive
                ]}
                onPress={() => toggleAmenidad(amenidad)}
              >
                <Text style={[
                  styles.amenidadText,
                  formData.amenidades.includes(amenidad) && styles.amenidadTextActive
                ]}>
                  {amenidad.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.guardarButton, loading && styles.guardarButtonDisabled]}
          onPress={handleGuardar}
          disabled={loading}
        >
          <Text style={styles.guardarButtonText}>
            {loading ? 'Creando...' : 'Crear publicación'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        visible={mostrarMapa}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity
              onPress={cerrarMapa}
              style={styles.mapModalCloseBtn}
              activeOpacity={0.7}
            >
              <View style={styles.closeButtonCircle}>
                <Ionicons name="close" size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            <View style={styles.mapModalTitleContainer}>
              <Text style={styles.mapModalTitle}>Ubicación del espacio</Text>
              <Text style={styles.mapModalSubtitle}>
                {formData.nombre || 'Nuevo espacio'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={cerrarMapa}
              style={[
                styles.mapModalSaveBtn,
                !formData.ubicacion.coordenadas.lat && styles.mapModalSaveBtnDisabled
              ]}
              disabled={!formData.ubicacion.coordenadas.lat}
              activeOpacity={0.7}
            >
              <Ionicons
                name="checkmark"
                size={18}
                color={formData.ubicacion.coordenadas.lat ? "#fff" : "#bdc3c7"}
              />
              <Text style={[
                styles.mapModalSaveText,
                !formData.ubicacion.coordenadas.lat && styles.mapModalSaveTextDisabled
              ]}>
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>

          <MapSelector
            onLocationSelect={handleLocationSelect}
            initialLocation={formData.ubicacion.coordenadas.lat ? formData.ubicacion.coordenadas : null}
            direccionCompleta={formData.ubicacion.direccionCompleta}
          />
        </View>
      </Modal>
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
    fontSize: 20,
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
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    fontFamily: 'System',
  },
  tiposContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipoButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    alignItems: 'center',
    minWidth: 100,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipoButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  tipoText: {
    fontSize: 12,
    color: '#2c3e50',
    marginTop: 4,
    fontFamily: 'System',
  },
  tipoTextActive: {
    color: '#fff',
  },
  subtiposContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  subtipoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  subtipoButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  subtipoText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  subtipoTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 15,
    fontFamily: 'System',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfInput: {
    flex: 1,
  },
  thirdInput: {
    flex: 1,
  },

  mapSection: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  mapSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  locationSelected: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27ae60',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: 12,
    color: '#2c3e50',
    fontFamily: 'monospace',
  },
  editLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a90e2',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  editLocationText: {
    fontSize: 12,
    color: '#4a90e2',
    fontWeight: '500',
    marginLeft: 4,
  },
  selectLocationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderStyle: 'dashed',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  selectLocationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  mapIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#e3f2fd',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectLocationTexts: {
    flex: 1,
  },
  selectLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  selectLocationSubtitle: {
    fontSize: 13,
    color: '#7f8c8d',
    lineHeight: 18,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#000000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  mapModalCloseBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  mapModalTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  mapModalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  mapModalSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a90e2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mapModalSaveBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 0,
    shadowOpacity: 0,
  },
  mapModalSaveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  mapModalSaveTextDisabled: {
    color: '#bdc3c7',
  },
  diasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  diaButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  diaButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  diaText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  diaTextActive: {
    color: '#fff',
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addImageButtonDisabled: {
    opacity: 0.6,
  },
  addImageText: {
    fontSize: 12,
    color: '#4a90e2',
    marginTop: 4,
    fontFamily: 'System',
  },
  uploadingText: {
    fontSize: 14,
    color: '#4a90e2',
    fontFamily: 'System',
  },
  imageContainer: {
    marginRight: 10,
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  amenidadesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenidadButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  amenidadButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  amenidadText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  amenidadTextActive: {
    color: '#fff',
  },
  guardarButton: {
    backgroundColor: '#4a90e2',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  guardarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  guardarButtonDisabled: {
    opacity: 0.6,
  },
  bottomSpacing: {
    height: 30,
  },
  helperText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});

export default CrearPublicacion;