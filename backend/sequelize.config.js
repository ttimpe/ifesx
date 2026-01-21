// sequelize.config.js
module.exports = {
    development: {
      dialect: 'sqlite',
      storage: './timetable.sqlite3',
    },
    test: {
      dialect: 'sqlite',
      storage: ':memory:',
    },
    production: {
      dialect: 'sqlite',
      storage: './timetable.sqlite3',
    },
  };