const fs = require('fs');
const rmrf = require('rimraf');

const chai = require('chai');
chai.use(require('chai-spies'));
const expect = require('chai').expect;

const specUtils = require('../spec-utils');

const Table = require('../source/table');
const FQL = require('../source/fql');
const Plan = require('../source/plan');

// --------------------------------------------------------
//  _______  _______  ______    _______    ___   ___   ___  
// |       ||   _   ||    _ |  |       |  |   | |   | |   | 
// |    _  ||  |_|  ||   | ||  |_     _|  |   | |   | |   | 
// |   |_| ||       ||   |_||_   |   |    |   | |   | |   | 
// |    ___||       ||    __  |  |   |    |   | |   | |   | 
// |   |    |   _   ||   |  | |  |   |    |   | |   | |   | 
// |___|    |__| |__||___|  |_|  |___|    |___| |___| |___| 
//
// --------------------------------------------------------

describe("Part III: (w)indexing", function () {

  let movieTable, movieQuery, actorTable;
  beforeEach(function () {
    movieTable = new Table('film-database/movies-table');
    movieQuery = new FQL(movieTable);
    actorTable = new Table('film-database/actors-table');
  });

  before(specUtils.removeNonDataTables);

  afterEach(specUtils.removeNonDataTables);

  xit("tables can be indexed by a column", function () {
    // `hasIndexTable`
    expect(Table.prototype.hasIndexTable).to.be.a('function');
    expect(movieTable.hasIndexTable('year')).to.equal(false);
    // `addIndexTable`
    expect(Table.prototype.addIndexTable).to.be.a('function');
    movieTable.addIndexTable('year');
    expect(movieTable.hasIndexTable('year')).to.equal(true);
    // `getIndexTable`
    expect(Table.prototype.getIndexTable).to.be.a('function');
    const indexTable = movieTable.getIndexTable('year');
    expect(indexTable).to.eql({
      1972: [ 10 ],
      1977: [ 31 ],
      1978: [ 1 ],
      1984: [ 8 ],
      1986: [ 0 ],
      1987: [ 25 ],
      1989: [ 15, 34 ],
      1991: [ 12 ],
      1992: [ 6, 27 ],
      1994: [ 26, 28 ],
      1995: [ 2, 4 ],
      1996: [ 5 ],
      1997: [ 33 ],
      1998: [ 23 ],
      1999: [ 7, 17, 22, 32 ],
      2000: [ 11, 18, 20, 30 ],
      2001: [ 21, 29, 35 ],
      2003: [ 13, 16, 19, 24 ],
      2004: [ 9, 14 ],
      2005: [ 3 ]
    });
  });

  xit("where queries take advantage of indexed columns to minimize table reads", function () {
    // non-indexed query
    chai.spy.on(movieTable, 'read');
    const nonIndexedResult = new FQL(movieTable)
    .where({year: 1999})
    .get();
    expect(movieTable.read).to.have.been.called.exactly(36);
    // indexed query
    movieTable.addIndexTable('year');
    chai.spy.on(movieTable, 'read');
    const indexedResult = new FQL(movieTable)
    .where({year: 1999})
    .get();
    expect(movieTable.read).to.have.been.called.exactly(4);
    // results should still be the same
    expect(nonIndexedResult).to.eql(indexedResult);
  });

  function nanosecondsOf (time) {
    return time[0] * 1e9 + time[1]; 
  }

  function logTime (label, time) {
    console.log(label, nanosecondsOf(time)/1e6, 'ms');
  }

  function pad (str) {
    return '    ' + str;
  }

  xit("produces results more quickly for sparse finds", function () {
    // non-indexed
    const nonIndexedStart = process.hrtime();
    const nonIndexedResult = new FQL(actorTable).where({last_name: 'Miller'}).get();
    const nonIndexedDuration = process.hrtime(nonIndexedStart);
    // indexed
    actorTable.addIndexTable('last_name');
    const indexedStart = process.hrtime();
    const indexedResult = new FQL(actorTable).where({last_name: 'Miller'}).get();
    const indexedDuration = process.hrtime(indexedStart);
    // check out the console!
    console.log(pad('+----------------------------------+'));
    logTime(pad(' Non-indexed query'), nonIndexedDuration);
    logTime(pad(' Indexed query'), indexedDuration);
    const factor = Math.round(nanosecondsOf(nonIndexedDuration) / nanosecondsOf(indexedDuration));
    console.log(pad(' Indexed query was'), factor, 'times faster');
    console.log(pad('+----------------------------------+'));
    // results are the same
    expect(nonIndexedResult).to.eql(indexedResult);
    // indexed query should be significantly faster
    expect(factor).to.be.greaterThan(10);
  });

});
