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
import { useSelector } from 'react-redux';

const DetalleOficina = ({ navigation, route }) => {
  if (!route?.params?.oficina) {
    Alert.alert('Error', 'No se encontraron los datos de la oficina');
    navigation.goBack();
    return null;
  }

  const { oficina, esPropia } = route.params;
  const { tipoUsuario } = useSelector(state => state.usuario);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const detallesOficina = {
    1: {
      descripcion: "Reservar la mejor oficina panorámica de la ciudad. Moderno diseño moderno, excelente iluminación y servicios brindados.",
      amenidades: [
        "Café premium gratis",
        "Wi-Fi de alta velocidad",
        "Estacionamiento incluido"
      ],
      equipamiento: [
        "Wi-Fi gratis",
        "computadoras e impresoras",
        "Proyector HD"
      ],
      extras: [
        "Vigilancia 24 hrs acceso",
        "con código de seguridad",
        "Sistema de alarma"
      ],
      capacidad: [
        "Lunes - viernes",
        "08:00-18:00",
        "8 personas"
      ],
      precio: "1200USD",
      imagen: require('../assets/images/oficina-skyview.jpg') 
    },
    2: {
      descripcion: "Oficina con vista privilegiada al horizonte. Espacio cómodo y funcional con todos los servicios necesarios para tu productividad.",
      amenidades: [
        "Café premium gratis",
        "Wi-Fi de alta velocidad", 
        "Estacionamiento gratuito"
      ],
      equipamiento: [
        "Wi-Fi gratis",
        "computadoras e impresoras",
        "Sistema audiovisual"
      ],
      extras: [
        "Vigilancia 24 hrs",
        "Acceso con tarjeta",
        "Cámaras de seguridad"
      ],
      capacidad: [
        "Lunes - viernes",
        "07:00-19:00",
        "12 personas"
      ],
      precio: "1500USD",
      imagen: require('../assets/images/oficina-mirador.jpg')
    },
    3: {
      descripcion: "Ubicada en el corazón de la ciudad, perfecta para reuniones de negocios. Diseño elegante y profesional.",
      amenidades: [
        "Café premium gratis",
        "Wi-Fi de alta velocidad",
        "Recepcionista"
      ],
      equipamiento: [
        "Wi-Fi gratis",
        "computadoras e impresoras",
        "Mesa de conferencias"
      ],
      extras: [
        "Vigilancia 24 hrs",
        "Control de acceso",
        "Seguridad privada"
      ],
      capacidad: [
        "Lunes - sábado",
        "06:00-20:00",
        "6 personas"
      ],
      precio: "900USD",
      imagen: require('../assets/images/oficina-mirador.jpg')
    }
  };

  const detalle = detallesOficina[oficina.id] || detallesOficina[1];

  const handleReservar = () => {
    navigation.navigate('MetodosPago', {
      modoSeleccion: true,
      oficina: oficina,
      precio: detalle.precio
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    setEditData({
      descripcion: detalle.descripcion,
      precio: detalle.precio,
      horario: detalle.capacidad[1],
      capacidadPersonas: detalle.capacidad[2].split(' ')[0]
    });
    setIsEditing(true);
  };

  const handleSave = () => {
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
          onPress: () => {
            setIsEditing(false);
            Alert.alert('Éxito', 'Los cambios se han guardado correctamente');
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const InfoSection = ({ title, items, iconName }) => (
    <View style={styles.infoSection}>
      <View style={styles.sectionHeader}>
        <Ionicons name={iconName} size={20} color="#4a90e2" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {items.map((item, index) => (
        <Text key={index} style={styles.infoItem}>• {item}</Text>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleGoBack} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#4a90e2" />
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
          <View style={[styles.imagePlaceholder, { backgroundColor: oficina.color }]}>
            <Ionicons name="business" size={60} color="white" />
            <Text style={styles.imageText}>{oficina.nombre}</Text>
            {esPropia && (
              <View style={styles.propiaIndicator}>
                <Text style={styles.propiaText}>Tu oficina</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitleMain}>Descripción</Text>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={editData.descripcion}
              onChangeText={(text) => setEditData({...editData, descripcion: text})}
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={styles.description}>{detalle.descripcion}</Text>
          )}
        </View>

        {!isEditing ? (
          <>
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <InfoSection 
                  title="Amenidades destacadas"
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

            <View style={styles.bottomSection}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Precio</Text>
                <Text style={styles.price}>{detalle.precio}</Text>
              </View>
              
              {(!esPropia || tipoUsuario !== 'cliente') && (
                <TouchableOpacity 
                  style={styles.reservarButton}
                  onPress={handleReservar}
                  activeOpacity={0.8}
                >
                  <Text style={styles.reservarButtonText}>RESERVAR</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <View style={styles.editSection}>
            <View style={styles.editField}>
              <Text style={styles.editLabel}>Precio</Text>
              <TextInput
                style={styles.editInput}
                value={editData.precio}
                onChangeText={(text) => setEditData({...editData, precio: text})}
                placeholder="Ej: 1200USD"
              />
            </View>

            <View style={styles.editField}>
              <Text style={styles.editLabel}>Horario</Text>
              <TextInput
                style={styles.editInput}
                value={editData.horario}
                onChangeText={(text) => setEditData({...editData, horario: text})}
                placeholder="Ej: 08:00-18:00"
              />
            </View>

            <View style={styles.editField}>
              <Text style={styles.editLabel}>Capacidad (personas)</Text>
              <TextInput
                style={styles.editInput}
                value={editData.capacidadPersonas}
                onChangeText={(text) => setEditData({...editData, capacidadPersonas: text})}
                placeholder="Ej: 8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.editButtons}>
              <TouchableOpacity 
                style={[styles.editButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.editButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  editButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
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
  imageContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  propiaIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  propiaText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#27ae60',
    fontFamily: 'System',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitleMain: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    fontFamily: 'System',
  },
  description: {
    fontSize: 16,
    color: '#5a6c7d',
    lineHeight: 24,
    fontFamily: 'System',
  },
  infoGrid: {
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
    fontFamily: 'System',
  },
  infoItem: {
    fontSize: 12,
    color: '#5a6c7d',
    marginBottom: 4,
    fontFamily: 'System',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 16,
    color: '#5a6c7d',
    fontFamily: 'System',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  reservarButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 8,
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
    fontFamily: 'System',
  },
  editSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  editField: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: 'System',
  },
  editInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
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
    fontFamily: 'System',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default DetalleOficina;