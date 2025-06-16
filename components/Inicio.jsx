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
import { useDispatch, useSelector } from 'react-redux';
import { desloguear } from '../store/slices/usuarioSlice';
import HamburgerMenu from './HamburgerMenu';

const Inicio = ({ navigation, setIsLogged, resetSession }) => {
  const [searchText, setSearchText] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dispatch = useDispatch();
  
  const { tipoUsuario, oficinasPropias, datosUsuario } = useSelector(state => state.usuario);

  const todasLasOficinas = [
    {
      id: 1,
      nombre: "Oficina Panorámica 'Skyview'",
      servicios: ['wifi', 'cafe', 'seguridad'],
      color: '#4a90e2',
      propietario: 'Cliente Demo'
    },
    {
      id: 2,
      nombre: "Oficina 'El mirador'",
      servicios: ['wifi', 'cafe', 'parking'],
      color: '#27ae60',
      propietario: 'Cliente Demo'
    },
    {
      id: 3,
      nombre: "Oficina 'Centro'",
      servicios: ['wifi', 'seguridad'],
      color: '#e74c3c',
      propietario: 'Otro Cliente'
    },
  ];

  const oficinas = tipoUsuario === 'cliente' 
    ? todasLasOficinas.filter(oficina => oficinasPropias.includes(oficina.id))
    : todasLasOficinas;

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleCloseMenu = () => {
    setMenuVisible(false);
  };

  const verDetalleOficina = (oficina) => {
    try {
      navigation.navigate('DetalleOficina', { 
        oficina,
        esPropia: oficinasPropias.includes(oficina.id) 
      });
    } catch (error) {      
      try {
        navigation.push('DetalleOficina', { 
          oficina,
          esPropia: oficinasPropias.includes(oficina.id)
        });
      } catch (pushError) {        
        try {
          navigation.navigate('Inicio', {
            screen: 'DetalleOficina',
            params: { 
              oficina,
              esPropia: oficinasPropias.includes(oficina.id)
            }
          });
        } catch (nestedError) {
          Alert.alert('Error', 'No se pudo navegar a los detalles de la oficina');
        }
      }
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);

      dispatch(desloguear());
      
      await SecureStore.deleteItemAsync('isLogged');
      
      await SecureStore.deleteItemAsync('usuario');
      
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

  const OficinaCard = ({ oficina }) => {
    const esPropia = oficinasPropias.includes(oficina.id);
    
    const handleVerDetalle = () => {
      verDetalleOficina(oficina);
    };

    return (
      <View style={styles.card}>
        <View style={[styles.cardImagePlaceholder, { backgroundColor: oficina.color }]}>
          <Ionicons name="business" size={40} color="white" />
          <Text style={styles.cardImageText}>Oficina</Text>
          {esPropia && (
            <View style={styles.propiaIndicator}>
              <Text style={styles.propiaText}>Tu oficina</Text>
            </View>
          )}
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
          
          <TouchableOpacity 
            style={styles.verButton}
            onPress={handleVerDetalle}
            activeOpacity={0.7}
          >
            <Text style={styles.verButtonText}>Ver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {tipoUsuario === 'cliente' ? 'Mis lugares' : 'Inicio'}
        </Text>
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
        
        {oficinas.length === 0 && tipoUsuario === 'cliente' ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={60} color="#bdc3c7" />
            <Text style={styles.emptyText}>No tienes oficinas registradas</Text>
            <Text style={styles.emptySubtext}>
              Contacta con nosotros para agregar tus oficinas
            </Text>
          </View>
        ) : (
          <View style={styles.oficinasContainer}>
            {oficinas.map((oficina) => (
              <OficinaCard key={oficina.id} oficina={oficina} />
            ))}
          </View>
        )}
      </ScrollView>

      <HamburgerMenu 
        visible={menuVisible}
        onClose={handleCloseMenu}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        navigation={navigation}
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
  welcomeContainer: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#d1e9f8',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#5a6c7d',
    marginTop: 4,
    fontFamily: 'System',
  },
  gananciasResumen: {
    backgroundColor: '#4a90e2',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  gananciasLeft: {
    flex: 1,
  },
  gananciasLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    fontFamily: 'System',
  },
  gananciasValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
    fontFamily: 'System',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 20,
    fontFamily: 'System',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'System',
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
    position: 'relative',
  },
  cardImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
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