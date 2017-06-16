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

specUtils.tryPromise = function (fn) {
  return new Promise(function (resolve, reject) {
    let result, error;
    try {
      result = fn();
    } catch (_error)  {
      error = _error;
    }
    if (error) return reject(error);
    if (result && typeof result.then === 'function') {
      result.then(resolve, reject);
    } else {
      resolve(result);
    }
  });
};

module.exports = specUtils;
