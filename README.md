# IFES X - VDV 452 ÖPNV-Datenmanagementsystem

IFES X ist ein umfassendes webbasiertes Managementsystem für ÖPNV-Daten gemäß dem VDV 452/451 Standard. Es bietet vollständige CRUD-Operationen für alle VDV-Datenobjekte, GTFS Import-/Export-Funktionen und eine intuitive, auf Angular basierende Benutzeroberfläche.

## 🚀 Funktionen

- **VDV 452 Datenmanagement**: Vollständige Unterstützung aller VDV 452 Entitäten, einschließlich Haltestellen, Linien, Verläufen, Fahrten, Kalendern und Fahrzeugen
- **GTFS Import/Export**: Nahtlose Konvertierung zwischen GTFS und VDV 452 Formaten
- **VDV 451/452 Datei-Import/Export**: Native Unterstützung für das VDV X10 Dateiformat
- **Hierarchische Datenstruktur**: Korrekte Handhabung von VDV Eltern-Kind-Beziehungen (Haltestellen, Linien, etc.)
- **Kaskadierende Aktualisierungen**: Intelligente kaskadierende Updates bei Änderung von Primärschlüsseln
- **Multi-Basisversionen**: Gleichzeitige Arbeit mit mehreren `BASIS_VERSION` Instanzen
- **Kalender-Management**: Volle Unterstützung für Tagesarten (`MENGE_TAGESART`), Firmenkalender (`FIRMENKALENDER`) und Basisversionen

## 📋 Technologie-Stack

### Backend
- **Runtime**: Node.js mit TypeScript
- **Framework**: Express.js
- **Datenbank**: SQLite mit Sequelize ORM
- **Datenverarbeitung**: Eigener VDV 451/452 Parser, GTFS Worker Threads

### Frontend
- **Framework**: Angular 18+
- **UI Bibliothek**: PrimeNG
- **Styling**: Tailwind CSS
- **State Management**: RxJS

### Infrastruktur
- **Containerisierung**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Entwicklung**: Hot-Reload für Frontend und Backend

## 🏗️ Projektstruktur

```
ifesx/
├── backend/           # Express.js API Server
│   ├── src/
│   │   ├── models/    # Sequelize Models für VDV-Entitäten
│   │   ├── controllers/ # API Endpunkt Controller
│   │   ├── workers/   # Hintergrund-Worker (GTFS Import)
│   │   ├── utils/     # VDV Parser, Hilfsfunktionen
│   │   └── app.ts     # Express App Einstiegspunkt
│   └── Dockerfile
├── frontend/          # Angular Anwendung
│   ├── src/app/
│   │   ├── components/ # UI Komponenten
│   │   ├── models/    # TypeScript Interfaces
│   │   ├── services/  # HTTP Services
│   │   └── app.routes.ts
│   └── Dockerfile
├── nginx/             # Reverse Proxy Konfiguration
└── docker-compose.yml
```

## 🛠️ Setup & Installation

### Voraussetzungen
- Docker & Docker Compose
- Node.js 18+ (für lokale Entwicklung)
- Node.js 18+ (für lokale Entwicklung)

### Schnellstart mit Docker

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd ifesx
   ```

2. **Dienste starten**
   ```bash
   docker-compose up -d
   ```

3. **Anwendung aufrufen**
   - Frontend: `http://localhost:4200`
   - Backend API: `http://localhost:3000`
   - Backend API: `http://localhost:3000`

### Lokales Entwicklungs-Setup

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## 📊 VDV 452 Datenmodell Referenz

### 1. Infrastruktur

#### REC_ORT (Orte/Haltestellen)
Repräsentiert physische Orte, einschließlich Haltestellengruppen und einzelnen Haltestellen.

**Wichtige Felder:**
- `ORT_NR` - Orts-ID (Primärschlüssel)
- `ORT_NAME` - Ortsname
- `ORT_REF_ORT` - Referenz zum übergeordneten Ort (für hierarchische Gruppierung)
- `ORT_POS_BREITE` / `ORT_POS_LAENGE` - GPS Koordinaten (WGS84)
- `ORT_TYP` - Ortstyp (1=Hst, 2=Ortsteil, etc.)

#### REC_HP (Haltepunkte/Steige)
Einzelne Einstiegspunkte an einer Haltestelle.

**Wichtige Felder:**
- `HP_NR` - Haltepunktnummer
- `ORT_NR` - Referenz zum übergeordneten Ort
- `HP_NAME` - Haltepunktname
- `POS_BREITE` / `POS_LAENGE` - GPS Koordinaten

