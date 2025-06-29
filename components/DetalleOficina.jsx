import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { actualizarEspacio, limpiarDetalle, obtenerDetalleEspacio } from '../store/slices/espaciosSlice';
import { obtenerServiciosPorEspacio } from '../store/slices/proveedoresSlice';
import MapSelector from './MapSelector';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const DetalleOficina = ({ navigation, route }) => {
  if (!route?.params?.oficina) {
    Alert.alert('Error', 'No se encontraron los datos de la oficina');
    navigation.goBack();
    return null;
  }

  const { oficina, esPropia, espacio } = route.params;
  const dispatch = useDispatch();

  const { tipoUsuario } = useSelector(state => state.auth);
  const { serviciosPorEspacio, loading: loadingServicios } = useSelector(state => state.proveedores);
  const {
    detalleActual,
    loadingDetalle,
    errorDetalle
  } = useSelector(state => state.espacios);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'oficina',
    configuracion: '',
    superficieM2: '',
    capacidadPersonas: '',
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
    amenidades: [],
    equipamiento: [],
    estado: 'disponible'
  });

  const [editingImages, setEditingImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mostrarMapaEdit, setMostrarMapaEdit] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const hoyISO = new Date().toISOString().split('T')[0];
  const [fechaInput, setFechaInput] = useState(hoyISO);
  const [horaInicioInput, setHoraInicioInput] = useState('09:00');
  const [horaFinInput, setHoraFinInput] = useState('17:00');
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [serviciosAdicionales, setServiciosAdicionales] = useState([]);

  const [datosEspacio, setDatosEspacio] = useState(null);

  useEffect(() => {
    if (espacio || oficina.datosCompletos) {
      const datosDisponibles = espacio || oficina.datosCompletos;
      setDatosEspacio(datosDisponibles);
    } else if (oficina.id && oficina.tipo) {
      dispatch(obtenerDetalleEspacio({
        id: oficina.id,
        tipo: oficina.tipo
      }));
    }

    return () => {
      dispatch(limpiarDetalle());
    };
  }, [oficina.id, oficina.tipo, espacio, dispatch]);

  useEffect(() => {
    if (detalleActual && !datosEspacio) {
      setDatosEspacio(detalleActual);
    }
  }, [detalleActual, datosEspacio]);

  useEffect(() => {
    if (oficina.id) {
      cargarServiciosEspacio();
    }
  }, [oficina.id]);

  useEffect(() => {
    if (errorDetalle) {
      Alert.alert('Error', errorDetalle);
    }
  }, [errorDetalle]);

  const cargarServiciosEspacio = async () => {
    try {
      await dispatch(obtenerServiciosPorEspacio(oficina.id));
    } catch (error) {
      console.error(error);
    }
  };

  const mapearDetalleEspacio = (detalle) => {
    if (!detalle) {
      return null;
    }

    const amenidades = [];

    if (detalle.amenidades) {
      if (Array.isArray(detalle.amenidades)) {
        detalle.amenidades.forEach(amenidad => {
          if (typeof amenidad === 'string') {
            amenidades.push(amenidad);
          } else if (typeof amenidad === 'object' && amenidad !== null) {
            Object.keys(amenidad).forEach(key => {
              if (amenidad[key] === true || amenidad[key] === 'true') {
                amenidades.push(key);
              }
            });
          }
        });
      } else if (typeof detalle.amenidades === 'object') {
        Object.keys(detalle.amenidades).forEach(key => {
          if (detalle.amenidades[key] === true || detalle.amenidades[key] === 'true') {
            amenidades.push(key);
          }
        });
      }
    }

    if (detalle.wifi) amenidades.push('Wi-Fi');
    if (detalle.cafe || detalle.cafetera) amenidades.push('Café');
    if (detalle.estacionamiento || detalle.parking) amenidades.push('Estacionamiento');

    const equipamiento = [];
    if (Array.isArray(detalle.equipamiento)) {
      detalle.equipamiento.forEach(item => {
        if (typeof item === 'string') {
          equipamiento.push(item);
        } else if (item.tipo) {
          equipamiento.push(item.tipo);
        } else if (item.nombre) {
          equipamiento.push(item.nombre);
        }
      });
    }

    if (detalle.proyector) equipamiento.push('Proyector');
    if (detalle.pizarra) equipamiento.push('Pizarra');
    if (detalle.impresora) equipamiento.push('Impresora');

    const extras = [];
    if (detalle.seguridad) {
      if (typeof detalle.seguridad === 'object') {
        if (detalle.seguridad.vigilancia24h) extras.push('Vigilancia 24 hrs');
        if (detalle.seguridad.accesoControlado) extras.push('Acceso controlado');
        if (detalle.seguridad.camaras) extras.push('Cámaras de seguridad');
      }
    }
    if (detalle.limpieza) extras.push('Servicio de limpieza');
    if (detalle.recepcion) extras.push('Recepción');

    const capacidad = [];
    const capacidadNum = detalle.capacidad || detalle.capacidadMaxima || 1;
    capacidad.push(`Límite: máx ${capacidadNum} pers`);

    if (detalle.horarioDisponible) {
      const { horaInicio, horaFin, diasSemana } = detalle.horarioDisponible;
      if (horaInicio && horaFin) {
        capacidad.push(`Horario: ${horaInicio} - ${horaFin}`);
      }
      if (Array.isArray(diasSemana) && diasSemana.length > 0) {
        capacidad.push(diasSemana.join(' - '));
      } else {
        capacidad.push('Lun - Dom');
      }
    } else {
      capacidad.push('Horario: 08:00 - 18:00');
      capacidad.push('Lun - Dom');
    }

    let precio = '0';
    if (detalle.precios) {
      precio = detalle.precios.porDia ||
        detalle.precios.porHora ||
        detalle.precios.porMes ||
        '0';
    } else if (detalle.precio) {
      precio = detalle.precio.toString();
    }

    const precioFormateado = precio.toString().includes('USD') ?
      precio : `${precio}USD`;

    let imagen = 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

    if (detalle.imagenes && Array.isArray(detalle.imagenes) && detalle.imagenes.length > 0) {
      imagen = detalle.imagenes[0];
    } else if (detalle.fotosPrincipales && Array.isArray(detalle.fotosPrincipales) && detalle.fotosPrincipales.length > 0) {
      imagen = detalle.fotosPrincipales[0];
    } else if (detalle.fotos && Array.isArray(detalle.fotos) && detalle.fotos.length > 0) {
      imagen = detalle.fotos[0];
    }

    const resultado = {
      descripcion: detalle.descripcion ||
        `${oficina.tipo || 'Espacio'} disponible para reserva ubicado en ${oficina.direccion || 'ubicación privilegiada'}. Cuenta con todos los servicios necesarios para una experiencia productiva y cómoda.`,
      amenidades: amenidades.length > 0 ? amenidades : [
        "Wi-Fi de alta velocidad",
        "Aire acondicionado",
        "Servicios básicos incluidos"
      ],
      equipamiento: equipamiento.length > 0 ? equipamiento : [
        "Equipamiento estándar",
        "Mobiliario completo"
      ],
      extras: extras.length > 0 ? extras : [
        "Acceso seguro",
        "Servicios de limpieza"
      ],
      capacidad,
      precio: precioFormateado,
      imagen
    };

    return resultado;
  };

  const getServiciosDisponibles = () => {
    const serviciosEspacio = serviciosPorEspacio[oficina.id] || [];

    if (serviciosEspacio.length === 0) {
      return [
        { _id: 1, nombre: 'Catering básico', precio: 15, unidadPrecio: 'persona' },
        { _id: 2, nombre: 'Proyector y pantalla', precio: 50, unidadPrecio: 'día' },
        { _id: 3, nombre: 'Servicio de café premium', precio: 5, unidadPrecio: 'persona' },
        { _id: 4, nombre: 'Estacionamiento adicional', precio: 20, unidadPrecio: 'día' }
      ];
    }

    return serviciosEspacio;
  };

  const handleReservar = () => {
    setModalVisible(true);
  };

  const handleOfrecerServicios = () => {
    navigation.navigate('OfrecerServicios', { oficina });
  };

  const toggleServicio = servicio => {
    setServiciosAdicionales(prev => {
      const existe = prev.find(s => s._id === servicio._id);
      if (existe) return prev.filter(s => s._id !== servicio._id);
      return [...prev, servicio];
    });
  };

  const calcularPrecioTotal = () => {
    const detalle = mapearDetalleEspacio(datosEspacio);
    if (!detalle) return 0;

    const precioBase = parseFloat(detalle.precio.replace('USD', ''));
    const precioServicios = serviciosAdicionales.reduce((tot, s) => {
      return tot + (s.unidadPrecio === 'persona'
        ? s.precio * cantidadPersonas
        : s.precio);
    }, 0);
    return precioBase + precioServicios;
  };

  const handleConfirmarReserva = () => {
    const detalle = mapearDetalleEspacio(datosEspacio);
    if (!detalle) return;

    const capacidadMaxima = parseInt(detalle.capacidad[0].split('máx ')[1].split(' pers')[0]);

    if (cantidadPersonas > capacidadMaxima) {
      Alert.alert('Error', `La capacidad máxima es de ${capacidadMaxima} personas`);
      return;
    }
    const parts = fechaInput.split('-').map(n => parseInt(n, 10));
    if (parts.length !== 3) {
      Alert.alert('Error', 'Formato de fecha inválido (debe ser YYYY-MM-DD)');
      return;
    }
    const [year, month, day] = parts;
    const formatoHora = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!formatoHora.test(horaInicioInput)) {
      Alert.alert('Error', 'Hora de inicio inválida (debe ser HH:MM en formato 24h)');
      return;
    }
    if (!formatoHora.test(horaFinInput)) {
      Alert.alert('Error', 'Hora de fin inválida (debe ser HH:MM en formato 24h)');
      return;
    }

    const [hI, mI] = horaInicioInput.split(':').map(n => parseInt(n, 10));
    const [hF, mF] = horaFinInput.split(':').map(n => parseInt(n, 10));

    const inicio = new Date(year, month - 1, day, hI, mI);
    const fin = new Date(year, month - 1, day, hF, mF);

    if (isNaN(inicio) || isNaN(fin)) {
      Alert.alert('Error', 'Fecha u hora inválida');
      return;
    }
    if (fin <= inicio) {
      Alert.alert('Error', 'La hora de fin debe ser posterior a la hora de inicio');
      return;
    }

    const ahora = new Date();
    if (inicio <= ahora) {
      Alert.alert('Error', 'La fecha y hora de la reserva debe ser futura');
      return;
    }

    const disponible = true;
    if (!disponible) {
      Alert.alert('No disponible', 'Este espacio no está disponible en el horario seleccionado');
      return;
    }

    const precioTotal = calcularPrecioTotal();

    const datosReserva = {
      espacioId: oficina.id?.toString(),
      espacioTipo: oficina.tipo,
      espacioNombre: oficina.nombre,

      fecha: fechaInput,
      horaInicio: horaInicioInput,
      horaFin: horaFinInput,
      fechaHoraInicio: inicio.toISOString(),
      fechaHoraFin: fin.toISOString(),

      cantidadPersonas: cantidadPersonas,
      precioTotal: precioTotal.toFixed(2),

      serviciosAdicionales: serviciosAdicionales.map(s => ({
        id: s._id?.toString(),
        nombre: s.nombre,
        precio: s.precio,
        unidadPrecio: s.unidadPrecio
      })),

      direccion: oficina.direccion
    };

    const validarDatosReserva = (datos) => {
      const errores = [];

      if (!datos.espacioId) errores.push('ID del espacio es requerido');
      if (!datos.espacioTipo) errores.push('Tipo del espacio es requerido');
      if (!datos.espacioNombre) errores.push('Nombre del espacio es requerido');
      if (!datos.fecha) errores.push('Fecha es requerida');
      if (!datos.horaInicio) errores.push('Hora de inicio es requerida');
      if (!datos.horaFin) errores.push('Hora de fin es requerida');
      if (!datos.fechaHoraInicio) errores.push('Fecha y hora de inicio en formato ISO es requerida');
      if (!datos.fechaHoraFin) errores.push('Fecha y hora de fin en formato ISO es requerida');
      if (!datos.cantidadPersonas || datos.cantidadPersonas < 1) errores.push('Cantidad de personas debe ser mayor a 0');
      if (!datos.precioTotal || parseFloat(datos.precioTotal) < 0) errores.push('Precio total es requerido');

      return errores;
    };

    const erroresValidacion = validarDatosReserva(datosReserva);
    if (erroresValidacion.length > 0) {
      Alert.alert('Error en datos', `Hay errores en los datos de la reserva:\n${erroresValidacion.join('\n')}`);
      return;
    }

    Alert.alert(
      'Confirmar reserva',
      `¿Confirmar reserva por $${precioTotal.toFixed(2)}?\n\nEspacio: ${oficina.nombre}\nFecha: ${fechaInput}\nHorario: ${horaInicioInput} - ${horaFinInput}\nPersonas: ${cantidadPersonas}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setModalVisible(false);
            navigation.navigate('MetodosPago', {
              modoSeleccion: true,
              oficina: oficina,
              precio: `$${precioTotal.toFixed(2)}`,
              datosReserva: datosReserva
            });
          }
        }
      ]
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    const detalle = mapearDetalleEspacio(datosEspacio);
    if (!detalle) return;

    const espacioActual = datosEspacio;

    setEditData({
      nombre: oficina.nombre || '',
      descripcion: detalle.descripcion || '',
      tipo: oficina.tipo || 'oficina',
      configuracion: espacioActual?.tipo || espacioActual?.configuracion || '',
      superficieM2: espacioActual?.superficieM2?.toString() || '',
      capacidadPersonas: detalle.capacidad[0]?.split('máx ')[1]?.split(' pers')[0] || '',

      ubicacion: {
        edificioId: espacioActual?.ubicacion?.edificioId || '',
        piso: espacioActual?.ubicacion?.piso?.toString() || '',
        numero: espacioActual?.ubicacion?.numero || '',
        zona: espacioActual?.ubicacion?.zona || '',
        sector: espacioActual?.ubicacion?.sector || '',
        coordenadas: {
          lat: espacioActual?.ubicacion?.coordenadas?.lat || null,
          lng: espacioActual?.ubicacion?.coordenadas?.lng || null
        },
        direccionCompleta: {
          calle: espacioActual?.ubicacion?.direccionCompleta?.calle || '',
          numero: espacioActual?.ubicacion?.direccionCompleta?.numero || '',
          ciudad: espacioActual?.ubicacion?.direccionCompleta?.ciudad || '',
          departamento: espacioActual?.ubicacion?.direccionCompleta?.departamento || '',
          codigoPostal: espacioActual?.ubicacion?.direccionCompleta?.codigoPostal || '',
          pais: espacioActual?.ubicacion?.direccionCompleta?.pais || 'Uruguay'
        }
      },

      precios: {
        porHora: espacioActual?.precios?.porHora?.toString() || '',
        porDia: espacioActual?.precios?.porDia?.toString() || '',
        porMes: espacioActual?.precios?.porMes?.toString() || ''
      },

      amenidades: detalle.amenidades || [],
      equipamiento: Array.isArray(espacioActual?.equipamiento)
        ? espacioActual.equipamiento.map(item => item.tipo || item.nombre || item)
        : [],

      disponibilidad: {
        horario: {
          apertura: espacioActual?.disponibilidad?.horario?.apertura ||
            espacioActual?.horarioDisponible?.horaInicio ||
            '09:00',
          cierre: espacioActual?.disponibilidad?.horario?.cierre ||
            espacioActual?.horarioDisponible?.horaFin ||
            '18:00'
        },
        dias: espacioActual?.disponibilidad?.dias ||
          espacioActual?.horarioDisponible?.diasSemana ||
          ['lunes', 'martes', 'miércoles', 'jueves', 'viernes']
      },

      estado: espacioActual?.estado || 'disponible'
    });

    setEditingImages(espacioActual?.imagenes || []);
    setIsEditing(true);
  };

  const toggleAmenidadEdit = (amenidad) => {
    setEditData(prev => ({
      ...prev,
      amenidades: prev.amenidades.includes(amenidad)
        ? prev.amenidades.filter(a => a !== amenidad)
        : [...prev.amenidades, amenidad]
    }));
  };

  const toggleEquipamientoEdit = (equipo) => {
    setEditData(prev => ({
      ...prev,
      equipamiento: prev.equipamiento.includes(equipo)
        ? prev.equipamiento.filter(e => e !== equipo)
        : [...prev.equipamiento, equipo]
    }));
  };

  const toggleDiaEdit = (dia) => {
    setEditData(prev => ({
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
      name: `${editData.tipo}_${Date.now()}.jpeg`,
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
    }
  };

  const selectImageEdit = async () => {
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

          setEditingImages([...editingImages, ...cloudinaryUrls]);
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

  const removeImageEdit = (index) => {
    setEditingImages(editingImages.filter((_, i) => i !== index));
  };

  const handleLocationSelectEdit = (coordenadas) => {
    setEditData(prev => ({
      ...prev,
      ubicacion: {
        ...prev.ubicacion,
        coordenadas: coordenadas
      }
    }));
  };

  const abrirMapaEdit = () => {
    setMostrarMapaEdit(true);
  };

  const cerrarMapaEdit = () => {
    setMostrarMapaEdit(false);
  };

  const validarFormularioEdit = () => {
    const errores = [];

    const tipos = [
      {
        id: 'oficina',
        subtipos: ['privada', 'compartida', 'coworking'],
        requiereNumero: true,
        requiereCapacidad: true
      },
      {
        id: 'espacio',
        subtipos: [],
        requiereSector: true,
        requiereCapacidad: true
      },
      {
        id: 'escritorio',
        subtipos: ['individual', 'compartido', 'standing'],
        requiereZona: true,
        requiereNumero: true
      },
      {
        id: 'sala',
        subtipos: ['mesa_redonda', 'auditorio', 'en_u', 'aula', 'flexible'],
        requiereNumero: true,
        requiereCapacidad: true,
        requierePrecioHora: true
      }
    ];

    if (!editData.nombre.trim()) {
      errores.push('El nombre es obligatorio');
    }

    if (!editData.descripcion.trim()) {
      errores.push('La descripción es obligatoria');
    }

    if (!editData.ubicacion.direccionCompleta.calle.trim()) {
      errores.push('La calle es obligatoria');
    }

    if (!editData.ubicacion.direccionCompleta.numero.trim()) {
      errores.push('El número de dirección es obligatorio');
    }

    if (!editData.ubicacion.direccionCompleta.ciudad.trim()) {
      errores.push('La ciudad es obligatoria');
    }

    if (!editData.ubicacion.direccionCompleta.departamento.trim()) {
      errores.push('El departamento es obligatorio');
    }

    if (!editData.ubicacion.direccionCompleta.codigoPostal.trim()) {
      errores.push('El código postal es obligatorio');
    }

    if (!editData.ubicacion.piso || editData.ubicacion.piso.trim() === '') {
      errores.push('El piso es obligatorio');
    }

    const tipoActual = tipos.find(t => t.id === editData.tipo);

    if (tipoActual?.requiereCapacidad && (!editData.capacidadPersonas || parseInt(editData.capacidadPersonas) < 1)) {
      errores.push('La capacidad es obligatoria y debe ser mayor a 0');
    }

    if (tipoActual?.requiereNumero && !editData.ubicacion.numero.trim()) {
      errores.push('El número de oficina/sala es obligatorio');
    }

    if (tipoActual?.requiereZona && !editData.ubicacion.zona.trim()) {
      errores.push('La zona es obligatoria para escritorios');
    }

    if (tipoActual?.requiereSector && !editData.ubicacion.sector.trim()) {
      errores.push('El sector es obligatorio para espacios');
    }

    if (tipoActual?.requierePrecioHora && (!editData.precios.porHora || parseFloat(editData.precios.porHora) <= 0)) {
      errores.push('El precio por hora es obligatorio para salas de reunión');
    }

    if (editData.tipo === 'escritorio' && (!editData.precios.porDia || parseFloat(editData.precios.porDia) <= 0)) {
      errores.push('El precio por día es obligatorio para escritorios');
    }

    if (!editData.ubicacion.coordenadas.lat || !editData.ubicacion.coordenadas.lng) {
      errores.push('Debes seleccionar la ubicación en el mapa');
    }

    if (editingImages.length === 0) {
      errores.push('Debes tener al menos una imagen');
    }

    if (tipoActual?.subtipos.length > 0 && !editData.configuracion) {
      errores.push(`Debes seleccionar un tipo de ${editData.tipo}`);
    }

    if (!editData.precios.porDia && !editData.precios.porHora && !editData.precios.porMes) {
      errores.push('Debes indicar al menos un precio');
    }

    return errores;
  };

  const handleSave = async () => {
    const errores = validarFormularioEdit();

    if (errores.length > 0) {
      Alert.alert('Errores de validación', errores.join('\n'));
      return;
    }

    Alert.alert(
      'Guardar cambios',
      '¿Estás seguro de que quieres guardar los cambios?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Guardar',
          onPress: async () => {
            try {
              const datosActualizados = {
                nombre: editData.nombre.trim(),
                tipo: editData.configuracion || editData.tipo,
                descripcion: editData.descripcion.trim(),

                ubicacion: {
                  ...(editData.ubicacion.edificioId && { edificioId: editData.ubicacion.edificioId }),
                  piso: parseInt(editData.ubicacion.piso),
                  ...(editData.ubicacion.numero && { numero: editData.ubicacion.numero }),
                  ...(editData.ubicacion.zona && { zona: editData.ubicacion.zona }),
                  ...(editData.ubicacion.sector && { sector: editData.ubicacion.sector }),
                  coordenadas: {
                    lat: editData.ubicacion.coordenadas.lat,
                    lng: editData.ubicacion.coordenadas.lng
                  },
                  direccionCompleta: {
                    calle: editData.ubicacion.direccionCompleta.calle,
                    numero: editData.ubicacion.direccionCompleta.numero,
                    ciudad: editData.ubicacion.direccionCompleta.ciudad,
                    departamento: editData.ubicacion.direccionCompleta.departamento,
                    codigoPostal: editData.ubicacion.direccionCompleta.codigoPostal,
                    pais: editData.ubicacion.direccionCompleta.pais
                  }
                },

                ...(editData.capacidadPersonas && { capacidad: parseInt(editData.capacidadPersonas) }),
                ...(editData.superficieM2 && { superficieM2: parseFloat(editData.superficieM2) }),

                precios: {
                  ...(editData.precios.porHora && { porHora: parseFloat(editData.precios.porHora) }),
                  ...(editData.precios.porDia && { porDia: parseFloat(editData.precios.porDia) }),
                  ...(editData.precios.porMes && { porMes: parseFloat(editData.precios.porMes) })
                },

                disponibilidad: {
                  horario: {
                    apertura: editData.disponibilidad.horario.apertura,
                    cierre: editData.disponibilidad.horario.cierre
                  },
                  dias: editData.disponibilidad.dias
                },

                horarioDisponible: {
                  horaInicio: editData.disponibilidad.horario.apertura,
                  horaFin: editData.disponibilidad.horario.cierre,
                  diasSemana: editData.disponibilidad.dias
                },

                amenidades: editData.amenidades,

                equipamiento: editData.equipamiento.map(item => ({
                  tipo: item,
                  descripcion: `${item} disponible`
                })),

                imagenes: editingImages,
                estado: editData.estado,
                activo: editData.estado === 'disponible',
                codigo: datosEspacio?.codigo || `${editData.tipo.toUpperCase().substring(0, 2)}-${Date.now()}`
              };

              const result = await dispatch(actualizarEspacio({
                id: oficina.id,
                tipo: oficina.tipo,
                datosActualizados
              }));

              if (actualizarEspacio.fulfilled.match(result)) {
                setDatosEspacio(result.payload.data);
                setIsEditing(false);
                setEditData({});
                setEditingImages([]);

                Alert.alert('Éxito', 'Los cambios se han guardado correctamente');

                if (editData.nombre !== oficina.nombre) {
                  navigation.setOptions({ title: editData.nombre });
                }
              } else {
                throw new Error(result.payload || 'Error al guardar los cambios');
              }
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'No se pudieron guardar los cambios. Inténtalo de nuevo.');
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
    setEditingImages([]);
  };

  const FormularioEdicionCompleta = () => {
    const tipos = [
      {
        id: 'oficina',
        nombre: 'Oficina',
        subtipos: ['privada', 'compartida', 'coworking'],
        requiereNumero: true,
        requiereCapacidad: true
      },
      {
        id: 'espacio',
        nombre: 'Espacio',
        subtipos: [],
        requiereSector: true,
        requiereCapacidad: true
      },
      {
        id: 'escritorio',
        nombre: 'Escritorio',
        subtipos: ['individual', 'compartido', 'standing'],
        requiereZona: true,
        requiereNumero: true
      },
      {
        id: 'sala',
        nombre: 'Sala de reuniones',
        subtipos: ['mesa_redonda', 'auditorio', 'en_u', 'aula', 'flexible'],
        requiereNumero: true,
        requiereCapacidad: true,
        requierePrecioHora: true
      }
    ];

    const amenidadesDisponibles = {
      oficina: ['wifi', 'aire_acondicionado', 'seguridad', 'parking', 'cocina', 'baño_privado'],
      espacio: ['wifi', 'aire_acondicionado', 'seguridad', 'parking', 'flexible'],
      escritorio: ['monitor', 'teclado', 'mouse', 'reposapiés', 'lampara'],
      sala: ['proyector', 'videoconferencia', 'pizarra', 'tv', 'aire_acondicionado']
    };

    const equipamientoDisponible = [
      'Proyector', 'Pantalla', 'Sistema de audio', 'Videoconferencia',
      'Pizarra', 'TV', 'Impresora', 'Scanner', 'Teléfono', 'Internet'
    ];

    const diasSemana = [
      'lunes', 'martes', 'miércoles', 'jueves',
      'viernes', 'sábado', 'domingo'
    ];

    const tipoActual = tipos.find(t => t.id === editData.tipo);

    return (
      <ScrollView style={styles.editSection} showsVerticalScrollIndicator={false}>
        <View style={styles.editField}>
          <Text style={styles.editLabel}>Tipo de espacio</Text>
          <View style={styles.tiposContainer}>
            {tipos.map(tipo => (
              <TouchableOpacity
                key={tipo.id}
                style={[
                  styles.tipoButtonEdit,
                  editData.tipo === tipo.id && styles.tipoButtonEditActive
                ]}
                onPress={() => setEditData({ ...editData, tipo: tipo.id })}
              >
                <Text style={[
                  styles.tipoTextEdit,
                  editData.tipo === tipo.id && styles.tipoTextEditActive
                ]}>
                  {tipo.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {tipoActual?.subtipos.length > 0 && (
          <View style={styles.editField}>
            <Text style={styles.editLabel}>
              {editData.tipo === 'sala' ? 'Configuración' : 'Tipo'} *
            </Text>
            <View style={styles.subtiposContainer}>
              {tipoActual.subtipos.map(subtipo => (
                <TouchableOpacity
                  key={subtipo}
                  style={[
                    styles.subtipoButtonEdit,
                    editData.configuracion === subtipo && styles.subtipoButtonEditActive
                  ]}
                  onPress={() => setEditData({ ...editData, configuracion: subtipo })}
                >
                  <Text style={[
                    styles.subtipoTextEdit,
                    editData.configuracion === subtipo && styles.subtipoTextEditActive
                  ]}>
                    {subtipo.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.editField}>
          <Text style={styles.editLabel}>Nombre del espacio *</Text>
          <TextInput
            style={styles.editInput}
            value={editData.nombre}
            onChangeText={(text) => setEditData({ ...editData, nombre: text })}
            placeholder="Nombre del espacio"
          />
        </View>

        <View style={styles.editField}>
          <Text style={styles.editLabel}>Descripción *</Text>
          <TextInput
            style={[styles.editInput, styles.editInputMultiline]}
            value={editData.descripcion}
            onChangeText={(text) => setEditData({ ...editData, descripcion: text })}
            multiline
            numberOfLines={4}
            placeholder="Describe tu espacio..."
          />
        </View>

        <View style={styles.editRow}>
          {tipoActual?.requiereCapacidad && (
            <View style={editData.tipo === 'oficina' ? styles.editFieldHalf : styles.editField}>
              <Text style={styles.editLabel}>Capacidad (personas) *</Text>
              <TextInput
                style={styles.editInput}
                value={editData.capacidadPersonas}
                onChangeText={(text) => setEditData({ ...editData, capacidadPersonas: text })}
                placeholder="8"
                keyboardType="numeric"
              />
            </View>
          )}

          {editData.tipo === 'oficina' && (
            <View style={styles.editFieldHalf}>
              <Text style={styles.editLabel}>Superficie (m²)</Text>
              <TextInput
                style={styles.editInput}
                value={editData.superficieM2}
                onChangeText={(text) => setEditData({ ...editData, superficieM2: text })}
                placeholder="50"
                keyboardType="numeric"
              />
            </View>
          )}
        </View>

        <View style={styles.editField}>
          <Text style={styles.sectionTitleEdit}>Ubicación</Text>

          <Text style={styles.editLabel}>Calle *</Text>
          <TextInput
            style={styles.editInput}
            placeholder="Nombre de la calle"
            value={editData.ubicacion.direccionCompleta.calle}
            onChangeText={(text) => setEditData({
              ...editData,
              ubicacion: {
                ...editData.ubicacion,
                direccionCompleta: {
                  ...editData.ubicacion.direccionCompleta,
                  calle: text
                }
              }
            })}
          />

          <View style={styles.editRow}>
            <View style={styles.editFieldHalf}>
              <Text style={styles.editLabel}>Número *</Text>
              <TextInput
                style={styles.editInput}
                placeholder="1234"
                value={editData.ubicacion.direccionCompleta.numero}
                onChangeText={(text) => setEditData({
                  ...editData,
                  ubicacion: {
                    ...editData.ubicacion,
                    direccionCompleta: {
                      ...editData.ubicacion.direccionCompleta,
                      numero: text
                    }
                  }
                })}
              />
            </View>
            <View style={styles.editFieldHalf}>
              <Text style={styles.editLabel}>Piso *</Text>
              <TextInput
                style={styles.editInput}
                placeholder="1, 2, 3..."
                value={editData.ubicacion.piso}
                onChangeText={(text) => setEditData({
                  ...editData,
                  ubicacion: {
                    ...editData.ubicacion,
                    piso: text
                  }
                })}
                keyboardType="numeric"
              />
            </View>
          </View>

          {tipoActual?.requiereNumero && (
            <>
              <Text style={styles.editLabel}>
                Número de {editData.tipo === 'oficina' ? 'oficina' : editData.tipo === 'sala' ? 'sala' : 'escritorio'} *
              </Text>
              <TextInput
                style={styles.editInput}
                placeholder="Ej: 101, A-5, etc."
                value={editData.ubicacion.numero}
                onChangeText={(text) => setEditData({
                  ...editData,
                  ubicacion: {
                    ...editData.ubicacion,
                    numero: text
                  }
                })}
              />
            </>
          )}

          {tipoActual?.requiereZona && (
            <>
              <Text style={styles.editLabel}>Zona *</Text>
              <TextInput
                style={styles.editInput}
                placeholder="Ej: Zona A, Open Space, etc."
                value={editData.ubicacion.zona}
                onChangeText={(text) => setEditData({
                  ...editData,
                  ubicacion: {
                    ...editData.ubicacion,
                    zona: text
                  }
                })}
              />
            </>
          )}

          {tipoActual?.requiereSector && (
            <>
              <Text style={styles.editLabel}>Sector *</Text>
              <TextInput
                style={styles.editInput}
                placeholder="Ej: Norte, Sur, Principal, etc."
                value={editData.ubicacion.sector}
                onChangeText={(text) => setEditData({
                  ...editData,
                  ubicacion: {
                    ...editData.ubicacion,
                    sector: text
                  }
                })}
              />
            </>
          )}

          <View style={styles.editRow}>
            <View style={styles.editFieldHalf}>
              <Text style={styles.editLabel}>Ciudad *</Text>
              <TextInput
                style={styles.editInput}
                placeholder="Montevideo"
                value={editData.ubicacion.direccionCompleta.ciudad}
                onChangeText={(text) => setEditData({
                  ...editData,
                  ubicacion: {
                    ...editData.ubicacion,
                    direccionCompleta: {
                      ...editData.ubicacion.direccionCompleta,
                      ciudad: text
                    }
                  }
                })}
              />
            </View>
            <View style={styles.editFieldHalf}>
              <Text style={styles.editLabel}>Departamento *</Text>
              <TextInput
                style={styles.editInput}
                placeholder="Montevideo"
                value={editData.ubicacion.direccionCompleta.departamento}
                onChangeText={(text) => setEditData({
                  ...editData,
                  ubicacion: {
                    ...editData.ubicacion,
                    direccionCompleta: {
                      ...editData.ubicacion.direccionCompleta,
                      departamento: text
                    }
                  }
                })}
              />
            </View>
          </View>

          <Text style={styles.editLabel}>Código Postal *</Text>
          <TextInput
            style={styles.editInput}
            placeholder="11000"
            value={editData.ubicacion.direccionCompleta.codigoPostal}
            onChangeText={(text) => setEditData({
              ...editData,
              ubicacion: {
                ...editData.ubicacion,
                direccionCompleta: {
                  ...editData.ubicacion.direccionCompleta,
                  codigoPostal: text
                }
              }
            })}
          />

          <View style={styles.mapSectionEdit}>
            <View style={styles.mapSectionHeaderEdit}>
              <Ionicons name="location" size={20} color="#4a90e2" />
              <Text style={styles.mapSectionTitleEdit}>Ubicación en el mapa *</Text>
            </View>

            {editData.ubicacion.coordenadas.lat && editData.ubicacion.coordenadas.lng ? (
              <View style={styles.locationSelectedEdit}>
                <View style={styles.locationInfoEdit}>
                  <View style={styles.locationIconEdit}>
                    <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                  </View>
                  <View style={styles.locationDetailsEdit}>
                    <Text style={styles.locationLabelEdit}>Coordenadas confirmadas</Text>
                    <Text style={styles.locationCoordsEdit}>
                      {editData.ubicacion.coordenadas.lat.toFixed(6)}, {editData.ubicacion.coordenadas.lng.toFixed(6)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.editLocationBtnEdit}
                  onPress={abrirMapaEdit}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil" size={16} color="#4a90e2" />
                  <Text style={styles.editLocationTextEdit}>Editar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectLocationCardEdit}
                onPress={abrirMapaEdit}
                activeOpacity={0.7}
              >
                <View style={styles.selectLocationContentEdit}>
                  <View style={styles.mapIconContainerEdit}>
                    <Ionicons name="map" size={32} color="#4a90e2" />
                  </View>
                  <View style={styles.selectLocationTextsEdit}>
                    <Text style={styles.selectLocationTitleEdit}>Seleccionar en el mapa</Text>
                    <Text style={styles.selectLocationSubtitleEdit}>
                      Toca para abrir el mapa y marcar la ubicación exacta
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.editField}>
          <Text style={styles.sectionTitleEdit}>Precios</Text>
          <View style={styles.editRow}>
            <View style={styles.editFieldThird}>
              <Text style={styles.editLabel}>
                Por hora {tipoActual?.requierePrecioHora ? '*' : ''}
              </Text>
              <TextInput
                style={styles.editInput}
                placeholder="USD"
                value={editData.precios.porHora}
                onChangeText={(text) => setEditData({
                  ...editData,
                  precios: { ...editData.precios, porHora: text }
                })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.editFieldThird}>
              <Text style={styles.editLabel}>
                Por día {editData.tipo === 'escritorio' ? '*' : ''}
              </Text>
              <TextInput
                style={styles.editInput}
                placeholder="USD"
                value={editData.precios.porDia}
                onChangeText={(text) => setEditData({
                  ...editData,
                  precios: { ...editData.precios, porDia: text }
                })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.editFieldThird}>
              <Text style={styles.editLabel}>Por mes</Text>
              <TextInput
                style={styles.editInput}
                placeholder="USD"
                value={editData.precios.porMes}
                onChangeText={(text) => setEditData({
                  ...editData,
                  precios: { ...editData.precios, porMes: text }
                })}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.editField}>
          <Text style={styles.sectionTitleEdit}>Horario disponible</Text>
          <View style={styles.editRow}>
            <View style={styles.editFieldHalf}>
              <Text style={styles.editLabel}>Apertura</Text>
              <TextInput
                style={styles.editInput}
                value={editData.disponibilidad.horario.apertura}
                onChangeText={(text) => setEditData({
                  ...editData,
                  disponibilidad: {
                    ...editData.disponibilidad,
                    horario: { ...editData.disponibilidad.horario, apertura: text }
                  }
                })}
                placeholder="09:00"
              />
            </View>

            <View style={styles.editFieldHalf}>
              <Text style={styles.editLabel}>Cierre</Text>
              <TextInput
                style={styles.editInput}
                value={editData.disponibilidad.horario.cierre}
                onChangeText={(text) => setEditData({
                  ...editData,
                  disponibilidad: {
                    ...editData.disponibilidad,
                    horario: { ...editData.disponibilidad.horario, cierre: text }
                  }
                })}
                placeholder="18:00"
              />
            </View>
          </View>

          <Text style={styles.editLabel}>Días disponibles</Text>
          <View style={styles.diasContainer}>
            {diasSemana.map(dia => (
              <TouchableOpacity
                key={dia}
                style={[
                  styles.diaButton,
                  editData.disponibilidad.dias.includes(dia) && styles.diaButtonActive
                ]}
                onPress={() => toggleDiaEdit(dia)}
              >
                <Text style={[
                  styles.diaText,
                  editData.disponibilidad.dias.includes(dia) && styles.diaTextActive
                ]}>
                  {dia.charAt(0).toUpperCase() + dia.slice(1, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.editField}>
          <Text style={styles.sectionTitleEdit}>Imágenes *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.addImageButtonEdit, uploadingImage && styles.addImageButtonEditDisabled]}
              onPress={selectImageEdit}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <Text style={styles.uploadingTextEdit}>Subiendo...</Text>
              ) : (
                <>
                  <Ionicons name="camera" size={32} color="#4a90e2" />
                  <Text style={styles.addImageTextEdit}>Agregar</Text>
                </>
              )}
            </TouchableOpacity>
            {editingImages.map((uri, index) => (
              <View key={index} style={styles.imageContainerEdit}>
                <Image source={{ uri }} style={styles.previewImageEdit} />
                <TouchableOpacity
                  style={styles.removeImageButtonEdit}
                  onPress={() => removeImageEdit(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.editField}>
          <Text style={styles.sectionTitleEdit}>
            {editData.tipo === 'sala' ? 'Equipamiento' : 'Amenidades'}
          </Text>
          <View style={styles.amenidadesContainer}>
            {amenidadesDisponibles[editData.tipo]?.map(amenidad => (
              <TouchableOpacity
                key={amenidad}
                style={[
                  styles.amenidadButton,
                  editData.amenidades.includes(amenidad) && styles.amenidadButtonActive
                ]}
                onPress={() => toggleAmenidadEdit(amenidad)}
              >
                <Text style={[
                  styles.amenidadText,
                  editData.amenidades.includes(amenidad) && styles.amenidadTextActive
                ]}>
                  {amenidad.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.editField}>
          <Text style={styles.sectionTitleEdit}>Equipamiento adicional</Text>
          <View style={styles.amenidadesContainer}>
            {equipamientoDisponible.map(equipo => (
              <TouchableOpacity
                key={equipo}
                style={[
                  styles.amenidadButton,
                  editData.equipamiento.includes(equipo) && styles.amenidadButtonActive
                ]}
                onPress={() => toggleEquipamientoEdit(equipo)}
              >
                <Text style={[
                  styles.amenidadText,
                  editData.equipamiento.includes(equipo) && styles.amenidadTextActive
                ]}>
                  {equipo}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.editField}>
          <Text style={styles.editLabel}>Estado</Text>
          <View style={styles.estadoContainer}>
            {['disponible', 'ocupado', 'mantenimiento'].map(estado => (
              <TouchableOpacity
                key={estado}
                style={[
                  styles.estadoButton,
                  editData.estado === estado && styles.estadoButtonActive
                ]}
                onPress={() => setEditData({ ...editData, estado })}
              >
                <Text style={[
                  styles.estadoText,
                  editData.estado === estado && styles.estadoTextActive
                ]}>
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.editButtons}>
          <TouchableOpacity
            style={[styles.editButtonStyle, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.editButtonStyle, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const MapaEdicionModal = () => (
    <Modal
      visible={mostrarMapaEdit}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
    >
      <View style={styles.mapModalContainer}>
        <View style={styles.mapModalHeader}>
          <TouchableOpacity
            onPress={cerrarMapaEdit}
            style={styles.mapModalCloseBtn}
            activeOpacity={0.7}
          >
            <View style={styles.closeButtonCircle}>
              <Ionicons name="close" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.mapModalTitleContainer}>
            <Text style={styles.mapModalTitle}>Editar ubicación</Text>
            <Text style={styles.mapModalSubtitle}>
              {editData.nombre || 'Espacio en edición'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={cerrarMapaEdit}
            style={[
              styles.mapModalSaveBtn,
              !editData.ubicacion.coordenadas.lat && styles.mapModalSaveBtnDisabled
            ]}
            disabled={!editData.ubicacion.coordenadas.lat}
            activeOpacity={0.7}
          >
            <Ionicons
              name="checkmark"
              size={18}
              color={editData.ubicacion.coordenadas.lat ? "#fff" : "#bdc3c7"}
            />
            <Text style={[
              styles.mapModalSaveText,
              !editData.ubicacion.coordenadas.lat && styles.mapModalSaveTextDisabled
            ]}>
              Confirmar
            </Text>
          </TouchableOpacity>
        </View>

        <MapSelector
          onLocationSelect={handleLocationSelectEdit}
          initialLocation={editData.ubicacion.coordenadas.lat ? editData.ubicacion.coordenadas : null}
          direccionCompleta={editData.ubicacion.direccionCompleta}
        />
      </View>
    </Modal>
  );

  const InfoSection = ({ title, items, iconName }) => (
    <View style={styles.infoSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {items.map((item, index) => (
        <View key={index} style={styles.infoItemContainer}>
          <Ionicons name="checkmark-circle" size={12} color="#4a90e2" />
          <Text style={styles.infoItem}>{item}</Text>
        </View>
      ))}
    </View>
  );

  if (loadingDetalle && !datosEspacio) {
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
          <Text style={styles.headerTitle} numberOfLines={1}>Cargando...</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Cargando detalles del espacio...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const detalle = mapearDetalleEspacio(datosEspacio);

  if (!detalle) {
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
          <Text style={styles.headerTitle} numberOfLines={1}>Error</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#e74c3c" />
          <Text style={styles.errorText}>No se pudieron cargar los detalles del espacio</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(obtenerDetalleEspacio({ id: oficina.id, tipo: oficina.tipo }))}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const serviciosDisponibles = getServiciosDisponibles();

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
        <Text style={styles.headerTitle} numberOfLines={1}>{oficina.nombre}</Text>
        {esPropia && tipoUsuario === 'cliente' && !isEditing && (
          <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color="#4a90e2" />
          </TouchableOpacity>
        )}
        {!esPropia && <View style={styles.placeholder} />}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: detalle.imagen }}
            style={styles.espacioImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <Text style={styles.espacioNombreOverlay}>{oficina.nombre}</Text>
            {esPropia && (
              <View style={styles.propiaIndicator}>
                <Text style={styles.propiaText}>Tu oficina</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.mainInfo}>
          <Text style={styles.sectionTitleMain}>Descripción</Text>

          {isEditing ? (
            <FormularioEdicionCompleta />
          ) : (
            <>
              <Text style={styles.description}>{detalle.descripcion}</Text>

              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <InfoSection
                    title="Amenidades Destacadas"
                    items={detalle.amenidades}
                    iconName="star"
                  />
                  <InfoSection
                    title="Equipamiento & Conectividad"
                    items={detalle.equipamiento}
                    iconName="laptop"
                  />
                </View>

                <View style={styles.infoRow}>
                  <InfoSection
                    title="Extras & Seguridad"
                    items={detalle.extras}
                    iconName="shield-checkmark"
                  />
                  <InfoSection
                    title="Capacidad & Horario"
                    items={detalle.capacidad}
                    iconName="time"
                  />
                </View>
              </View>

              <View style={styles.priceSection}>
                <Text style={styles.priceLabel}>Precio</Text>
                <Text style={styles.price}>{detalle.precio}</Text>
              </View>

              {esPropia && tipoUsuario === 'cliente' && (
                <View style={styles.serviciosSection}>
                  <Text style={styles.sectionTitleMain}>Servicios de tu espacio</Text>
                  <View style={styles.serviciosContainer}>
                    <View style={styles.serviciosTabs}>
                      <TouchableOpacity
                        style={[styles.servicioTab, styles.servicioTabActive]}
                        onPress={() => navigation.navigate('ServiciosEspacio', { oficina })}
                      >
                        <Ionicons name="construct" size={20} color="#4a90e2" />
                        <Text style={styles.servicioTabText}>Servicios incluidos</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.servicioTab}
                        onPress={() => navigation.navigate('ServiciosOfrecidos', { oficina })}
                      >
                        <Ionicons name="people" size={20} color="#7f8c8d" />
                        <Text style={[styles.servicioTabText, { color: '#7f8c8d' }]}>Proveedores externos</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.serviciosDescripcion}>
                      Gestiona los servicios incluidos en tu espacio y los proveedores externos disponibles
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {!isEditing && (
          <>
            {tipoUsuario === 'usuario' && !esPropia && (
              <TouchableOpacity
                style={styles.reservarButton}
                onPress={handleReservar}
                activeOpacity={0.8}
              >
                <Text style={styles.reservarButtonText}>RESERVAR</Text>
              </TouchableOpacity>
            )}

            {tipoUsuario === 'proveedor' && !esPropia && (
              <TouchableOpacity
                style={styles.ofrecerServiciosButton}
                onPress={handleOfrecerServicios}
                activeOpacity={0.8}
              >
                <Ionicons name="construct" size={20} color="#fff" />
                <Text style={styles.ofrecerServiciosButtonText}>OFRECER SERVICIOS</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <MapaEdicionModal />

      {tipoUsuario === 'usuario' && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Reservar espacio</Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.espacioInfoModal}>
                <Text style={styles.espacioNombreModal}>{oficina.nombre}</Text>
                <Text style={styles.espacioDireccionModal}>{oficina.direccion || 'Montevideo, Ciudad Vieja'}</Text>
                <View style={styles.espacioDetallesModal}>
                  <View style={styles.detalleItemModal}>
                    <Ionicons name="people" size={16} color="#4a90e2" />
                    <Text style={styles.detalleTextModal}>
                      Hasta {parseInt(detalle.capacidad[0].split('máx ')[1].split(' pers')[0])} personas
                    </Text>
                  </View>
                  <View style={styles.detalleItemModal}>
                    <Ionicons name="pricetag" size={16} color="#27ae60" />
                    <Text style={styles.detalleTextModal}>${detalle.precio}/día</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fecha (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  value={fechaInput}
                  onChangeText={setFechaInput}
                  placeholder="2025-06-20"
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hora inicio (HH:MM)</Text>
                <TextInput
                  style={styles.input}
                  value={horaInicioInput}
                  onChangeText={setHoraInicioInput}
                  placeholder="09:00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hora fin (HH:MM)</Text>
                <TextInput
                  style={styles.input}
                  value={horaFinInput}
                  onChangeText={setHoraFinInput}
                  placeholder="17:00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cantidad de personas</Text>
                <View style={styles.cantidadContainer}>
                  <TouchableOpacity
                    style={styles.cantidadButton}
                    onPress={() => setCantidadPersonas(Math.max(1, cantidadPersonas - 1))}
                  >
                    <Ionicons name="remove" size={24} color="#4a90e2" />
                  </TouchableOpacity>
                  <Text style={styles.cantidadText}>{cantidadPersonas}</Text>
                  <TouchableOpacity
                    style={styles.cantidadButton}
                    onPress={() => {
                      const capacidadMaxima = parseInt(detalle.capacidad[0].split('máx ')[1].split(' pers')[0]);
                      setCantidadPersonas(Math.min(capacidadMaxima, cantidadPersonas + 1));
                    }}
                  >
                    <Ionicons name="add" size={24} color="#4a90e2" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Servicios adicionales</Text>
                {loadingServicios ? (
                  <Text style={styles.loadingText}>Cargando servicios...</Text>
                ) : serviciosDisponibles.length === 0 ? (
                  <Text style={styles.noServiciosText}>No hay servicios adicionales disponibles</Text>
                ) : (
                  serviciosDisponibles.map(s => (
                    <TouchableOpacity
                      key={s._id}
                      style={[
                        styles.servicioItem,
                        serviciosAdicionales.some(x => x._id === s._id) && styles.servicioItemActive
                      ]}
                      onPress={() => toggleServicio(s)}
                    >
                      <View style={styles.servicioInfo}>
                        <Text style={styles.servicioNombre}>{s.nombre}</Text>
                        <Text style={styles.servicioPrecio}>
                          ${s.precio}/{s.unidadPrecio || 'servicio'}
                        </Text>
                      </View>
                      <Ionicons
                        name={serviciosAdicionales.some(x => x._id === s._id) ? 'checkbox' : 'square-outline'}
                        size={24}
                        color="#4a90e2"
                      />
                    </TouchableOpacity>
                  ))
                )}
              </View>

              <View style={styles.resumenSection}>
                <Text style={styles.resumenTitle}>Resumen de reserva</Text>
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenLabel}>Precio base</Text>
                  <Text style={styles.resumenValue}>${detalle.precio.replace('USD', '')}</Text>
                </View>
                {serviciosAdicionales.map(s => (
                  <View key={s._id} style={styles.resumenItem}>
                    <Text style={styles.resumenLabel}>
                      {s.nombre}{s.unidadPrecio === 'persona' && ` (x${cantidadPersonas})`}
                    </Text>
                    <Text style={styles.resumenValue}>
                      ${s.unidadPrecio === 'persona' ? s.precio * cantidadPersonas : s.precio}
                    </Text>
                  </View>
                ))}
                <View style={[styles.resumenItem, styles.resumenTotal]}>
                  <Text style={styles.resumenTotalLabel}>Total</Text>
                  <Text style={styles.resumenTotalValue}>${calcularPrecioTotal().toFixed(2)}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.modalReservarButton} onPress={handleConfirmarReserva}>
                <Text style={styles.modalReservarButtonText}>Continuar con el pago</Text>
              </TouchableOpacity>
              <View style={styles.bottomSpacing} />
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
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
  editButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
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
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  espacioImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  espacioNombreOverlay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  propiaIndicator: {
    backgroundColor: 'rgba(39, 174, 96, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  propiaText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  mainInfo: {
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitleMain: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 5,
  },
  description: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 20,
    marginBottom: 25,
  },
  infoGrid: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  infoSection: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  infoItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoItem: {
    fontSize: 12,
    color: '#5a6c7d',
    marginLeft: 6,
    flex: 1,
  },
  priceSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  serviciosSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  serviciosContainer: {
    marginTop: 10,
  },
  serviciosTabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  servicioTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    gap: 8,
  },
  servicioTabActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4a90e2',
  },
  servicioTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a90e2',
  },
  serviciosDescripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  reservarButton: {
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
  reservarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ofrecerServiciosButton: {
    backgroundColor: '#27ae60',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  ofrecerServiciosButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editSection: {
    marginTop: 20,
  },
  editField: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    color: '#2c3e50',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  editButtonStyle: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  saveButton: {
    backgroundColor: '#4a90e2',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
    fontFamily: 'System',
    textAlign: 'center',
    paddingVertical: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e74c3c',
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'System',
  },
  retryButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
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
  modalCloseButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  modalContent: {
    flex: 1,
  },
  espacioInfoModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  espacioNombreModal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  espacioDireccionModal: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  espacioDetallesModal: {
    flexDirection: 'row',
    gap: 20,
  },
  detalleItemModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detalleTextModal: {
    fontSize: 14,
    color: '#5a6c7d',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    fontSize: 16,
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  cantidadButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  cantidadText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    minWidth: 40,
    textAlign: 'center',
  },
  servicioItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  servicioItemActive: {
    borderColor: '#4a90e2',
    backgroundColor: '#f0f8ff',
  },
  servicioInfo: {
    flex: 1,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  servicioPrecio: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  resumenSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  resumenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  resumenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resumenLabel: {
    fontSize: 14,
    color: '#5a6c7d',
  },
  resumenValue: {
    fontSize: 14,
    color: '#2c3e50',
  },
  resumenTotal: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10,
    marginTop: 10,
  },
  resumenTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  resumenTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  modalReservarButton: {
    backgroundColor: '#4a90e2',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalReservarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noServiciosText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default DetalleOficina;