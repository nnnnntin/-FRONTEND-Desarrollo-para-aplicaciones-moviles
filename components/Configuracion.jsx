import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import i18n from '../i18n/i18n';

const Configuracion = ({ navigation }) => {
  const { t } = useTranslation();

  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleLanguageChange = async (newLanguage) => {
    if (isChangingLanguage || newLanguage === i18n.language) return;

    setIsChangingLanguage(true);

    try {
      await i18n.changeLanguage(newLanguage);

      setTimeout(() => {
        const languageName = newLanguage === 'es' ?
          (newLanguage === 'es' ? 'Español' : 'Spanish') :
          (newLanguage === 'es' ? 'Inglés' : 'English');

        Alert.alert(
          t('configuration.alerts.languageChanged'),
          t('configuration.alerts.languageChangedMessage', { language: languageName }),
          [{ text: t('addPaymentMethodForm.common.ok'), onPress: () => {} }]
        );
      }, 100);

    } catch (error) {
      console.error(error);
      Alert.alert(
        t('alerts.error'),
        'Error al cambiar el idioma / Error changing language',
        [{ text: t('alerts.ok'), onPress: () => {} }]
      );
    } finally {
      setIsChangingLanguage(false);
    }
  };

  const getLanguageName = (lang) => {
    return lang === 'es' ? t('configuration.language.spanish') : t('configuration.language.english');
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
        <Text style={styles.headerTitle}>{t('configuration.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('configuration.language.title')}</Text>
          <Text style={styles.sectionSubtitle}>{t('configuration.language.subtitle')}</Text>

          <View style={styles.currentLanguageContainer}>
            <Text style={styles.currentLanguageText}>
              {t('configuration.language.current', { language: getLanguageName(i18n.language) })}
            </Text>
          </View>

          <View style={styles.languageOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.languageOption,
                i18n.language === 'es' && styles.languageOptionSelected
              ]}
              onPress={() => handleLanguageChange('es')}
              disabled={isChangingLanguage}
              activeOpacity={0.7}
            >
              <View style={styles.languageOptionContent}>
                <Text style={[
                  styles.languageOptionText,
                  i18n.language === 'es' && styles.languageOptionTextSelected
                ]}>
                  {t('configuration.language.spanish')}
                </Text>
                <Text style={[
                  styles.languageOptionSubtext,
                  i18n.language === 'es' && styles.languageOptionSubtextSelected
                ]}>
                  Español
                </Text>
              </View>
              {i18n.language === 'es' && (
                <Ionicons name="checkmark-circle" size={24} color="#4a90e2" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                i18n.language === 'en' && styles.languageOptionSelected
              ]}
              onPress={() => handleLanguageChange('en')}
              disabled={isChangingLanguage}
              activeOpacity={0.7}
            >
              <View style={styles.languageOptionContent}>
                <Text style={[
                  styles.languageOptionText,
                  i18n.language === 'en' && styles.languageOptionTextSelected
                ]}>
                  {t('configuration.language.english')}
                </Text>
                <Text style={[
                  styles.languageOptionSubtext,
                  i18n.language === 'en' && styles.languageOptionSubtextSelected
                ]}>
                  English
                </Text>
              </View>
              {i18n.language === 'en' && (
                <Ionicons name="checkmark-circle" size={24} color="#4a90e2" />
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    fontFamily: 'System',
    marginBottom: 20,
  },
  currentLanguageContainer: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  currentLanguageText: {
    fontSize: 14,
    color: '#27ae60',
    fontFamily: 'System',
    fontWeight: '500',
  },
  languageOptionsContainer: {
    gap: 12,
  },
  languageOption: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  languageOptionSelected: {
    borderColor: '#4a90e2',
    backgroundColor: '#f0f8ff',
  },
  languageOptionContent: {
    flex: 1,
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
    marginBottom: 4,
  },
  languageOptionTextSelected: {
    color: '#4a90e2',
  },
  languageOptionSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  languageOptionSubtextSelected: {
    color: '#4a90e2',
  },
});

export default Configuracion;