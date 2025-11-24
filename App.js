import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Appbar, TextInput, Button, Card, RadioButton, List, Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const webViewRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState('https://google.com');
  const [urlInput, setUrlInput] = useState('https://google.com');
  const [showUASelector, setShowUASelector] = useState(false);
  const [selectedUA, setSelectedUA] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isLoading, setIsLoading] = useState(false);

  // USER-AGENTS database (de tu extensión)
  const userAgents = {
    desktop: [
      { 
        name: "Windows 10 - Chrome", 
        value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        resolution: "1920x1080"
      },
      { 
        name: "Windows 7/10 - IE 11", 
        value: "Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko",
        resolution: "1366x768"
      },
      { 
        name: "macOS - Chrome", 
        value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        resolution: "1440x900"
      },
      { 
        name: "macOS - Safari", 
        value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
        resolution: "1440x900"
      },
      { 
        name: "Linux - Chrome", 
        value: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        resolution: "1366x768"
      }
    ],
    mobile: [
      { 
        name: "Android Phone - Chrome", 
        value: "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        resolution: "412x915"
      },
      { 
        name: "Android Tablet", 
        value: "Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        resolution: "800x1280"
      },
      { 
        name: "iPhone - Safari", 
        value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        resolution: "390x844"
      },
      { 
        name: "iPad - Safari", 
        value: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        resolution: "834x1194"
      }
    ]
  };

  // IDIOMAS (de tu extensión)
  const languageProfiles = {
    "en-US": "English (US)",
    "es-ES": "Español (ES)", 
    "fr-FR": "Français (FR)",
    "de-DE": "Deutsch (DE)",
    "ja-JP": "日本語 (JP)",
    "pt-BR": "Português (BR)"
  };

  // Cargar configuración guardada
  useEffect(() => {
    loadSavedSettings();
  }, []);

  const loadSavedSettings = async () => {
    try {
      const savedUA = await AsyncStorage.getItem('selectedUA');
      const savedLang = await AsyncStorage.getItem('selectedLanguage');
      if (savedUA) setSelectedUA(savedUA);
      if (savedLang) setSelectedLanguage(savedLang);
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  // Navegar a URL
  const navigate = () => {
    let url = urlInput.trim();
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    setCurrentUrl(url);
    setUrlInput(url);
  };

  // Aplicar User-Agent
  const applyUserAgent = async (ua) => {
    setSelectedUA(ua);
    await AsyncStorage.setItem('selectedUA', ua);
    setShowUASelector(false);
    
    // Recargar página con nuevo User-Agent
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  // Aplicar Idioma
  const applyLanguage = async (lang) => {
    setSelectedLanguage(lang);
    await AsyncStorage.setItem('selectedLanguage', lang);
    
    // Recargar página con nuevo idioma
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  // Reset configuración
  const resetSettings = async () => {
    setSelectedUA('');
    setSelectedLanguage('en-US');
    await AsyncStorage.multiRemove(['selectedUA', 'selectedLanguage']);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        
        {/* HEADER CON BUSCADOR */}
        <Appbar.Header>
          <Appbar.Action 
            icon="menu" 
            onPress={() => setShowUASelector(true)} 
          />
          
          <TextInput
            style={styles.urlInput}
            value={urlInput}
            onChangeText={setUrlInput}
            onSubmitEditing={navigate}
            placeholder="Ingresa URL o busca..."
            mode="outlined"
            dense
          />
          
          <Appbar.Action 
            icon="magnify" 
            onPress={navigate} 
          />
        </Appbar.Header>

        {/* BARRA DE NAVEGACIÓN */}
        <View style={styles.navBar}>
          <Button 
            mode="text" 
            icon="arrow-left" 
            onPress={() => webViewRef.current?.goBack()}
          >
            Atrás
          </Button>
          
          <Button 
            mode="text" 
            icon="arrow-right" 
            onPress={() => webViewRef.current?.goForward()}
          >
            Adelante
          </Button>
          
          <Button 
            mode="text" 
            icon="reload" 
            onPress={() => webViewRef.current?.reload()}
          >
            Recargar
          </Button>
          
          <Button 
            mode="text" 
            icon="home" 
            onPress={() => {
              setUrlInput('https://google.com');
              setCurrentUrl('https://google.com');
            }}
          >
            Inicio
          </Button>
        </View>

        {/* INDICADOR DE CONFIGURACIÓN ACTUAL */}
        <View style={styles.configBar}>
          <Text style={styles.configText}>
            {selectedUA ? 'User-Agent: ' + userAgents.desktop.concat(userAgents.mobile)
              .find(ua => ua.value === selectedUA)?.name : 'User-Agent: Predeterminado'}
          </Text>
          <Text style={styles.configText}>
            Idioma: {languageProfiles[selectedLanguage]}
          </Text>
        </View>

        {/* NAVEGADOR WEBVIEW */}
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          style={styles.webview}
          userAgent={selectedUA}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
          injectedJavaScript={`
            // Inyectar configuración de idioma
            Object.defineProperty(navigator, 'language', {
              get: function() { return '${selectedLanguage}'; }
            });
            Object.defineProperty(navigator, 'languages', {
              get: function() { return ['${selectedLanguage}', '${selectedLanguage.split('-')[0]}', 'en']; }
            });
            true;
          `}
        />

        {/* MODAL SELECTOR USER-AGENT */}
        <Modal
          visible={showUASelector}
          animationType="slide"
          onRequestClose={() => setShowUASelector(false)}
        >
          <View style={styles.modalContainer}>
            <Appbar.Header>
              <Appbar.BackAction onPress={() => setShowUASelector(false)} />
              <Appbar.Content title="Configurar User-Agent" />
              <Appbar.Action icon="refresh" onPress={resetSettings} />
            </Appbar.Header>

            <ScrollView style={styles.modalContent}>
              
              {/* SELECTOR DE IDIOMA */}
              <Card style={styles.sectionCard}>
                <Card.Title title="Idioma y Región" />
                <Card.Content>
                  {Object.entries(languageProfiles).map(([code, name]) => (
                    <TouchableOpacity
                      key={code}
                      style={[
                        styles.languageItem,
                        selectedLanguage === code && styles.selectedItem
                      ]}
                      onPress={() => applyLanguage(code)}
                    >
                      <RadioButton
                        value={code}
                        status={selectedLanguage === code ? 'checked' : 'unchecked'}
                        onPress={() => applyLanguage(code)}
                      />
                      <Text style={styles.languageText}>{name}</Text>
                    </TouchableOpacity>
                  ))}
                </Card.Content>
              </Card>

              {/* USER-AGENTS ESCRITORIO */}
              <Card style={styles.sectionCard}>
                <Card.Title title="Modo Escritorio" />
                <Card.Content>
                  {userAgents.desktop.map((ua, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.uaItem,
                        selectedUA === ua.value && styles.selectedItem
                      ]}
                      onPress={() => applyUserAgent(ua.value)}
                    >
                      <RadioButton
                        value={ua.value}
                        status={selectedUA === ua.value ? 'checked' : 'unchecked'}
                        onPress={() => applyUserAgent(ua.value)}
                      />
                      <View style={styles.uaInfo}>
                        <Text style={styles.uaName}>{ua.name}</Text>
                        <Text style={styles.uaResolution}>{ua.resolution}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </Card.Content>
              </Card>

              {/* USER-AGENTS MÓVIL */}
              <Card style={styles.sectionCard}>
                <Card.Title title="Modo Móvil" />
                <Card.Content>
                  {userAgents.mobile.map((ua, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.uaItem,
                        selectedUA === ua.value && styles.selectedItem
                      ]}
                      onPress={() => applyUserAgent(ua.value)}
                    >
                      <RadioButton
                        value={ua.value}
                        status={selectedUA === ua.value ? 'checked' : 'unchecked'}
                        onPress={() => applyUserAgent(ua.value)}
                      />
                      <View style={styles.uaInfo}>
                        <Text style={styles.uaName}>{ua.name}</Text>
                        <Text style={styles.uaResolution}>{ua.resolution}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </Card.Content>
              </Card>

              {/* BOTÓN RESET */}
              <Button 
                mode="outlined" 
                style={styles.resetButton}
                onPress={resetSettings}
                icon="refresh"
              >
                Restablecer Configuración
              </Button>

            </ScrollView>
          </View>
        </Modal>

      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  urlInput: {
    flex: 1,
    marginHorizontal: 10,
    height: 40,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 5,
    justifyContent: 'space-around',
  },
  configBar: {
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#bbdefb',
  },
  configText: {
    fontSize: 12,
    color: '#1565c0',
    fontWeight: '500',
  },
  webview: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalContent: {
    flex: 1,
    padding: 10,
  },
  sectionCard: {
    marginBottom: 15,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  uaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
  languageText: {
    fontSize: 16,
    marginLeft: 8,
  },
  uaInfo: {
    marginLeft: 8,
    flex: 1,
  },
  uaName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  uaResolution: {
    fontSize: 12,
    color: '#666',
  },
  resetButton: {
    margin: 15,
    marginTop: 5,
  },
});
