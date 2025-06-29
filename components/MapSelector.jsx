import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const MapSelector = ({
  onLocationSelect,
  initialLocation = null,
  direccionCompleta = null
}) => {
  const [region, setRegion] = useState({
    latitude: -34.9011,
    longitude: -56.1645,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(false);
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === 'granted');
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  useEffect(() => {
    if (direccionCompleta?.calle && direccionCompleta?.ciudad && !selectedLocation) {
      geocodeAddress();
    }
  }, [direccionCompleta]);

  useEffect(() => {
    if (!selectedLocation) return;
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]).start(pulse);
    };
    pulse();
  }, [selectedLocation]);

  const getCurrentLocation = async () => {
    if (!locationPermission) {
      return Alert.alert(
        'Permisos requeridos',
        'Se necesitan permisos de ubicación para usar esta función',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Configurar', onPress: () => Location.requestForegroundPermissionsAsync() }
        ]
      );
    }
    try {
      setLoadingCurrentLocation(true);
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const newRegion = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      if (!selectedLocation) {
        const newLoc = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setSelectedLocation(newLoc);
        onLocationSelect(newLoc);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
    } finally {
      setLoadingCurrentLocation(false);
    }
  };

  const geocodeAddress = async () => {
    if (!direccionCompleta?.calle || !direccionCompleta?.ciudad) return;
    try {
      setLoading(true);
      const addr = `${direccionCompleta.calle} ${direccionCompleta.numero || ''}, ${direccionCompleta.ciudad}, ${direccionCompleta.departamento || 'Montevideo'}, ${direccionCompleta.pais || 'Uruguay'}`;
      const results = await Location.geocodeAsync(addr);
      if (results.length) {
        const { latitude, longitude } = results[0];
        const newRegion = { latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
        const newLoc = { lat: latitude, lng: longitude };
        setSelectedLocation(newLoc);
        onLocationSelect(newLoc);
        Alert.alert('Éxito', 'Dirección encontrada en el mapa');
      } else {
        Alert.alert('Error', 'No se pudo encontrar la dirección especificada');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Error al buscar la dirección');
    } finally {
      setLoading(false);
    }
  };

  const onMapPress = ({ nativeEvent }) => {
    const { latitude, longitude } = nativeEvent.coordinate;
    const newLoc = { lat: latitude, lng: longitude };
    setSelectedLocation(newLoc);
    onLocationSelect(newLoc);
  };

  const centerOnSelection = () => {
    if (!selectedLocation) return;
    const newRegion = {
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="location" size={24} color="#4a90e2" />
          <View style={styles.headerTexts}>
            <Text style={styles.title}>Seleccionar ubicación</Text>
            <Text style={styles.subtitle}>
              Toca en el mapa o muévelo para marcar la ubicación exacta
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          onPress={onMapPress}
          onRegionChangeComplete={setRegion}
          onMapReady={() => setMapReady(true)}
          showsUserLocation={locationPermission}
          showsCompass
          showsScale
          mapType="standard"
          loadingEnabled
          pitchEnabled
          rotateEnabled
          scrollEnabled
          zoomEnabled
        >
          {selectedLocation && (
            <Marker
              coordinate={{
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lng
              }}
              title="Ubicación seleccionada"
              description={`${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
              anchor={{ x: 0.5, y: 1 }}
            >
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={styles.markerInner}>
                  <Ionicons name="location" size={24} color="#fff" />
                </View>
                <View style={styles.markerShadow} />
              </Animated.View>
            </Marker>
          )}
        </MapView>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              { backgroundColor: locationPermission ? '#fff' : '#f5f5f5' }
            ]}
            onPress={getCurrentLocation}
            disabled={loadingCurrentLocation}
          >
            {loadingCurrentLocation
              ? <ActivityIndicator size="small" color="#4a90e2" />
              : <Ionicons name="locate" size={22} color="#4a90e2" />
            }
          </TouchableOpacity>

          {direccionCompleta?.calle && (
            <TouchableOpacity
              style={[styles.controlButton, styles.geocodeButton]}
              onPress={geocodeAddress}
              disabled={loading}
            >
              <Ionicons name="search" size={20} color="#4a90e2" />
            </TouchableOpacity>
          )}

          {selectedLocation && (
            <TouchableOpacity
              style={[styles.controlButton, styles.centerButton]}
              onPress={centerOnSelection}
            >
              <Ionicons name="eye" size={20} color="#4a90e2" />
            </TouchableOpacity>
          )}
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4a90e2" />
              <Text style={styles.loadingText}>Buscando dirección...</Text>
            </View>
          </View>
        )}

        {!selectedLocation && mapReady && (
          <View style={styles.instructionsContainer}>
            <View style={styles.instructionsBubble}>
              <Ionicons name="hand-left" size={20} color="#fff" />
              <Text style={styles.instructionsText}>
                Toca en el mapa para seleccionar
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.infoPanel}>
        {selectedLocation ? (
          <>
            <View style={styles.infoPanelHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
              <Text style={styles.infoPanelTitle}>Ubicación confirmada</Text>
            </View>
            <View style={styles.coordinatesContainer}>
              <View style={styles.coordinateItem}>
                <Text style={styles.coordinateLabel}>Latitud</Text>
                <Text style={styles.coordinateValue}>
                  {selectedLocation.lat.toFixed(6)}
                </Text>
              </View>
              <View style={styles.coordinateDivider} />
              <View style={styles.coordinateItem}>
                <Text style={styles.coordinateLabel}>Longitud</Text>
                <Text style={styles.coordinateValue}>
                  {selectedLocation.lng.toFixed(6)}
                </Text>
              </View>
            </View>
            <Text style={styles.helpText}>
              Puedes mover el mapa y tocar en otra ubicación para cambiar la selección
            </Text>
          </>
        ) : (
          <>
            <View style={styles.infoPanelHeader}>
              <Ionicons name="information-circle" size={24} color="#f39c12" />
              <Text style={styles.infoPanelTitle}>Sin ubicación seleccionada</Text>
            </View>
            <Text style={styles.helpText}>
              Toca en cualquier lugar del mapa para marcar la ubicación de tu espacio
            </Text>
            {direccionCompleta?.calle && (
              <TouchableOpacity
                style={styles.quickSearchButton}
                onPress={geocodeAddress}
                disabled={loading}
              >
                <Ionicons name="search" size={16} color="#4a90e2" />
                <Text style={styles.quickSearchText}>
                  Buscar "{direccionCompleta.calle}"
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerTexts: { marginLeft: 12, flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  subtitle: { fontSize: 14, color: '#7f8c8d', lineHeight: 20 },

  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },

  controls: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 10,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  geocodeButton: { backgroundColor: '#e3f2fd' },
  centerButton: { backgroundColor: '#e8f5e8' },

  markerInner: {
    width: 40,
    height: 40,
    backgroundColor: '#4a90e2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  markerShadow: {
    width: 16,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    marginTop: -4,
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    minWidth: 150,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#2c3e50', textAlign: 'center' },

  instructionsContainer: {
    position: 'absolute',
    top: '50%',
    left: 20, right: 20,
    alignItems: 'center',
    marginTop: -50,
  },
  instructionsBubble: {
    backgroundColor: 'rgba(74,144,226,0.95)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  instructionsText: { color: '#fff', fontSize: 14, fontWeight: '500', marginLeft: 8 },

  infoPanel: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 120,
  },
  infoPanelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoPanelTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginLeft: 8 },

  coordinatesContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  coordinateItem: { flex: 1, alignItems: 'center' },
  coordinateLabel: { fontSize: 12, color: '#7f8c8d', fontWeight: '500', marginBottom: 4 },
  coordinateValue: { fontSize: 14, color: '#2c3e50', fontWeight: 'bold', fontFamily: 'monospace' },
  coordinateDivider: { width: 1, backgroundColor: '#e1e5e9', marginHorizontal: 16 },

  helpText: { fontSize: 13, color: '#7f8c8d', textAlign: 'center', lineHeight: 18 },

  quickSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  quickSearchText: { fontSize: 14, color: '#4a90e2', fontWeight: '500', marginLeft: 6 },
});

export default MapSelector;
