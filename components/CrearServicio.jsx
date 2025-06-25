import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
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
import { useDispatch, useSelector } from 'react-redux';
import { crearServicioAdicional } from '../store/slices/proveedoresSlice';

const CrearServicio = ({ navigation }) => {
  const dispatch = useDispatch();
  const { datosUsuario } = useSelector(state => state.usuario);
  const { loading } = useSelector(state => state.proveedores);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    precio: '',
    duracion: '',
    disponibilidad: [],
    requisitos: '',
    experiencia: '',
    certificaciones: '',
    imagenes: []
  });

  const [errores, setErrores] = useState({});

  const categorias = [
    { id: 'limpieza', nombre: 'Limpieza', icono: 'sparkles', color: '#3498db' },
    { id: 'tecnologia', nombre: 'Tecnología', icono: 'laptop', color: '#9b59b6' },
    { id: 'catering', nombre: 'Catering', icono: 'restaurant', color: '#e74c3c' },
    { id: 'seguridad', nombre: 'Seguridad', icono: 'shield-checkmark', color: '#e67e22' },
    { id: 'mantenimiento', nombre: 'Mantenimiento', icono: 'construct', color: '#95a5a6' },
    { id: 'eventos', nombre: 'Eventos', icono: 'calendar', color: '#f39c12' },
    { id: 'transporte', nombre: 'Transporte', icono: 'car', color: '#2ecc71' },
    { id: 'consultoria', nombre: 'Consultoría', icono: 'briefcase', color: '#34495e' }
  ];

  const diasSemana = [
    { id: 'lunes', nombre: 'Lunes' },
    { id: 'martes', nombre: 'Martes' },
    { id: 'miercoles', nombre: 'Miércoles' },
    { id: 'jueves', nombre: 'Jueves' },
    { id: 'viernes', nombre: 'Viernes' },
    { id: 'sabado', nombre: 'Sábado' },
    { id: 'domingo', nombre: 'Domingo' }
  ];

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del servicio es obligatorio';
    }

    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    }

    if (!formData.categoria) {
      nuevosErrores.categoria = 'Selecciona una categoría';
    }

    if (!formData.precio.trim()) {
      nuevosErrores.precio = 'El precio es obligatorio';
    } else if (isNaN(parseFloat(formData.precio)) || parseFloat(formData.precio) <= 0) {
      nuevosErrores.precio = 'Ingresa un precio válido';
    }

    if (!formData.duracion.trim()) {
      nuevosErrores.duracion = 'La duración estimada es obligatoria';
    }

    if (formData.disponibilidad.length === 0) {
      nuevosErrores.disponibilidad = 'Selecciona al menos un día de disponibilidad';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      Alert.alert('Formulario incompleto', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const servicioData = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      tipo: formData.categoria,
      precio: parseFloat(formData.precio),
      duracionEstimada: formData.duracion.trim(),
      diasDisponibles: formData.disponibilidad,
      requisitos: formData.requisitos.trim(),
      experiencia: formData.experiencia.trim(),
      certificaciones: formData.certificaciones.split(',').map(c => c.trim()).filter(c => c),
      imagenes: formData.imagenes,
      proveedorId: datosUsuario?._id,
      activo: true,
      requiereAprobacion: true
    };

    try {
      const result = await dispatch(crearServicioAdicional(servicioData));
      
      if (result.success) {
        Alert.alert(
          'Servicio creado',
          'Tu servicio ha sido creado exitosamente y está pendiente de revisión.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ServiciosProveedor')
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'No se pudo crear el servicio');
      }
    } catch (error) {
      console.error('Error creando servicio:', error);
      Alert.alert('Error', 'Ocurrió un error al crear el servicio');
    }
  };

  const selectCategoria = (categoriaId) => {
    setFormData({ ...formData, categoria: categoriaId });
    if (errores.categoria) {
      setErrores({ ...errores, categoria: null });
    }
  };

  const toggleDisponibilidad = (dia) => {
    const nuevaDisponibilidad = formData.disponibilidad.includes(dia)
      ? formData.disponibilidad.filter(d => d !== dia)
      : [...formData.disponibilidad, dia];

    setFormData({ ...formData, disponibilidad: nuevaDisponibilidad });

    if (errores.disponibilidad && nuevaDisponibilidad.length > 0) {
      setErrores({ ...errores, disponibilidad: null });
    }
  };

  const handleImagePicker = () => {
    Alert.alert('Función no disponible', 'La selección de imágenes se implementará próximamente');
  };

  const renderCategoria = (categoria) => (
    <TouchableOpacity
      key={categoria.id}
      style={[
        styles.categoriaCard,
        { borderColor: categoria.color },
        formData.categoria === categoria.id && { backgroundColor: categoria.color + '20', borderWidth: 2 }
      ]}
      onPress={() => selectCategoria(categoria.id)}
    >
      <View style={[styles.categoriaIcon, { backgroundColor: categoria.color }]}>
        <Ionicons name={categoria.icono} size={24} color="#fff" />
      </View>
      <Text style={[
        styles.categoriaNombre,
        formData.categoria === categoria.id && { color: categoria.color, fontWeight: 'bold' }
      ]}>
        {categoria.nombre}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear nuevo servicio</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.proveedorInfo}>
          <View style={styles.proveedorAvatar}>
            <Ionicons name="person" size={24} color="#4a90e2" />
          </View>
          <View style={styles.proveedorDetails}>
            <Text style={styles.proveedorNombre}>{datosUsuario?.nombre || 'Tu nombre'}</Text>
            <Text style={styles.proveedorTipo}>Proveedor de servicios</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información básica</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre del servicio *</Text>
            <TextInput
              style={[styles.input, errores.nombre && styles.inputError]}
              value={formData.nombre}
              onChangeText={(text) => {
                setFormData({ ...formData, nombre: text });
                if (errores.nombre) setErrores({ ...errores, nombre: null });
              }}
              placeholder="Ej: Limpieza profunda de oficinas"
            />
            {errores.nombre && <Text style={styles.errorText}>{errores.nombre}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción detallada *</Text>
            <TextInput
              style={[styles.textArea, errores.descripcion && styles.inputError]}
              value={formData.descripcion}
              onChangeText={(text) => {
                setFormData({ ...formData, descripcion: text });
                if (errores.descripcion) setErrores({ ...errores, descripcion: null });
              }}
              placeholder="Describe en detalle qué incluye tu servicio, metodología, etc."
              multiline
              numberOfLines={4}
            />
            {errores.descripcion && <Text style={styles.errorText}>{errores.descripcion}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categoría del servicio *</Text>
          {errores.categoria && <Text style={styles.errorText}>{errores.categoria}</Text>}
          <View style={styles.categoriasGrid}>
            {categorias.map(renderCategoria)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precio y duración</Text>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>Precio (USD) *</Text>
              <TextInput
                style={[styles.input, errores.precio && styles.inputError]}
                value={formData.precio}
                onChangeText={(text) => {
                  setFormData({ ...formData, precio: text });
                  if (errores.precio) setErrores({ ...errores, precio: null });
                }}
                placeholder="120"
                keyboardType="numeric"
              />
              {errores.precio && <Text style={styles.errorText}>{errores.precio}</Text>}
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.inputLabel}>Duración estimada *</Text>
              <TextInput
                style={[styles.input, errores.duracion && styles.inputError]}
                value={formData.duracion}
                onChangeText={(text) => {
                  setFormData({ ...formData, duracion: text });
                  if (errores.duracion) setErrores({ ...errores, duracion: null });
                }}
                placeholder="2-3 horas"
              />
              {errores.duracion && <Text style={styles.errorText}>{errores.duracion}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilidad *</Text>
          {errores.disponibilidad && <Text style={styles.errorText}>{errores.disponibilidad}</Text>}
          <Text style={styles.sectionSubtitle}>Selecciona los días que puedes ofrecer este servicio</Text>

          <View style={styles.diasContainer}>
            {diasSemana.map(dia => (
              <TouchableOpacity
                key={dia.id}
                style={[
                  styles.diaButton,
                  formData.disponibilidad.includes(dia.id) && styles.diaButtonActive
                ]}
                onPress={() => toggleDisponibilidad(dia.id)}
              >
                <Text style={[
                  styles.diaText,
                  formData.disponibilidad.includes(dia.id) && styles.diaTextActive
                ]}>
                  {dia.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información adicional</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Requisitos especiales</Text>
            <TextInput
              style={styles.textArea}
              value={formData.requisitos}
              onChangeText={(text) => setFormData({ ...formData, requisitos: text })}
              placeholder="Ej: Acceso a toma de agua, espacio de estacionamiento, etc."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Experiencia y calificaciones</Text>
            <TextInput
              style={styles.textArea}
              value={formData.experiencia}
              onChangeText={(text) => setFormData({ ...formData, experiencia: text })}
              placeholder="Describe tu experiencia, años en el rubro, clientes destacados, etc."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Certificaciones</Text>
            <TextInput
              style={styles.input}
              value={formData.certificaciones}
              onChangeText={(text) => setFormData({ ...formData, certificaciones: text })}
              placeholder="Ej: ISO 9001, Certificación en higiene industrial, etc."
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imágenes del servicio</Text>
          <Text style={styles.sectionSubtitle}>
            Agrega fotos que muestren tu trabajo (opcional)
          </Text>

          <TouchableOpacity style={styles.imageUpload} onPress={handleImagePicker}>
            <Ionicons name="camera" size={32} color="#4a90e2" />
            <Text style={styles.imageUploadText}>Agregar imágenes</Text>
            <Text style={styles.imageUploadSubtext}>
              Toca para seleccionar fotos de trabajos anteriores
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creando...' : 'Crear servicio'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
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
  proveedorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  proveedorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  proveedorDetails: {
    flex: 1,
  },
  proveedorNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  proveedorTipo: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    color: '#2c3e50',
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    color: '#2c3e50',
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    marginTop: 5,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoriasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoriaCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoriaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoriaNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  diasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  diaButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
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
    fontWeight: '600',
  },
  diaTextActive: {
    color: '#fff',
  },
  imageUpload: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderStyle: 'dashed',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a90e2',
    marginTop: 8,
  },
  imageUploadSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#27ae60',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default CrearServicio;