# IFES X - VDV 452 Transit Data Management System

IFES X is a comprehensive web-based management system for public transit data conforming to the VDV 452/451 standard. It provides full CRUD operations for all VDV data entities, GTFS import/export capabilities, and an intuitive Angular-based user interface.

## 🚀 Features

- **VDV 452 Data Management**: Complete support for all VDV 452 entities including stops, lines, routes, trips, calendars, and vehicles
- **GTFS Import/Export**: Seamless conversion between GTFS and VDV 452 formats
- **VDV 451/452 File Import/Export**: Native support for VDV X10 file format
- **Hierarchical Data Structure**: Proper handling of VDV parent-child relationships (stops, lines, etc.)
- **Cascading Updates**: Intelligent cascading updates when modifying primary identifiers
- **Multi-Basis Version Support**: Work with multiple `BASIS_VERSION` instances simultaneously
- **Calendar Management**: Full support for day types (`TAGESART`), company calendars (`FIRMENKALENDER`), and basis versions

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Data Processing**: Custom VDV 451/452 parser, GTFS worker threads

### Frontend
- **Framework**: Angular 18+
- **UI Library**: PrimeNG
- **Styling**: Tailwind CSS
- **State Management**: RxJS

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Development**: Hot-reload for both frontend and backend

## 🏗️ Project Structure

```
ifesx/
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── models/    # Sequelize models for VDV entities
│   │   ├── controllers/ # API endpoint controllers
│   │   ├── workers/   # Background workers (GTFS import)
│   │   ├── utils/     # VDV parser, helper functions
│   │   └── app.ts     # Express app entry point
│   └── Dockerfile
├── frontend/          # Angular application
│   ├── src/app/
│   │   ├── components/ # UI components
│   │   ├── models/    # TypeScript interfaces
│   │   ├── services/  # HTTP services
│   │   └── app.routes.ts
│   └── Dockerfile
├── nginx/             # Reverse proxy config
└── docker-compose.yml
```

## 🛠️ Setup & Installation

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 14+ (if not using Docker)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ifesx
   ```

2. **Start the services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: `http://localhost:4200`
   - Backend API: `http://localhost:3000`
   - Database: `localhost:5432`

### Local Development Setup

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

## 📊 VDV 452 Data Model Reference

### 1. Infrastructure

#### REC_ORT (Places/Stops)
Represents physical locations including stop groups and individual stops.

**Key Fields:**
- `ORT_NR` - Place ID (Primary Key)
- `ORT_NAME` - Place name
- `ORT_REF_ORT` - Reference to parent place (for hierarchical grouping)
- `ORT_POS_BREITE` / `ORT_POS_LAENGE` - GPS coordinates (WGS84)
- `ORT_TYP` - Place type (1=Stop, 2=Area, etc.)

#### REC_HP (Stop Points)
Individual boarding points at a stop location.

**Key Fields:**
- `HP_NR` - Stop point ID
- `ORT_NR` - Reference to parent place
- `HP_NAME` - Stop point name
- `POS_BREITE` / `POS_LAENGE` - GPS coordinates

#### REC_SEL (Route Segments)
Network segments connecting two stops.

**Key Fields:**
- `SEL_FZT_FELD_NR` - Segment ID
- `SEL_RICHTUNG` - Direction (H=outbound, R=return)
- `ORT_NR_VON` / `ORT_NR_NACH` - From/To stop IDs
- `SEL_FZT` - Travel time in seconds

#### REC_OM (Place Markers)
Specific points along routes for distance/time calculations.

### 2. Line Planning

#### REC_LID (Lines)
Transit lines (e.g., "Line 4", "Bus 121").

**Key Fields:**
- `LI_NR` - Line ID (Primary Key) - **Now editable with cascading updates**
- `STR_LI_VAR` - Line variant
- `LI_R_NACH_ZIEL` - Destination for return direction
- `LI_H_NACH_ZIEL` - Destination for outbound direction
- `LI_LI_KU` - Short line name

#### LID_VERLAUF (Routes)
Ordered sequence of stops for a line variant.

**Key Fields:**
- `LI_NR` / `STR_LI_VAR` - Line and variant reference
- `LI_LFD_NR` - Sequence number
- `ORT_NR` - Stop ID
- `SEL_ZNR` - Destination ID (for announcements)

#### MENGE_FGR (Vehicle Groups)
Vehicle type groups for line assignment.

### 3. Schedule & Operations

#### REC_FRT (Trips)
Individual vehicle trips along a route.

**Key Fields:**
- `FRT_FID` - Trip ID (Primary Key)
- `LI_NR` / `STR_LI_VAR` - Line and variant
- `FRT_START` - Start time in seconds from midnight
- `UM_UID` - Block/rotation ID
- `TAGESART_NR` - Service day type

#### REC_UMS (Transfers/Timetable Points)
Scheduled arrival/departure times for each stop on a trip.

