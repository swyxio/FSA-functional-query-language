const fs = require('fs');
const rmrf = require('rimraf');

const specUtils = {};

const allowed = new Set(['movies-table', 'actors-table', 'roles-table']);
specUtils.removeNonDataTables = function () {
  fs.readdirSync('film-database').forEach(function (path) {
    if (!allowed.has(path)) {
      rmrf.sync('film-database/' + path);
    }
  });
};

module.exports = specUtils;