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
import { useSelector } from 'react-redux';

const Transacciones = ({ navigation, route }) => {
  const { transaccion } = route?.params || {};
  const usuario = useSelector(state => state.auth.usuario);

  const handleVolver = () => {
    navigation.goBack();
  };

  const handleReportarProblema = () => {
    navigation.navigate('FormularioProblema', {
      reservaId: transaccion?.reserva?.id,
      tipo: 'reserva',
      transaccionId: transaccion?.id,
      pagoId: transaccion?.pago?.id,
      facturaId: transaccion?.factura?.id
    });
  };

  const generarPDFContent = () => {
    const fecha = transaccion?.fecha || new Date().toLocaleDateString('es-ES');
    const precio = transaccion?.precio || '$0.00';
    const nombreUsuario = transaccion?.usuario?.nombre ||
      usuario?.nombre ||
      usuario?.name ||
      `${usuario?.firstName || ''} ${usuario?.lastName || ''}`.trim() ||
      'Usuario';

    const emailUsuario = transaccion?.usuario?.email ||
      usuario?.email ||
      usuario?.correo ||
      '';

    const reserva = transaccion?.reserva;
    const pago = transaccion?.pago;
    const factura = transaccion?.factura;

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
            .subtitle {
              color: #7f8c8d;
              font-size: 16px;
              margin: 5px 0 0 0;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              color: #2c3e50;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
              border-bottom: 1px solid #ecf0f1;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 8px 0;
            }
            .label {
              color: #7f8c8d;
              font-weight: bold;
              width: 40%;
            }
            .value {
              color: #2c3e50;
              font-weight: 600;
              width: 60%;
              text-align: right;
            }
            .highlight {
              background-color: #e3f2fd;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
            }
            .payment-section {
              background-color: #f0f9ff;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
              border-left: 4px solid #27ae60;
            }
            .invoice-section {
              background-color: #fff9f0;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
              border-left: 4px solid #f39c12;
            }
            .services-list {
              margin-top: 10px;
            }
            .service-item {
              margin-bottom: 5px;
              padding: 5px 0;
              border-bottom: 1px dotted #ddd;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #7f8c8d;
              font-size: 12px;
              border-top: 1px solid #ecf0f1;
              padding-top: 20px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              color: white;
              background-color: #27ae60;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">Comprobante de Pago y Reserva</h1>
              <p class="subtitle">Transacción completada exitosamente</p>
              ${transaccion?.id ? `<p class="subtitle">ID Transacción: ${transaccion.id}</p>` : ''}
              ${pago?.id ? `<p class="subtitle">ID Pago: ${pago.id}</p>` : ''}
              ${factura?.numeroFactura ? `<p class="subtitle">Factura: ${factura.numeroFactura}</p>` : ''}
            </div>
            
            <div class="section">
              <h2 class="section-title">Información de la Transacción</h2>
              <div class="info-row">
                <span class="label">Fecha de transacción:</span>
                <span class="value">${fecha}</span>
              </div>
              <div class="info-row">
                <span class="label">Importe total:</span>
                <span class="value">${precio}</span>
              </div>
              <div class="info-row">
                <span class="label">Usuario:</span>
                <span class="value">${nombreUsuario}</span>
              </div>
              ${emailUsuario ? `
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${emailUsuario}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="label">Método de Pago:</span>
                <span class="value">${pago?.metodoPago?.tipo || 'N/A'} •••• ${transaccion?.metodo?.ultimosDigitos || pago?.metodoPago?.detalles?.ultimosDigitos || '****'}</span>
              </div>
              <div class="info-row">
                <span class="label">Estado:</span>
                <span class="value"><span class="status-badge">${pago?.estado || 'Completado'}</span></span>
              </div>
            </div>

            ${pago ? `
            <div class="section">
              <h2 class="section-title">Detalles del Pago</h2>
              <div class="payment-section">
                <div class="info-row">
                  <span class="label">ID de Pago:</span>
                  <span class="value">${pago.id || pago._id}</span>
                </div>
                <div class="info-row">
                  <span class="label">Monto:</span>
                  <span class="value">${pago.monto} ${pago.moneda || 'USD'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Concepto:</span>
                  <span class="value">${pago.conceptoPago || 'Reserva'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Fecha de pago:</span>
                  <span class="value">${new Date(pago.fecha).toLocaleDateString('es-ES')}</span>
                </div>
                ${pago.comprobante ? `
                <div class="info-row">
                  <span class="label">Comprobante:</span>
                  <span class="value">${pago.comprobante}</span>
                </div>
                ` : ''}
                ${pago.metodoPago?.detalles?.numeroAutorizacion ? `
                <div class="info-row">
                  <span class="label">Autorización:</span>
                  <span class="value">${pago.metodoPago.detalles.numeroAutorizacion}</span>
                </div>
                ` : ''}
              </div>
            </div>
            ` : ''}

            ${factura ? `
            <div class="section">
              <h2 class="section-title">Información de Facturación</h2>
              <div class="invoice-section">
                <div class="info-row">
                  <span class="label">Número de Factura:</span>
                  <span class="value">${factura.numeroFactura}</span>
                </div>
                <div class="info-row">
                  <span class="label">Fecha de Emisión:</span>
                  <span class="value">${new Date(factura.fechaEmision).toLocaleDateString('es-ES')}</span>
                </div>
                <div class="info-row">
                  <span class="label">Fecha de Vencimiento:</span>
                  <span class="value">${new Date(factura.fechaVencimiento).toLocaleDateString('es-ES')}</span>
                </div>
                <div class="info-row">
                  <span class="label">Estado:</span>
                  <span class="value"><span class="status-badge">${factura.estado || 'Pagada'}</span></span>
                </div>
                <div class="info-row">
                  <span class="label">Subtotal:</span>
                  <span class="value">${factura.subtotal}</span>
                </div>
                ${factura.descuentoTotal > 0 ? `
                <div class="info-row">
                  <span class="label">Descuento:</span>
                  <span class="value">-${factura.descuentoTotal}</span>
                </div>
                ` : ''}
                <div class="info-row">
                  <span class="label">Total:</span>
                  <span class="value"><strong>${factura.total}</strong></span>
                </div>
              </div>
            </div>
            ` : ''}

            ${reserva ? `
            <div class="section">
              <h2 class="section-title">Detalles de la Reserva</h2>
              <div class="highlight">
                <div class="info-row">
                  <span class="label">Espacio:</span>
                  <span class="value">${reserva.espacioNombre || reserva.entidadReservada?.nombre || transaccion?.oficina?.nombre}</span>
                </div>
                <div class="info-row">
                  <span class="label">Tipo de espacio:</span>
                  <span class="value">${reserva.entidadReservada?.tipo || 'Espacio'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Fecha de reserva:</span>
                  <span class="value">${reserva.fecha}</span>
                </div>
                <div class="info-row">
                  <span class="label">Horario:</span>
                  <span class="value">${reserva.horaInicio} - ${reserva.horaFin}</span>
                </div>
                <div class="info-row">
                  <span class="label">Número de personas:</span>
                  <span class="value">${reserva.cantidadPersonas}</span>
                </div>
                <div class="info-row">
                  <span class="label">Estado:</span>
                  <span class="value"><span class="status-badge">${reserva.estado || 'Confirmada'}</span></span>
                </div>
                <div class="info-row">
                  <span class="label">Tipo de reserva:</span>
                  <span class="value">${reserva.tipoReserva || 'N/A'}</span>
                </div>
              </div>
              
              ${reserva.serviciosAdicionales && reserva.serviciosAdicionales.length > 0 ? `
              <h3 style="color: #2c3e50; margin-top: 20px; margin-bottom: 10px;">Servicios Adicionales</h3>
              <div class="services-list">
                ${reserva.serviciosAdicionales.map(servicio => `
                  <div class="service-item">
                    <div class="info-row">
                      <span class="label">${servicio.nombre}:</span>
                      <span class="value">${servicio.precio}/${servicio.unidadPrecio}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
              ` : ''}
            </div>
            ` : ''}
            
            <div class="footer">
              <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
              <p>Para cualquier consulta, contacta a nuestro equipo de soporte</p>
              ${emailUsuario ? `<p>Email de contacto: ${emailUsuario}</p>` : ''}
              ${pago?.id ? `<p>Referencia de pago: ${pago.id}</p>` : ''}
              ${factura?.numeroFactura ? `<p>Número de factura: ${factura.numeroFactura}</p>` : ''}
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
      await Print.printAsync({ uri });
    } catch (error) {
      console.error('Error imprimiendo:', error);
      const msg = error?.message ?? '';
      if (msg.includes('Printing did not complete')) {
        return;
      }
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

      const reservaId = transaccion?.reserva?.id ? `_${transaccion.reserva.id.slice(-6)}` : '';
      const pagoId = transaccion?.pago?.id ? `_${transaccion.pago.id.slice(-6)}` : '';
      const fileName = `comprobante${reservaId}${pagoId}_${transaccion?.fecha?.replace(/\//g, '-') || 'documento'}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });

      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir comprobante de pago y reserva',
        });
      } else {
        Alert.alert(
          'Compartir no disponible',
          'La función de compartir no está disponible en este dispositivo.',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('Error compartiendo:', error);
      const msg = error?.message || '';
      if (msg.toLowerCase().includes('cancel') || msg.includes('CANCELLED')) {
        return;
      }
      Alert.alert(
        'Error',
        'No se pudo compartir el comprobante. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleVerReserva = () => {
    if (transaccion?.reserva?.id) {
      navigation.navigate('DetalleReserva', {
        reservaId: transaccion.reserva.id
      });
    }
  };

  const handleVerPago = () => {
    if (transaccion?.pago?.id) {
      navigation.navigate('DetallePago', {
        pagoId: transaccion.pago.id
      });
    }
  };

  const handleVerFactura = () => {
    if (transaccion?.factura?.id) {
      navigation.navigate('DetalleFactura', {
        facturaId: transaccion.factura.id
      });
    }
  };

  const obtenerNombreUsuario = () => {
    return transaccion?.usuario?.nombre ||
      usuario?.nombre ||
      usuario?.name ||
      `${usuario?.firstName || ''} ${usuario?.lastName || ''}`.trim() ||
      'Usuario';
  };

  const obtenerEmailUsuario = () => {
    return transaccion?.usuario?.email ||
      usuario?.email ||
      usuario?.correo ||
      '';
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
        <Text style={styles.headerTitle}>
          {transaccion?.reserva ? 'Comprobante de Pago' : 'Transacción'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.transaccionContainer}>
          <Text style={styles.sectionTitle}>Información de la transacción</Text>

          <View style={styles.transaccionItem}>
            <View style={styles.transaccionIcono}>
              <Ionicons name="calendar-outline" size={20} color="#4a90e2" />
            </View>
            <View style={styles.transaccionInfo}>
              <Text style={styles.transaccionLabel}>Fecha de transacción</Text>
              <Text style={styles.transaccionValor}>
                {transaccion?.fecha || new Date().toLocaleDateString('es-ES')}
              </Text>
            </View>
          </View>

          <View style={styles.transaccionItem}>
            <View style={styles.transaccionIcono}>
              <Ionicons name="card-outline" size={20} color="#4a90e2" />
            </View>
            <View style={styles.transaccionInfo}>
              <Text style={styles.transaccionLabel}>Importe total</Text>
              <Text style={styles.transaccionValor}>{transaccion?.precio || '$0.00'}</Text>
            </View>
          </View>

          <View style={styles.transaccionItem}>
            <View style={styles.transaccionIcono}>
              <Ionicons name="person-outline" size={20} color="#4a90e2" />
            </View>
            <View style={styles.transaccionInfo}>
              <Text style={styles.transaccionLabel}>Usuario</Text>
              <Text style={styles.transaccionValor}>{obtenerNombreUsuario()}</Text>
            </View>
          </View>

          {obtenerEmailUsuario() && (
            <View style={styles.transaccionItem}>
              <View style={styles.transaccionIcono}>
                <Ionicons name="mail-outline" size={20} color="#4a90e2" />
              </View>
              <View style={styles.transaccionInfo}>
                <Text style={styles.transaccionLabel}>Email</Text>
                <Text style={styles.transaccionValor}>{obtenerEmailUsuario()}</Text>
              </View>
            </View>
          )}

          <View style={[styles.transaccionItem, styles.lastItem]}>
            <View style={styles.transaccionIcono}>
              <Ionicons name="card" size={20} color="#4a90e2" />
            </View>
            <View style={styles.transaccionInfo}>
              <Text style={styles.transaccionLabel}>Método de pago</Text>
              <Text style={styles.transaccionValor}>
                {transaccion?.pago?.metodoPago?.tipo || 'Tarjeta'} •••• {transaccion?.metodo?.ultimosDigitos || transaccion?.pago?.metodoPago?.detalles?.ultimosDigitos || '****'}
              </Text>
            </View>
          </View>
        </View>

        {/* Sección de Pago */}
        {transaccion?.pago && (
          <View style={styles.pagoContainer}>
            <Text style={styles.sectionTitle}>Detalles del Pago</Text>

            <View style={styles.pagoHighlight}>
              <View style={styles.pagoItem}>
                <View style={styles.pagoIcono}>
                  <Ionicons name="cash-outline" size={20} color="#27ae60" />
                </View>
                <View style={styles.pagoInfo}>
                  <Text style={styles.pagoLabel}>ID de Pago</Text>
                  <Text style={styles.pagoValor}>
                    {transaccion.pago.id || transaccion.pago._id}
                  </Text>
                </View>
              </View>

              <View style={styles.pagoItem}>
                <View style={styles.pagoIcono}>
                  <Ionicons name="pricetag-outline" size={20} color="#27ae60" />
                </View>
                <View style={styles.pagoInfo}>
                  <Text style={styles.pagoLabel}>Monto</Text>
                  <Text style={styles.pagoValor}>
                    ${transaccion.pago.monto} {transaccion.pago.moneda || 'USD'}
                  </Text>
                </View>
              </View>

              <View style={styles.pagoItem}>
                <View style={styles.pagoIcono}>
                  <Ionicons name="document-text-outline" size={20} color="#27ae60" />
                </View>
                <View style={styles.pagoInfo}>
                  <Text style={styles.pagoLabel}>Concepto</Text>
                  <Text style={styles.pagoValor}>
                    {transaccion.pago.conceptoPago || 'Reserva'}
                  </Text>
                </View>
              </View>

              <View style={styles.pagoItem}>
                <View style={styles.pagoIcono}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#27ae60" />
                </View>
                <View style={styles.pagoInfo}>
                  <Text style={styles.pagoLabel}>Estado</Text>
                  <Text style={styles.pagoValor}>
                    {transaccion.pago.estado || 'Completado'}
                  </Text>
                </View>
              </View>

              {transaccion.pago.comprobante && (
                <View style={styles.pagoItem}>
                  <View style={styles.pagoIcono}>
                    <Ionicons name="receipt-outline" size={20} color="#27ae60" />
                  </View>
                  <View style={styles.pagoInfo}>
                    <Text style={styles.pagoLabel}>Comprobante</Text>
                    <Text style={styles.pagoValor}>
                      {transaccion.pago.comprobante}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.botonVerDetalle}
              onPress={handleVerPago}
              activeOpacity={0.7}
            >
              <Ionicons name="eye-outline" size={16} color="#27ae60" />
              <Text style={styles.textoBotonVerDetalle}>Ver detalles del pago</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sección de Factura */}
        {transaccion?.factura && (
          <View style={styles.facturaContainer}>
            <Text style={styles.sectionTitle}>Información de Facturación</Text>

            <View style={styles.facturaHighlight}>
              <View style={styles.facturaItem}>
                <View style={styles.facturaIcono}>
                  <Ionicons name="document-outline" size={20} color="#f39c12" />
                </View>
                <View style={styles.facturaInfo}>
                  <Text style={styles.facturaLabel}>Número de Factura</Text>
                  <Text style={styles.facturaValor}>
                    {transaccion.factura.numeroFactura}
                  </Text>
                </View>
              </View>

              <View style={styles.facturaItem}>
                <View style={styles.facturaIcono}>
                  <Ionicons name="calendar-outline" size={20} color="#f39c12" />
                </View>
                <View style={styles.facturaInfo}>
                  <Text style={styles.facturaLabel}>Fecha de Emisión</Text>
                  <Text style={styles.facturaValor}>
                    {new Date(transaccion.factura.fechaEmision).toLocaleDateString('es-ES')}
                  </Text>
                </View>
              </View>

              <View style={styles.facturaItem}>
                <View style={styles.facturaIcono}>
                  <Ionicons name="cash-outline" size={20} color="#f39c12" />
                </View>
                <View style={styles.facturaInfo}>
                  <Text style={styles.facturaLabel}>Total</Text>
                  <Text style={styles.facturaValor}>
                    ${transaccion.factura.total}
                  </Text>
                </View>
              </View>

              <View style={styles.facturaItem}>
                <View style={styles.facturaIcono}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#f39c12" />
                </View>
                <View style={styles.facturaInfo}>
                  <Text style={styles.facturaLabel}>Estado</Text>
                  <Text style={styles.facturaValor}>
                    {transaccion.factura.estado || 'Pagada'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.botonVerDetalle}
              onPress={handleVerFactura}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={16} color="#f39c12" />
              <Text style={styles.textoBotonVerDetalle}>Ver factura completa</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sección de Reserva */}
        {transaccion?.reserva && (
          <View style={styles.reservaContainer}>
            <Text style={styles.sectionTitle}>Detalles de la reserva</Text>

            <View style={styles.reservaHighlight}>
              <View style={styles.reservaItem}>
                <View style={styles.reservaIcono}>
                  <Ionicons name="business-outline" size={20} color="#4a90e2" />
                </View>
                <View style={styles.reservaInfo}>
                  <Text style={styles.reservaLabel}>Espacio reservado</Text>
                  <Text style={styles.reservaValor}>
                    {transaccion.reserva.espacioNombre ||
                      transaccion.reserva.entidadReservada?.nombre ||
                      transaccion?.oficina?.nombre}
                  </Text>
                </View>
              </View>

              {transaccion.reserva.entidadReservada?.tipo && (
                <View style={styles.reservaItem}>
                  <View style={styles.reservaIcono}>
                    <Ionicons name="albums-outline" size={20} color="#4a90e2" />
                  </View>
                  <View style={styles.reservaInfo}>
                    <Text style={styles.reservaLabel}>Tipo de espacio</Text>
                    <Text style={styles.reservaValor}>
                      {transaccion.reserva.entidadReservada.tipo}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.reservaItem}>
                <View style={styles.reservaIcono}>
                  <Ionicons name="today-outline" size={20} color="#4a90e2" />
                </View>
                <View style={styles.reservaInfo}>
                  <Text style={styles.reservaLabel}>Fecha de reserva</Text>
                  <Text style={styles.reservaValor}>{transaccion.reserva.fecha}</Text>
                </View>
              </View>

              <View style={styles.reservaItem}>
                <View style={styles.reservaIcono}>
                  <Ionicons name="time-outline" size={20} color="#4a90e2" />
                </View>
                <View style={styles.reservaInfo}>
                  <Text style={styles.reservaLabel}>Horario</Text>
                  <Text style={styles.reservaValor}>
                    {transaccion.reserva.horaInicio} - {transaccion.reserva.horaFin}
                  </Text>
                </View>
              </View>

              <View style={styles.reservaItem}>
                <View style={styles.reservaIcono}>
                  <Ionicons name="people-outline" size={20} color="#4a90e2" />
                </View>
                <View style={styles.reservaInfo}>
                  <Text style={styles.reservaLabel}>Número de personas</Text>
                  <Text style={styles.reservaValor}>{transaccion.reserva.cantidadPersonas}</Text>
                </View>
              </View>

              <View style={styles.reservaItem}>
                <View style={styles.reservaIcono}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#4a90e2" />
                </View>
                <View style={styles.reservaInfo}>
                  <Text style={styles.reservaLabel}>Estado</Text>
                  <Text style={styles.reservaValor}>
                    {transaccion.reserva.estado || 'Confirmada'}
                  </Text>
                </View>
              </View>
            </View>

            {transaccion.reserva.serviciosAdicionales && transaccion.reserva.serviciosAdicionales.length > 0 && (
              <View style={styles.serviciosContainer}>
                <Text style={styles.serviciosTitle}>Servicios adicionales</Text>
                {transaccion.reserva.serviciosAdicionales.map((servicio, index) => (
                  <View key={index} style={styles.servicioItem}>
                    <View style={styles.servicioInfo}>
                      <Text style={styles.servicioNombre}>{servicio.nombre}</Text>
                      <Text style={styles.servicioPrecio}>
                        ${servicio.precio}/{servicio.unidadPrecio}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.botonVerDetalle}
              onPress={handleVerReserva}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={16} color="#4a90e2" />
              <Text style={styles.textoBotonVerDetalle}>Ver detalles de la reserva</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.botonesContainer}>
          <TouchableOpacity
            style={styles.botonImprimir}
            onPress={handleImprimir}
            activeOpacity={0.7}
          >
            <Ionicons name="print-outline" size={20} color="#fff" style={styles.iconoBoton} />
            <Text style={styles.textoBotonImprimir}>Imprimir comprobante</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonCompartir}
            onPress={handleCompartir}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={20} color="#fff" style={styles.iconoBoton} />
            <Text style={styles.textoBotonCompartir}>Compartir comprobante</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoAdicionalContainer}>
          <Text style={styles.infoAdicionalTitulo}>Información adicional</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcono}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#666" />
            </View>
            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>Estado</Text>
              <Text style={styles.infoValor}>Transacción completada</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcono}>
              <Ionicons name="pricetag-outline" size={16} color="#666" />
            </View>
            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>Categoría</Text>
              <Text style={styles.infoValor}>
                {transaccion?.reserva ? 'Reserva de espacio' : 'Compra'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcono}>
              <Ionicons name="time-outline" size={16} color="#666" />
            </View>
            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>Procesado</Text>
              <Text style={styles.infoValor}>
                {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          {transaccion?.pago?.id && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcono}>
                <Ionicons name="card-outline" size={16} color="#666" />
              </View>
              <View style={styles.infoTexto}>
                <Text style={styles.infoLabel}>ID de Pago</Text>
                <Text style={styles.infoValor}>
                  {transaccion.pago.id || transaccion.pago._id}
                </Text>
              </View>
            </View>
          )}

          {transaccion?.factura?.numeroFactura && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcono}>
                <Ionicons name="document-outline" size={16} color="#666" />
              </View>
              <View style={styles.infoTexto}>
                <Text style={styles.infoLabel}>Factura</Text>
                <Text style={styles.infoValor}>
                  {transaccion.factura.numeroFactura}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.problemaContainer}>
          <TouchableOpacity
            style={styles.problemaLink}
            onPress={handleReportarProblema}
            activeOpacity={0.7}
          >
            <Text style={styles.problemaTexto}>
              ¿Tienes un problema con esta {transaccion?.reserva ? 'reserva' : 'transacción'}?
            </Text>
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
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    fontFamily: 'System',
  },
  transaccionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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

  pagoContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pagoHighlight: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  pagoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1f5fe',
  },
  pagoIcono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pagoInfo: {
    flex: 1,
  },
  pagoLabel: {
    fontSize: 13,
    color: '#27ae60',
    fontFamily: 'System',
    marginBottom: 2,
    fontWeight: '600',
  },
  pagoValor: {
    fontSize: 15,
    color: '#1565c0',
    fontWeight: '600',
    fontFamily: 'System',
  },

  facturaContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  facturaHighlight: {
    backgroundColor: '#fff9f0',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  facturaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fef5e7',
  },
  facturaIcono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  facturaInfo: {
    flex: 1,
  },
  facturaLabel: {
    fontSize: 13,
    color: '#f39c12',
    fontFamily: 'System',
    marginBottom: 2,
    fontWeight: '600',
  },
  facturaValor: {
    fontSize: 15,
    color: '#d68910',
    fontWeight: '600',
    fontFamily: 'System',
  },

  reservaContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reservaHighlight: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  reservaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1f5fe',
  },
  reservaIcono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reservaInfo: {
    flex: 1,
  },
  reservaLabel: {
    fontSize: 13,
    color: '#4a90e2',
    fontFamily: 'System',
    marginBottom: 2,
    fontWeight: '600',
  },
  reservaValor: {
    fontSize: 15,
    color: '#1565c0',
    fontWeight: '600',
    fontFamily: 'System',
  },
  serviciosContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#fafafa',
    borderRadius: 8,
  },
  serviciosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    fontFamily: 'System',
  },
  servicioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  servicioInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicioNombre: {
    fontSize: 14,
    color: '#2c3e50',
    fontFamily: 'System',
  },
  servicioPrecio: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
    fontFamily: 'System',
  },

  botonVerDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#e3e3e3',
  },
  textoBotonVerDetalle: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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