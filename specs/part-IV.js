const fs = require('fs');
const rmrf = require('rimraf');

const chai = require('chai');
chai.use(require('chai-spies'));
const expect = require('chai').expect;

const specUtils = require('../spec-utils');

const Table = require('../source/table');
const FQL = require('../source/fql');

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

describe("Part IV: putting the able in table", function () {

  beforeEach(function () {
    fs.mkdirSync('test-db');
  });

  afterEach(function () {
    rmrf.sync('test-db');
  });

  before(specUtils.removeNonDataTables);

  afterEach(specUtils.removeNonDataTables);

  describe("table existence", function () {

    xit("creates a folder for a new table if no such folder exists yet", function () {
      new Table('test-db/test-table');
      // a corresponding path should now exist
      const exists = fs.existsSync('test-db/test-table');
      expect(exists).to.equal(true);
      // that path should point to a directory
      const stats = fs.statSync('test-db/test-table');
      expect(stats.isDirectory()).to.equal(true);
    });

    xit("`drop` deletes the whole table (folder)", function () {
      // HINT: check out `rimraf.sync` (https://github.com/isaacs/rimraf#rimrafsync)
      expect(Table.prototype.drop).to.be.a('function');
      let testTable = new Table('test-db/test-table');
      testTable.drop();
      expect(fs.existsSync('test-db/test-table')).to.equal(false); // after dropping
      testTable = new Table('test-db/test-table');
      fs.writeFileSync('test-db/test-table/0404.json', '"{}"');
      testTable.drop();
      expect(fs.existsSync('test-db/test-table')).to.equal(false); // after dropping
    });

  });

  describe("row existence", function () {

    let testTable;
    beforeEach(function () {
      testTable = new Table('test-db/test-table');
    });

    xit("`read` will retrieve a row added after table creation", function () {
      const resultBefore = testTable.read('0456');
      expect(resultBefore).to.equal(undefined);
      fs.writeFileSync('test-db/test-table/0456.json', '{"letter":"F","isFor":"functional"}');
      const resultAfter = testTable.read('0456');
      expect(resultAfter).to.eql({letter: 'F', isFor: 'functional'});
    });

    xit("`erase` removes a particular row", function () {
      // HINT: check out `fs.unlink` (https://nodejs.org/api/fs.html#fs_fs_unlinksync_path)
      expect(Table.prototype.erase).to.be.a('function');
      fs.writeFileSync('test-db/test-table/0987.json', '{"name":"Roosevelt Franklin","role":"student"}');
      testTable.erase('0987');
      expect(fs.existsSync('test-db/test-table/0987.json')).to.equal(false);
    });

    xit("`write` stores the given data as a JSON string in a file of the given name", function () {
      // HINT: check out `JSON.stringify` (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
      expect(Table.prototype.write).to.be.a('function');
      testTable.write('0123', {name: 'Oscar', role: 'grouch'});
      expect(fs.readdirSync('test-db/test-table')).to.eql(['0123.json']);
      const fileStr = fs.readFileSync('test-db/test-table/0123.json').toString();
      expect(fileStr).to.equal('{"name":"Oscar","role":"grouch"}');
    });

    xit("`update` sets particular columns for a particular row", function () {
      expect(Table.prototype.update).to.be.a('function');
      fs.writeFileSync('test-db/test-table/0789.json', '{"title":"Sesame Street","network":"PBS"}');
      testTable.update('0789', {network: 'HBO', coCreator: 'Joan Ganz Cooney'});
      const fileStr = fs.readFileSync('test-db/test-table/0789.json').toString();
      expect(fileStr).to.equal('{"title":"Sesame Street","network":"HBO","coCreator":"Joan Ganz Cooney"}');
    });

    xit("`insert` writes the row data using an auto-incrementing ID", function () {
      expect(Table.prototype.insert).to.be.a('function');
      testTable.insert({song: 'One of These Things', by: 'Joe Raposo, Jon Stone, & Bruce Hart'});
      testTable.insert({song: 'Rubber Duckie', by: 'Jeff Moss'});
      expect(fs.readdirSync('test-db/test-table')).to.eql(['0000.json', '0001.json']);
      const fileStrA = fs.readFileSync('test-db/test-table/0000.json').toString();
      expect(fileStrA).to.equal('{"song":"One of These Things","by":"Joe Raposo, Jon Stone, & Bruce Hart","id":"0000"}');
      const fileStrB = fs.readFileSync('test-db/test-table/0001.json').toString();
      expect(fileStrB).to.equal('{"song":"Rubber Duckie","by":"Jeff Moss","id":"0001"}');
    });

    function createFakeTableWithData () {
      rmrf.sync('test-db/test-table');
      fs.mkdirSync('test-db/test-table');
      fs.writeFileSync('test-db/test-table/0002.json', '{"a":"alpha","id":"0002"}');
      fs.writeFileSync('test-db/test-table/0003.json', '{"b":"bravo","id":"0003"}');
      fs.writeFileSync('test-db/test-table/0009.json', '{"c":"charlie","id":"0009"}');
    }
    xit("can write to and read from an already-existing table (folder)", function () {
      createFakeTableWithData();
      const table = new Table('test-db/test-table');
      const resultBefore = [table.read('0002'), table.read('0003'), table.read('0009')];
      expect(resultBefore).to.eql([
        {a: 'alpha', id: '0002'},
        {b: 'bravo', id: '0003'},
        {c: 'charlie', id: '0009'}
      ]);
      table.insert({d: 'delta'});
      const resultAfter = [table.read('0002'), table.read('0003'), table.read('0009'), table.read('0010')];
      expect(resultAfter).to.eql([
        {a: 'alpha', id: '0002'},
        {b: 'bravo', id: '0003'},
        {c: 'charlie', id: '0009'},
        {d: 'delta', id: '0010'} // auto-incrementer counts up from the previous maximum
      ]);
    });

  });

  describe("enhanced indexing", function () {

    let testTable;
    beforeEach(function () {
      rmrf.sync('test-db/test-table');
      fs.mkdirSync('test-db/test-table');
      fs.writeFileSync('test-db/test-table/0002.json', '{"title":"alpha","id":"0002"}');
      fs.writeFileSync('test-db/test-table/0003.json', '{"title":"bravo","id":"0003"}');
      fs.writeFileSync('test-db/test-table/0009.json', '{"title":"charlie","id":"0009"}');
      fs.writeFileSync('test-db/test-table/0010.json', '{"title":"bravo","id":"0010"}');
      testTable = new Table('test-db/test-table');
    });

    xit("`addIndexTable` persistently creates an index table", function () {
      testTable.addIndexTable('title'); // should trigger a *persistent* change
      // another table instance will be able to load the already-made index table
      const otherTestTableInstance = new Table('test-db/test-table');
      expect(otherTestTableInstance.hasIndexTable('title')).to.equal(true);
      expect(otherTestTableInstance.getIndexTable('title')).to.eql({
        alpha: [ '0002' ],
        bravo: [ '0003', '0010' ],
        charlie: [ '0009' ]
      });
    });

    xit("`removeIndexTable` persistently removes an index table", function () {
      testTable.addIndexTable('title');
      testTable.removeIndexTable('title'); // should trigger a *persistent* change
      const otherTestTableInstance = new Table('test-db/test-table');
      expect(otherTestTableInstance.hasIndexTable('title')).to.equal(false);
    });

    xit("`write` also updates any index tables", function () {
      testTable.addIndexTable('title');
      testTable.insert({title: 'delta'});
      const otherTestTableInstance = new Table('test-db/test-table');
      let indexTableData = otherTestTableInstance.getIndexTable('title');
      expect(indexTableData).to.have.property('delta');
      expect(indexTableData.delta).to.eql([ '0011' ]);
      testTable.insert({title: 'bravo'});
      indexTableData = otherTestTableInstance.getIndexTable('title');
      expect(indexTableData).to.have.property('bravo');
      expect(indexTableData.bravo).to.eql(['0003', '0010', '0012']);
    });

    xit("`drop` also removes a table's index tables", function () {
      testTable.addIndexTable('title');
      testTable.drop();
      const otherTestTableInstance = new Table('test-db/test-table');
      expect(otherTestTableInstance.hasIndexTable('title')).to.equal(false);
    });

  });

  describe("enhanced queries", function () {

    const originals = {};
    let wouldHaveBeenWritten, wouldHaveBeenErased;
    beforeEach(function () {
      originals.write = Table.prototype.write;
      originals.erase = Table.prototype.erase;
      wouldHaveBeenWritten = {};
      Table.prototype.write = function (id, data) {
        wouldHaveBeenWritten[id] = data;
      };
      wouldHaveBeenErased = {};
      Table.prototype.erase = function (id) {
        wouldHaveBeenErased[id] = true;
      };
    });
    afterEach(function () {
      Table.prototype.write = originals.write;
      Table.prototype.erase = originals.erase;
    });

    let movieTable, movieQuery;
    beforeEach(function () {
      movieTable = new Table('film-database/movies-table');
      movieQuery = new FQL(movieTable);
    });

    xit("`delete` removes any rows specified by the query", function () {
      expect(FQL.prototype.delete).to.be.a('function');
      chai.spy.on(movieTable, 'erase');
      movieQuery.where({year: 1999}).delete();
      expect(movieTable.erase).to.have.been.called.exactly(4);
      // wouldHaveBeenErased is internally set up by specs (see above)
      // it keeps track of what movie ids get erased by Table.prototype.erase
      expect(wouldHaveBeenErased).to.eql({ '0007': true, '0017': true, '0022': true, '0032': true });
    });

    xit("`set` alters any rows specified by the query", function () {
      expect(FQL.prototype.set).to.be.a('function');
      chai.spy.on(movieTable, 'write');
      movieQuery.where({rank: 7.5}).set({rank: 'C'});
      expect(movieTable.write).to.have.been.called.exactly(5);
      // wouldHaveBeenWritten is internally set up by specs (see above)
      // it keeps track of what movie ids get written to by Table.prototype.write and also what the written value would have been
      expect(wouldHaveBeenWritten).to.eql({
        '0001': { id: '0001', name: 'Animal House', year: 1978, rank: 'C' },
        '0002': { id: '0002', name: 'Apollo 13', year: 1995, rank: 'C' },
        '0006': { id: '0006', name: 'Few Good Men, A', year: 1992, rank: 'C' },
        '0021': { id: '0021', name: 'Ocean\'s Eleven', year: 2001, rank: 'C' },
        '0023': { id: '0023', name: 'Pi', year: 1998, rank: 'C' }
      });
    });

  });

});
