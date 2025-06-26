import { createStackNavigator } from '@react-navigation/stack';
import Login from '../components/Login';
import Registro from '../components/Registro';
import RestablecerContraseña from '../components/RestablecerContraseña';
import RestablecerMail from '../components/RestablecerMail';

const Stack = createStackNavigator();

const Pila = ({ setIsLogged, resetSession }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
        gestureEnabled: true,
        animationEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
      initialRouteName="Iniciar sesión"
    >
      <Stack.Screen name="Iniciar sesión">
        {props => (
          <Login
            {...props}
            setIsLogged={setIsLogged}
            resetSession={resetSession}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="Registro"
        options={{
          headerShown: true,
          title: 'Crear Cuenta',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
        }}
      >
        {props => (
          <Registro
            {...props}
            setIsLogged={setIsLogged}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="RestablecerMail"
        options={{
          headerShown: true,
          title: 'Recuperar Contraseña',
          headerStyle: {
            backgroundColor: '#e74c3c',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
        }}
      >
        {props => (
          <RestablecerMail
            {...props}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="RestablecerContraseña"
        options={{
          headerShown: true,
          title: 'Nueva Contraseña',
          headerStyle: {
            backgroundColor: '#e74c3c',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
          headerLeft: null,
        }}
      >
        {props => (
          <RestablecerContraseña
            {...props}
            setIsLogged={setIsLogged}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default Pila;