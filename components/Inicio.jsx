import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
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
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { desloguear } from '../store/slices/usuarioSlice';
import HamburgerMenu from './HamburgerMenu';

const Inicio = ({ navigation, setIsLogged, resetSession }) => {
  const [searchText, setSearchText] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dispatch = useDispatch();

  const oficinas = [
    {
      id: 1,
      nombre: "Oficina Panorámica 'Skyview'",
      servicios: ['wifi', 'cafe', 'seguridad'],
      color: '#4a90e2'
    },
    {
      id: 2,
      nombre: "Oficina 'El mirador'",
      servicios: ['wifi', 'cafe', 'parking'],
      color: '#27ae60'
    },
    {
      id: 3,
      nombre: "Oficina 'Centro'",
      servicios: ['wifi', 'seguridad'],
      color: '#e74c3c'
    },
  ];

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleCloseMenu = () => {
    setMenuVisible(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);

      dispatch(desloguear());
      
      try {
        await SecureStore.deleteItemAsync('isLogged');
      } catch (error) {
      }
      
      try {
        await SecureStore.deleteItemAsync('usuario');
      } catch (error) {
      }
      
      setMenuVisible(false);
      
      setTimeout(() => {
        setIsLogged(false);
        
        Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente');
      }, 300);
      
    } catch (error) {
      
      dispatch(desloguear());
      setMenuVisible(false);
      
      setTimeout(() => {
        setIsLogged(false);
      }, 300);
      
    } finally {
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 500);
    }
  };

  const renderServiceIcon = (service) => {
    switch (service) {
      case 'wifi':
        return <Ionicons name="wifi" size={20} color="#4a90e2" />;
      case 'cafe':
        return <Ionicons name="cafe" size={20} color="#4a90e2" />;
      case 'seguridad':
        return <Ionicons name="shield-checkmark" size={20} color="#4a90e2" />;
      case 'parking':
        return <Ionicons name="car" size={20} color="#4a90e2" />;
      default:
        return <Ionicons name="checkmark-circle" size={20} color="#4a90e2" />;
    }
  };

  const OficinaCard = ({ oficina }) => (
    <View style={styles.card}>
      <View style={[styles.cardImagePlaceholder, { backgroundColor: oficina.color }]}>
        <Ionicons name="business" size={40} color="white" />
        <Text style={styles.cardImageText}>Oficina</Text>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{oficina.nombre}</Text>
        
        <View style={styles.servicesContainer}>
          <Text style={styles.servicesLabel}>Servicios</Text>
          <View style={styles.servicesIcons}>
            {oficina.servicios.map((service, index) => (
              <View key={index} style={styles.serviceIcon}>
                {renderServiceIcon(service)}
              </View>
            ))}
          </View>
        </View>
        
        <TouchableOpacity style={styles.verButton}>
          <Text style={styles.verButtonText}>Ver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inicio</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <View style={styles.oficinasContainer}>
          {oficinas.map((oficina) => (
            <OficinaCard key={oficina.id} oficina={oficina} />
          ))}
        </View>
      </ScrollView>

      <HamburgerMenu 
        visible={menuVisible}
        onClose={handleCloseMenu}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
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
  menuButton: {
    width: 30,
    height: 20,
    justifyContent: 'space-between',
    padding: 5,
  },
  hamburgerLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#4a90e2',
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    fontFamily: 'System',
    color: '#2c3e50',
  },
  oficinasContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    fontFamily: 'System',
  },
  servicesContainer: {
    marginBottom: 15,
  },
  servicesLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
    fontFamily: 'System',
  },
  servicesIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    marginRight: 15,
    padding: 8,
    backgroundColor: '#f1f3f4',
    borderRadius: 20,
  },
  verButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  verButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
});

export default Inicio;