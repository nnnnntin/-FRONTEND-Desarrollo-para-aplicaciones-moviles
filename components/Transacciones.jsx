import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const Transacciones = ({ navigation, route }) => {
  const { transaccion } = route?.params || {};

  const handleVolver = () => {
    navigation.goBack();
  };

  const handleReportarProblema = () => {
    navigation.navigate('FormularioProblema');
  };

  const generarPDFContent = () => {
    const fecha = transaccion?.fecha || '01/01/2026';
    const precio = transaccion?.precio || '$1200.00';
    const usuario = 'Juan Pérez';
    
    return `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              background-color: #f8f9fa;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #4a90e2;
              padding-bottom: 20px;
            }
            .title {
              color: #2c3e50;
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
              padding: 10px 0;
              border-bottom: 1px solid #ecf0f1;
            }
            .label {
              color: #7f8c8d;
              font-weight: bold;
            }
            .value {
              color: #2c3e50;
              font-weight: 600;
            }
            .additional-info {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ecf0f1;
            }
            .section-title {
              color: #2c3e50;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #7f8c8d;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">Comprobante de Transacción</h1>
            </div>
            
            <div class="info-row">
              <span class="label">Fecha:</span>
              <span class="value">${fecha}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Importe:</span>
              <span class="value">${precio}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Usuario:</span>
              <span class="value">${usuario}</span>
            </div>
            
            <div class="additional-info">
              <h2 class="section-title">Información Adicional</h2>
              
              <div class="info-row">
                <span class="label">Método de Pago:</span>
                <span class="value">Tarjeta de Crédito</span>
              </div>
              
              <div class="info-row">
                <span class="label">Categoría:</span>
                <span class="value">Compras</span>
              </div>
            </div>
            
            <div class="footer">
              <p>Generado el ${new Date().toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleImprimir = async () => {
    try {
      const htmlContent = generarPDFContent();
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Print.printAsync({
        uri,
      });

    } catch (error) {
      console.error('Error al imprimir:', error);
      Alert.alert(
        'Error',
        'No se pudo procesar la impresión. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCompartir = async () => {
    try {
      const htmlContent = generarPDFContent();
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const fileName = `transaccion_${transaccion?.fecha?.replace(/\//g, '-') || 'comprobante'}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });

      const canShare = await Sharing.isAvailableAsync();
      
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir comprobante de transacción',
        });
      } else {
        Alert.alert(
          'Compartir no disponible',
          'La función de compartir no está disponible en este dispositivo.',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('Error al compartir:', error);
      Alert.alert(
        'Error',
        'No se pudo compartir el comprobante. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleVolver}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transacción</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.transaccionContainer}>
          <View style={styles.transaccionItem}>
            <View style={styles.transaccionIcono}>
              <Ionicons name="calendar-outline" size={20} color="#4a90e2" />
            </View>
            <View style={styles.transaccionInfo}>
              <Text style={styles.transaccionLabel}>Fecha</Text>
              <Text style={styles.transaccionValor}>{transaccion?.fecha || '01/01/2026'}</Text>
            </View>
          </View>

          <View style={styles.transaccionItem}>
            <View style={styles.transaccionIcono}>
              <Ionicons name="card-outline" size={20} color="#4a90e2" />
            </View>
            <View style={styles.transaccionInfo}>
              <Text style={styles.transaccionLabel}>Importe</Text>
              <Text style={styles.transaccionValor}>{transaccion?.precio || '$1200.00'}</Text>
            </View>
          </View>

          <View style={[styles.transaccionItem, styles.lastItem]}>
            <View style={styles.transaccionIcono}>
              <Ionicons name="person-outline" size={20} color="#4a90e2" />
            </View>
            <View style={styles.transaccionInfo}>
              <Text style={styles.transaccionLabel}>Usuario</Text>
              <Text style={styles.transaccionValor}>Juan Pérez</Text>
            </View>
          </View>
        </View>

        <View style={styles.botonesContainer}>
          <TouchableOpacity
            style={styles.botonImprimir}
            onPress={handleImprimir}
            activeOpacity={0.7}
          >
            <Ionicons name="print-outline" size={20} color="#fff" style={styles.iconoBoton} />
            <Text style={styles.textoBotonImprimir}>Imprimir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonCompartir}
            onPress={handleCompartir}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={20} color="#fff" style={styles.iconoBoton} />
            <Text style={styles.textoBotonCompartir}>Compartir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoAdicionalContainer}>
          <Text style={styles.infoAdicionalTitulo}>Información adicional</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcono}>
              <Ionicons name="card-outline" size={16} color="#666" />
            </View>
            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>Método de Pago</Text>
              <Text style={styles.infoValor}>Tarjeta de Crédito</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcono}>
              <Ionicons name="pricetag-outline" size={16} color="#666" />
            </View>
            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>Categoría</Text>
              <Text style={styles.infoValor}>Compras</Text>
            </View>
          </View>
        </View>

        <View style={styles.problemaContainer}>
          <TouchableOpacity
            style={styles.problemaLink}
            onPress={handleReportarProblema}
            activeOpacity={0.7}
          >
            <Text style={styles.problemaTexto}>¿Tienes un problema?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.botonContinuarTransaccion}
          onPress={handleVolver}
          activeOpacity={0.7}
        >
          <Text style={styles.textoBotonContinuar}>Continuar</Text>
        </TouchableOpacity>
      </ScrollView>
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
    fontSize: 18,
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
  transaccionContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transaccionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  transaccionIcono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transaccionInfo: {
    flex: 1,
  },
  transaccionLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'System',
    marginBottom: 2,
  },
  transaccionValor: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    fontFamily: 'System',
  },
  botonesContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  botonImprimir: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotonImprimir: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
  botonCompartir: {
    backgroundColor: '#2c3e50',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotonCompartir: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
  iconoBoton: {
    marginRight: 8,
  },
  infoAdicionalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoAdicionalTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    fontFamily: 'System',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcono: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTexto: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  infoValor: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    fontFamily: 'System',
  },
  problemaContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  problemaLink: {
    padding: 10,
  },
  problemaTexto: {
    fontSize: 14,
    color: '#4a90e2',
    fontFamily: 'System',
    textDecorationLine: 'underline',
  },
  botonContinuarTransaccion: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textoBotonContinuar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default Transacciones;