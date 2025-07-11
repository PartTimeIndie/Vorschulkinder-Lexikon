# 🌐 Kinderlexikon - Lokales Netzwerk Setup

## Übersicht
Diese Anleitung zeigt, wie du das Kinderlexikon unter **www.klex.home** im lokalen Netzwerk verfügbar machst.

## 🖥️ **Aktueller Computer (Host)**

### IP-Adresse: `192.168.178.151`

### 1. Lokale Domain konfigurieren
```bash
# Als Administrator ausführen:
setup-local-domain.bat
```

### 2. Kinderlexikon im Netzwerk-Modus starten
```bash
# Development-Modus (empfohlen)
npm run dev-network

# Production-Modus  
npm run build
npm run start-network
```

### 3. Zugriff testen
- **Lokal:** http://www.klex.home:3000
- **API:** http://www.klex.home:5000/api/health

## 📱 **Andere Geräte im Netzwerk**

### Option A: Direkte IP-Adresse
- **Frontend:** http://192.168.178.151:3000
- **API:** http://192.168.178.151:5000

### Option B: Router DNS konfigurieren
1. Router-Admin-Panel öffnen (meist http://192.168.178.1)
2. DNS-Einstellungen finden
3. DNS-Eintrag hinzufügen:
   - **Domain:** www.klex.home
   - **IP:** 192.168.178.151

### Option C: Geräte-spezifische hosts-Datei

#### Windows:
```
C:\Windows\System32\drivers\etc\hosts
```
Hinzufügen:
```
192.168.178.151 www.klex.home
192.168.178.151 klex.home
```

#### macOS/Linux:
```
/etc/hosts
```
Hinzufügen:
```
192.168.178.151 www.klex.home
192.168.178.151 klex.home
```

#### Android:
1. Root-Zugriff erforderlich
2. `/system/etc/hosts` bearbeiten
3. Zeile hinzufügen: `192.168.178.151 www.klex.home`

#### iOS:
Ohne Jailbreak nicht möglich - nutze direkte IP.

## 🔧 **Problembehandlung**

### Port bereits belegt
```bash
# Prüfe welcher Prozess Port 3000/5000 nutzt
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Prozess beenden (PID aus obigem Befehl)
taskkill /PID <PROZESS_ID> /F
```

### Firewall blockiert Zugriff
```bash
# Windows Firewall Regel hinzufügen
netsh advfirewall firewall add rule name="Kinderlexikon-Frontend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Kinderlexikon-API" dir=in action=allow protocol=TCP localport=5000
```

### DNS Cache leeren
```bash
# Windows
ipconfig /flushdns

# macOS
sudo dscacheutil -flushcache

# Linux
sudo systemctl restart systemd-resolved
```

## 🚀 **Deployment-Modi**

### Development (empfohlen für lokales Netzwerk)
```bash
npm run dev-network
```
- ✅ Hot Reload
- ✅ Error Overlay
- ✅ Debugging

### Production
```bash
npm run build
npm run start-network
```
- ✅ Optimiert
- ✅ Bessere Performance
- ❌ Kein Hot Reload

## 📊 **Status prüfen**

### Health Checks
- **API:** http://www.klex.home:5000/api/health
- **Frontend:** http://www.klex.home:3000
- **Kategorien:** http://www.klex.home:5000/api/categories

### Log-Ausgaben
```bash
# Server läuft korrekt wenn:
🚀 Kinderlexikon Server running on 0.0.0.0:5000
🌐 Network access enabled - accessible from other devices
📱 Local network: http://192.168.178.151:5000/api/health
🏠 Custom domain: http://www.klex.home:5000/api/health
```

## 🔒 **Sicherheitshinweise**

⚠️ **Nur für lokales Netzwerk verwenden!**
- Server ist nicht für Internet-Zugriff konfiguriert
- Keine HTTPS/SSL-Verschlüsselung
- Keine Authentifizierung implementiert

## 📋 **Nützliche Befehle**

```bash
# Netzwerk-Informationen anzeigen
ipconfig /all

# Verfügbare Ports prüfen
netstat -an | findstr LISTEN

# Kinderlexikon stoppen
Ctrl + C (im Terminal)

# Hosts-Datei bearbeiten (als Admin)
notepad C:\Windows\System32\drivers\etc\hosts
```

## 🆘 **Support**

Bei Problemen:
1. Prüfe, ob alle Ports frei sind
2. Überprüfe Firewall-Einstellungen  
3. Teste direkte IP-Adresse statt Domain
4. Neustart von Router und Computer

---

**Viel Spaß mit dem Kinderlexikon! 🎉** 