const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const livereload = require('livereload');
const Mocha = require('mocha');

// get livereload server cooking
const server = livereload.createServer();
server.watch(__dirname);

// put livereload client script into report.html
const livereloadClientScript = `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>`;
const tempOutput = path.join(__dirname, '_report-without-livereload.html');
const reportTargetFile = path.join(__dirname, 'report.html');
function addLivereloadScript (cb) {
  fs.readFile(tempOutput, function (err, contents) {
    if (err) return cb(err);
    fs.writeFile(reportTargetFile, contents.toString() + livereloadClientScript, function (err) {
      if (err) return cb(err);
      cb();
    });
  });
}

const specDir = path.join(__dirname, 'specs');
function runSpecs (cb) {
  // clear the cache so mocha actually re-runs all files
  Object.keys(require.cache).forEach(key => delete require.cache[key]);
  // setup mocha instance
  const mocha = new Mocha({
    reporter: 'mocha-simple-html-reporter',
    reporterOptions: {
      output: tempOutput
    }
  });
  fs.readdirSync('specs')
  .filter(filename => filename.slice(-3) === '.js')
  .forEach(filename => mocha.addFile(path.join(specDir, filename)));
  // run the specs
  mocha.run(function () {
    addLivereloadScript(function (err) {
      if (err) console.error(err);
      else console.log(`Successfully added livereload client script to "${reportTargetFile}"`);
      fs.unlink(tempOutput, function (err) {
        if (err) console.error(err);
        else console.log(`Successfully deleted the temporary "${tempOutput}" file.`);
        if (cb) cb();
      });
    });
  });
}

// kick the whole thing off one time at startup
runSpecs(() => child_process.exec(`open "${reportTargetFile}"`));
// continue watching for the future
fs.watch('specs', () => runSpecs());
