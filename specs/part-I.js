const chai = require('chai');
chai.use(require('chai-spies'));
const expect = require('chai').expect;

const Table = require('../source/table');
const FQL = require('../source/fql');

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

  it("`Table` is a constructor that takes a folder path (don't worry about it too much yet)", function () {
    // this spec should already be passing (check out the file ../source/table.js)
    expect(Table).to.be.a('function');
    const movieTable = new Table('film-database/movies-table');
    expect(movieTable).to.be.an.instanceOf(Table);
  });

  it("`Table.toFilename` converts an ID to a JSON filename", function () {
    // notice this method is `Table.toFilename`, not `Table.prototype.toFilename`
    // this is what we might call a "static method" or a "class method" (http://javascript.info/tutorial/static-variables-methods-decorators#static-methods)
    expect(Table.toFilename).to.be.a('function');
    expect(Table.toFilename('3895')).to.equal('3895.json');
    expect(Table.toFilename('0216')).to.equal('0216.json');
    expect(Table.toFilename('0042')).to.equal('0042.json');
    expect(Table.toFilename('0007')).to.equal('0007.json');
  });

  it("`Table.toId` converts a filename to an ID (no extension)", function () {
    expect(Table.toId).to.be.a('function');
    expect(Table.toId('4444.json')).to.equal('4444');
    expect(Table.toId('0333.json')).to.equal('0333');
    expect(Table.toId('0022.json')).to.equal('0022');
    expect(Table.toId('0001.json')).to.equal('0001');
  });

  it("`Table` instances (tables) can read from a folder, given an ID", function () {
    // HINT: check out `JSON.parse` (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
    expect(Table.prototype.read).to.be.a('function');
    const movieTable = new Table('film-database/movies-table');
    const result = movieTable.read('0002');
    expect(result).to.eql({
      id: '0002',
      name: 'Apollo 13',
      year: 1995,
      rank: 7.5
    });
  });

  it("tables will return `undefined` for a row that does not exist", function () {
    // HINT: I wonder whether we could `try` to `catch` an error?
    // ALTERNATIVE HINT: `fs.existsSync` (https://nodejs.org/api/fs.html#fs_fs_existssync_path)
    const movieTable = new Table('film-database/movies-table');
    const result = movieTable.read('0040');
    expect(result).to.eql(undefined);
  });

  it("tables can `getRowIds`", function () {
    // HINT: checkout `fs.readdirSync` (https://nodejs.org/api/fs.html#fs_fs_readdirsync_path)
    expect(Table.prototype.getRowIds).to.be.a('function');
    const movieTable = new Table('film-database/movies-table');
    const ids = movieTable.getRowIds();
    expect(ids).to.eql(['0000', '0001', '0002', '0003', '0004', '0005', '0006', '0007', '0008', '0009', '0010', '0011', '0012', '0013', '0014', '0015', '0016', '0017', '0018', '0019', '0020', '0021', '0022', '0023', '0024', '0025', '0026', '0027', '0028', '0029', '0030', '0031', '0032', '0033', '0034', '0035' ]);
  });

  it("`FQL` is a constructor that takes a table", function () {
    const movieTable = new Table('film-database/movies-table');
    expect(FQL).to.be.a('function');
    const movieQuery = new FQL(movieTable);
    expect(movieQuery).to.be.an.instanceOf(FQL);
  });

  it("`FQL` instances (queries) can retrieve all rows from their table using `get`", function () {
    expect(FQL.prototype.get).to.be.a('function');
    const movieTable = new Table('film-database/movies-table');
    const movieQuery = new FQL(movieTable);
    chai.spy.on(movieTable, 'getRowIds');
    chai.spy.on(movieTable, 'read');
    const result = movieQuery.get();
    expect(movieTable.getRowIds).to.have.been.called.exactly(1);
    expect(movieTable.read).to.have.been.called.exactly(36);
    expect(result).to.eql([
      { id: '0000', name: 'Aliens', year: 1986, rank: 8.2 },
      { id: '0001', name: 'Animal House', year: 1978, rank: 7.5 },
      { id: '0002', name: 'Apollo 13', year: 1995, rank: 7.5 },
      { id: '0003', name: 'Batman Begins', year: 2005, rank: null },
      { id: '0004', name: 'Braveheart', year: 1995, rank: 8.3 },
      { id: '0005', name: 'Fargo', year: 1996, rank: 8.2 },
      { id: '0006', name: 'Few Good Men, A', year: 1992, rank: 7.5 },
      { id: '0007', name: 'Fight Club', year: 1999, rank: 8.5 },
      { id: '0008', name: 'Footloose', year: 1984, rank: 5.8 },
      { id: '0009', name: 'Garden State', year: 2004, rank: 8.3 },
      { id: '0010', name: 'Godfather, The', year: 1972, rank: 9 },
      { id: '0011', name: 'Hollow Man', year: 2000, rank: 5.3 },
      { id: '0012', name: 'JFK', year: 1991, rank: 7.8 },
      { id: '0013', name: 'Kill Bill: Vol. 1', year: 2003, rank: 8.4 },
      { id: '0014', name: 'Kill Bill: Vol. 2', year: 2004, rank: 8.2 },
      { id: '0015', name: 'Little Mermaid, The', year: 1989, rank: 7.3 },
      { id: '0016', name: 'Lost in Translation', year: 2003, rank: 8 },
      { id: '0017', name: 'Matrix, The', year: 1999, rank: 8.5 },
      { id: '0018', name: 'Memento', year: 2000, rank: 8.7 },
      { id: '0019', name: 'Mystic River', year: 2003, rank: 8.1 },
      { id: '0020', name: 'O Brother, Where Art Thou?', year: 2000, rank: 7.8 },
      { id: '0021', name: 'Ocean\'s Eleven', year: 2001, rank: 7.5 },
      { id: '0022', name: 'Office Space', year: 1999, rank: 7.6 },
      { id: '0023', name: 'Pi', year: 1998, rank: 7.5 },
      { id: '0024', name: 'Pirates of the Caribbean', year: 2003, rank: null },
      { id: '0025', name: 'Planes, Trains & Automobiles', year: 1987, rank: 7.2 },
      { id: '0026', name: 'Pulp Fiction', year: 1994, rank: 8.7 },
      { id: '0027', name: 'Reservoir Dogs', year: 1992, rank: 8.3 },
      { id: '0028', name: 'Shawshank Redemption, The', year: 1994, rank: 9 },
      { id: '0029', name: 'Shrek', year: 2001, rank: 8.1 },
      { id: '0030', name: 'Snatch.', year: 2000, rank: 7.9 },
      { id: '0031', name: 'Star Wars', year: 1977, rank: 8.8 },
      { id: '0032', name: 'Stir of Echoes', year: 1999, rank: 7 },
      { id: '0033', name: 'Titanic', year: 1997, rank: 6.9 },
      { id: '0034', name: 'UHF', year: 1989, rank: 6.6 },
      { id: '0035', name: 'Vanilla Sky', year: 2001, rank: 6.9 }
    ]);
  });

  it("queries can count all rows", function () {
    expect(FQL.prototype.count).to.be.a('function');
    const movieTable = new Table('film-database/movies-table');
    const movieQuery = new FQL(movieTable);
    const result = movieQuery.count();
    expect(result).to.equal(36);
  });

});