#### REC_SEL (Streckensegmente)
Netzwerksegmente die zwei Orte verbinden.

**Wichtige Felder:**
- `SEL_FZT_FELD_NR` - Fahrzeitfeldnummer
- `SEL_RICHTUNG` - Richtung (H=Hin, R=Rück)
- `ORT_NR_VON` / `ORT_NR_NACH` - Von/Bis Orts-ID
- `SEL_FZT` - Fahrzeit in Sekunden

#### REC_OM (Ortsmarken)
Spezifische Punkte entlang von Strecken für Distanz-/Zeitberechnungen.

### 2. Linienplanung

#### REC_LID (Linien)
Verkehrslinien (z.B., "Linie 4", "Bus 121").

**Wichtige Felder:**
- `LI_NR` - Liniennummer (Primärschlüssel) - **Jetzt bearbeitbar mit kaskadierenden Updates**
- `STR_LI_VAR` - Linienvariante
- `LI_R_NACH_ZIEL` - Zieltext Rückrichtung
- `LI_H_NACH_ZIEL` - Zieltext Hinrichtung
- `LI_LI_KU` - Linienkürzel

#### LID_VERLAUF (Routenverlauf)
Geordnete Abfolge von Orten für eine Linienvariante.

**Wichtige Felder:**
- `LI_NR` / `STR_LI_VAR` - Linien- und Variantenreferenz
- `LI_LFD_NR` - Laufende Nummer
- `ORT_NR` - Orts-ID
- `SEL_ZNR` - Zielnummer (für Ansagen/Matrix)

#### MENGE_FGR (Fahrzeuggruppen)
Fahrzeugartgruppe für die Linienzuordnung.

### 3. Fahrplan & Betrieb

#### REC_FRT (Fahrten)
Einzelne Fahrzeugfahrten entlang eines Verlaufs.

**Wichtige Felder:**
- `FRT_FID` - Fahrt-ID (Primärschlüssel)
- `LI_NR` / `STR_LI_VAR` - Linie und Variante
- `FRT_START` - Startzeit in Sekunden ab Mitternacht
- `UM_UID` - Umlauf-ID
- `TAGESART_NR` - Tagesart

#### REC_UMS (Haltestellenfahrplan/Umschlagszeiten)
Geplante Ankunfts-/Abfahrtszeiten für jeden Halt einer Fahrt.

**Wichtige Felder:**
- `FRT_FID` - Fahrt-ID Referenz
- `LI_LFD_NR` - Laufende Nummer im Verlauf
- `UMS_ANKUNFT` / `UMS_ABFAHRT` - Ankunfts-/Abfahrtszeit (Sekunden ab Mitternacht)

#### MENGE_TAGESART (Tagesarten)
Betriebskalender-Tagesarten (z.B., "Mo-Fr", "Sa", "So").

**Wichtige Felder:**
- `TAGESART_NR` - Tagesartnummer
- `TAGESART_TEXT` - Beschreibung

#### FIRMENKALENDER
Weist Datumsbereichen Tagesarten zu.

**Wichtige Felder:**
- `BETRIEBSTAG` - Betriebstag (YYYYMMDD)
- `TAGESART_NR` - Tagesartnummer für dieses Datum

#### MENGE_BASIS_VERSIONEN (Basisversionen)
Versionskontrolle für Datensätze.

**Wichtige Felder:**
- `BASIS_VERSION` - Versionsnummer (z.B., 20250101)

#### MENGE_BHOF (Betriebshöfe)
Depotstandorte für Busse/Bahnen.

**Wichtige Felder:**
- `BHOF_NR` - Betriebshofnummer
- `BHOF_TEXT` - Name des Betriebshofs
- `STR_BHOF` - Kürzel

### 4. Fahrgastinformation (FIS)

#### REC_ZNR (Ziele)
Zieltexte für Fahrgastinformationssysteme.

**Wichtige Felder:**
- `ZNR` - Zielnummer
- `ZIELTEXT` - Zieltext (Front/Seite)
- `ZIELTEXT_KURZ` - Kurzzieltext

#### REC_ANR (Ansagen)
Automatisierte Ansagetexte.

### 5. Disposition & Anschlüsse

#### REC_UEB (Überläufer/Wagenübergänge)
Beschreibt Fahrzeugübergänge zwischen Fahrten (z.B. Linienwechsel, Richtungswechsel).

