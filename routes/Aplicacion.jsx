import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import { Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';


import AgregarTarjeta from '../components/AgregarTarjeta';
import BuscarProveedores from '../components/BuscarProveedores';
import CrearPublicacion from '../components/CrearPublicacion';
import CrearServicio from '../components/CrearServicio';
import DetalleOficina from '../components/DetalleOficina';
import DetalleReserva from '../components/DetalleReserva';
import Estadisticas from '../components/Estadisticas';
import FormularioProblema from '../components/FormularioProblema';
import GananciasProveedor from '../components/GananciasProveedor';
import GestionGanancias from '../components/GestionGanancias';
import GestionServicios from '../components/GestionServicios';
import Inicio from '../components/Inicio';
import Mapa from '../components/Mapa';
import Membresias from '../components/Membresias';
import MetodosPago from '../components/MetodosPago';
import MiCuenta from '../components/MiCuenta';
import Notificaciones from '../components/Notificaciones';
import OfrecerServicios from '../components/OfrecerServicios';
import Reservas from '../components/Reservas';
import ServiciosEspacio from '../components/ServiciosEspacio';
import ServiciosOfrecidos from '../components/ServiciosOfrecidos';
import ServiciosProveedor from '../components/ServiciosProveedor';
import SolicitudesServicio from '../components/SolicitudesServicio';
import Transacciones from '../components/Transacciones';

import ComisionesAdmin from '../components/ComisionesAdmin';
import ConfiguracionAdmin from '../components/ConfiguracionAdmin';
import DashboardAdmin from '../components/DashboardAdmin';
import GestionProveedores from '../components/GestionProveedores';
import GestionPublicaciones from '../components/GestionPublicaciones';
import GestionReservas from '../components/GestionReservas';
import GestionUsuarios from '../components/GestionUsuarios';
import NotificacionesAdmin from '../components/NotificacionesAdmin';
import ReportesAdmin from '../components/ReportesAdmin';
import SoporteAdmin from '../components/SoporteAdmin';
import TransaccionesAdmin from '../components/TransaccionesAdmin';

import Listar from './Listar';


import { desloguear } from '../store/slices/authSlice';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const InicioStack = ({ setIsLogged, resetSession }) => {
  
  const { tipoUsuario } = useSelector(state => state.auth);
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen 
        name="InicioMain"
      >
        {props => (
          <Inicio 
            {...props} 
            setIsLogged={setIsLogged} 
            resetSession={resetSession}
          />
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="DetalleOficina" 
        component={DetalleOficina}
      />
      <Stack.Screen 
        name="Notificaciones" 
        component={Notificaciones}
      />
      <Stack.Screen 
        name="Mapa" 
        component={Mapa}
      />
      <Stack.Screen 
        name="MiCuenta" 
        component={MiCuenta}
      />
      
      <Stack.Screen 
        name="Listar" 
        component={Listar}
        options={{
          headerShown: true,
          title: getListarTitle(tipoUsuario),
          headerStyle: {
            backgroundColor: getHeaderColor(tipoUsuario),
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      
      {tipoUsuario === 'administrador' && (
        <>
          <Stack.Screen 
            name="DashboardAdmin" 
            component={DashboardAdmin}
          />
          <Stack.Screen 
            name="GestionUsuarios" 
            component={GestionUsuarios}
          />
          <Stack.Screen 
            name="GestionPublicaciones" 
            component={GestionPublicaciones}
          />
          <Stack.Screen 
            name="GestionReservas" 
            component={GestionReservas}
          />
          <Stack.Screen 
            name="GestionProveedores" 
            component={GestionProveedores}
          />
          <Stack.Screen 
            name="TransaccionesAdmin" 
            component={TransaccionesAdmin}
          />
          <Stack.Screen 
            name="ComisionesAdmin" 
            component={ComisionesAdmin}
          />
          <Stack.Screen 
            name="ReportesAdmin" 
            component={ReportesAdmin}
          />
          <Stack.Screen 
            name="NotificacionesAdmin" 
            component={NotificacionesAdmin}
          />
          <Stack.Screen 
            name="ConfiguracionAdmin" 
            component={ConfiguracionAdmin}
          />
          <Stack.Screen 
            name="SoporteAdmin" 
            component={SoporteAdmin}
          />
        </>
      )}
      
      {tipoUsuario === 'usuario' && (
        <>
          <Stack.Screen 
            name="MetodosPago" 
            component={MetodosPago}
          />
          <Stack.Screen 
            name="AgregarTarjeta" 
            component={AgregarTarjeta}
          />
          <Stack.Screen 
            name="Transacciones" 
            component={Transacciones}
          />
          <Stack.Screen 
            name="FormularioProblema" 
            component={FormularioProblema}
          />
          <Stack.Screen 
            name="Reservas" 
            component={Reservas}
          />
          <Stack.Screen 
            name="DetalleReserva" 
            component={DetalleReserva}
          />
          <Stack.Screen 
            name="Membresias" 
            component={Membresias}
          />
        </>
      )}
      
      {tipoUsuario === 'cliente' && (
        <>
          <Stack.Screen 
            name="Estadisticas" 
            component={Estadisticas}
          />
          <Stack.Screen 
            name="GestionGanancias" 
            component={GestionGanancias}
          />
          <Stack.Screen 
            name="CrearPublicacion" 
            component={CrearPublicacion}
          />
          <Stack.Screen 
            name="GestionServicios" 
            component={GestionServicios}
          />
          <Stack.Screen 
            name="ServiciosEspacio" 
            component={ServiciosEspacio}
          />
          <Stack.Screen 
            name="ServiciosOfrecidos" 
            component={ServiciosOfrecidos}
          />
          <Stack.Screen 
            name="BuscarProveedores" 
            component={BuscarProveedores}
          />
          <Stack.Screen 
            name="Reservas" 
            component={Reservas}
          />
          <Stack.Screen 
            name="DetalleReserva" 
            component={DetalleReserva}
          />
          <Stack.Screen 
            name="FormularioProblema" 
            component={FormularioProblema}
          />
        </>
      )}
      
      {tipoUsuario === 'proveedor' && (
        <>
          <Stack.Screen 
            name="ServiciosProveedor" 
            component={ServiciosProveedor}
          />
          <Stack.Screen 
            name="CrearServicio" 
            component={CrearServicio}
          />
          <Stack.Screen 
            name="SolicitudesServicio" 
            component={SolicitudesServicio}
          />
          <Stack.Screen 
            name="GananciasProveedor" 
            component={GananciasProveedor}
          />
          <Stack.Screen 
            name="OfrecerServicios" 
            component={OfrecerServicios}
          />
          <Stack.Screen 
            name="FormularioProblema" 
            component={FormularioProblema}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const getListarTitle = (tipoUsuario) => {
  switch (tipoUsuario) {
    case 'administrador': 
      return 'Panel de Administración';
    case 'cliente':
      return 'Gestión de Servicios';
    case 'proveedor':
      return 'Mis Servicios';
    case 'usuario':
    default:
      return 'Mi Actividad';
  }
};

const getHeaderColor = (tipoUsuario) => {
  switch (tipoUsuario) {
    case 'administrador': 
      return '#2c3e50';
    case 'cliente':
      return '#3498db';
    case 'proveedor':
      return '#9b59b6';
    case 'usuario':
    default:
      return '#1abc9c';
  }
};

const Aplicacion = ({setIsLogged, resetSession}) => {
    const dispatch = useDispatch();
    
    const { tipoUsuario } = useSelector(state => state.auth);

    const cerrarSesion = async () => {
        try {
            await SecureStore.deleteItemAsync('isLogged');
            await SecureStore.deleteItemAsync('usuario');
            await SecureStore.deleteItemAsync('tipoUsuario');
            setIsLogged(false);
            dispatch(desloguear());
        } catch (error) {
            console.error('Error al eliminar la sesión:', error);
        }
    }

    const resetSessionInternal = async () => {
        try {
            await SecureStore.deleteItemAsync('isLogged');
            await SecureStore.deleteItemAsync('usuario');
            await SecureStore.deleteItemAsync('tipoUsuario');
            setIsLogged(false);
        } catch (error) {
            console.error('Error al resetear sesión:', error);
        }
    };

    const getTituloPrincipal = () => {
        switch (tipoUsuario) {
            case 'usuario':
                return 'Reservar espacios';
            case 'cliente':
                return 'Mis espacios';
            case 'proveedor':
                return 'Oportunidades de servicio';
            case 'administrador': 
                return 'Panel de Administración';
            default:
                return 'Inicio';
        }
    };

    if (tipoUsuario === 'administrador') {
        return (
            <Stack.Navigator
                screenOptions={{
                    headerShown: false
                }}
                initialRouteName="InicioStack"
            >
                <Stack.Screen 
                    name='InicioStack'
                >
                    {props => (
                        <InicioStack 
                            {...props} 
                            setIsLogged={setIsLogged} 
                            resetSession={resetSession || resetSessionInternal}
                        />
                    )}
                </Stack.Screen>
            </Stack.Navigator>
        );
    }

    return (
        <Drawer.Navigator 
            screenOptions={{ 
                headerRight: () => (<Button title='Cerrar sesion' onPress={cerrarSesion} />)
            }}
            initialRouteName="Inicio" 
        >
            <Drawer.Screen 
                name='Inicio' 
                options={{
                    headerShown: false,
                    title: getTituloPrincipal()
                }}
            >
                {props => (
                    <InicioStack 
                        {...props} 
                        setIsLogged={setIsLogged} 
                        resetSession={resetSession || resetSessionInternal}
                    />
                )}
            </Drawer.Screen>
            
            <Drawer.Screen 
                name='MiCuenta' 
                component={MiCuenta}
                options={{
                    title: 'Mi cuenta',
                    headerShown: false 
                }}
            />
            
            <Drawer.Screen 
                name='Notificaciones' 
                component={Notificaciones}
                options={{
                    title: 'Notificaciones',
                    headerShown: false 
                }}
            />
            
            <Drawer.Screen 
                name='Mapa' 
                component={Mapa}
                options={{
                    title: tipoUsuario === 'proveedor' ? 'Oportunidades' : 'Mapa de espacios',
                    headerShown: false 
                }}
            />

            <Drawer.Screen 
                name='Listar' 
                component={Listar}
                options={{
                    title: getListarTitle(tipoUsuario),
                    headerShown: false,
                    drawerIcon: ({ color, size }) => {
                        const iconName = tipoUsuario === 'administrador' ? 'settings' : 
                                        tipoUsuario === 'cliente' ? 'business' :
                                        tipoUsuario === 'proveedor' ? 'construct' : 'list';
                        return <Ionicons name={`${iconName}-outline`} size={size} color={color} />;
                    }
                }}
            />
            
            {tipoUsuario === 'usuario' && (
                <>
                    <Drawer.Screen 
                        name='Reservas' 
                        component={Reservas}
                        options={{
                            title: 'Mis Reservas',
                            headerShown: false 
                        }}
                    />
                    <Drawer.Screen 
                        name='Membresias' 
                        component={Membresias}
                        options={{
                            title: 'Membresías',
                            headerShown: false 
                        }}
                    />
                    <Drawer.Screen 
                        name='MetodosPago' 
                        component={MetodosPago}
                        options={{
                            title: 'Métodos de pago',
                            headerShown: false 
                        }}
                    />
                </>
            )}
            
            {tipoUsuario === 'cliente' && (
                <>
                    <Drawer.Screen 
                        name='CrearPublicacion' 
                        component={CrearPublicacion}
                        options={{
                            title: 'Crear publicación',
                            headerShown: false 
                        }}
                    />
                    <Drawer.Screen 
                        name='GestionServicios' 
                        component={GestionServicios}
                        options={{
                            title: 'Gestión de servicios',
                            headerShown: false 
                        }}
                    />
                    <Drawer.Screen 
                        name='Reservas' 
                        component={Reservas}
                        options={{
                            title: 'Reservas recibidas',
                            headerShown: false 
                        }}
                    />
                    <Drawer.Screen 
                        name='Estadisticas' 
                        component={Estadisticas}
                        options={{
                            title: 'Estadísticas',
                            headerShown: false 
                        }}
                    />
                    <Drawer.Screen 
                        name='GestionGanancias' 
                        component={GestionGanancias}
                        options={{
                            title: 'Ganancias',
                            headerShown: false 
                        }}
                    />
                </>
            )}
            
            {tipoUsuario === 'proveedor' && (
                <>
                    <Drawer.Screen 
                        name='ServiciosProveedor' 
                        component={ServiciosProveedor}
                        options={{
                            title: 'Mis Servicios',
                            headerShown: false 
                        }}
                    />
                    <Drawer.Screen 
                        name='CrearServicio' 
                        component={CrearServicio}
                        options={{
                            title: 'Crear servicio',
                            headerShown: false 
                        }}
                    />
                    <Drawer.Screen 
                        name='SolicitudesServicio' 
                        component={SolicitudesServicio}
                        options={{
                            title: 'Solicitudes',
                            headerShown: false 
                        }}
                    />
                    <Drawer.Screen 
                        name='GananciasProveedor' 
                        component={GananciasProveedor}
                        options={{
                            title: 'Mis Ganancias',
                            headerShown: false 
                        }}
                    />
                </>
            )}
        </Drawer.Navigator>
    )
}

export default Aplicacion