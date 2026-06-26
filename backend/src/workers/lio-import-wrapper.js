
const path = require('path');

// tsx registrieren, damit .ts-Worker im Dev-Modus geladen werden kann
require('tsx/cjs');

// Eigentlichen Worker laden
require(path.join(__dirname, 'lio-import.worker.ts'));
