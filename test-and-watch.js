const fs = require('fs');
const path = require('path');
const livereload = require('livereload');
const tripwire = require('tripwire');
const opn = require('opn');
const Mocha = require('mocha');
const interceptStdOut = require('intercept-stdout');
const AnsiToHtml = require('ansi-to-html');
const ansiToHtml = new AnsiToHtml();

const specUtils = require('./spec-utils');

// filepaths constants
const tempOutput = path.join(__dirname, '_report-without-livereload.html');
const reportTargetFile = path.join(__dirname, 'report.html');
const specDir = path.join(__dirname, 'specs');
const sourceDir = path.join(__dirname, 'source');

// create a fresh `mocha` instance that can be run (but is not yet run)
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

// this opens the report (with the user's default web browser), but only once ever
// from there, livereload should be able to take over
let hasAttemptedOpen = false;
function openOnce () {
  if (hasAttemptedOpen) return;
  hasAttemptedOpen = true;
  opn(reportTargetFile);
}

// to keep out mocha runner logs
function captureExclusionFilter (text) {
  return text.startsWith('The report is written in');
}

// start the stdout intercepter
let capturedHtml = '';
let interceptStopper;
function captureStdOutAsHtml () {
  stopCapturing();
  interceptStopper = interceptStdOut(function (text) {
    if (captureExclusionFilter(text)) return;
    // conversion is primarily to maintain any coloration in stdout
    capturedHtml += ansiToHtml.toHtml(text);
  });
}

// stop the stdout intercepter
function stopCapturing () {
  if (interceptStopper) interceptStopper();
}

// return the captured html and reset it to emptiness, also stop capturing
function consumeCapturedHtmlAndStopCapturing () {
  stopCapturing();
  const toReturn = capturedHtml;
  capturedHtml = '';
  return toReturn;
}

// stupid sipmle (regex) parse html for div with id mocha and prepend some html inside it
const mochaDivPattern = /id="mocha">/g;
function prependToMocha (html, toPrepend) {
  return html.replace(mochaDivPattern, function (match) {
    return match + toPrepend;
  });
}

function consumePrependAndStopCapture (existingHtmlOutput) {
  return prependToMocha(existingHtmlOutput, `
    <h1>Console Output</h1>
    <pre>${consumeCapturedHtmlAndStopCapturing() || '(none)'}</pre>
    <hr>
    <h1>Specs</h1>
  `);
}

// actually executes the specs and returns a promise for some html
function mochaHtmlOutput (mocha) {
  return new Promise(function (resolve, reject) {
    mocha.run(function () {
      let result, error;
      try {
        result = fs.readFileSync(tempOutput).toString();
        fs.unlinkSync(tempOutput);
      } catch (_error) {
        error = _error;
      }
      if (error) reject(error);
      else resolve(result);
    });
  });
}

// attempt to execute the specs
// but catches possible syntax errors in files required by the specs
function tryMochaHtmlOutput () {
  return specUtils.tryPromise(function () {
    tripwire.resetTripwire(2000);
    const mocha = setupMochaInstance();
    return mochaHtmlOutput(mocha);
  });
}

// format an error for how it will display to the user
function formatErrorForHtmlOutput (error) {
  return `<h2>Error: ${error.message}</h2><pre>${error.stack}</pre>`;
}

// append live reload script to some existing html
const livereloadClientScript = `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>`;
function addLivereloadScript (existingHtmlOutput) {
  return existingHtmlOutput + livereloadClientScript;
}

// html output maybe from mocha or from an error in attempting to run the specs
function generateHtmlOutput () {
  captureStdOutAsHtml();
  return tryMochaHtmlOutput()
  .catch(formatErrorForHtmlOutput)
  .then(consumePrependAndStopCapture)
  .then(addLivereloadScript);
}

// send html to the report file (which should trigger livereload because that's what it's watching)
function writeToReportTarget (htmlOutput) {
  return fs.writeFileSync(reportTargetFile, htmlOutput);
}

// create, write, and open the report
function generateAndOpenReport () {
  generateHtmlOutput()
  .then(writeToReportTarget)
  .then(openOnce)
  .catch(function (error) {
    // this is just a failsafe in case `writeToReportTarget` or `openOnce` have some unforseen error
    console.error('There was some totally unexpected error');
    console.error(error);
  });
}

// get livereload server cooking
function startLiveReload () {
  const server = livereload.createServer();
  // only watch the report file
  server.watch(reportTargetFile);
  return server;
}

// do the thing
function startAutoReportGenerator () {
  startLiveReload();
  // kick the whole thing off one time at startup
  generateAndOpenReport();
  // continue watching for the future
  fs.watch(specDir, () => generateAndOpenReport());
  fs.watch(sourceDir, () => generateAndOpenReport());
}

// go!
startAutoReportGenerator();
