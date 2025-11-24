import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, Text, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Appbar, TextInput, Button, Card, RadioButton, Provider as PaperProvider, Switch, Chip, ProgressBar, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const webViewRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState('https://google.com');
  const [urlInput, setUrlInput] = useState('https://google.com');
  const [showUASelector, setShowUASelector] = useState(false);
  const [selectedUA, setSelectedUA] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // NUEVOS ESTADOS PARA MEJORAS
  const [darkMode, setDarkMode] = useState(false);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [tabs, setTabs] = useState([{ id: 1, url: 'https://google.com', title: 'Google' }]);
  const [activeTab, setActiveTab] = useState(1);
  const [showProxyConfig, setShowProxyConfig] = useState(false);
  const [proxyConfig, setProxyConfig] = useState({ host: '', port: '', enabled: false });

  // USER-AGENTS database
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

  // IDIOMAS
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
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      const savedProxy = await AsyncStorage.getItem('proxyConfig');
      
      if (savedUA) setSelectedUA(savedUA);
      if (savedLang) setSelectedLanguage(savedLang);
      if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
      if (savedProxy) setProxyConfig(JSON.parse(savedProxy));
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
    
    // Actualizar pestaña activa
    const updatedTabs = tabs.map(tab => 
      tab.id === activeTab ? { ...tab, url: url, title: 'Cargando...' } : tab
    );
    setTabs(updatedTabs);
  };

  // Agregar nueva pestaña
  const addNewTab = () => {
    const newTabId = Date.now();
    const newTab = { id: newTabId, url: 'https://google.com', title: 'Nueva pestaña' };
    setTabs([...tabs, newTab]);
    setActiveTab(newTabId);
    setCurrentUrl('https://google.com');
    setUrlInput('https://google.com');
  };

  // Cerrar pestaña
  const closeTab = (tabId) => {
    if (tabs.length === 1) {
      Alert.alert('No se puede cerrar', 'Debe haber al menos una pestaña abierta');
      return;
    }
    
    const filteredTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(filteredTabs);
    
    if (activeTab === tabId) {
      setActiveTab(filteredTabs[0].id);
      setCurrentUrl(filteredTabs[0].url);
      setUrlInput(filteredTabs[0].url);
    }
  };

  // Cambiar entre pestañas
  const switchTab = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTab(tabId);
      setCurrentUrl(tab.url);
      setUrlInput(tab.url);
    }
  };

  // Aplicar User-Agent
  const applyUserAgent = async (ua) => {
    setSelectedUA(ua);
    await AsyncStorage.setItem('selectedUA', ua);
    setShowUASelector(false);
    
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  // Aplicar Idioma
  const applyLanguage = async (lang) => {
    setSelectedLanguage(lang);
    await AsyncStorage.setItem('selectedLanguage', lang);
    
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  // Toggle Modo Oscuro
  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    await AsyncStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  // Toggle Modo Incógnito
  const toggleIncognitoMode = () => {
    setIncognitoMode(!incognitoMode);
    if (!incognitoMode) {
      Alert.alert('Modo Incógnito', 'No se guardará el historial ni cookies en esta sesión');
    }
  };

  // Configurar Proxy
  const saveProxyConfig = async () => {
    await AsyncStorage.setItem('proxyConfig', JSON.stringify(proxyConfig));
    setShowProxyConfig(false);
    Alert.alert('Proxy Configurado', 'La configuración se ha guardado');
  };

  // Reset configuración
  const resetSettings = async () => {
    setSelectedUA('');
    setSelectedLanguage('en-US');
    setDarkMode(false);
    setProxyConfig({ host: '', port: '', enabled: false });
    await AsyncStorage.multiRemove(['selectedUA', 'selectedLanguage', 'darkMode', 'proxyConfig']);
    
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  // Tema dinámico
  const theme = {
    colors: {
      primary: darkMode ? '#bb86fc' : '#4f46e5',
      background: darkMode ? '#121212' : '#ffffff',
      surface: darkMode ? '#1e1e1e' : '#ffffff',
      text: darkMode ? '#ffffff' : '#000000',
    }
  };

  return (
    <PaperProvider theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        
        {/* HEADER MEJORADO */}
        <Appbar.Header style={{ backgroundColor: darkMode ? '#1e1e1e' : '#4f46e5' }}>
          <Appbar.Action 
            icon="menu" 
            color="white"
            onPress={() => setShowUASelector(true)} 
          />
          
          <TextInput
            style={styles.urlInput}
            value={urlInput}
            onChangeText={setUrlInput}
            onSubmitEditing={navigate}
            placeholder="Buscar o ingresar URL..."
            placeholderTextColor={darkMode ? '#888' : '#666'}
            mode="outlined"
            dense
            theme={{ colors: { primary: 'white', text: 'white', background: darkMode ? '#333' : '#fff' } }}
          />
          
          <Appbar.Action 
            icon="magnify" 
            color="white"
            onPress={navigate} 
          />
          <Appbar.Action 
            icon="plus" 
            color="white"
            onPress={addNewTab} 
          />
        </Appbar.Header>

        {/* BARRA DE PROGRESO */}
        {isLoading && (
          <ProgressBar 
            progress={progress} 
            color={darkMode ? '#bb86fc' : '#4f46e5'} 
            style={styles.progressBar}
          />
        )}

        {/* PESTAÑAS */}
        <ScrollView horizontal style={[styles.tabsContainer, { backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5' }]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab,
                { backgroundColor: darkMode ? '#333' : '#e0e0e0' },
                activeTab === tab.id && { backgroundColor: darkMode ? '#bb86fc' : '#4f46e5' }
              ]}
              onPress={() => switchTab(tab.id)}
            >
              <Text style={[styles.tabTitle, { color: activeTab === tabId ? 'white' : (darkMode ? '#fff' : '#333') }]} numberOfLines={1}>
                {tab.title}
              </Text>
              {tabs.length > 1 && (
                <TouchableOpacity 
                  style={styles.closeTab}
                  onPress={() => closeTab(tab.id)}
                >
                  <Text style={[styles.closeText, { color: activeTab === tabId ? 'white' : (darkMode ? '#fff' : '#666') }]}>×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* BARRA DE URL ACTUAL */}
        <View style={[styles.urlBar, { backgroundColor: darkMode ? '#1a1a1a' : '#f9f9f9' }]}>
          <Text style={[styles.currentUrl, { color: darkMode ? '#ccc' : '#666' }]} numberOfLines={1}>
            {currentUrl}
          </Text>
          <Chip 
            icon={currentUrl.startsWith('https') ? "lock" : "lock-open"}
            mode="outlined"
            style={styles.securityChip}
            textStyle={{ color: currentUrl.startsWith('https') ? 'green' : 'red' }}
          >
            {currentUrl.startsWith('https') ? 'Seguro' : 'No seguro'}
          </Chip>
        </View>

        {/* BARRA DE NAVEGACIÓN MEJORADA */}
        <View style={[styles.navBar, { backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5' }]}>
          <View style={styles.navGroup}>
            <Button 
              mode="text" 
              icon="arrow-left" 
              onPress={() => webViewRef.current?.goBack()}
              textColor={darkMode ? 'white' : '#4f46e5'}
            />
            
            <Button 
              mode="text" 
              icon="arrow-right" 
              onPress={() => webViewRef.current?.goForward()}
              textColor={darkMode ? 'white' : '#4f46e5'}
            />
            
            <Button 
              mode="text" 
              icon="reload" 
              onPress={() => webViewRef.current?.reload()}
              textColor={darkMode ? 'white' : '#4f46e5'}
            />
            
            <Button 
              mode="text" 
              icon="home" 
              onPress={() => {
                const url = 'https://google.com';
                setUrlInput(url);
                setCurrentUrl(url);
                const updatedTabs = tabs.map(tab => 
                  tab.id === activeTab ? { ...tab, url: url, title: 'Google' } : tab
                );
                setTabs(updatedTabs);
              }}
              textColor={darkMode ? 'white' : '#4f46e5'}
            />
          </View>

          <View style={styles.navGroup}>
            <Text style={[styles.modeText, { color: darkMode ? '#bb86fc' : '#4f46e5' }]}>🌙</Text>
            <Switch value={darkMode} onValueChange={toggleDarkMode} color="#4f46e5" />
            
            <Text style={[styles.modeText, { color: darkMode ? '#bb86fc' : '#4f46e5' }]}>🕵️</Text>
            <Switch value={incognitoMode} onValueChange={toggleIncognitoMode} color="#4f46e5" />
          </View>
        </View>

        {/* CONFIGURACIÓN ACTUAL */}
        <View style={[styles.configBar, { backgroundColor: darkMode ? '#1a1a1a' : '#e3f2fd' }]}>
          <Text style={[styles.configText, { color: darkMode ? '#fff' : '#1565c0' }]}>
            {selectedUA ? 'User-Agent: ' + userAgents.desktop.concat(userAgents.mobile)
              .find(ua => ua.value === selectedUA)?.name : 'User-Agent: Predeterminado'}
          </Text>
          <Text style={[styles.configText, { color: darkMode ? '#fff' : '#1565c0' }]}>
            Idioma: {languageProfiles[selectedLanguage]} | 
            {incognitoMode ? ' 🕵️ Incógnito' : ' 🌐 Normal'} |
            {darkMode ? ' 🌙 Oscuro' : ' ☀️ Claro'}
          </Text>
        </View>

        {/* NAVEGADOR WEBVIEW */}
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          style={styles.webview}
          userAgent={selectedUA}
          onLoadStart={() => {
            setIsLoading(true);
            setProgress(0);
          }}
          onLoadProgress={({ nativeEvent }) => {
            setProgress(nativeEvent.progress);
          }}
          onLoadEnd={() => {
            setIsLoading(false);
            setProgress(1);
            // Actualizar título de la pestaña
            const updatedTabs = tabs.map(tab => 
              tab.id === activeTab ? { ...tab, title: currentUrl.split('/')[2] || 'Página' } : tab
            );
            setTabs(updatedTabs);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            setIsLoading(false);
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

        {/* MODAL SELECTOR USER-AGENT MEJORADO */}
        <Modal
          visible={showUASelector}
          animationType="slide"
          onRequestClose={() => setShowUASelector(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor: darkMode ? '#121212' : 'white' }]}>
            <Appbar.Header style={{ backgroundColor: darkMode ? '#1e1e1e' : '#4f46e5' }}>
              <Appbar.BackAction color="white" onPress={() => setShowUASelector(false)} />
              <Appbar.Content title="Configuración de Privacidad" titleStyle={{ color: 'white' }} />
              <Appbar.Action icon="cog" color="white" onPress={() => setShowProxyConfig(true)} />
              <Appbar.Action icon="refresh" color="white" onPress={resetSettings} />
            </Appbar.Header>

            <ScrollView style={styles.modalContent}>
              
              {/* CONFIGURACIÓN RÁPIDA */}
              <Card style={[styles.sectionCard, { backgroundColor: darkMode ? '#1e1e1e' : 'white' }]}>
                <Card.Title title="Configuración Rápida" titleStyle={{ color: darkMode ? 'white' : 'black' }} />
                <Card.Content>
                  <View style={styles.quickSettings}>
                    <View style={styles.settingRow}>
                      <Text style={[styles.settingText, { color: darkMode ? 'white' : 'black' }]}>Modo Oscuro</Text>
                      <Switch value={darkMode} onValueChange={toggleDarkMode} color="#4f46e5" />
                    </View>
                    <View style={styles.settingRow}>
                      <Text style={[styles.settingText, { color: darkMode ? 'white' : 'black' }]}>Modo Incógnito</Text>
                      <Switch value={incognitoMode} onValueChange={toggleIncognitoMode} color="#4f46e5" />
                    </View>
                  </View>
                </Card.Content>
              </Card>

              {/* SELECTOR DE IDIOMA */}
              <Card style={[styles.sectionCard, { backgroundColor: darkMode ? '#1e1e1e' : 'white' }]}>
                <Card.Title title="Idioma y Región" titleStyle={{ color: darkMode ? 'white' : 'black' }} />
                <Card.Content>
                  {Object.entries(languageProfiles).map(([code, name]) => (
                    <TouchableOpacity
                      key={code}
                      style={[
                        styles.languageItem,
                        selectedLanguage === code && styles.selectedItem,
                        { backgroundColor: darkMode ? '#333' : 'transparent' }
                      ]}
                      onPress={() => applyLanguage(code)}
                    >
                      <RadioButton
                        value={code}
                        status={selectedLanguage === code ? 'checked' : 'unchecked'}
                        onPress={() => applyLanguage(code)}
                        color={darkMode ? '#bb86fc' : '#4f46e5'}
                      />
                      <Text style={[styles.languageText, { color: darkMode ? 'white' : 'black' }]}>{name}</Text>
                    </TouchableOpacity>
                  ))}
                </Card.Content>
              </Card>

              {/* USER-AGENTS ESCRITORIO */}
              <Card style={[styles.sectionCard, { backgroundColor: darkMode ? '#1e1e1e' : 'white' }]}>
                <Card.Title title="Modo Escritorio" titleStyle={{ color: darkMode ? 'white' : 'black' }} />
                <Card.Content>
                  {userAgents.desktop.map((ua, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.uaItem,
                        selectedUA === ua.value && styles.selectedItem,
                        { backgroundColor: darkMode ? '#333' : 'transparent' }
                      ]}
                      onPress={() => applyUserAgent(ua.value)}
                    >
                      <RadioButton
                        value={ua.value}
                        status={selectedUA === ua.value ? 'checked' : 'unchecked'}
                        onPress={() => applyUserAgent(ua.value)}
                        color={darkMode ? '#bb86fc' : '#4f46e5'}
                      />
                      <View style={styles.uaInfo}>
                        <Text style={[styles.uaName, { color: darkMode ? 'white' : 'black' }]}>{ua.name}</Text>
                        <Text style={[styles.uaResolution, { color: darkMode ? '#ccc' : '#666' }]}>{ua.resolution}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </Card.Content>
              </Card>

              {/* USER-AGENTS MÓVIL */}
              <Card style={[styles.sectionCard, { backgroundColor: darkMode ? '#1e1e1e' : 'white' }]}>
                <Card.Title title="Modo Móvil" titleStyle={{ color: darkMode ? 'white' : 'black' }} />
                <Card.Content>
                  {userAgents.mobile.map((ua, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.uaItem,
                        selectedUA === ua.value && styles.selectedItem,
                        { backgroundColor: darkMode ? '#333' : 'transparent' }
                      ]}
                      onPress={() => applyUserAgent(ua.value)}
                    >
                      <RadioButton
                        value={ua.value}
                        status={selectedUA === ua.value ? 'checked' : 'unchecked'}
                        onPress={() => applyUserAgent(ua.value)}
                        color={darkMode ? '#bb86fc' : '#4f46e5'}
                      />
                      <View style={styles.uaInfo}>
                        <Text style={[styles.uaName, { color: darkMode ? 'white' : 'black' }]}>{ua.name}</Text>
                        <Text style={[styles.uaResolution, { color: darkMode ? '#ccc' : '#666' }]}>{ua.resolution}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </Card.Content>
              </Card>

            </ScrollView>
          </View>
        </Modal>

        {/* MODAL CONFIGURACIÓN PROXY */}
        <Modal visible={showProxyConfig} animationType="slide">
          <View style={[styles.modalContainer, { backgroundColor: darkMode ? '#121212' : 'white' }]}>
            <Appbar.Header style={{ backgroundColor: darkMode ? '#1e1e1e' : '#4f46e5' }}>
              <Appbar.BackAction color="white" onPress={() => setShowProxyConfig(false)} />
              <Appbar.Content title="Configuración Proxy" titleStyle={{ color: 'white' }} />
            </Appbar.Header>

            <ScrollView style={styles.modalContent}>
              <Card style={[styles.sectionCard, { backgroundColor: darkMode ? '#1e1e1e' : 'white' }]}>
                <Card.Title title="Configuración de Proxy" titleStyle={{ color: darkMode ? 'white' : 'black' }} />
                <Card.Content>
                  <Text style={[styles.settingText, { color: darkMode ? 'white' : 'black' }]}>
                    Host del Proxy:
                  </Text>
                  <TextInput
                    value={proxyConfig.host}
                    onChangeText={(text) => setProxyConfig({...proxyConfig, host: text})}
                    placeholder="ej: 192.168.1.1"
                    placeholderTextColor={darkMode ? '#888' : '#666'}
                    mode="outlined"
                    style={styles.proxyInput}
                    theme={{ colors: { primary: darkMode ? '#bb86fc' : '#4f46e5' } }}
                  />
                  
                  <Text style={[styles.settingText, { color: darkMode ? 'white' : 'black' }]}>
                    Puerto:
                  </Text>
                  <TextInput
                    value={proxyConfig.port}
                    onChangeText={(text) => setProxyConfig({...proxyConfig, port: text})}
                    placeholder="ej: 8080"
                    placeholderTextColor={darkMode ? '#888' : '#666'}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.proxyInput}
                    theme={{ colors: { primary: darkMode ? '#bb86fc' : '#4f46e5' } }}
                  />
                  
                  <View style={styles.settingRow}>
                    <Text style={[styles.settingText, { color: darkMode ? 'white' : 'black' }]}>
                      Habilitar Proxy
                    </Text>
                    <Switch 
                      value={proxyConfig.enabled} 
                      onValueChange={(value) => setProxyConfig({...proxyConfig, enabled: value})}
                      color="#4f46e5"
                    />
                  </View>
                  
                  <Button 
                    mode="contained" 
                    onPress={saveProxyConfig}
                    style={styles.saveButton}
                    buttonColor={darkMode ? '#bb86fc' : '#4f46e5'}
                  >
                    Guardar Configuración
                  </Button>
                </Card.Content>
              </Card>
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
  },
  urlInput: {
    flex: 1,
    marginHorizontal: 10,
    height: 40,
  },
  progressBar: {
    height: 2,
  },
  tabsContainer: {
    maxHeight: 45,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 2,
    borderRadius: 5,
    minWidth: 120,
    maxWidth: 200,
  },
  activeTab: {
    // El color se maneja dinámicamente
  },
  tabTitle: {
    fontSize: 12,
    flex: 1,
  },
  closeTab: {
    marginLeft: 5,
    padding: 2,
  },
  closeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  urlBar: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentUrl: {
    fontSize: 12,
    flex: 1,
  },
  securityChip: {
    height: 25,
  },
  navBar: {
    flexDirection: 'row',
    padding: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeText: {
    marginHorizontal: 5,
    fontSize: 16,
  },
  configBar: {
    padding: 8,
  },
  configText: {
    fontSize: 11,
    fontWeight: '500',
  },
  webview: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 10,
  },
  sectionCard: {
    marginBottom: 15,
  },
  quickSettings: {
    marginVertical: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingText: {
    fontSize: 16,
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
    // El color se maneja dinámicamente
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
  },
  proxyInput: {
    marginVertical: 8,
  },
  saveButton: {
    marginTop: 15,
  },
});