**Wichtige Felder:**
- `UEB_NR` - Übergangsnummer
- `UEB_FAHRZEIT` - Übergangszeit in Sekunden

#### EINZELANSCHLUSS (Anschlusssicherung)
Garantierte Umsteigeverbindungen.

**Komponenten:**
- **EINZELANSCHLUSS (VDV 432)**: Definiert WER auf WEN wartet
- **REC_UMS (VDV 232)**: Definiert WANN und WIE LANGE gewartet wird

#### REC_FZG (Fahrzeuge)
Physisches Flottenmanagement.

**Tabellen:**
- `REC_FZG_TYP` - Fahrzeugtypen (z.B., "MAN Lion's City 12C")
- `REC_FZG` - Einzelne Fahrzeuge mit Kennzeichen und Wagennummer

## 🔄 Wichtige Workflows

### GTFS Import
1. Navigiere zu "Import/Export"
2. Wähle den GTFS Tab
3. Wähle `BASIS_VERSION` oder erstelle eine neue
4. Lade die GTFS ZIP-Datei hoch
5. Überwache den Importfortschritt
6. Überprüfe die importierten Daten in den jeweiligen Ansichten

### VDV 452 Import
1. Navigiere zu "Import/Export" → VDV 452 Tab
2. Wähle `BASIS_VERSION` und den Tabellentyp
3. Lade die `.x10` Datei hoch
4. Daten werden geparst und in die ausgewählte Tabelle importiert

### VDV 452 Export
1. Navigiere zu "Import/Export" → VDV 452 Tab
2. Wähle `BASIS_VERSION` und Tabellentyp
3. Klicke auf "Exportieren"
4. Lade die ISO-8859-1 kodierte `.x10` Datei herunter

### Linien-ID Bearbeitung (mit kaskadierenden Updates)
Beim Bearbeiten des `LI_NR` Feldes einer existierenden Linie:
1. Öffne die Linie in der Detailansicht
2. Ändere das `LI_NR` Feld
3. Klicke auf "Speichern"
4. Bestätige die Warnung zum kaskadierenden Update
5. Das System aktualisiert automatisch alle abhängigen Datensätze:
   - `LID_VERLAUF` (Routenverläufe)
   - `REC_FRT` (Fahrten)
   - `REC_UMS` (Fahrplzeiten)

⚠️ **Warnung**: Diese Operation ist transaktionsbasiert und betrifft mehrere Tabellen. Stelle sicher, dass die neue ID nicht mit existierenden Linien kollidiert.

## 📡 API Endpunkte

### Kern-Ressourcen
- `GET/POST /api/vdv/orte` - Orte/Haltestellen
- `GET/POST /api/vdv/haltepunkte` - Haltepunkte
- `GET/POST /api/lines` - Linien
- `PUT /api/lines/:oldId/change-id` - Kaskadierendes Linien-ID Update
- `GET/POST /api/variants` - Linienvarianten
- `GET/POST /api/trips` - Fahrten
- `GET/POST /api/vdv/betriebshoefe` - Betriebshöfe

### Kalender & Versionen
- `GET /api/calendar/basis-versions` - Basisversionen
- `GET /api/calendar/day-types` - Tagesarten
- `GET /api/calendar/company-calendar` - Firmenkalender

### Import/Export
- `POST /api/gtfs/import` - GTFS Import
- `POST /api/gtfs/export` - GTFS Export
- `POST /api/vdv/import` - VDV 451/452 Import
- `GET /api/vdv/export/:table` - VDV 451/452 Export
- `GET /api/vdv/supported-tables` - Liste importierbarer Tabellen

### Fahrzeuge
- `GET/POST /api/vdv/vehicles` - Fahrzeuge
- `GET/POST /api/vdv/vehicle-types` - Fahrzeugtypen

## 🧪 Tests

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚦 Umgebungsvariablen

Erstelle eine `.env` Datei im Backend-Verzeichnis:

```env
# Datenbank
DB_FILE=timetable.sqlite3

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (für CORS)
FRONTEND_URL=http://localhost:4200
```

## 📝 Lizenz

[Lizenz hier einfügen]

## 👥 Mitwirkende

[Mitwirkende hinzufügen]

## 📞 Support

Für Probleme, Fragen oder Beiträge, bitte [ein Issue öffnen](link-to-issues).

---

**VDV Standard Referenzen:**
- VDV 451: Schnittstelle für Fahrplandaten
- VDV 452: Datenmodell für Planung und Betrieb
- VDV 454: ÖPNV Datenaustauschformat
