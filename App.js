import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, Text, Switch, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Appbar, TextInput, Button, Card, Chip, IconButton, Portal, Dialog, List } from 'react-native-paper';

export default function App() {
  // ==================== ESTADO DE PESTAÑAS ====================
  const [tabs, setTabs] = useState([
    { 
      id: 1, 
      url: 'https://google.com', 
      title: 'Google',
      isSecure: true,
      webViewRef: useRef(null)
    }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [showTabSelector, setShowTabSelector] = useState(false);

  // ==================== ESTADO DE NAVEGACIÓN ====================
  const [urlInput, setUrlInput] = useState('https://google.com');
  const [currentUrl, setCurrentUrl] = useState('https://google.com');
  const [isLoading, setIsLoading] = useState(false);

  // ==================== ESTADO DE CONFIGURACIÓN ====================
  const [showSettings, setShowSettings] = useState(false);
  const [autoRotateUA, setAutoRotateUA] = useState(false);
  const [rotationInterval, setRotationInterval] = useState(5); // minutos
  const [currentUA, setCurrentUA] = useState('');
  const [currentLang, setCurrentLang] = useState('es-ES');

  // ==================== USER-AGENTS DATABASE ====================
  const userAgents = {
    desktop: [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15"
    ],
    mobile: [
      "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
    ]
  };

  // ==================== SOLO 2 IDIOMAS ====================
  const languages = {
    "es-ES": "🇪🇸 Español",
    "en-US": "🇺🇸 English"
  };

  // ==================== BLOQUEO DE TRAKERS ====================
  const trackerBlockList = [
    'google-analytics.com',
    'googletagmanager.com',
    'facebook.com/tr',
    'doubleclick.net',
    'googlesyndication.com',
    'scorecardresearch.com',
    'hotjar.com'
  ];

  const allUserAgents = [...userAgents.desktop, ...userAgents.mobile];

  // ==================== PROTECCIÓN ANTI-FINGERPRINTING ====================
  const antiFingerprintingJS = `
    // Bloquear canvas fingerprinting
    (function() {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function() {
        const context = originalGetContext.apply(this, arguments);
        if (context) {
          const originalFillText = context.fillText;
          const originalStrokeText = context.strokeText;
          const originalGetImageData = context.getImageData;
          const originalToDataURL = context.canvas.toDataURL;
          
          context.fillText = function() {
            return originalFillText.apply(this, arguments);
          };
          context.strokeText = function() {
            return originalStrokeText.apply(this, arguments);
          };
          context.getImageData = function() {
            return originalGetImageData.apply(this, arguments);
          };
          context.canvas.toDataURL = function() {
            return originalToDataURL.apply(this, arguments);
          };
        }
        return context;
      };
    })();

    // Randomizar valores de pantalla
    const randomValues = {
      width: Math.random() > 0.5 ? 1920 : 1366,
      height: Math.random() > 0.5 ? 1080 : 768,
      colorDepth: Math.random() > 0.5 ? 24 : 32,
      pixelDepth: Math.random() > 0.5 ? 24 : 32
    };

    Object.defineProperty(screen, 'width', { 
      get: () => randomValues.width,
      configurable: true
    });
    Object.defineProperty(screen, 'height', { 
      get: () => randomValues.height,
      configurable: true
    });
    Object.defineProperty(screen, 'availWidth', { 
      get: () => randomValues.width,
      configurable: true
    });
    Object.defineProperty(screen, 'availHeight', { 
      get: () => randomValues.height,
      configurable: true
    });
    Object.defineProperty(screen, 'colorDepth', { 
      get: () => randomValues.colorDepth,
      configurable: true
    });
    Object.defineProperty(screen, 'pixelDepth', { 
      get: () => randomValues.pixelDepth,
      configurable: true
    });

    // Bloquear WebGL fingerprinting
    if (typeof WebGLRenderingContext !== 'undefined') {
      const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return "Intel Inc.";
        if (parameter === 37446) return "Intel Iris OpenGL Engine";
        return originalGetParameter.call(this, parameter);
      };
    }

    // Bloquear audio fingerprinting
    if (typeof AudioContext !== 'undefined') {
      const originalCreateOscillator = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function() {
        const oscillator = originalCreateOscillator.call(this);
        const originalFrequency = oscillator.frequency;
        Object.defineProperty(oscillator.frequency, 'value', {
          get: () => 440,
          set: () => {}
        });
        return oscillator;
      };
    }

    // Bloquear font fingerprinting
    const originalMeasureText = CanvasRenderingContext2D.prototype.measureText;
    CanvasRenderingContext2D.prototype.measureText = function(text) {
      const metrics = originalMeasureText.call(this, text);
      metrics.width = Math.round(metrics.width);
      return metrics;
    };

    true;
  `;

  // ==================== INICIALIZAR ====================
  useEffect(() => {
    rotateIdentity();
  }, []);

  // ==================== AUTO-ROTACIÓN ====================
  useEffect(() => {
    if (!autoRotateUA) return;
    
    const timer = setInterval(() => {
      rotateIdentity();
      console.log('🔄 User-Agent e idioma rotados');
    }, rotationInterval * 60 * 1000);

    return () => clearInterval(timer);
  }, [autoRotateUA, rotationInterval]);

  // ==================== ROTAR IDENTIDAD ====================
  const rotateIdentity = () => {
    const randomUA = allUserAgents[Math.floor(Math.random() * allUserAgents.length)];
    const langKeys = Object.keys(languages);
    const randomLang = langKeys[Math.floor(Math.random() * langKeys.length)];
    
    setCurrentUA(randomUA);
    setCurrentLang(randomLang);
    
    // Recargar pestaña activa con nuevo User-Agent
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab?.webViewRef?.current) {
      activeTab.webViewRef.current.reload();
    }
  };

  // ==================== VERIFICAR SI URL ES TRAKER ====================
  const isTrackerUrl = (url) => {
    return trackerBlockList.some(tracker => url.includes(tracker));
  };

  // ==================== OBTENER PESTAÑA ACTIVA ====================
  const activeTab = tabs.find(t => t.id === activeTabId);

  // ==================== CREAR NUEVA PESTAÑA ====================
  const createTab = () => {
    const newTab = {
      id: Date.now(),
      url: 'https://google.com',
      title: 'Nueva pestaña',
      isSecure: true,
      webViewRef: React.createRef()
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setUrlInput('https://google.com');
    setCurrentUrl('https://google.com');
  };

  // ==================== CERRAR PESTAÑA ====================
  const closeTab = (tabId) => {
    if (tabs.length === 1) {
      // Si es la última pestaña, limpiar y crear nueva
      clearTabData(tabId);
      setUrlInput('https://google.com');
      setCurrentUrl('https://google.com');
      setTabs([{
        id: Date.now(),
        url: 'https://google.com',
        title: 'Nueva pestaña',
        isSecure: true,
        webViewRef: React.createRef()
      }]);
      setActiveTabId(Date.now());
      return;
    }
    
    // Limpiar datos de la pestaña
    clearTabData(tabId);
    
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      const newActiveTab = newTabs[0];
      setActiveTabId(newActiveTab.id);
      setUrlInput(newActiveTab.url);
      setCurrentUrl(newActiveTab.url);
    }
  };

  // ==================== LIMPIAR DATOS DE PESTAÑA ====================
  const clearTabData = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.webViewRef?.current) {
      // Limpiar cookies y caché
      tab.webViewRef.current.injectJavaScript(`
        // Limpiar cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        // Limpiar localStorage
        localStorage.clear();
        // Limpiar sessionStorage
        sessionStorage.clear();
        // Limpiar indexedDB
        if (window.indexedDB) {
          indexedDB.databases().then(function(databases) {
            databases.forEach(function(db) {
              indexedDB.deleteDatabase(db.name);
            });
          });
        }
        true;
      `);
    }
  };

  // ==================== CAMBIAR PESTAÑA ACTIVA ====================
  const switchTab = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    setActiveTabId(tabId);
    setUrlInput(tab.url);
    setCurrentUrl(tab.url);
    setShowTabSelector(false);
  };

  // ==================== NAVEGAR A URL ====================
  const navigate = () => {
    let url = urlInput.trim();
    
    // Si está vacío, no hacer nada
    if (!url) return;
    
    // Si es un tracker, bloquear
    if (isTrackerUrl(url)) {
      alert('🚫 Esta URL ha sido bloqueada por protección de privacidad');
      return;
    }
    
    // Si no tiene punto y no es http, buscar en Google
    if (!url.includes('.') && !url.startsWith('http')) {
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    } 
    // Si no empieza con http, agregar https://
    else if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    const isSecure = url.startsWith('https://');
    
    setCurrentUrl(url);
    setTabs(tabs.map(t => 
      t.id === activeTabId 
        ? { ...t, url, isSecure }
        : t
    ));
  };

  // ==================== ACTUALIZAR URL MIENTRAS NAVEGAS ====================
  const handleNavigationStateChange = (navState) => {
    const { url, title } = navState;
    
    // Bloquear trackers
    if (isTrackerUrl(url)) {
      alert('🚫 Tracker bloqueado: ' + new URL(url).hostname);
      return;
    }
    
    const isSecure = url.startsWith('https://');
    
    setCurrentUrl(url);
    setUrlInput(url);
    
    setTabs(tabs.map(t => 
      t.id === activeTabId 
        ? { ...t, url, title: title || new URL(url).hostname, isSecure }
        : t
    ));
  };

  // ==================== LIMPIAR TODO ====================
  const clearEverything = () => {
    // Limpiar todas las pestañas
    tabs.forEach(tab => clearTabData(tab.id));
    
    // Crear pestaña limpia
    setTabs([{
      id: Date.now(),
      url: 'https://google.com',
      title: 'Nueva pestaña',
      isSecure: true,
      webViewRef: React.createRef()
    }]);
    setActiveTabId(Date.now());
    setUrlInput('https://google.com');
    setCurrentUrl('https://google.com');
    
    // Rotar identidad
    rotateIdentity();
    
    alert('🧹 Todos los datos han sido eliminados permanentemente');
    setShowSettings(false);
  };

  // ==================== JAVASCRIPT COMPLETO PARA INYECTAR ====================
  const getInjectedJavaScript = () => {
    return `
      ${antiFingerprintingJS}
      
      // Inyectar idioma
      Object.defineProperty(navigator, 'language', {
        get: function() { return '${currentLang}'; },
        configurable: true
      });
      Object.defineProperty(navigator, 'languages', {
        get: function() { return ['${currentLang}', '${currentLang.split('-')[0]}']; },
        configurable: true
      });
      
      // Limpiar datos al cargar
      localStorage.clear();
      sessionStorage.clear();
      
      // Bloquear request a trackers
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string' && ${JSON.stringify(trackerBlockList)}.some(tracker => url.includes(tracker))) {
          console.log('🚫 Tracker bloqueado:', url);
          return Promise.reject(new Error('Tracker bloqueado'));
        }
        return originalFetch.apply(this, args);
      };
      
      true;
    `;
  };

  return (
    <View style={styles.container}>
      
      {/* ==================== HEADER CON PESTAÑAS ==================== */}
      <Appbar.Header style={styles.header}>
        <Appbar.Action 
          icon="menu" 
          onPress={() => setShowSettings(true)} 
        />
        
        {/* BARRA DE URL CON ICONO DE SEGURIDAD */}
        <View style={styles.urlContainer}>
          <IconButton
            icon={activeTab?.isSecure ? "lock" : "lock-open"}
            size={16}
            iconColor={activeTab?.isSecure ? "#4CAF50" : "#FFC107"}
          />
          
          <TextInput
            style={styles.urlInput}
            value={urlInput}
            onChangeText={setUrlInput}
            onSubmitEditing={navigate}
            placeholder="Buscar o escribir URL..."
            mode="flat"
            dense
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        
        {/* CONTADOR DE PESTAÑAS */}
        <Chip 
          style={styles.tabCounter}
          onPress={() => setShowTabSelector(true)}
        >
          {tabs.length}
        </Chip>
        
        {/* BOTÓN NUEVA PESTAÑA */}
        <Appbar.Action 
          icon="plus" 
          onPress={createTab} 
        />
      </Appbar.Header>

      {/* ==================== BARRA DE NAVEGACIÓN ==================== */}
      <View style={styles.navBar}>
        <Button 
          mode="text" 
          icon="arrow-left" 
          onPress={() => activeTab?.webViewRef?.current?.goBack()}
          compact
        >
          Atrás
        </Button>
        
        <Button 
          mode="text" 
          icon="arrow-right" 
          onPress={() => activeTab?.webViewRef?.current?.goForward()}
          compact
        >
          Adelante
        </Button>
        
        <Button 
          mode="text" 
          icon="reload" 
          onPress={() => activeTab?.webViewRef?.current?.reload()}
          compact
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
          compact
        >
          Inicio
        </Button>
      </View>

      {/* ==================== BARRA DE ESTADO DE PRIVACIDAD ==================== */}
      <View style={styles.privacyBar}>
        <Text style={styles.privacyText}>
          🛡️ Privacidad Total | UA: {currentUA.includes('Windows') ? 'Win' : currentUA.includes('Mac') ? 'Mac' : currentUA.includes('Android') ? 'Android' : 'iOS'} | 
          {' '}{languages[currentLang]}
        </Text>
        <Text style={[styles.privacyText, { color: autoRotateUA ? '#4CAF50' : '#999' }]}>
          🔄 Auto: {autoRotateUA ? 'ON' : 'OFF'} | 🚫 Anti-Fingerprinting
        </Text>
      </View>

      {/* ==================== WEBVIEW (PESTAÑA ACTIVA) ==================== */}
      {tabs.map(tab => (
        <WebView
          key={tab.id}
          ref={tab.webViewRef}
          source={{ uri: tab.url }}
          style={[styles.webview, { display: tab.id === activeTabId ? 'flex' : 'none' }]}
          userAgent={currentUA}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={false}
          thirdPartyCookiesEnabled={false}
          sharedCookiesEnabled={false}
          cacheEnabled={false}
          incognito={true}
          injectedJavaScript={getInjectedJavaScript()}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      ))}

      {/* ==================== MODAL: SELECTOR DE PESTAÑAS ==================== */}
      <Modal
        visible={showTabSelector}
        animationType="slide"
        onRequestClose={() => setShowTabSelector(false)}
      >
        <View style={styles.modalContainer}>
          <Appbar.Header>
            <Appbar.BackAction onPress={() => setShowTabSelector(false)} />
            <Appbar.Content title={`Pestañas (${tabs.length})`} />
            <Appbar.Action icon="plus" onPress={createTab} />
          </Appbar.Header>

          <ScrollView style={styles.tabList}>
            {tabs.map(tab => (
              <Card 
                key={tab.id}
                style={[
                  styles.tabCard,
                  tab.id === activeTabId && styles.activeTabCard
                ]}
                onPress={() => switchTab(tab.id)}
              >
                <Card.Content style={styles.tabCardContent}>
                  <View style={styles.tabInfo}>
                    <IconButton
                      icon={tab.isSecure ? "lock" : "lock-open"}
                      size={16}
                      iconColor={tab.isSecure ? "#4CAF50" : "#FFC107"}
                    />
                    <View style={styles.tabDetails}>
                      <Text style={styles.tabTitle} numberOfLines={1}>
                        {tab.title}
                      </Text>
                      <Text style={styles.tabUrl} numberOfLines={1}>
                        {tab.url}
                      </Text>
                    </View>
                  </View>
                  
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => closeTab(tab.id)}
                  />
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ==================== MODAL: CONFIGURACIÓN ==================== */}
      <Modal
        visible={showSettings}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalContainer}>
          <Appbar.Header>
            <Appbar.BackAction onPress={() => setShowSettings(false)} />
            <Appbar.Content title="Configuración de Privacidad" />
          </Appbar.Header>

          <ScrollView style={styles.settingsContent}>
            
            {/* SECCIÓN: PRIVACIDAD TOTAL */}
            <Card style={styles.settingCard}>
              <Card.Title 
                title="🛡️ Privacidad Total Activada" 
                subtitle="Protección máxima contra rastreo"
              />
              <Card.Content>
                <List.Item
                  title="❌ Sin historial ni cookies"
                  description="Todo se borra automáticamente"
                  left={props => <List.Icon {...props} icon="check-circle" color="#4CAF50" />}
                />
                <List.Item
                  title="✅ Anti-Fingerprinting"
                  description="Bloquea identificación única"
                  left={props => <List.Icon {...props} icon="check-circle" color="#4CAF50" />}
                />
                <List.Item
                  title="🚫 Trackers bloqueados"
                  description="Analytics y anuncios bloqueados"
                  left={props => <List.Icon {...props} icon="check-circle" color="#4CAF50" />}
                />
              </Card.Content>
            </Card>

            {/* SECCIÓN: AUTO-ROTACIÓN */}
            <Card style={styles.settingCard}>
              <Card.Title title="🔄 Rotación Automática de Identidad" />
              <Card.Content>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Activar auto-rotación</Text>
                  <Switch
                    value={autoRotateUA}
                    onValueChange={setAutoRotateUA}
                    trackColor={{ false: "#767577", true: "#4CAF50" }}
                    thumbColor={autoRotateUA ? "#fff" : "#f4f3f4"}
                  />
                </View>

                {autoRotateUA && (
                  <View style={styles.intervalSelector}>
                    <Text style={styles.intervalLabel}>Rotar cada:</Text>
                    <View style={styles.intervalButtons}>
                      {[5, 10, 15, 30].map(minutes => (
                        <Button
                          key={minutes}
                          mode={rotationInterval === minutes ? "contained" : "outlined"}
                          onPress={() => setRotationInterval(minutes)}
                          style={styles.intervalButton}
                          compact
                        >
                          {minutes} min
                        </Button>
                      ))}
                    </View>
                  </View>
                )}

                <Button
                  mode="contained"
                  icon="reload"
                  onPress={rotateIdentity}
                  style={styles.rotateButton}
                >
                  Rotar Identidad Ahora
                </Button>
              </Card.Content>
            </Card>

            {/* SECCIÓN: ESTADO ACTUAL */}
            <Card style={styles.settingCard}>
              <Card.Title title="📊 Estado Actual" />
              <Card.Content>
                <Text style={styles.statusLabel}>User-Agent:</Text>
                <Text style={styles.statusValue}>
                  {currentUA.includes('Windows') ? '💻 Windows' :
                   currentUA.includes('Macintosh') ? '🍎 macOS' :
                   currentUA.includes('Linux') ? '🐧 Linux' :
                   currentUA.includes('Android') ? '📱 Android' : '📱 iOS'}
                </Text>

                <Text style={[styles.statusLabel, { marginTop: 10 }]}>Idioma:</Text>
                <Text style={styles.statusValue}>{languages[currentLang]}</Text>

                <Text style={[styles.statusLabel, { marginTop: 10 }]}>Protección:</Text>
                <Text style={styles.statusValue}>
                  🛡️ Anti-Fingerprinting | 🚫 {trackerBlockList.length} trackers bloqueados
                </Text>
              </Card.Content>
            </Card>

            {/* BOTÓN: LIMPIAR TODO */}
            <Button
              mode="contained"
              icon="delete-sweep"
              onPress={clearEverything}
              style={styles.clearButton}
              buttonColor="#F44336"
            >
              🧹 Limpiar Todo y Reiniciar
            </Button>

          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

// Los estilos se mantienen igual que en tu código original...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#1976D2',
  },
  urlContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  urlInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 14,
  },
  tabCounter: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginRight: 8,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 4,
    justifyContent: 'space-around',
  },
  privacyBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  privacyText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabList: {
    flex: 1,
    padding: 10,
  },
  tabCard: {
    marginBottom: 10,
    elevation: 2,
  },
  activeTabCard: {
    borderWidth: 2,
    borderColor: '#1976D2',
  },
  tabCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabDetails: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  tabUrl: {
    fontSize: 12,
    color: '#666',
  },
  settingsContent: {
    flex: 1,
    padding: 10,
  },
  settingCard: {
    marginBottom: 15,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  intervalSelector: {
    marginTop: 15,
  },
  intervalLabel: {
    fontSize: 14,
    marginBottom: 10,
    color: '#666',
  },
  intervalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intervalButton: {
    flex: 1,
  },
  rotateButton: {
    marginTop: 15,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statusValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  clearButton: {
    margin: 15,
    paddingVertical: 8,
  },
});
