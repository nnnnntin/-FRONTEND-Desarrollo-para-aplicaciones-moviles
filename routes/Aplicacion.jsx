import { createDrawerNavigator } from '@react-navigation/drawer';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { Button } from 'react-native';
import { useDispatch } from 'react-redux';
import Inicio from '../components/Inicio';
import { desloguear } from '../store/slices/usuarioSlice';

const Drawer = createDrawerNavigator();

const Aplicacion = ({setIsLogged}) => {

    const dispatch = useDispatch();

    useEffect(() => {
        
        
    }, []);

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
                    headerShown: false 
                }}
            >
                {props => {
                    
                    return <Inicio {...props} setIsLogged={setIsLogged}/>;
                }}
            </Drawer.Screen>
        </Drawer.Navigator>
    )
}

export default Aplicacion