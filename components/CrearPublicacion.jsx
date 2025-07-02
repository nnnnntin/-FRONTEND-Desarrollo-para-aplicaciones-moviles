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
import * as Yup from 'yup';
import { crearPublicacion } from '../store/slices/espaciosSlice';
import MapSelector from './MapSelector';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const ubicacionSchema = Yup.object({
  edificioId: Yup.string(),
  piso: Yup.number()
    .required('El piso es requerido')
    .min(0, 'El piso debe ser un número positivo')
    .max(100, 'El piso no puede ser mayor a 100'),
  numero: Yup.string()
    .when('$requiereNumero', {
      is: true,
      then: (schema) => schema.required('El número es requerido').min(1, 'El número no puede estar vacío'),
      otherwise: (schema) => schema.nullable()
    }),
  zona: Yup.string()
    .when('$requiereZona', {
      is: true,
      then: (schema) => schema.required('La zona es requerida').min(2, 'La zona debe tener al menos 2 caracteres'),
      otherwise: (schema) => schema.nullable()
    }),
  sector: Yup.string()
    .when('$requiereSector', {
      is: true,
      then: (schema) => schema.required('El sector es requerido').min(2, 'El sector debe tener al menos 2 caracteres'),
      otherwise: (schema) => schema.nullable()
    }),
  coordenadas: Yup.object({
    lat: Yup.number()
      .required('Debes seleccionar la ubicación en el mapa')
      .min(-90, 'Latitud inválida')
      .max(90, 'Latitud inválida'),
    lng: Yup.number()
      .required('Debes seleccionar la ubicación en el mapa')
      .min(-180, 'Longitud inválida')
      .max(180, 'Longitud inválida')
  }),
  direccionCompleta: Yup.object({
    calle: Yup.string()
      .required('La calle es requerida')
      .min(3, 'La calle debe tener al menos 3 caracteres'),
    numero: Yup.string()
      .required('El número de dirección es requerido')
      .matches(/^[0-9]+[a-zA-Z]?$/, 'Formato de número inválido'),
    ciudad: Yup.string()
      .required('La ciudad es requerida')
      .min(2, 'La ciudad debe tener al menos 2 caracteres'),
    departamento: Yup.string()
      .required('El departamento es requerido')
      .min(2, 'El departamento debe tener al menos 2 caracteres'),
    codigoPostal: Yup.string()
      .required('El código postal es requerido')
      .matches(/^[0-9]{5}$/, 'El código postal debe tener 5 dígitos'),
    pais: Yup.string().default('Uruguay')
  })
});

const preciosSchema = Yup.object({
  porHora: Yup.number()
    .when('$requierePrecioHora', {
      is: true,
      then: (schema) => schema.required('El precio por hora es requerido').min(0.01, 'El precio debe ser mayor a 0'),
      otherwise: (schema) => schema.nullable().min(0, 'El precio no puede ser negativo')
    }),
  porDia: Yup.number()
    .when('$requierePrecioDia', {
      is: true,
      then: (schema) => schema.required('El precio por día es requerido').min(0.01, 'El precio debe ser mayor a 0'),
      otherwise: (schema) => schema.nullable().min(0, 'El precio no puede ser negativo')
    }),
  porMes: Yup.number()
    .nullable()
    .min(0, 'El precio no puede ser negativo')
}).test('al-menos-un-precio', 'Debes indicar al menos un precio', function(value) {
  return value.porHora || value.porDia || value.porMes;
});

const disponibilidadSchema = Yup.object({
  horario: Yup.object({
    apertura: Yup.string()
      .required('La hora de apertura es requerida')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    cierre: Yup.string()
      .required('La hora de cierre es requerida')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
      .test('cierre-despues-apertura', 'La hora de cierre debe ser después de la apertura', function(value) {
        const { apertura } = this.parent;
        if (!apertura || !value) return true;
        return value > apertura;
      })
  }),
  dias: Yup.array()
    .of(Yup.string().test('dia-valido', 'Día no válido', function(value) {
      const diasValidos = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
      return !value || diasValidos.includes(value);
    }))
    .min(1, 'Debes seleccionar al menos un día')
});

