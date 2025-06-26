import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import ComisionesAdmin from '../components/ComisionesAdmin';
import Estadisticas from '../components/Estadisticas';
import GananciasProveedor from '../components/GananciasProveedor';
import GestionGanancias from '../components/GestionGanancias';
import GestionProveedores from '../components/GestionProveedores';
import GestionPublicaciones from '../components/GestionPublicaciones';
import GestionReservas from '../components/GestionReservas';
import GestionServicios from '../components/GestionServicios';
import GestionUsuarios from '../components/GestionUsuarios';
import Membresias from '../components/Membresias';
import MetodosPago from '../components/MetodosPago';
import ReportesAdmin from '../components/ReportesAdmin';
import Reservas from '../components/Reservas';
import ServiciosOfrecidos from '../components/ServiciosOfrecidos';
import ServiciosProveedor from '../components/ServiciosProveedor';
import SolicitudesServicio from '../components/SolicitudesServicio';
import Transacciones from '../components/Transacciones';
import TransaccionesAdmin from '../components/TransaccionesAdmin';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AdminGestionStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#2c3e50',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="GestionUsuarios"
      component={GestionUsuarios}
      options={{ title: 'Gestión de Usuarios' }}
    />
    <Stack.Screen
      name="GestionProveedores"
      component={GestionProveedores}
      options={{ title: 'Gestión de Proveedores' }}
    />
    <Stack.Screen
      name="GestionPublicaciones"
      component={GestionPublicaciones}
      options={{ title: 'Gestión de Publicaciones' }}
    />
    <Stack.Screen
      name="GestionReservas"
      component={GestionReservas}
      options={{ title: 'Gestión de Reservas' }}
    />
  </Stack.Navigator>
);

const AdminFinanzasStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#27ae60',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="TransaccionesAdmin"
      component={TransaccionesAdmin}
      options={{ title: 'Transacciones' }}
    />
    <Stack.Screen
      name="ComisionesAdmin"
      component={ComisionesAdmin}
      options={{ title: 'Comisiones' }}
    />
    <Stack.Screen
      name="ReportesAdmin"
      component={ReportesAdmin}
      options={{ title: 'Reportes Financieros' }}
    />
  </Stack.Navigator>
);

const ClienteServiciosStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#3498db',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="GestionServicios"
      component={GestionServicios}
      options={{ title: 'Mis Servicios' }}
    />
    <Stack.Screen
      name="ServiciosOfrecidos"
      component={ServiciosOfrecidos}
      options={{ title: 'Servicios Ofrecidos' }}
    />
    <Stack.Screen
      name="Estadisticas"
      component={Estadisticas}
      options={{ title: 'Estadísticas' }}
    />
  </Stack.Navigator>
);

const ClienteFinanzasStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#f39c12',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="GestionGanancias"
      component={GestionGanancias}
      options={{ title: 'Mis Ganancias' }}
    />
    <Stack.Screen
      name="Reservas"
      component={Reservas}
      options={{ title: 'Reservas Recibidas' }}
    />
  </Stack.Navigator>
);

const ProveedorServiciosStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#9b59b6',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="ServiciosProveedor"
      component={ServiciosProveedor}
      options={{ title: 'Mis Servicios' }}
    />
    <Stack.Screen
      name="SolicitudesServicio"
      component={SolicitudesServicio}
      options={{ title: 'Solicitudes' }}
    />
    <Stack.Screen
      name="GananciasProveedor"
      component={GananciasProveedor}
      options={{ title: 'Mis Ganancias' }}
    />
  </Stack.Navigator>
);

const UsuarioActividadStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#1abc9c',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="Reservas"
      component={Reservas}
      options={{ title: 'Mis Reservas' }}
    />
    <Stack.Screen
      name="Transacciones"
      component={Transacciones}
      options={{ title: 'Mis Transacciones' }}
    />
    <Stack.Screen
      name="Membresias"
      component={Membresias}
      options={{ title: 'Membresías' }}
    />
  </Stack.Navigator>
);

const UsuarioPagosStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#e67e22',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="MetodosPago"
      component={MetodosPago}
      options={{ title: 'Métodos de Pago' }}
    />
  </Stack.Navigator>
);

const Listar = () => {
  const { tipoUsuario } = useSelector(state => state.usuario);

  const getTabScreens = () => {
    switch (tipoUsuario) {
      case 'admin':
        return (
          <>
            <Tab.Screen
              name="AdminGestion"
              component={AdminGestionStack}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="settings-outline" size={size} color={color} />
                ),
                tabBarLabel: 'Gestión',
                headerShown: false
              }}
            />
            <Tab.Screen
              name="AdminFinanzas"
              component={AdminFinanzasStack}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="analytics-outline" size={size} color={color} />
                ),
                tabBarLabel: 'Finanzas',
                headerShown: false
              }}
            />
          </>
        );

      case 'cliente':
        return (
          <>
            <Tab.Screen
              name="ClienteServicios"
              component={ClienteServiciosStack}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="business-outline" size={size} color={color} />
                ),
                tabBarLabel: 'Servicios',
                headerShown: false
              }}
            />
            <Tab.Screen
              name="ClienteFinanzas"
              component={ClienteFinanzasStack}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="wallet-outline" size={size} color={color} />
                ),
                tabBarLabel: 'Finanzas',
                headerShown: false
              }}
            />
          </>
        );

      case 'proveedor':
        return (
          <>
            <Tab.Screen
              name="ProveedorServicios"
              component={ProveedorServiciosStack}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="construct-outline" size={size} color={color} />
                ),
                tabBarLabel: 'Mis Servicios',
                headerShown: false
              }}
            />
          </>
        );

      case 'usuario':
      default:
        return (
          <>
            <Tab.Screen
              name="UsuarioActividad"
              component={UsuarioActividadStack}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="list-outline" size={size} color={color} />
                ),
                tabBarLabel: 'Actividad',
                headerShown: false
              }}
            />
            <Tab.Screen
              name="UsuarioPagos"
              component={UsuarioPagosStack}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="card-outline" size={size} color={color} />
                ),
                tabBarLabel: 'Pagos',
                headerShown: false
              }}
            />
          </>
        );
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e1e8ed',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      {getTabScreens()}
    </Tab.Navigator>
  );
};

export default Listar;