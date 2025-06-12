import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
import Login from '../components/Login.jsx';
import Registro from '../components/Registro';

const Stack = createStackNavigator();

const Pila = ({setIsLogged}) => {
  return (
    <Stack.Navigator>
        <Stack.Screen name='login' options={{headerShown:false}}> 
            {props => <Login {...props} setIsLogged={setIsLogged}/>}
        </Stack.Screen>
        <Stack.Screen name='Registro' component={Registro}/>
    </Stack.Navigator>
  )
}

export default Pila

const styles = StyleSheet.create({})