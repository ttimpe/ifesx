const { register } = require('tsx/cjs/api');
register();
require('./gtfs-import.worker.ts');
