import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const ServiciosEspacio = ({ navigation, route }) => {
  const { oficina } = route.params;

  const [serviciosIncluidos, setServiciosIncluidos] = useState([
    { id: 1, nombre: 'Wi-Fi Premium', descripcion: 'Internet de alta velocidad 100MB', precio: 0, activo: true },
    { id: 2, nombre: 'Café gratis', descripcion: 'Café ilimitado durante la estadía', precio: 0, activo: true },
    { id: 3, nombre: 'Estacionamiento', descripcion: 'Plaza de estacionamiento incluida', precio: 0, activo: true },
    { id: 4, nombre: 'Recepcionista', descripcion: 'Servicio de recepción 8AM-6PM', precio: 0, activo: false },
    { id: 5, nombre: 'Aire acondicionado', descripcion: 'Climatización automática', precio: 0, activo: true },
    { id: 6, nombre: 'Seguridad 24h', descripcion: 'Vigilancia las 24 horas', precio: 0, activo: false },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '0'
  });

  const toggleServicio = (servicioId) => {
    setServiciosIncluidos(prev => prev.map(servicio =>
      servicio.id === servicioId
        ? { ...servicio, activo: !servicio.activo }
        : servicio
    ));
  };

  const handleEditServicio = (servicio) => {
    setEditingService(servicio);
    setFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: servicio.precio.toString()
    });
    setModalVisible(true);
  };

  const handleAddServicio = () => {
    setEditingService(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '0'
    });
    setModalVisible(true);
  };

  const handleSaveServicio = () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre del servicio es obligatorio');
      return;
    }

    const servicioData = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      precio: parseFloat(formData.precio) || 0
    };

    if (editingService) {
      setServiciosIncluidos(prev => prev.map(servicio =>
        servicio.id === editingService.id
          ? { ...servicio, ...servicioData }
          : servicio
      ));
    } else {
      const newService = {
        id: Date.now(),
        ...servicioData,
        activo: true
      };
      setServiciosIncluidos(prev => [...prev, newService]);
    }

    setModalVisible(false);
    setEditingService(null);
  };

  const handleDeleteServicio = (servicioId) => {
    Alert.alert(
      'Eliminar servicio',
      '¿Estás seguro de que quieres eliminar este servicio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setServiciosIncluidos(prev =>
              prev.filter(servicio => servicio.id !== servicioId)
            );
          }
        }
      ]
    );
  };

  const renderServicio = ({ item: servicio }) => (
    <View style={[styles.servicioItem, !servicio.activo && styles.servicioInactivo]}>
      <View style={styles.servicioInfo}>
        <Text style={[styles.servicioNombre, !servicio.activo && styles.textoInactivo]}>
          {servicio.nombre}
        </Text>
        <Text style={[styles.servicioDescripcion, !servicio.activo && styles.textoInactivo]}>
          {servicio.descripcion}
        </Text>
        {servicio.precio > 0 && (
          <Text style={styles.servicioPrecio}>
            +${servicio.precio}/día
          </Text>
        )}
      </View>

      <View style={styles.servicioActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditServicio(servicio)}
        >
          <Ionicons name="create-outline" size={20} color="#4a90e2" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteServicio(servicio.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, servicio.activo && styles.toggleButtonActive]}
          onPress={() => toggleServicio(servicio.id)}
        >
          <Ionicons
            name={servicio.activo ? 'checkmark' : 'close'}
            size={20}
            color={servicio.activo ? '#fff' : '#7f8c8d'}
          />
        </TouchableOpacity>
      </View>
    </View>
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
        <Text style={styles.headerTitle}>Servicios incluidos</Text>
        <TouchableOpacity
          onPress={handleAddServicio}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.espacioNombre}>{oficina.nombre}</Text>
        <Text style={styles.infoText}>
          Gestiona los servicios que están incluidos en el precio base de tu espacio
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {serviciosIncluidos.filter(s => s.activo).length}
          </Text>
          <Text style={styles.statLabel}>Servicios activos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {serviciosIncluidos.filter(s => !s.activo).length}
          </Text>
          <Text style={styles.statLabel}>Servicios inactivos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {serviciosIncluidos.filter(s => s.precio > 0).length}
          </Text>
          <Text style={styles.statLabel}>Con costo adicional</Text>
        </View>
      </View>

      <FlatList
        data={serviciosIncluidos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderServicio}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingService ? 'Editar servicio' : 'Agregar servicio'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre del servicio *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nombre}
                  onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                  placeholder="Ej: Wi-Fi Premium"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.descripcion}
                  onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                  placeholder="Describe brevemente el servicio"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Precio adicional (USD)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.precio}
                  onChangeText={(text) => setFormData({ ...formData, precio: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
                <Text style={styles.helpText}>
                  Deja en 0 si está incluido en el precio base
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveServicio}
              >
                <Text style={styles.saveButtonText}>
                  {editingService ? 'Guardar' : 'Agregar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  addButton: {
    padding: 5,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  espacioNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  lista: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  servicioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  servicioInactivo: {
    opacity: 0.6,
  },
  servicioInfo: {
    flex: 1,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  servicioDescripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  servicioPrecio: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e74c3c',
  },
  textoInactivo: {
    color: '#bdc3c7',
  },
  servicioActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  toggleButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalContent: {
    padding: 20,
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
    height: 80,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ServiciosEspacio;