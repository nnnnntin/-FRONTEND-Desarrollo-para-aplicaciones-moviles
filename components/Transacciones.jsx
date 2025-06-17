import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const Transacciones = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Botón atrás */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#1f5fa1" />
        </TouchableOpacity>

        <Text style={styles.header}>Transacción</Text>

        <View style={styles.section}>
          <Item icon="calendar-outline" label="Fecha" value="01/01/2026" />
          <Item icon="cash-outline" label="Importe" value="$1200.00" />
          <Item icon="person-outline" label="Usuario" value="Juan Pérez" />
        </View>

        <TouchableOpacity style={styles.printButton}>
          <Text style={styles.printText}>Imprimir</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareText}>Compartir</Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoHeader}>Información adicional</Text>

          <AdditionalInfo
            icon="card-outline"
            label="Método de Pago"
            value="Tarjeta de Crédito"
          />
          <AdditionalInfo
            icon="pricetag-outline"
            label="Categoría"
            value="Compras"
          />

          <Text style={styles.problemText}>¿Tienes un problema?</Text>
        </View>

        <TouchableOpacity style={styles.continueButton}>
          <Text style={styles.continueText}>Continuar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const Item = ({ icon, label, value }) => (
  <View style={styles.itemRow}>
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={20} color="#1f5fa1" />
    </View>
    <View style={styles.itemText}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const AdditionalInfo = ({ icon, label, value }) => (
  <View style={styles.additionalRow}>
    <Ionicons name={icon} size={20} color="#999" style={{ marginRight: 10 }} />
    <View>
      <Text style={styles.additionalLabel}>{label}</Text>
      <Text style={styles.additionalValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    paddingTop: 10,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 10,
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
    color: '#1f5fa1',
    fontWeight: '500',
  },
  section: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 30,
    alignItems: 'center',
  },
  itemText: {
    marginLeft: 10,
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  printButton: {
    backgroundColor: '#4183d7',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  printText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#0a2943',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  shareText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  additionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  additionalLabel: {
    color: '#888',
    fontSize: 13,
  },
  additionalValue: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  problemText: {
    color: '#60a3f0',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
  continueButton: {
    backgroundColor: '#336699',
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default Transacciones;
