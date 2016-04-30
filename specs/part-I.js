'use strict';

var chai = require('chai');
chai.use(require('chai-spies'));
var expect = require('chai').expect;

var Table = require('../source/table');
var FQL = require('../source/fql');
var Plan = require('../source/plan');

// --------------------------------------------
//  _______  _______  ______    _______    ___  
// |       ||   _   ||    _ |  |       |  |   | 
// |    _  ||  |_|  ||   | ||  |_     _|  |   | 
// |   |_| ||       ||   |_||_   |   |    |   | 
// |    ___||       ||    __  |  |   |    |   | 
// |   |    |   _   ||   |  | |  |   |    |   | 
// |___|    |__| |__||___|  |_|  |___|    |___| 
//
// --------------------------------------------
describe("Part I: bedrock", function () {

  xit("`Table` is a constructor that takes a folder path (don't worry about it too much yet)", function () {
    expect(Table).to.be.a('function');
    var movieTable = new Table('film-database/movies-table')
    expect(movieTable).to.be.an.instanceOf(Table);
  });

  xit("`Table.toFilename` converts an ID to a four-digit zero-padded filename", function () {
    expect(Table.toFilename).to.be.a('function');
    expect(Table.toFilename(3895)).to.equal('3895.json');
    expect(Table.toFilename(216)).to.equal('0216.json');
    expect(Table.toFilename(42)).to.equal('0042.json');
    expect(Table.toFilename(7)).to.equal('0007.json');
  });

  xit("`Table.toId` converts an filename to an ID (number)", function () {
    expect(Table.toId).to.be.a('function');
    expect(Table.toId('4444.json')).to.equal(4444);
    expect(Table.toId('0333.json')).to.equal(333);
    expect(Table.toId('0022.json')).to.equal(22);
    expect(Table.toId('0001.json')).to.equal(1);
  });

  // HINT: check out `JSON.parse` (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
  xit("`Table` instances (tables) can read from a folder, given an ID", function () {
    expect(Table.prototype.read).to.be.a('function');
    var movieTable = new Table('film-database/movies-table');
    var result = movieTable.read(2);
    expect(result).to.eql({
      id: 2,
      name: 'Apollo 13',
      year: 1995,
      rank: 7.5
    });
  });

  // HINT: checkout `fs.readdirSync` (https://nodejs.org/api/fs.html#fs_fs_readdirsync_path)
  xit("tables can `getRowIds`", function () {
    expect(Table.prototype.getRowIds).to.be.a('function');
    var movieTable = new Table('film-database/movies-table');
    var ids = movieTable.getRowIds();
    expect(ids).to.eql([ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35 ]);
  });

  xit("`FQL` is a constructor that takes a table", function () {
    var movieTable = new Table('film-database/movies-table')
    expect(FQL).to.be.a('function');
    var movieQuery = new FQL(movieTable);
    expect(movieQuery).to.be.an.instanceOf(FQL);
  });

  xit("`FQL` instances (queries) can retrieve all rows from their table using `get`", function () {
    expect(FQL.prototype.get).to.be.a('function');
    var movieTable = new Table('film-database/movies-table');
    var movieQuery = new FQL(movieTable);
    chai.spy.on(movieTable, 'getRowIds');
    chai.spy.on(movieTable, 'read');
    var result = movieQuery.get();
    expect(movieTable.getRowIds).to.have.been.called.exactly(1);
    expect(movieTable.read).to.have.been.called.exactly(36);
    expect(result).to.eql([
      { id: 0, name: 'Aliens', year: 1986, rank: 8.2 },
      { id: 1, name: 'Animal House', year: 1978, rank: 7.5 },
      { id: 2, name: 'Apollo 13', year: 1995, rank: 7.5 },
      { id: 3, name: 'Batman Begins', year: 2005, rank: null },
      { id: 4, name: 'Braveheart', year: 1995, rank: 8.3 },
      { id: 5, name: 'Fargo', year: 1996, rank: 8.2 },
      { id: 6, name: 'Few Good Men, A', year: 1992, rank: 7.5 },
      { id: 7, name: 'Fight Club', year: 1999, rank: 8.5 },
      { id: 8, name: 'Footloose', year: 1984, rank: 5.8 },
      { id: 9, name: 'Garden State', year: 2004, rank: 8.3 },
      { id: 10, name: 'Godfather, The', year: 1972, rank: 9 },
      { id: 11, name: 'Hollow Man', year: 2000, rank: 5.3 },
      { id: 12, name: 'JFK', year: 1991, rank: 7.8 },
      { id: 13, name: 'Kill Bill: Vol. 1', year: 2003, rank: 8.4 },
      { id: 14, name: 'Kill Bill: Vol. 2', year: 2004, rank: 8.2 },
      { id: 15, name: 'Little Mermaid, The', year: 1989, rank: 7.3 },
      { id: 16, name: 'Lost in Translation', year: 2003, rank: 8 },
      { id: 17, name: 'Matrix, The', year: 1999, rank: 8.5 },
      { id: 18, name: 'Memento', year: 2000, rank: 8.7 },
      { id: 19, name: 'Mystic River', year: 2003, rank: 8.1 },
      { id: 20, name: 'O Brother, Where Art Thou?', year: 2000, rank: 7.8 },
      { id: 21, name: 'Ocean\'s Eleven', year: 2001, rank: 7.5 },
      { id: 22, name: 'Office Space', year: 1999, rank: 7.6 },
      { id: 23, name: 'Pi', year: 1998, rank: 7.5 },
      { id: 24, name: 'Pirates of the Caribbean', year: 2003, rank: null },
      { id: 25, name: 'Planes, Trains & Automobiles', year: 1987, rank: 7.2 },
      { id: 26, name: 'Pulp Fiction', year: 1994, rank: 8.7 },
      { id: 27, name: 'Reservoir Dogs', year: 1992, rank: 8.3 },
      { id: 28, name: 'Shawshank Redemption, The', year: 1994, rank: 9 },
      { id: 29, name: 'Shrek', year: 2001, rank: 8.1 },
      { id: 30, name: 'Snatch.', year: 2000, rank: 7.9 },
      { id: 31, name: 'Star Wars', year: 1977, rank: 8.8 },
      { id: 32, name: 'Stir of Echoes', year: 1999, rank: 7 },
      { id: 33, name: 'Titanic', year: 1997, rank: 6.9 },
      { id: 34, name: 'UHF', year: 1989, rank: 6.6 },
      { id: 35, name: 'Vanilla Sky', year: 2001, rank: 6.9 }
    ]);
  });

  xit("queries can count all rows", function () {
    expect(FQL.prototype.count).to.be.a('function');
    var movieTable = new Table('film-database/movies-table');
    var movieQuery = new FQL(movieTable);
    var result = movieQuery.count();
    expect(result).to.equal(36);
  });

  // why do queries have a plan you ask? ...see part II
  xit("queries have a plan", function () {
    var movieTable = new Table('film-database/movies-table');
    var movieQuery = new FQL(movieTable);
    expect(movieQuery).to.have.property('plan');
    expect(movieQuery.plan).to.be.instanceOf(Plan);
  });

});
