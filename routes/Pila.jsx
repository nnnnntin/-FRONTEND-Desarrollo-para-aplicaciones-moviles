import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
import Login from '../components/Login.jsx';
import Registro from '../components/Registro.jsx';

const Stack = createStackNavigator();

const Pila = ({setIsLogged}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
        <Stack.Screen name='login'> 
            {props => <Login {...props} setIsLogged={setIsLogged}/>}
        </Stack.Screen>
        
        <Stack.Screen name='Registro' component={Registro} />
    </Stack.Navigator>
  )
}

export default Pila

const styles = StyleSheet.create({})