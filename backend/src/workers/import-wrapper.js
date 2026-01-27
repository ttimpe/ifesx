
const path = require('path');

// Register tsx to handle .ts files
require('tsx/cjs');

// Load the actual worker
require(path.join(__dirname, 'gtfs-import.worker.ts'));
