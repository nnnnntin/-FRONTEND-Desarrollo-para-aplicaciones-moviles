import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const ConfiguracionAdmin = ({ navigation }) => {
  const [configuracion, setConfiguracion] = useState({
    general: {
      nombrePlataforma: 'Officereserve',
      emailContacto: 'admin@officereserve.com',
      telefonoSoporte: '+598 2900 0000',
      direccionEmpresa: 'Montevideo, Uruguay'
    },
    notificaciones: {
      nuevasPublicaciones: true,
      pagosRealizados: true,
      reportesProblemas: true,
      nuevosUsuarios: true,
      metasAlcanzadas: true,
      emailResumenDiario: false
    },
    seguridad: {
      verificacionDosFactores: false,
      sesionMaxima: 24,
      intentosMaximos: 5,
      bloqueoTemporal: 30
    },
    mantenimiento: {
      modoMantenimiento: false,
      mensajeMantenimiento: 'Estamos realizando mejoras. Volveremos pronto.',
      respaldoAutomatico: true,
      frecuenciaRespaldo: 'diario'
    },
    politicas: {
      diasCancelacionGratuita: 2,
      penalizacionCancelacion: 10,
      tiempoMaximoReserva: 30,
      anticipacionMinimaReserva: 1
    }
  });

  const [editando, setEditando] = useState(null);
  const [tempValue, setTempValue] = useState('');

  const handleToggle = (categoria, campo) => {
    setConfiguracion(prev => ({
      ...prev,
      [categoria]: {
        ...prev[categoria],
        [campo]: !prev[categoria][campo]
      }
    }));
  };

  const handleEdit = (categoria, campo, valor) => {
    setEditando(`${categoria}.${campo}`);
    setTempValue(valor.toString());
  };

  const handleSave = (categoria, campo) => {
    setConfiguracion(prev => ({
      ...prev,
      [categoria]: {
        ...prev[categoria],
        [campo]: isNaN(tempValue) ? tempValue : Number(tempValue)
      }
    }));
    setEditando(null);
    setTempValue('');
  };

  const handleCancel = () => {
    setEditando(null);
    setTempValue('');
  };

  const handleGuardarCambios = () => {
    Alert.alert(
      'Guardar configuración',
      '¿Confirmar los cambios en la configuración?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: () => {
            Alert.alert('Éxito', 'Configuración actualizada correctamente');
          }
        }
      ]
    );
  };

  const handleReiniciarDefecto = () => {
    Alert.alert(
      'Restablecer configuración',
      '¿Restablecer toda la configuración a los valores por defecto? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Éxito', 'Configuración restablecida');
          }
        }
      ]
    );
  };

  const renderEditableField = (categoria, campo, valor, tipo = 'text') => {
    const isEditing = editando === `${categoria}.${campo}`;

    return (
      <View style={styles.campoEditable}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={tempValue}
              onChangeText={setTempValue}
              keyboardType={tipo === 'number' ? 'numeric' : 'default'}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => handleSave(categoria, campo)}
              style={styles.editButton}
            >
              <Ionicons name="checkmark" size={20} color="#27ae60" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.editButton}
            >
              <Ionicons name="close" size={20} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.valorContainer}
            onPress={() => handleEdit(categoria, campo, valor)}
          >
            <Text style={styles.valor}>{valor}</Text>
            <Ionicons name="create-outline" size={16} color="#4a90e2" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <TouchableOpacity
          onPress={handleReiniciarDefecto}
          style={styles.resetButton}
        >
          <Ionicons name="refresh" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.seccion}>
          <View style={styles.seccionHeader}>
            <Ionicons name="settings" size={20} color="#4a90e2" />
            <Text style={styles.seccionTitulo}>Configuración General</Text>
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Nombre de la plataforma</Text>
            {renderEditableField('general', 'nombrePlataforma', configuracion.general.nombrePlataforma)}
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Email de contacto</Text>
            {renderEditableField('general', 'emailContacto', configuracion.general.emailContacto)}
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Teléfono de soporte</Text>
            {renderEditableField('general', 'telefonoSoporte', configuracion.general.telefonoSoporte)}
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Dirección de la empresa</Text>
            {renderEditableField('general', 'direccionEmpresa', configuracion.general.direccionEmpresa)}
          </View>
        </View>

        <View style={styles.seccion}>
          <View style={styles.seccionHeader}>
            <Ionicons name="notifications" size={20} color="#f39c12" />
            <Text style={styles.seccionTitulo}>Notificaciones</Text>
          </View>

          <View style={styles.switchCampo}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Nuevas publicaciones</Text>
              <Text style={styles.switchDescripcion}>
                Notificar cuando se creen nuevas publicaciones
              </Text>
            </View>
            <Switch
              value={configuracion.notificaciones.nuevasPublicaciones}
              onValueChange={() => handleToggle('notificaciones', 'nuevasPublicaciones')}
              trackColor={{ false: '#e1e5e9', true: '#4a90e2' }}
            />
          </View>

          <View style={styles.switchCampo}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Pagos realizados</Text>
              <Text style={styles.switchDescripcion}>
                Alertas de pagos y comisiones procesadas
              </Text>
            </View>
            <Switch
              value={configuracion.notificaciones.pagosRealizados}
              onValueChange={() => handleToggle('notificaciones', 'pagosRealizados')}
              trackColor={{ false: '#e1e5e9', true: '#4a90e2' }}
            />
          </View>

          <View style={styles.switchCampo}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Reportes de problemas</Text>
              <Text style={styles.switchDescripcion}>
                Notificar sobre nuevos reportes de usuarios
              </Text>
            </View>
            <Switch
              value={configuracion.notificaciones.reportesProblemas}
              onValueChange={() => handleToggle('notificaciones', 'reportesProblemas')}
              trackColor={{ false: '#e1e5e9', true: '#4a90e2' }}
            />
          </View>

          <View style={styles.switchCampo}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Resumen diario por email</Text>
              <Text style={styles.switchDescripcion}>
                Enviar resumen de actividad diaria al email
              </Text>
            </View>
            <Switch
              value={configuracion.notificaciones.emailResumenDiario}
              onValueChange={() => handleToggle('notificaciones', 'emailResumenDiario')}
              trackColor={{ false: '#e1e5e9', true: '#4a90e2' }}
            />
          </View>
        </View>

        <View style={styles.seccion}>
          <View style={styles.seccionHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#27ae60" />
            <Text style={styles.seccionTitulo}>Seguridad</Text>
          </View>

          <View style={styles.switchCampo}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Verificación de dos factores</Text>
              <Text style={styles.switchDescripcion}>
                Requiere código adicional al iniciar sesión
              </Text>
            </View>
            <Switch
              value={configuracion.seguridad.verificacionDosFactores}
              onValueChange={() => handleToggle('seguridad', 'verificacionDosFactores')}
              trackColor={{ false: '#e1e5e9', true: '#27ae60' }}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Duración máxima de sesión (horas)</Text>
            {renderEditableField('seguridad', 'sesionMaxima', configuracion.seguridad.sesionMaxima, 'number')}
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Intentos máximos de login</Text>
            {renderEditableField('seguridad', 'intentosMaximos', configuracion.seguridad.intentosMaximos, 'number')}
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Tiempo de bloqueo (minutos)</Text>
            {renderEditableField('seguridad', 'bloqueoTemporal', configuracion.seguridad.bloqueoTemporal, 'number')}
          </View>
        </View>

        <View style={styles.seccion}>
          <View style={styles.seccionHeader}>
            <Ionicons name="construct" size={20} color="#9b59b6" />
            <Text style={styles.seccionTitulo}>Mantenimiento</Text>
          </View>

          <View style={styles.switchCampo}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Modo mantenimiento</Text>
              <Text style={styles.switchDescripcion}>
                Desactiva temporalmente el acceso a usuarios
              </Text>
            </View>
            <Switch
              value={configuracion.mantenimiento.modoMantenimiento}
              onValueChange={() => handleToggle('mantenimiento', 'modoMantenimiento')}
              trackColor={{ false: '#e1e5e9', true: '#e74c3c' }}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Mensaje de mantenimiento</Text>
            {renderEditableField('mantenimiento', 'mensajeMantenimiento', configuracion.mantenimiento.mensajeMantenimiento)}
          </View>

          <View style={styles.switchCampo}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Respaldo automático</Text>
              <Text style={styles.switchDescripcion}>
                Realizar respaldos automáticos de la base de datos
              </Text>
            </View>
            <Switch
              value={configuracion.mantenimiento.respaldoAutomatico}
              onValueChange={() => handleToggle('mantenimiento', 'respaldoAutomatico')}
              trackColor={{ false: '#e1e5e9', true: '#27ae60' }}
            />
          </View>
        </View>

        <View style={styles.seccion}>
          <View style={styles.seccionHeader}>
            <Ionicons name="document-text" size={20} color="#e67e22" />
            <Text style={styles.seccionTitulo}>Políticas de la plataforma</Text>
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Días para cancelación gratuita</Text>
            {renderEditableField('politicas', 'diasCancelacionGratuita', configuracion.politicas.diasCancelacionGratuita, 'number')}
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Penalización por cancelación (%)</Text>
            {renderEditableField('politicas', 'penalizacionCancelacion', configuracion.politicas.penalizacionCancelacion, 'number')}
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Tiempo máximo de reserva (días)</Text>
            {renderEditableField('politicas', 'tiempoMaximoReserva', configuracion.politicas.tiempoMaximoReserva, 'number')}
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Anticipación mínima para reservar (horas)</Text>
            {renderEditableField('politicas', 'anticipacionMinimaReserva', configuracion.politicas.anticipacionMinimaReserva, 'number')}
          </View>
        </View>

        <TouchableOpacity
          style={styles.guardarButton}
          onPress={handleGuardarCambios}
        >
          <Ionicons name="save" size={20} color="#fff" />
          <Text style={styles.guardarButtonText}>Guardar cambios</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
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
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  resetButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  seccion: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 1,
  },
  seccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  campo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  campoEditable: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    minHeight: 45,
    justifyContent: 'center',
  },
  valorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  valor: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    paddingVertical: 8,
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
  switchCampo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 4,
  },
  switchDescripcion: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  guardarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    elevation: 3,
  },
  guardarButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomSpacing: {
    height: 30,
  },
});

export default ConfiguracionAdmin;