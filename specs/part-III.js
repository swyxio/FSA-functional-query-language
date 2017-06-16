const chai = require('chai');
chai.use(require('chai-spies'));
const expect = require('chai').expect;

const specUtils = require('../spec-utils');

const Table = require('../source/table');
const FQL = require('../source/fql');

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

  let movieTable, actorTable;
  beforeEach(function () {
    movieTable = new Table('film-database/movies-table');
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
      1972: [ '0010' ],
      1977: [ '0031' ],
      1978: [ '0001' ],
      1984: [ '0008' ],
      1986: [ '0000' ],
      1987: [ '0025' ],
      1989: [ '0015', '0034' ],
      1991: [ '0012' ],
      1992: [ '0006', '0027' ],
      1994: [ '0026', '0028' ],
      1995: [ '0002', '0004' ],
      1996: [ '0005' ],
      1997: [ '0033' ],
      1998: [ '0023' ],
      1999: [ '0007', '0017', '0022', '0032' ],
      2000: [ '0011', '0018', '0020', '0030' ],
      2001: [ '0021', '0029', '0035' ],
      2003: [ '0013', '0016', '0019', '0024' ],
      2004: [ '0009', '0014' ],
      2005: [ '0003' ]
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
    console.log(label, nanosecondsOf(time) / 1e6, 'ms');
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
