import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Appbar, TextInput, Button, Card, RadioButton, List, Provider as PaperProvider, Chip, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  // ==================== ESTADO DE PESTAÑAS ====================
  const [tabs, setTabs] = useState([
    { 
      id: 1, 
      url: 'https://google.com', 
      title: 'Nueva pestaña',
      loading: false 
    }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [showTabManager, setShowTabManager] = useState(false);
  
  // Refs para WebViews
  const webViewRefs = useRef({});

  // ==================== ESTADO ORIGINAL ====================
  const [urlInput, setUrlInput] = useState('https://google.com');
  const [showUASelector, setShowUASelector] = useState(false);
  const [selectedUA, setSelectedUA] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isLoading, setIsLoading] = useState(false);

  // USER-AGENTS database (original)
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

  // IDIOMAS (original)
  const languageProfiles = {
    "en-US": "English (US)",
    "es-ES": "Español (ES)", 
    "fr-FR": "Français (FR)",
    "de-DE": "Deutsch (DE)",
    "ja-JP": "日本語 (JP)",
    "pt-BR": "Português (BR)"
  };

  // ==================== FUNCIONES DE PESTAÑAS ====================
  const createNewTab = () => {
    const newTabId = Date.now();
    const newTab = {
      id: newTabId,
      url: 'https://google.com',
      title: 'Nueva pestaña',
      loading: false
    };
    
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
    setUrlInput('https://google.com');
    setShowTabManager(false);
  };

  const closeTab = (tabId) => {
    if (tabs.length === 1) {
      // No permitir cerrar la última pestaña, mejor resetearla
      setTabs([{
        id: Date.now(),
        url: 'https://google.com',
        title: 'Nueva pestaña',
        loading: false
      }]);
      setActiveTabId(tabs[0].id);
      setUrlInput('https://google.com');
      return;
    }
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
      setUrlInput(newTabs[0].url);
    }
    
    // Limpiar referencia
    delete webViewRefs.current[tabId];
  };

  const switchTab = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    setActiveTabId(tabId);
    setUrlInput(tab.url);
    setShowTabManager(false);
  };

  // ==================== FUNCIONES ORIGINALES MODIFICADAS ====================
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

  // Navegar a URL (actualizada para pestañas)
  const navigate = () => {
    let url = urlInput.trim();
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    setTabs(tabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, url, title: 'Cargando...' }
        : tab
    ));
  };

  // Actualizar URL mientras navegas
  const handleNavigationStateChange = (navState, tabId) => {
    const { url, title } = navState;
    
    setTabs(tabs.map(tab => 
      tab.id === tabId 
        ? { 
            ...tab, 
            url: url || tab.url, 
            title: title || tab.title,
            loading: navState.loading 
          }
        : tab
    ));
    
    if (tabId === activeTabId) {
      setUrlInput(url || '');
    }
  };

  // Aplicar User-Agent (actualizada para todas las pestañas)
  const applyUserAgent = async (ua) => {
    setSelectedUA(ua);
    await AsyncStorage.setItem('selectedUA', ua);
    setShowUASelector(false);
    
    // Recargar todas las pestañas con nuevo User-Agent
    Object.values(webViewRefs.current).forEach(webViewRef => {
      if (webViewRef) {
        webViewRef.reload();
      }
    });
  };

  // Aplicar Idioma (actualizada para todas las pestañas)
  const applyLanguage = async (lang) => {
    setSelectedLanguage(lang);
    await AsyncStorage.setItem('selectedLanguage', lang);
    
    // Recargar todas las pestañas con nuevo idioma
    Object.values(webViewRefs.current).forEach(webViewRef => {
      if (webViewRef) {
        webViewRef.reload();
      }
    });
  };

  // Reset configuración
  const resetSettings = async () => {
    setSelectedUA('');
    setSelectedLanguage('en-US');
    await AsyncStorage.multiRemove(['selectedUA', 'selectedLanguage']);
    
    Object.values(webViewRefs.current).forEach(webViewRef => {
      if (webViewRef) {
        webViewRef.reload();
      }
    });
  };

  // Pestaña activa
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <PaperProvider>
      <View style={styles.container}>
        
        {/* HEADER MEJORADO CON PESTAÑAS */}
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
          
          {/* CONTADOR DE PESTAÑAS */}
          <Chip 
            style={styles.tabChip}
            onPress={() => setShowTabManager(true)}
          >
            {tabs.length}
          </Chip>
        </Appbar.Header>

        {/* BARRA DE PESTAÑAS ACTIVAS */}
        <ScrollView horizontal style={styles.tabBar}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                tab.id === activeTabId && styles.activeTab
              ]}
              onPress={() => switchTab(tab.id)}
              onLongPress={() => closeTab(tab.id)}
            >
              <Text 
                style={[
                  styles.tabText,
                  tab.id === activeTabId && styles.activeTabText
                ]}
                numberOfLines={1}
              >
                {tab.title}
              </Text>
              {tabs.length > 1 && (
                <IconButton
                  icon="close"
                  size={14}
                  onPress={() => closeTab(tab.id)}
                  style={styles.tabClose}
                />
              )}
            </TouchableOpacity>
          ))}
          
          {/* BOTÓN NUEVA PESTAÑA */}
          <IconButton
            icon="plus"
            size={20}
            onPress={createNewTab}
            style={styles.newTabButton}
          />
        </ScrollView>

        {/* INDICADOR DE CONFIGURACIÓN ACTUAL */}
        <View style={styles.configBar}>
          <Text style={styles.configText}>
            {selectedUA ? 'User-Agent: ' + userAgents.desktop.concat(userAgents.mobile)
              .find(ua => ua.value === selectedUA)?.name : 'User-Agent: Predeterminado'}
          </Text>
          <Text style={styles.configText}>
            Idioma: {languageProfiles[selectedLanguage]} | Pestañas: {tabs.length}
          </Text>
        </View>

        {/* NAVEGADOR WEBVIEW CON PESTAÑAS */}
        {tabs.map(tab => (
          <WebView
            key={tab.id}
            ref={(ref) => {
              if (ref) webViewRefs.current[tab.id] = ref;
            }}
            source={{ uri: tab.url }}
            style={[
              styles.webview,
              { display: tab.id === activeTabId ? 'flex' : 'none' }
            ]}
            userAgent={selectedUA}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onNavigationStateChange={(navState) => 
              handleNavigationStateChange(navState, tab.id)
            }
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
            javaScriptEnabled={true}
            domStorageEnabled={false} // ✅ Deshabilitar almacenamiento
            cacheEnabled={false} // ✅ Deshabilitar cache
            thirdPartyCookiesEnabled={false} // ✅ Deshabilitar cookies de terceros
            sharedCookiesEnabled={false} // ✅ Deshabilitar cookies compartidas
            injectedJavaScript={`
              // Inyectar configuración de idioma
              Object.defineProperty(navigator, 'language', {
                get: function() { return '${selectedLanguage}'; }
              });
              Object.defineProperty(navigator, 'languages', {
                get: function() { return ['${selectedLanguage}', '${selectedLanguage.split('-')[0]}', 'en']; }
              });
              
              // Limpiar cualquier dato existente
              try {
                if (typeof localStorage !== 'undefined') localStorage.clear();
                if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
              } catch(e) {}
              
              true;
            `}
          />
        ))}

        {/* BARRA DE NAVEGACIÓN */}
        <View style={styles.navBar}>
          <Button 
            mode="text" 
            icon="arrow-left" 
            onPress={() => webViewRefs.current[activeTabId]?.goBack()}
          >
            Atrás
          </Button>
          
          <Button 
            mode="text" 
            icon="arrow-right" 
            onPress={() => webViewRefs.current[activeTabId]?.goForward()}
          >
            Adelante
          </Button>
          
          <Button 
            mode="text" 
            icon="reload" 
            onPress={() => webViewRefs.current[activeTabId]?.reload()}
          >
            Recargar
          </Button>
          
          <Button 
            mode="text" 
            icon="home" 
            onPress={() => {
              setUrlInput('https://google.com');
              setTabs(tabs.map(tab => 
                tab.id === activeTabId 
                  ? { ...tab, url: 'https://google.com', title: 'Google' }
                  : tab
              ));
            }}
          >
            Inicio
          </Button>
          
          <Button 
            mode="text" 
            icon="plus" 
            onPress={createNewTab}
          >
            Nueva
          </Button>
        </View>

        {/* MODAL SELECTOR USER-AGENT (ORIGINAL) */}
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
  tabChip: {
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    maxHeight: 45,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 100,
    maxWidth: 200,
  },
  activeTab: {
    backgroundColor: '#1976D2',
    borderColor: '#1565C0',
  },
  tabText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabClose: {
    margin: 0,
    padding: 0,
    marginLeft: 4,
  },
  newTabButton: {
    margin: 0,
    padding: 0,
    marginLeft: 4,
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
