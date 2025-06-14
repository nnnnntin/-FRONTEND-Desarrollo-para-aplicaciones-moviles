import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { desloguear, loguear } from '../store/slices/usuarioSlice';
import Aplicacion from './Aplicacion';
import Pila from './Pila';

const Pantallas = ({ isLogged, setIsLogged, resetSession }) => {
    const logueado = useSelector(state => state.usuario.logueado);
    const dispatch = useDispatch();

    useEffect(() => {
        if (isLogged !== null) {

            if (isLogged && !logueado) {
                dispatch(loguear());
            } else if (!isLogged && logueado) {
                dispatch(desloguear());
            }
        }
    }, [isLogged, dispatch]);

    if (isLogged === null) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>🔄 Verificando sesión...</Text>
            </View>
        );
    }

    const shouldShowApp = isLogged && logueado;
        
    return (
        <View style={styles.container}>
            {shouldShowApp ? 
                <Aplicacion setIsLogged={setIsLogged} resetSession={resetSession} /> : 
                <Pila setIsLogged={setIsLogged} />
            }
        </View>
    );
}

export default Pantallas;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        fontSize: 18,
        color: '#2c3e50',
        fontFamily: 'System',
    },
    debugBar: {
        backgroundColor: '#fff3cd',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ffeaa7',
    },
    debugText: {
        fontSize: 12,
        color: '#856404',
        textAlign: 'center',
        fontFamily: 'System',
    },
});