const publicacionSchema = Yup.object({
  nombre: Yup.string()
    .required('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  
  tipo: Yup.string()
    .test('tipo-valido', 'Tipo de espacio no válido', function(value) {
      const tiposValidos = ['oficina', 'espacio', 'escritorio', 'sala'];
      return tiposValidos.includes(value);
    })
    .required('Debes seleccionar un tipo de espacio'),
  
  descripcion: Yup.string()
    .max(500, 'La descripción no puede tener más de 500 caracteres'),
  
  capacidad: Yup.number()
    .when('$requiereCapacidad', {
      is: true,
      then: (schema) => schema.required('La capacidad es requerida').min(1, 'La capacidad debe ser mayor a 0').max(1000, 'La capacidad no puede ser mayor a 1000'),
      otherwise: (schema) => schema.nullable()
    }),
  
  superficieM2: Yup.number()
    .nullable()
    .min(1, 'La superficie debe ser mayor a 0')
    .max(10000, 'La superficie no puede ser mayor a 10,000 m²'),
  
  configuracion: Yup.string()
    .when('$tieneSubtipos', {
      is: true,
      then: (schema) => schema.required('Debes seleccionar una configuración'),
      otherwise: (schema) => schema.nullable()
    }),
  
  ubicacion: ubicacionSchema,
  precios: preciosSchema,
  disponibilidad: disponibilidadSchema,
  
  amenidades: Yup.array().of(Yup.string()),
  equipamiento: Yup.array().of(Yup.string()),
  
  estado: Yup.string()
    .test('estado-valido', 'Estado no válido', function(value) {
      const estadosValidos = ['disponible', 'ocupado', 'mantenimiento'];
      return !value || estadosValidos.includes(value);
    })
    .default('disponible'),
  
  activo: Yup.boolean().default(true)
});

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
  const [errores, setErrores] = useState({});

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

  const validarCampo = async (campo, valor, datosCompletos = null) => {
    try {
      const contexto = {
        requiereNumero: tipoActual?.requiereNumero,
        requiereZona: tipoActual?.requiereZona,
        requiereSector: tipoActual?.requiereSector,
        requiereCapacidad: tipoActual?.requiereCapacidad,
        requierePrecioHora: tipoActual?.requierePrecioHora,
        requierePrecioDia: formData.tipo === 'escritorio',
        tieneSubtipos: tipoActual?.subtipos?.length > 0
      };

      const datosParaValidar = datosCompletos || formData;
      
      await publicacionSchema.validateAt(campo, datosParaValidar, { context: contexto });
      
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

  const validarFormularioCompleto = async () => {
    const contexto = {
      requiereNumero: tipoActual?.requiereNumero,
      requiereZona: tipoActual?.requiereZona,
      requiereSector: tipoActual?.requiereSector,
      requiereCapacidad: tipoActual?.requiereCapacidad,
      requierePrecioHora: tipoActual?.requierePrecioHora,
      requierePrecioDia: formData.tipo === 'escritorio',
      tieneSubtipos: tipoActual?.subtipos?.length > 0
    };

    const datosParaValidar = {
      ...formData,
      capacidad: formData.capacidad ? parseInt(formData.capacidad) : null,
      superficieM2: formData.superficieM2 ? parseFloat(formData.superficieM2) : null,
      ubicacion: {
        ...formData.ubicacion,
        piso: formData.ubicacion.piso ? parseInt(formData.ubicacion.piso) : null
      },
      precios: {
        porHora: formData.precios.porHora ? parseFloat(formData.precios.porHora) : null,
        porDia: formData.precios.porDia ? parseFloat(formData.precios.porDia) : null,
        porMes: formData.precios.porMes ? parseFloat(formData.precios.porMes) : null
      }
    };

    try {
      await publicacionSchema.validate(datosParaValidar, { 
        abortEarly: false,
        context: contexto
      });

      if (imagenes.length === 0) {
        throw new Error('Debes agregar al menos una imagen');
      }

      setErrores({});
      return true;
    } catch (error) {
      const nuevosErrores = {};
      
      if (error.inner && error.inner.length > 0) {
        error.inner.forEach(err => {
          nuevosErrores[err.path] = err.message;
        });
      } else {
        nuevosErrores.general = error.message;
      }
      
      setErrores(nuevosErrores);
      return false;
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleLocationSelect = (coordenadas) => {
    const nuevaUbicacion = {
      ...formData.ubicacion,
      coordenadas: coordenadas
    };
    
    setFormData(prev => ({
      ...prev,
      ubicacion: nuevaUbicacion
    }));
    
    validarCampo('ubicacion.coordenadas', coordenadas);
  };

  const abrirMapa = () => {
    setMostrarMapa(true);
  };

  const cerrarMapa = () => {
    setMostrarMapa(false);
  };

  const toggleAmenidad = (amenidad) => {
    const nuevasAmenidades = formData.amenidades.includes(amenidad)
      ? formData.amenidades.filter(a => a !== amenidad)
      : [...formData.amenidades, amenidad];
    
    setFormData(prev => ({
      ...prev,
      amenidades: nuevasAmenidades
    }));
  };

  const toggleDia = (dia) => {
    const nuevosDias = formData.disponibilidad.dias.includes(dia)
      ? formData.disponibilidad.dias.filter(d => d !== dia)
      : [...formData.disponibilidad.dias, dia];
    
    const nuevaDisponibilidad = {
      ...formData.disponibilidad,
      dias: nuevosDias
    };
    
    setFormData(prev => ({
      ...prev,
      disponibilidad: nuevaDisponibilidad
    }));
    
    validarCampo('disponibilidad.dias', nuevosDias);
  };

  const handleCambioTexto = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
    
    validarCampo(campo, valor);
  };

  const handleCambioUbicacion = (subcampo, valor) => {
    const nuevaUbicacion = {
      ...formData.ubicacion,
      [subcampo]: valor
    };
    
    setFormData(prev => ({
      ...prev,
      ubicacion: nuevaUbicacion
    }));
    
    validarCampo(`ubicacion.${subcampo}`, valor);
  };

  const handleCambioDireccion = (subcampo, valor) => {
    const nuevaDireccion = {
      ...formData.ubicacion.direccionCompleta,
      [subcampo]: valor
    };
    
    const nuevaUbicacion = {
      ...formData.ubicacion,
      direccionCompleta: nuevaDireccion
    };
    
    setFormData(prev => ({
      ...prev,
      ubicacion: nuevaUbicacion
    }));
    
    validarCampo(`ubicacion.direccionCompleta.${subcampo}`, valor);
  };

  const handleCambioPrecio = (tipoPrecio, valor) => {
    const nuevosPrecios = {
      ...formData.precios,
      [tipoPrecio]: valor
    };
    
    setFormData(prev => ({
      ...prev,
      precios: nuevosPrecios
    }));
    
    validarCampo(`precios.${tipoPrecio}`, parseFloat(valor) || null);
  };

  const handleCambioHorario = (tipoHorario, valor) => {
    const nuevoHorario = {
      ...formData.disponibilidad.horario,
      [tipoHorario]: valor
    };
    
    const nuevaDisponibilidad = {
      ...formData.disponibilidad,
      horario: nuevoHorario
    };
    
    setFormData(prev => ({
      ...prev,
      disponibilidad: nuevaDisponibilidad
    }));
    
    validarCampo(`disponibilidad.horario.${tipoHorario}`, valor);
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

          const nuevasImagenes = [...imagenes, ...cloudinaryUrls];
          setImagenes(nuevasImagenes);
          
          if (nuevasImagenes.length > 0 && errores.imagenes) {
            setErrores(prev => ({
              ...prev,
              imagenes: null
            }));
          }
          
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
    const nuevasImagenes = imagenes.filter((_, i) => i !== index);
    setImagenes(nuevasImagenes);
    
    if (nuevasImagenes.length === 0) {
      setErrores(prev => ({
        ...prev,
        imagenes: 'Debes agregar al menos una imagen'
      }));
    }
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

  const handleGuardar = async () => {
    const esValido = await validarFormularioCompleto();

    if (!esValido) {
      const erroresTexto = Object.values(errores).filter(Boolean).join('\n');
      Alert.alert('Errores de validación', erroresTexto || 'Por favor revisa los campos marcados');
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

  const renderErrorText = (campo) => {
    if (errores[campo]) {
      return (
        <Text style={styles.errorText}>
          {errores[campo]}
        </Text>
      );
    }
    return null;
  };

  const getInputStyle = (campo) => {
    return [
      styles.input,
      errores[campo] && styles.inputError
    ];
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
                  formData.tipo === tipo.id && styles.tipoButtonActive,
                  errores.tipo && styles.tipoButtonError
                ]}
                onPress={() => handleCambioTexto('tipo', tipo.id)}
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
          {renderErrorText('tipo')}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nombre del espacio *</Text>
          <TextInput
            style={getInputStyle('nombre')}
            placeholder="Ej: Oficina Ejecutiva Centro"
            value={formData.nombre}
            onChangeText={(text) => handleCambioTexto('nombre', text)}
          />
          {renderErrorText('nombre')}

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
                      formData.configuracion === subtipo && styles.subtipoButtonActive,
                      errores.configuracion && styles.subtipoButtonError
                    ]}
                    onPress={() => handleCambioTexto('configuracion', subtipo)}
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
              {renderErrorText('configuracion')}
            </>
          )}

          <View style={styles.row}>
            {tipoActual.requiereCapacidad && (
              <View style={formData.tipo === 'oficina' ? styles.halfInput : styles.fullInput}>
                <Text style={styles.label}>Capacidad *</Text>
                <TextInput
                  style={getInputStyle('capacidad')}
                  placeholder="Personas"
                  value={formData.capacidad}
                  onChangeText={(text) => handleCambioTexto('capacidad', text)}
                  keyboardType="numeric"
                />
                {renderErrorText('capacidad')}
              </View>
            )}
            {formData.tipo === 'oficina' && (
              <View style={styles.halfInput}>
                <Text style={styles.label}>Superficie (m²)</Text>
                <TextInput
                  style={getInputStyle('superficieM2')}
                  placeholder="Metros cuadrados"
                  value={formData.superficieM2}
                  onChangeText={(text) => handleCambioTexto('superficieM2', text)}
                  keyboardType="numeric"
                />
                {renderErrorText('superficieM2')}
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>

          <Text style={styles.label}>Calle *</Text>
          <TextInput
            style={getInputStyle('ubicacion.direccionCompleta.calle')}
            placeholder="Nombre de la calle"
            value={formData.ubicacion.direccionCompleta.calle}
            onChangeText={(text) => handleCambioDireccion('calle', text)}
          />
          {renderErrorText('ubicacion.direccionCompleta.calle')}

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Número *</Text>
              <TextInput
                style={getInputStyle('ubicacion.direccionCompleta.numero')}
                placeholder="1234"
                value={formData.ubicacion.direccionCompleta.numero}
                onChangeText={(text) => handleCambioDireccion('numero', text)}
              />
              {renderErrorText('ubicacion.direccionCompleta.numero')}
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Piso *</Text>
              <TextInput
                style={getInputStyle('ubicacion.piso')}
                placeholder="1, 2, 3..."
                value={formData.ubicacion.piso}
                onChangeText={(text) => handleCambioUbicacion('piso', text)}
                keyboardType="numeric"
              />
              {renderErrorText('ubicacion.piso')}
            </View>
          </View>

          {tipoActual.requiereNumero && (
            <>
              <Text style={styles.label}>
                Número de {formData.tipo === 'oficina' ? 'oficina' : formData.tipo === 'sala' ? 'sala' : 'escritorio'} *
              </Text>
              <TextInput
                style={getInputStyle('ubicacion.numero')}
                placeholder="Ej: 101, A-5, etc."
                value={formData.ubicacion.numero}
                onChangeText={(text) => handleCambioUbicacion('numero', text)}
              />
              {renderErrorText('ubicacion.numero')}
            </>
          )}

          {tipoActual.requiereZona && (
            <>
              <Text style={styles.label}>Zona *</Text>
              <TextInput
                style={getInputStyle('ubicacion.zona')}
                placeholder="Ej: Zona A, Open Space, etc."
                value={formData.ubicacion.zona}
                onChangeText={(text) => handleCambioUbicacion('zona', text)}
              />
              {renderErrorText('ubicacion.zona')}
            </>
          )}

          {tipoActual.requiereSector && (
            <>
              <Text style={styles.label}>Sector *</Text>
              <TextInput
                style={getInputStyle('ubicacion.sector')}
                placeholder="Ej: Norte, Sur, Principal, etc."
                value={formData.ubicacion.sector}
                onChangeText={(text) => handleCambioUbicacion('sector', text)}
              />
              {renderErrorText('ubicacion.sector')}
            </>
          )}

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Ciudad *</Text>
              <TextInput
                style={getInputStyle('ubicacion.direccionCompleta.ciudad')}
                placeholder="Montevideo"
                value={formData.ubicacion.direccionCompleta.ciudad}
                onChangeText={(text) => handleCambioDireccion('ciudad', text)}
              />
              {renderErrorText('ubicacion.direccionCompleta.ciudad')}
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Departamento *</Text>
              <TextInput
                style={getInputStyle('ubicacion.direccionCompleta.departamento')}
                placeholder="Montevideo"
                value={formData.ubicacion.direccionCompleta.departamento}
                onChangeText={(text) => handleCambioDireccion('departamento', text)}
              />
              {renderErrorText('ubicacion.direccionCompleta.departamento')}
            </View>
          </View>

          <Text style={styles.label}>Código Postal *</Text>
          <TextInput
            style={getInputStyle('ubicacion.direccionCompleta.codigoPostal')}
            placeholder="11000"
            value={formData.ubicacion.direccionCompleta.codigoPostal}
            onChangeText={(text) => handleCambioDireccion('codigoPostal', text)}
            keyboardType="numeric"
          />
          {renderErrorText('ubicacion.direccionCompleta.codigoPostal')}

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
                style={[
                  styles.selectLocationCard,
                  errores['ubicacion.coordenadas.lat'] && styles.selectLocationCardError
                ]}
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
            {renderErrorText('ubicacion.coordenadas.lat')}
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
                style={getInputStyle('precios.porHora')}
                placeholder="USD"
                value={formData.precios.porHora}
                onChangeText={(text) => handleCambioPrecio('porHora', text)}
                keyboardType="numeric"
              />
              {renderErrorText('precios.porHora')}
            </View>
            <View style={styles.thirdInput}>
              <Text style={styles.label}>
                Por día {formData.tipo === 'escritorio' ? '*' : ''}
              </Text>
              <TextInput
                style={getInputStyle('precios.porDia')}
                placeholder="USD"
                value={formData.precios.porDia}
                onChangeText={(text) => handleCambioPrecio('porDia', text)}
                keyboardType="numeric"
              />
              {renderErrorText('precios.porDia')}
            </View>
            <View style={styles.thirdInput}>
              <Text style={styles.label}>Por mes</Text>
              <TextInput
                style={getInputStyle('precios.porMes')}
                placeholder="USD"
                value={formData.precios.porMes}
                onChangeText={(text) => handleCambioPrecio('porMes', text)}
                keyboardType="numeric"
              />
              {renderErrorText('precios.porMes')}
            </View>
          </View>
          {renderErrorText('precios')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horario disponible</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Apertura</Text>
              <TextInput
                style={getInputStyle('disponibilidad.horario.apertura')}
                placeholder="09:00"
                value={formData.disponibilidad.horario.apertura}
                onChangeText={(text) => handleCambioHorario('apertura', text)}
              />
              {renderErrorText('disponibilidad.horario.apertura')}
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Cierre</Text>
              <TextInput
                style={getInputStyle('disponibilidad.horario.cierre')}
                placeholder="18:00"
                value={formData.disponibilidad.horario.cierre}
                onChangeText={(text) => handleCambioHorario('cierre', text)}
              />
              {renderErrorText('disponibilidad.horario.cierre')}
            </View>
          </View>

          <Text style={styles.label}>Días disponibles</Text>
          <View style={styles.diasContainer}>
            {['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map(dia => (
              <TouchableOpacity
                key={dia}
                style={[
                  styles.diaButton,
                  formData.disponibilidad.dias.includes(dia) && styles.diaButtonActive,
                  errores['disponibilidad.dias'] && styles.diaButtonError
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
          {renderErrorText('disponibilidad.dias')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imágenes *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.addImageButton, 
                uploadingImage && styles.addImageButtonDisabled,
                errores.imagenes && styles.addImageButtonError
              ]}
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
          {renderErrorText('imagenes')}
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
    inputError: {
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  tipoButtonError: {
    borderColor: '#e74c3c',
  },
  subtipoButtonError: {
    borderColor: '#e74c3c',
  },
  selectLocationCardError: {
    borderColor: '#e74c3c',
  },
  addImageButtonError: {
    borderColor: '#e74c3c',
  },
  diaButtonError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'System',
  },
  fullInput: {
    flex: 1,
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