import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import { Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AgregarTarjeta from '../components/AgregarTarjeta';
import DetalleOficina from '../components/DetalleOficina';
import DetalleReserva from '../components/DetalleReserva';
import Estadisticas from '../components/Estadisticas';
import GestionGanancias from '../components/GestionGanancias';
import Inicio from '../components/Inicio';
import MetodosPago from '../components/MetodosPago';
import MiCuenta from '../components/MiCuenta';
import Reservas from '../components/Reservas';
import { desloguear } from '../store/slices/usuarioSlice';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const InicioStack = ({ setIsLogged, resetSession }) => {
  const { tipoUsuario } = useSelector(state => state.usuario);
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
      initialRouteName="InicioMain"
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
        name="MetodosPago" 
        component={MetodosPago}
      />
      <Stack.Screen 
        name="AgregarTarjeta" 
        component={AgregarTarjeta}
      />
      {tipoUsuario !== 'cliente' && (
        <Stack.Screen 
          name="Reservas" 
          component={Reservas}
        />
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
        </>
      )}
      <Stack.Screen 
        name="DetalleReserva" 
        component={DetalleReserva}
      />
    </Stack.Navigator>
  );
};

const Aplicacion = ({setIsLogged}) => {
    const dispatch = useDispatch();
    const { tipoUsuario } = useSelector(state => state.usuario);

    const cerrarSesion = async () => {
        try {
            await SecureStore.deleteItemAsync('isLogged');
            await SecureStore.deleteItemAsync('usuario');
            setIsLogged(false);
            dispatch(desloguear());
        } catch (error) {
            console.error('Error al eliminar la sesión:', error);
        }
    }

    const resetSession = async () => {
        try {
            await SecureStore.deleteItemAsync('isLogged');
            await SecureStore.deleteItemAsync('usuario');
            setIsLogged(false);
        } catch (error) {
            console.error('Error al resetear sesión:', error);
        }
    };

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
                    title: tipoUsuario === 'cliente' ? 'Mis Oficinas' : 'Inicio'
                }}
            >
                {props => (
                    <InicioStack 
                        {...props} 
                        setIsLogged={setIsLogged} 
                        resetSession={resetSession}
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
            
            {tipoUsuario === 'cliente' && (
                <>
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
            
            {tipoUsuario !== 'cliente' && (
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
                        name='MetodosPago' 
                        component={MetodosPago}
                        options={{
                            title: 'Métodos de pago',
                            headerShown: false 
                        }}
                    />
                </>
            )}
        </Drawer.Navigator>
    )
}

export default Aplicacion