const fs = require('fs');
const path = require('path');
const livereload = require('livereload');
const tripwire = require('tripwire');
const opn = require('opn');
const Mocha = require('mocha');

// filepaths constants
const tempOutput = path.join(__dirname, '_report-without-livereload.html');
const reportTargetFile = path.join(__dirname, 'report.html');
const specDir = path.join(__dirname, 'specs');
const sourceDir = path.join(__dirname, 'source');

// get livereload server cooking
const server = livereload.createServer();
server.watch(__dirname);

// put livereload client script into report.html
const livereloadClientScript = `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>`;
function addLivereloadScript () {
  const contents = fs.readFileSync(tempOutput);
  fs.writeFileSync(reportTargetFile, contents.toString() + livereloadClientScript);
}

function setupMochaInstance () {
  // clear the cache so mocha actually re-runs all files
  Object.keys(require.cache).forEach(key => delete require.cache[key]);
  // setup mocha instance
  const mocha = new Mocha({
    reporter: 'mocha-simple-html-reporter',
    reporterOptions: {
      output: tempOutput
    }
  });
  fs.readdirSync(specDir)
  .filter(filename => filename.slice(-3) === '.js')
  .forEach(filename => mocha.addFile(path.join(specDir, filename)));
  return mocha;
}

let hasAttemptedOpen = false;
function openOnce () {
  if (hasAttemptedOpen) return;
  hasAttemptedOpen = true;
  opn(reportTargetFile);
}

function runSpecs () {
  tripwire.resetTripwire(2000);
  const mocha = setupMochaInstance();
  // run the specs
  mocha.run(function () {
    try {
      addLivereloadScript();
      console.log(`Successfully added livereload client script to "${reportTargetFile}"`);
      fs.unlinkSync(tempOutput);
      console.log(`Successfully deleted the temporary "${tempOutput}" file.`);
      openOnce();
    } catch (err) {
      console.error(err);
    }
  });
}

// kick the whole thing off one time at startup
runSpecs();
// continue watching for the future
fs.watch(specDir, () => runSpecs());
fs.watch(sourceDir, () => runSpecs());
