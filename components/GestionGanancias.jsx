import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSelector } from 'react-redux';

const GestionGanancias = ({ navigation }) => {
  const { datosUsuario } = useSelector(state => state.usuario);
  const [modalVisible, setModalVisible] = useState(false);
  const [cuentaBancaria, setCuentaBancaria] = useState({
    banco: '',
    tipoCuenta: 'ahorro',
    numeroCuenta: '',
    titular: ''
  });
  const [cuentaGuardada, setCuentaGuardada] = useState(null);

  const ganancias = {
    disponible: 45850.00,
    pendiente: 12300.00,
    total: 58150.00,
    proximoPago: '25/06/2025'
  };

  const transacciones = [
    { id: 1, fecha: '10/06/2025', monto: 15000, estado: 'completado', descripcion: 'Transferencia mensual' },
    { id: 2, fecha: '10/05/2025', monto: 18500, estado: 'completado', descripcion: 'Transferencia mensual' },
    { id: 3, fecha: '10/04/2025', monto: 12350, estado: 'completado', descripcion: 'Transferencia mensual' },
  ];

  const bancos = [
    { id: 'brou', nombre: 'Banco República (BROU)', color: '#0066CC' },
    { id: 'itau', nombre: 'Itaú', color: '#FF6600' },
    { id: 'santander', nombre: 'Santander', color: '#EC0000' },
    { id: 'scotiabank', nombre: 'Scotiabank', color: '#E60000' },
    { id: 'hsbc', nombre: 'HSBC', color: '#DC0000' },
    { id: 'bbva', nombre: 'BBVA', color: '#004B93' },
    { id: 'heritage', nombre: 'Banco Heritage', color: '#1B4F72' },
  ];

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSolicitarTransferencia = () => {
    if (!cuentaGuardada) {
      Alert.alert('Error', 'Primero debes configurar una cuenta bancaria');
      return;
    }

    if (ganancias.disponible === 0) {
      Alert.alert('Sin fondos', 'No tienes fondos disponibles para transferir');
      return;
    }

    Alert.alert(
      'Solicitar transferencia',
      `¿Deseas solicitar la transferencia de $${ganancias.disponible.toLocaleString('es-UY')} a tu cuenta en ${cuentaGuardada.banco}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => {
            Alert.alert(
              'Transferencia solicitada',
              'Tu solicitud ha sido procesada. Recibirás el dinero en 2-3 días hábiles.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const handleGuardarCuenta = () => {
    if (!cuentaBancaria.banco || !cuentaBancaria.numeroCuenta || !cuentaBancaria.titular) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const bancoSeleccionado = bancos.find(b => b.id === cuentaBancaria.banco);
    setCuentaGuardada({
      ...cuentaBancaria,
      banco: bancoSeleccionado?.nombre || cuentaBancaria.banco
    });
    setModalVisible(false);
    Alert.alert('Éxito', 'Cuenta bancaria guardada correctamente');
  };

  const formatearNumero = (numero) => {
    return `$${numero.toLocaleString('es-UY', { minimumFractionDigits: 2 })}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleGoBack} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ganancias</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.resumenContainer}>
          <View style={styles.gananciaPrincipal}>
            <Text style={styles.gananciaLabel}>Disponible para transferir</Text>
            <Text style={styles.gananciaValor}>{formatearNumero(ganancias.disponible)}</Text>
          </View>
          
          <View style={styles.gananciaSecundaria}>
            <View style={styles.gananciaItem}>
              <Text style={styles.gananciaItemLabel}>Pendiente</Text>
              <Text style={styles.gananciaItemValor}>{formatearNumero(ganancias.pendiente)}</Text>
            </View>
            <View style={styles.gananciaItem}>
              <Text style={styles.gananciaItemLabel}>Total generado</Text>
              <Text style={styles.gananciaItemValor}>{formatearNumero(ganancias.total)}</Text>
            </View>
          </View>
          
          <Text style={styles.proximoPago}>
            Próximo pago disponible: {ganancias.proximoPago}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cuenta bancaria</Text>
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              style={styles.editButton}
            >
              <Ionicons name={cuentaGuardada ? "create-outline" : "add-circle-outline"} size={20} color="#4a90e2" />
            </TouchableOpacity>
          </View>
          
          {cuentaGuardada ? (
            <View style={styles.cuentaCard}>
              <Ionicons name="business" size={24} color="#4a90e2" style={styles.bancoIcon} />
              <View style={styles.cuentaInfo}>
                <Text style={styles.bancoNombre}>{cuentaGuardada.banco}</Text>
                <Text style={styles.cuentaDetalle}>
                  Cuenta {cuentaGuardada.tipoCuenta} - ****{cuentaGuardada.numeroCuenta.slice(-4)}
                </Text>
                <Text style={styles.cuentaTitular}>{cuentaGuardada.titular}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.agregarCuentaButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={24} color="#4a90e2" />
              <Text style={styles.agregarCuentaText}>Agregar cuenta bancaria</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={[
            styles.transferirButton,
            (!cuentaGuardada || ganancias.disponible === 0) && styles.transferirButtonDisabled
          ]}
          onPress={handleSolicitarTransferencia}
          disabled={!cuentaGuardada || ganancias.disponible === 0}
        >
          <Ionicons name="send" size={20} color="#fff" style={styles.transferirIcon} />
          <Text style={styles.transferirButtonText}>Solicitar transferencia</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de transferencias</Text>
          
          {transacciones.map((transaccion) => (
            <View key={transaccion.id} style={styles.transaccionItem}>
              <View style={styles.transaccionLeft}>
                <Text style={styles.transaccionFecha}>{transaccion.fecha}</Text>
                <Text style={styles.transaccionDescripcion}>{transaccion.descripcion}</Text>
              </View>
              <View style={styles.transaccionRight}>
                <Text style={styles.transaccionMonto}>
                  {formatearNumero(transaccion.monto)}
                </Text>
                <View style={[styles.estadoBadge, styles[`estado${transaccion.estado}`]]}>
                  <Text style={styles.estadoText}>{transaccion.estado}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {cuentaGuardada ? 'Editar cuenta bancaria' : 'Agregar cuenta bancaria'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Banco</Text>
              <View style={styles.bancosList}>
                {bancos.map((banco) => (
                  <TouchableOpacity
                    key={banco.id}
                    style={[
                      styles.bancoOption,
                      cuentaBancaria.banco === banco.id && styles.bancoOptionSelected
                    ]}
                    onPress={() => setCuentaBancaria({...cuentaBancaria, banco: banco.id})}
                  >
                    <View style={[styles.bancoColor, { backgroundColor: banco.color }]} />
                    <Text style={[
                      styles.bancoOptionText,
                      cuentaBancaria.banco === banco.id && styles.bancoOptionTextSelected
                    ]}>
                      {banco.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Tipo de cuenta</Text>
              <View style={styles.tipoCuentaContainer}>
                <TouchableOpacity
                  style={[
                    styles.tipoCuentaButton,
                    cuentaBancaria.tipoCuenta === 'ahorro' && styles.tipoCuentaButtonActive
                  ]}
                  onPress={() => setCuentaBancaria({...cuentaBancaria, tipoCuenta: 'ahorro'})}
                >
                  <Text style={[
                    styles.tipoCuentaText,
                    cuentaBancaria.tipoCuenta === 'ahorro' && styles.tipoCuentaTextActive
                  ]}>
                    Caja de ahorro
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tipoCuentaButton,
                    cuentaBancaria.tipoCuenta === 'corriente' && styles.tipoCuentaButtonActive
                  ]}
                  onPress={() => setCuentaBancaria({...cuentaBancaria, tipoCuenta: 'corriente'})}
                >
                  <Text style={[
                    styles.tipoCuentaText,
                    cuentaBancaria.tipoCuenta === 'corriente' && styles.tipoCuentaTextActive
                  ]}>
                    Cuenta corriente
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Número de cuenta</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa el número de cuenta"
                value={cuentaBancaria.numeroCuenta}
                onChangeText={(text) => setCuentaBancaria({...cuentaBancaria, numeroCuenta: text})}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Titular de la cuenta</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre completo del titular"
                value={cuentaBancaria.titular}
                onChangeText={(text) => setCuentaBancaria({...cuentaBancaria, titular: text})}
              />

              <TouchableOpacity 
                style={styles.guardarButton}
                onPress={handleGuardarCuenta}
              >
                <Text style={styles.guardarButtonText}>Guardar cuenta</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
  },
  resumenContainer: {
    backgroundColor: '#4a90e2',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gananciaPrincipal: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gananciaLabel: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    fontFamily: 'System',
  },
  gananciaValor: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
    fontFamily: 'System',
  },
  gananciaSecundaria: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 15,
  },
  gananciaItem: {
    alignItems: 'center',
  },
  gananciaItemLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    fontFamily: 'System',
  },
  gananciaItemValor: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 4,
    fontFamily: 'System',
  },
  proximoPago: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 15,
    fontFamily: 'System',
  },
  section: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  editButton: {
    padding: 5,
  },
  cuentaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bancoIcon: {
    marginRight: 15,
  },
  cuentaInfo: {
    flex: 1,
  },
  bancoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  cuentaDetalle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
    fontFamily: 'System',
  },
  cuentaTitular: {
    fontSize: 14,
    color: '#5a6c7d',
    marginTop: 2,
    fontFamily: 'System',
  },
  agregarCuentaButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderStyle: 'dashed',
  },
  agregarCuentaText: {
    fontSize: 16,
    color: '#4a90e2',
    marginLeft: 10,
    fontWeight: '600',
    fontFamily: 'System',
  },
  transferirButton: {
    backgroundColor: '#27ae60',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  transferirButtonDisabled: {
    backgroundColor: '#95a5a6',
    elevation: 0,
  },
  transferirIcon: {
    marginRight: 8,
  },
  transferirButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  transaccionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transaccionLeft: {
    flex: 1,
  },
  transaccionFecha: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  transaccionDescripcion: {
    fontSize: 16,
    color: '#2c3e50',
    marginTop: 2,
    fontFamily: 'System',
  },
  transaccionRight: {
    alignItems: 'flex-end',
  },
  transaccionMonto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    fontFamily: 'System',
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  estadocompletado: {
    backgroundColor: '#e8f8f5',
  },
  estadoText: {
    fontSize: 12,
    color: '#27ae60',
    fontFamily: 'System',
    textTransform: 'capitalize',
  },
  bottomSpacing: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    marginTop: 15,
    fontFamily: 'System',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  bancosList: {
    marginBottom: 15,
  },
  bancoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  bancoOptionSelected: {
    backgroundColor: '#e8f4fd',
    borderColor: '#4a90e2',
  },
  bancoColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  bancoOptionText: {
    fontSize: 16,
    color: '#2c3e50',
    fontFamily: 'System',
  },
  bancoOptionTextSelected: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  tipoCuentaContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  tipoCuentaButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    alignItems: 'center',
  },
  tipoCuentaButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  tipoCuentaText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
    fontFamily: 'System',
  },
  tipoCuentaTextActive: {
    color: '#fff',
  },
  guardarButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  guardarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
});

export default GestionGanancias;