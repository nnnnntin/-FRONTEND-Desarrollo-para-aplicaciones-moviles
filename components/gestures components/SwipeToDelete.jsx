import { StyleSheet, Text, View, Alert } from 'react-native'
import React, { useState } from 'react';
import { Swipeable, RectButton } from 'react-native-gesture-handler';

const SwipeToDelete = () => {


    const [items, setItems] = useState(['Elemento 1', 'Elemento 2', 'Elemento 3']);


    const eliminarItem = (index) => {
        const nuevoArray = [...items];
        nuevoArray.splice(index, 1);
        setItems(nuevoArray);
    }

    const renderRigthActions = (index) => (
        <RectButton
            style={styles.deleteButton}
            onPress={() => {
                Alert.alert("Eliminar", "Seguro que desea eliminar ese elemento?", [
                    { text: "Cancelar", style: 'cancel' },
                    { text: "Eliminar", onPress: () => eliminarItem(index) }
                ])
            }}
        >
            <Text style={styles.deleteText}>Eliminar</Text>
        </RectButton>
    )

    return (
        <View style={styles.container}>
            {items.map((item, index) => (
                <Swipeable
                    key={index}
                    renderRightActions={() => renderRigthActions(index)}
                >
                    <View style={styles.item}>
                        <Text>{item}</Text>
                    </View>
                </Swipeable>
            ))}
        </View>
    );
};

export default SwipeToDelete

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        paddingHorizontal: 20
    },
    item: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 2
    },
    deleteButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        marginBottom: 10,
        borderRadius: 10
    },
    deleteText: {
        color: '#fff',
        fontWeight: 'bold'
    }
})