**Key Fields:**
- `FRT_FID` - Trip ID reference
- `LI_LFD_NR` - Stop sequence number
- `UMS_ANKUNFT` / `UMS_ABFAHRT` - Arrival/departure time (seconds from midnight)

#### MENGE_TAGESART (Day Types)
Service calendar day types (e.g., "Mo-Fr", "Sa", "So").

**Key Fields:**
- `TAGESART_NR` - Day type ID
- `TAGESART_TEXT` - Description

#### FIRMENKALENDER (Company Calendar)
Assigns date ranges to day types.

**Key Fields:**
- `BETRIEBSTAG` - Operating date (YYYYMMDD)
- `TAGESART_NR` - Day type for this date

#### MENGE_BASIS_VERSIONEN (Basis Versions)
Version control for datasets.

**Key Fields:**
- `BASIS_VERSION` - Version number (e.g., 20250101)

#### MENGE_BHOF (Depots/Betriebshöfe)
Bus/tram depot locations.

**Key Fields:**
- `BHOF_NR` - Depot ID
- `BHOF_TEXT` - Depot name
- `STR_BHOF` - Depot abbreviation

### 4. Passenger Information (FIS)

#### REC_ZNR (Destinations)
Destination texts for passenger information systems.

**Key Fields:**
- `ZNR` - Destination ID
- `ZIELTEXT` - Destination text
- `ZIELTEXT_KURZ` - Short destination

#### REC_ANR (Announcements)
Automated announcement texts.

### 5. Disposition & Connections

#### REC_UEB (Vehicle Transitions)
Describes vehicle handoffs between trips (e.g., line changes, direction changes).

**Key Fields:**
- `UEB_NR` - Transition ID
- `UEB_FAHRZEIT` - Transition time in seconds

#### EINZELANSCHLUSS (Connection Protection)
Guaranteed transfer connections between trips.

**Components:**
- **EINZELANSCHLUSS (VDV 432)**: Defines WHICH trips are connected
- **REC_UMS (VDV 232)**: Defines WHEN and HOW LONG to wait

#### REC_FZG (Vehicles)
Physical fleet management.

**Tables:**
- `REC_FZG_TYP` - Vehicle classes (e.g., "MAN Lion's City 12C")
- `REC_FZG` - Individual vehicles with registration numbers

## 🔄 Key Workflows

### GTFS Import
1. Navigate to "Import/Export"
2. Select GTFS tab
3. Choose `BASIS_VERSION` or create new
4. Upload GTFS ZIP file
5. Monitor import progress
6. Review imported data in respective entity views

### VDV 452 Import
1. Navigate to "Import/Export" → VDV 452 tab
2. Select `BASIS_VERSION` and table type
3. Upload `.x10` file
4. Data is parsed and imported into selected table

### VDV 452 Export
1. Navigate to "Import/Export" → VDV 452 tab
2. Select `BASIS_VERSION` and table type
3. Click "Export"
4. Download ISO-8859-1 encoded `.x10` file

### Editing Line IDs (with Cascading Updates)
When editing the `LI_NR` field on an existing line:
1. Open line in detail view
2. Modify `LI_NR` field
3. Click "Save"
4. Confirm cascading update warning
5. System automatically updates all dependent records:
   - `LID_VERLAUF` (route sequences)
   - `REC_FRT` (trips)
   - `REC_UMS` (timetable points)

⚠️ **Warning**: This operation is transactional and affects multiple tables. Ensure the new ID doesn't conflict with existing lines.

## 📡 API Endpoints

### Core Resources
- `GET/POST /api/vdv/orte` - Stops/Places
- `GET/POST /api/vdv/haltepunkte` - Stop points
- `GET/POST /api/lines` - Lines
- `PUT /api/lines/:oldId/change-id` - Cascade line ID update
- `GET/POST /api/variants` - Line variants
- `GET/POST /api/trips` - Trips
- `GET/POST /api/vdv/betriebshoefe` - Depots

### Calendar & Versions
- `GET /api/calendar/basis-versions` - Basis versions
- `GET /api/calendar/day-types` - Day types
- `GET /api/calendar/company-calendar` - Company calendar

### Import/Export
- `POST /api/gtfs/import` - GTFS import
- `POST /api/gtfs/export` - GTFS export
- `POST /api/vdv/import` - VDV 451/452 import
- `GET /api/vdv/export/:table` - VDV 451/452 export
- `GET /api/vdv/supported-tables` - List importable tables

### Vehicles
- `GET/POST /api/vdv/vehicles` - Vehicles
- `GET/POST /api/vdv/vehicle-types` - Vehicle types

## 🧪 Testing

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

## 🚦 Environment Variables

Create `.env` file in backend directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ifesx
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:4200
```

## 📝 License

[Add your license here]

## 👥 Contributors

[Add contributors]

## 📞 Support

For issues, questions, or contributions, please [open an issue](link-to-issues).

---

**VDV Standard References:**
- VDV 451: Interface for timetable data
- VDV 452: Data model for planning and operations
- VDV 454: ÖPNV data exchange format
