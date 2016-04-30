'use strict';

var chai = require('chai');
chai.use(require('chai-spies'));
var expect = require('chai').expect;

var Table = require('../source/table');
var FQL = require('../source/fql');
var Plan = require('../source/plan');

// ------------------------------------------------------
//  _______  _______  ______    _______    ___   __   __ 
// |       ||   _   ||    _ |  |       |  |   | |  | |  |
// |    _  ||  |_|  ||   | ||  |_     _|  |   | |  |_|  |
// |   |_| ||       ||   |_||_   |   |    |   | |       |
// |    ___||       ||    __  |  |   |    |   | |       |
// |   |    |   _   ||   |  | |  |   |    |   |  |     | 
// |___|    |__| |__||___|  |_|  |___|    |___|   |___|  
//
// ------------------------------------------------------

describe("Part IV: (w)indexing", function () {

  var movieTable, movieQuery, actorTable;
  beforeEach(function () {
    movieTable = new Table('film-database/movies-table');
    movieQuery = new FQL(movieTable);
    actorTable = new Table('film-database/actors-table');
  });

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
    var indexTable = movieTable.getIndexTable('year');
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
    var nonIndexedResult = new FQL(movieTable)
    .where({year: 1999})
    .get();
    expect(movieTable.read).to.have.been.called.exactly(36);
    // indexed query
    movieTable.addIndexTable('year');
    chai.spy.on(movieTable, 'read');
    var indexedResult = new FQL(movieTable)
    .where({year: 1999})
    .get();
    expect(movieTable.read).to.have.been.called.exactly(4);
    // results should still be the same
    expect(nonIndexedResult).to.eql(indexedResult);
  });

  xit("produces results more quickly for sparse finds", function () {
    // non-indexed
    console.time('non-indexed query');
    var nonIndexedResult = new FQL(actorTable).where({last_name: 'Miller'}).get();
    console.timeEnd('non-indexed query');
    // indexed
    actorTable.addIndexTable('last_name');
    console.time('indexed query');
    var indexedResult = new FQL(actorTable).where({last_name: 'Miller'}).get();
    console.timeEnd('indexed query');
    // check out the console!
    expect(nonIndexedResult).to.eql(indexedResult);
  });

});
