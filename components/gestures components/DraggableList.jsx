import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import DraggableFlatList from 'react-native-draggable-flatlist'

const DraggableList = () => {

    const [data, setData] = useState([
        { key: '1', label: 'Item 1' },
        { key: '2', label: 'Item 2' },
        { key: '3', label: 'Item 3' },
        { key: '4', label: 'Item 4' },
    ]);

    const renderItem = ({ item, drag, isActive }) => (
        <View style={[styles.item, isActive && styles.activeItem]}>
            <Text
                onLongPress={drag}
                style={styles.text}
            >
                {item.label}
            </Text>
        </View>
    )

    return (
        <DraggableFlatList
            data={data}
            onDragEnd={({ data }) => setData(data)}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
        />
    )
}

export default DraggableList

const styles = StyleSheet.create({
    item: {
        padding: 20,
        backgroundColor: '#fafafa',
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        borderRadius: 8
    },
    activeItem: {
        backgroundColor: '#e0f7fa',
    },
    text: {
        fontSize: 18
    }
})