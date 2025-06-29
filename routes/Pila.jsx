import { createStackNavigator } from '@react-navigation/stack';
import Login from '../components/Login';
import Registro from '../components/Registro';
import RestablecerContraseña from '../components/RestablecerContraseña';

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
      initialRouteName="Login"
    >
      <Stack.Screen name="Login">
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