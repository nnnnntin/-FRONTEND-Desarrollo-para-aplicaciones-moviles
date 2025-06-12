import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ListaPokemon from '../components/ListaPokemon';
import ListaUsuarios from '../components/ListaUsuarios';

const Tab = createBottomTabNavigator();

const Listar = () => {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
        <Tab.Screen name='Usuarios' component={ListaUsuarios}/>
        <Tab.Screen name='Pokemon' component={ListaPokemon}/>
    </Tab.Navigator>
  )
}

export default Listar

