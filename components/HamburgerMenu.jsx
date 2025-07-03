import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Animated,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

const HamburgerMenu = ({ visible, onClose, onLogout, isLoggingOut, navigation }) => {
  const slideAnim = React.useRef(new Animated.Value(-300)).current;

  const { tipoUsuario, usuario } = useSelector(state => state.auth);

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleNavigation = (screenName) => {
    onClose();

    setTimeout(() => {
      try {
        if (navigation && navigation.navigate) {
          navigation.navigate(screenName);
        } else {
        }
      } catch (error) {
        console.error(error);
      }
    }, 100);
  };

  const getMenuItems = () => {
    const baseItems = [
      {
        id: 1,
        title: 'Inicio',
        icon: 'home-outline',
        onPress: () => handleNavigation('InicioMain')
      },
      {
        id: 2,
        title: 'Mi cuenta',
        icon: 'person-outline',
        onPress: () => handleNavigation('MiCuenta')
      },
      {
        id: 3,
        title: 'Notificaciones',
        icon: 'notifications-outline',
        onPress: () => handleNavigation('Notificaciones')
      },
      {
        id: 8,
        title: 'Configuración',
        icon: 'settings-outline',
        onPress: () => handleNavigation('Configuracion')
      }
    ];

    if (tipoUsuario === 'administrador') {
      return [
        {
          id: 1,
          title: 'Dashboard',
          icon: 'grid-outline',
          onPress: () => handleNavigation('DashboardAdmin')
        },
        {
          id: 2,
          title: 'Usuarios',
          icon: 'people-outline',
          onPress: () => handleNavigation('GestionUsuarios')
        },
        {
          id: 3,
          title: 'Espacios',
          icon: 'business-outline',
          onPress: () => handleNavigation('GestionPublicaciones')
        },
        {
          id: 4,
          title: 'Reservas',
          icon: 'calendar-outline',
          onPress: () => handleNavigation('GestionReservas')
        },
        {
          id: 5,
          title: 'Proveedores',
          icon: 'construct-outline',
          onPress: () => handleNavigation('GestionProveedores')
        },
      ];
    } else if (tipoUsuario === 'usuario') {
      return [
        ...baseItems,
        {
          id: 4,
          title: 'Mis reservas',
          icon: 'calendar-outline',
          onPress: () => handleNavigation('Reservas')
        },
        {
          id: 5,
          title: 'Membresías',
          icon: 'star-outline',
          onPress: () => handleNavigation('Membresias')
        },
        {
          id: 6,
          title: 'Métodos de pago',
          icon: 'card-outline',
          onPress: () => handleNavigation('MetodosPago')
        }
      ];
    } else if (tipoUsuario === 'cliente') {
      return [
        ...baseItems,
        {
          id: 5,
          title: 'Crear publicación',
          icon: 'add-circle-outline',
          onPress: () => handleNavigation('CrearPublicacion')
        },
        {
          id: 7,
          title: 'Ganancias',
          icon: 'cash-outline',
          onPress: () => handleNavigation('GestionGanancias')
        }
      ];
    } else if (tipoUsuario === 'proveedor') {
      return [
        ...baseItems,
        {
          id: 4,
          title: 'Mis servicios',
          icon: 'construct-outline',
          onPress: () => handleNavigation('ServiciosProveedor')
        },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    if (!isLoggingOut) {
      onLogout();
    }
  };

  const getTipoUsuarioDisplay = () => {
    switch (tipoUsuario) {
      case 'usuario':
        return 'Usuario';
      case 'cliente':

        return usuario?.empresa || 'Cliente';
      case 'proveedor':

        return usuario?.servicio || 'Proveedor';
      case 'administrador':
        return 'Administrador';
      default:
        return '';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />

      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <TouchableOpacity activeOpacity={1} onPress={() => { }}>
            <Animated.View
              style={[
                styles.menuContainer,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                  <View style={styles.logoContainer}>
                    <View style={[
                      styles.logoCircle,
                      tipoUsuario === 'administrador' && { backgroundColor: '#ffe8e8' }
                    ]}>
                      <Ionicons
                        name={tipoUsuario === 'administrador' ? 'shield' : 'business'}
                        size={24}
                        color={tipoUsuario === 'administrador' ? '#e74c3c' : '#4a90e2'}
                      />
                    </View>
                    <View>
                      <Text style={styles.appName}>Officereserve</Text>
                      <Text style={styles.userType}>
                        {getTipoUsuarioDisplay()}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.menuItemsContainer, tipoUsuario === 'administrador' && styles.menuItemsContainerAdmin]}>
                  {menuItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.menuItem, tipoUsuario === 'administrador' && styles.menuItemAdmin]}
                      onPress={item.onPress}
                    >
                      <View style={styles.menuItemContent}>
                        <Ionicons
                          name={item.icon}
                          size={22}
                          color={tipoUsuario === 'administrador' ? '#e74c3c' : '#4a90e2'}
                          style={styles.menuIcon}
                        />
                        <Text style={styles.menuItemText}>{item.title}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.logoutContainer}>
                  <TouchableOpacity
                    style={[
                      styles.logoutButton,
                      isLoggingOut && styles.logoutButtonDisabled
                    ]}
                    onPress={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={22}
                      color="#e74c3c"
                      style={styles.logoutIcon}
                    />
                    <Text style={[
                      styles.logoutText,
                      isLoggingOut && styles.logoutTextDisabled
                    ]}>
                      {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  menuContainer: {
    width: 280,
    backgroundColor: '#ffffff',
    height: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f4fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  userType: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
    fontFamily: 'System',
  },
  menuItemsContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuItemsContainerAdmin: {
    paddingTop: 10,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemAdmin: {
    paddingVertical: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 15,
    width: 22,
  },
  menuItemText: {
    fontSize: 16,
    color: '#2c3e50',
    fontFamily: 'System',
    fontWeight: '500',
  },
  logoutContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fef5f5',
  },
  logoutButtonDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  logoutIcon: {
    marginRight: 12,
    width: 22,
  },
  logoutText: {
    fontSize: 16,
    color: '#e74c3c',
    fontFamily: 'System',
    fontWeight: '500',
  },
  logoutTextDisabled: {
    color: '#999',
  },
});

export default HamburgerMenu;