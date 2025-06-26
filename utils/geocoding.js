


export const obtenerCoordenadas = async (direccion) => {
    try {
        
        const direccionCompleta = `${direccion.calle} ${direccion.numero}, ${direccion.ciudad}, ${direccion.departamento}, ${direccion.pais}`;
        const encodedAddress = encodeURIComponent(direccionCompleta);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`
        );

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        } else {
            
            return {
                lat: -34.9011,
                lng: -56.1645
            };
        }
    } catch (error) {
        console.error('Error obteniendo coordenadas:', error);
        
        return {
            lat: -34.9011,
            lng: -56.1645
        };
    }
};


export const validarCoordenadas = (lat, lng) => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};