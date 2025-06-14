import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HamburgerMenu = ({ visible, onClose, onLogout, isLoggingOut }) => {
  const slideAnim = React.useRef(new Animated.Value(-300)).current;

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

  const menuItems = [
    {
      id: 1,
      title: 'Inicio',
      icon: 'home-outline',
      onPress: () => {
        onClose();
      }
    },
    {
      id: 2,
      title: 'Mi cuenta',
      icon: 'person-outline',
      onPress: () => {
        onClose();
      }
    },
    {
      id: 3,
      title: 'Reservas',
      icon: 'calendar-outline',
      onPress: () => {
        onClose();
      }
    },
    {
      id: 4,
      title: 'Pagos',
      icon: 'card-outline',
      onPress: () => {
        onClose();
      }
    }
  ];

  const handleLogout = () => {
    if (!isLoggingOut) {
      onLogout();
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
      
      {/* Overlay de fondo oscuro */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          {/* Menú deslizable */}
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <Animated.View
              style={[
                styles.menuContainer,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <SafeAreaView style={styles.safeArea}>
                {/* Header del menú */}
                <View style={styles.header}>
                  <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                      <Ionicons name="business" size={24} color="#4a90e2" />
                    </View>
                    <Text style={styles.appName}>Officereserve</Text>
                  </View>
                </View>

                {/* Elementos del menú */}
                <View style={styles.menuItemsContainer}>
                  {menuItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.menuItem}
                      onPress={item.onPress}
                    >
                      <View style={styles.menuItemContent}>
                        <Ionicons 
                          name={item.icon} 
                          size={22} 
                          color="#4a90e2" 
                          style={styles.menuIcon}
                        />
                        <Text style={styles.menuItemText}>{item.title}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Botón de cerrar sesión */}
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
  menuItemsContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
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