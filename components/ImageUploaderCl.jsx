import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const ImageUploaderCl = () => {

    const [message, setMessage] = useState('')

    const handleUpload = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if(status !== 'granted'){
            setMessage('Permiso denegado');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1
        })

        if(result.canceled){
            setMessage('Seleccion cancelada');
            return;
        }

        const image = result.assets[0];

        const formData = new FormData();

        formData.append('file', {
            uri: image.uri,
            name: 'uploadClass.jpeg',
            type: 'image/jpeg'
        });

        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if(data.secure_url){
                setMessage('Imagen subida correctamente: ' + data.secure_url);
                console.log('URL de la imagen:', data.secure_url);
                console.log('Public ID:', data.public_id);
            }else{
                console.log('Error en respuesta:', data);
                setMessage("Error inesperado al subir imagen");
            }
        } catch (error) {
            console.error('Error en upload:', error);
            setMessage('Error al subir imagen: ' + error.message)
        }
    }

  return (
    <View style={styles.container}>
        <Button title='Subir imagen a Cloudinary' onPress={handleUpload}/>
        { message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  )
}

export default ImageUploaderCl

const styles = StyleSheet.create({
    container:{
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    message:{
        marginTop: 20,
        textAlign: 'center'
    }
})