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
  const { loading, error } = useSelector(state => state.proveedores);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    precio: '',
    unidadPrecio: 'por_uso',
    disponibilidad: {
      diasDisponibles: [],
      horaInicio: '',
      horaFin: ''
    },
    tiempoAnticipacion: '',
    requiereAprobacion: false,
    espaciosDisponibles: []
  });

  const [errores, setErrores] = useState({});

  const categorias = [
    { id: 'catering', nombre: 'Catering', icono: 'restaurant', color: '#e74c3c' },
    { id: 'limpieza', nombre: 'Limpieza', icono: 'sparkles', color: '#3498db' },
    { id: 'recepcion', nombre: 'Recepción', icono: 'people', color: '#9b59b6' },
    { id: 'parking', nombre: 'Parking', icono: 'car', color: '#2ecc71' },
    { id: 'impresion', nombre: 'Impresión', icono: 'print', color: '#f39c12' },
    { id: 'otro', nombre: 'Otro', icono: 'ellipse', color: '#95a5a6' }
  ];

  const diasSemana = [
    { id: 'lunes', nombre: 'Lunes' },
    { id: 'martes', nombre: 'Martes' },
    { id: 'miércoles', nombre: 'Miércoles' },
    { id: 'jueves', nombre: 'Jueves' },
    { id: 'viernes', nombre: 'Viernes' },
    { id: 'sábado', nombre: 'Sábado' },
    { id: 'domingo', nombre: 'Domingo' }
  ];

  const unidadesPrecio = [
    { id: 'por_uso', nombre: 'Por uso' },
    { id: 'por_hora', nombre: 'Por hora' },
    { id: 'por_persona', nombre: 'Por persona' },
    { id: 'por_dia', nombre: 'Por día' }
  ];

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del servicio es obligatorio';
    }

    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    }

    if (!formData.tipo) {
      nuevosErrores.tipo = 'Selecciona una categoría';
    }

    if (!formData.precio.trim()) {
      nuevosErrores.precio = 'El precio es obligatorio';
    } else if (isNaN(parseFloat(formData.precio)) || parseFloat(formData.precio) < 0) {
      nuevosErrores.precio = 'Ingresa un precio válido (mayor o igual a 0)';
    }

    if (formData.disponibilidad.diasDisponibles.length === 0) {
      nuevosErrores.disponibilidad = 'Selecciona al menos un día de disponibilidad';
    }

    if (formData.disponibilidad.horaInicio && formData.disponibilidad.horaFin) {
      const horaInicioValid = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.disponibilidad.horaInicio);
      const horaFinValid = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.disponibilidad.horaFin);
      
      if (!horaInicioValid) {
        nuevosErrores.horaInicio = 'Formato de hora inválido (HH:MM)';
      }
      if (!horaFinValid) {
        nuevosErrores.horaFin = 'Formato de hora inválido (HH:MM)';
      }
    }

    if (formData.tiempoAnticipacion && (isNaN(parseInt(formData.tiempoAnticipacion)) || parseInt(formData.tiempoAnticipacion) < 0)) {
      nuevosErrores.tiempoAnticipacion = 'El tiempo de anticipación debe ser un número entero mayor o igual a 0';
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
      tipo: formData.tipo,
      precio: parseFloat(formData.precio),
      unidadPrecio: formData.unidadPrecio,
      disponibilidad: {
        diasDisponibles: formData.disponibilidad.diasDisponibles,
        ...(formData.disponibilidad.horaInicio && { horaInicio: formData.disponibilidad.horaInicio }),
        ...(formData.disponibilidad.horaFin && { horaFin: formData.disponibilidad.horaFin })
      },
      ...(formData.tiempoAnticipacion && { tiempoAnticipacion: parseInt(formData.tiempoAnticipacion) }),
      requiereAprobacion: formData.requiereAprobacion,
      proveedorId: datosUsuario?._id,
      activo: true,
      ...(formData.espaciosDisponibles.length > 0 && { espaciosDisponibles: formData.espaciosDisponibles })
    };

    try {
      const result = await dispatch(crearServicioAdicional(servicioData));

      if (crearServicioAdicional.fulfilled.match(result)) {
        Alert.alert(
          'Servicio creado',
          'Tu servicio ha sido creado exitosamente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ServiciosProveedor')
            }
          ]
        );
      } else {
        Alert.alert('Error', result.payload || 'No se pudo crear el servicio');
      }
    } catch (error) {
      console.error('Error al crear servicio:', error);
      Alert.alert('Error', 'Ocurrió un error al crear el servicio');
    }
  };

  const selectCategoria = (categoriaId) => {
    setFormData({ ...formData, tipo: categoriaId });
    if (errores.tipo) {
      setErrores({ ...errores, tipo: null });
    }
  };

  const toggleDisponibilidad = (dia) => {
    const nuevaDisponibilidad = formData.disponibilidad.diasDisponibles.includes(dia)
      ? formData.disponibilidad.diasDisponibles.filter(d => d !== dia)
      : [...formData.disponibilidad.diasDisponibles, dia];

    setFormData({ 
      ...formData, 
      disponibilidad: {
        ...formData.disponibilidad,
        diasDisponibles: nuevaDisponibilidad
      }
    });

    if (errores.disponibilidad && nuevaDisponibilidad.length > 0) {
      setErrores({ ...errores, disponibilidad: null });
    }
  };

  const selectUnidadPrecio = (unidad) => {
    setFormData({ ...formData, unidadPrecio: unidad });
  };

  const renderCategoria = (categoria) => (
    <TouchableOpacity
      key={categoria.id}
      style={[
        styles.categoriaCard,
        { borderColor: categoria.color },
        formData.tipo === categoria.id && { backgroundColor: categoria.color + '20', borderWidth: 2 }
      ]}
      onPress={() => selectCategoria(categoria.id)}
    >
      <View style={[styles.categoriaIcon, { backgroundColor: categoria.color }]}>
        <Ionicons name={categoria.icono} size={24} color="#fff" />
      </View>
      <Text style={[
        styles.categoriaNombre,
        formData.tipo === categoria.id && { color: categoria.color, fontWeight: 'bold' }
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
          {errores.tipo && <Text style={styles.errorText}>{errores.tipo}</Text>}
          <View style={styles.categoriasGrid}>
            {categorias.map(renderCategoria)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precio y configuración</Text>

          <View style={styles.inputGroup}>
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

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Unidad de precio *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unidadContainer}>
              {unidadesPrecio.map((unidad) => (
                <TouchableOpacity
                  key={unidad.id}
                  style={[
                    styles.unidadButton,
                    formData.unidadPrecio === unidad.id && styles.unidadButtonActive
                  ]}
                  onPress={() => selectUnidadPrecio(unidad.id)}
                >
                  <Text style={[
                    styles.unidadButtonText,
                    formData.unidadPrecio === unidad.id && styles.unidadButtonTextActive
                  ]}>
                    {unidad.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tiempo de anticipación (horas)</Text>
            <TextInput
              style={[styles.input, errores.tiempoAnticipacion && styles.inputError]}
              value={formData.tiempoAnticipacion}
              onChangeText={(text) => {
                setFormData({ ...formData, tiempoAnticipacion: text });
                if (errores.tiempoAnticipacion) setErrores({ ...errores, tiempoAnticipacion: null });
              }}
              placeholder="24"
              keyboardType="numeric"
            />
            {errores.tiempoAnticipacion && <Text style={styles.errorText}>{errores.tiempoAnticipacion}</Text>}
            <Text style={styles.inputHelp}>Tiempo mínimo requerido para solicitar el servicio</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFormData({ ...formData, requiereAprobacion: !formData.requiereAprobacion })}
            >
              <Ionicons
                name={formData.requiereAprobacion ? 'checkbox' : 'square-outline'}
                size={24}
                color={formData.requiereAprobacion ? '#27ae60' : '#7f8c8d'}
              />
              <Text style={styles.checkboxText}>Requiere aprobación previa</Text>
            </TouchableOpacity>
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
                  formData.disponibilidad.diasDisponibles.includes(dia.id) && styles.diaButtonActive
                ]}
                onPress={() => toggleDisponibilidad(dia.id)}
              >
                <Text style={[
                  styles.diaText,
                  formData.disponibilidad.diasDisponibles.includes(dia.id) && styles.diaTextActive
                ]}>
                  {dia.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.horariosContainer}>
            <Text style={styles.inputLabel}>Horarios de disponibilidad (opcional)</Text>
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Hora inicio</Text>
                <TextInput
                  style={[styles.input, errores.horaInicio && styles.inputError]}
                  value={formData.disponibilidad.horaInicio}
                  onChangeText={(text) => {
                    setFormData({ 
                      ...formData, 
                      disponibilidad: { ...formData.disponibilidad, horaInicio: text }
                    });
                    if (errores.horaInicio) setErrores({ ...errores, horaInicio: null });
                  }}
                  placeholder="09:00"
                />
                {errores.horaInicio && <Text style={styles.errorText}>{errores.horaInicio}</Text>}
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Hora fin</Text>
                <TextInput
                  style={[styles.input, errores.horaFin && styles.inputError]}
                  value={formData.disponibilidad.horaFin}
                  onChangeText={(text) => {
                    setFormData({ 
                      ...formData, 
                      disponibilidad: { ...formData.disponibilidad, horaFin: text }
                    });
                    if (errores.horaFin) setErrores({ ...errores, horaFin: null });
                  }}
                  placeholder="17:00"
                />
                {errores.horaFin && <Text style={styles.errorText}>{errores.horaFin}</Text>}
              </View>
            </View>
          </View>
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
  inputHelp: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
    fontStyle: 'italic',
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
  unidadContainer: {
    marginBottom: 10,
  },
  unidadButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    marginRight: 10,
  },
  unidadButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  unidadButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  unidadButtonTextActive: {
    color: '#fff',
  },
  checkboxContainer: {
    marginTop: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  diasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
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
  horariosContainer: {
    marginTop: 15,
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
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
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