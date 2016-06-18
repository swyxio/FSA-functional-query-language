'use strict';

var fs = require('fs');
var rmrf = require('rimraf');

var chai = require('chai');
chai.use(require('chai-spies'));
var expect = require('chai').expect;

var Table = require('../source/table');
var FQL = require('../source/fql');

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

  describe("table existence", function () {

    xit("creates a folder for a new table if no such folder exists yet", function () {
      new Table('test-db/test-table');
      // a corresponding path should now exist
      var exists = fs.existsSync('test-db/test-table');
      expect(exists).to.equal(true);
      // that path should point to a directory
      var stats = fs.statSync('test-db/test-table');
      expect(stats.isDirectory()).to.equal(true);
    });

    // HINT: check out `rimraf.sync` (https://github.com/isaacs/rimraf#rimrafsync)
    xit("`drop` deletes the whole table (folder)", function () {
      expect(Table.prototype.drop).to.be.a('function');
      var testTable = new Table('test-db/test-table');
      testTable.drop();
      expect(fs.existsSync('test-db/test-table')).to.equal(false); // after dropping
      testTable = new Table('test-db/test-table');
      fs.writeFileSync('test-db/test-table/0404.json', '"{}"');
      testTable.drop();
      expect(fs.existsSync('test-db/test-table')).to.equal(false); // after dropping
    });

  });

  describe("row existence", function () {

    var testTable;
    beforeEach(function () {
      testTable = new Table('test-db/test-table');
    });

    xit("`read` will retrieve a row added after table creation", function () {
      var resultBefore = testTable.read(456);
      expect(resultBefore).to.equal(undefined);
      fs.writeFileSync('test-db/test-table/0456.json', '{"letter":"F","isFor":"functional"}');
      var resultAfter = testTable.read(456);
      expect(resultAfter).to.eql({letter: 'F', isFor: 'functional'});
    });

    // HINT: check out `fs.unlink` (https://nodejs.org/api/fs.html#fs_fs_unlinksync_path)
    xit("`erase` removes a particular row", function () {
      expect(Table.prototype.erase).to.be.a('function');
      fs.writeFileSync('test-db/test-table/0987.json', '{"name":"Roosevelt Franklin","role":"student"}');
      testTable.erase(987);
      expect(fs.existsSync('test-db/test-table/0987.json')).to.equal(false);
    });

    // HINT: check out `JSON.stringify` (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
    xit("`write` stores the given data as a JSON string in a file of the given name", function () {
      expect(Table.prototype.write).to.be.a('function');
      testTable.write(123, {name: 'Oscar', role: 'grouch'});
      expect(fs.readdirSync('test-db/test-table')).to.eql(['0123.json']);
      var fileStr = fs.readFileSync('test-db/test-table/0123.json').toString();
      expect(fileStr).to.equal('{"name":"Oscar","role":"grouch"}');
    });

    xit("`update` sets particular columns for a particular row", function () {
      expect(Table.prototype.update).to.be.a('function');
      fs.writeFileSync('test-db/test-table/0789.json', '{"title":"Sesame Street","network":"PBS"}');
      testTable.update(789, {network: 'HBO', coCreator: 'Joan Ganz Cooney'});
      var fileStr = fs.readFileSync('test-db/test-table/0789.json').toString();
      expect(fileStr).to.equal('{"title":"Sesame Street","network":"HBO","coCreator":"Joan Ganz Cooney"}');
    });

    xit("`insert` writes the row data using an auto-incrementing ID", function () {
      expect(Table.prototype.insert).to.be.a('function');
      testTable.insert({song: 'One of These Things', by: 'Joe Raposo, Jon Stone, & Bruce Hart'});
      testTable.insert({song: 'Rubber Duckie', by: 'Jeff Moss'});
      expect(fs.readdirSync('test-db/test-table')).to.eql(['0000.json', '0001.json']);
      var fileStrA = fs.readFileSync('test-db/test-table/0000.json').toString();
      expect(fileStrA).to.equal('{"song":"One of These Things","by":"Joe Raposo, Jon Stone, & Bruce Hart","id":0}');
      var fileStrB = fs.readFileSync('test-db/test-table/0001.json').toString();
      expect(fileStrB).to.equal('{"song":"Rubber Duckie","by":"Jeff Moss","id":1}');
    });

    function createFakeTableWithData () {
      rmrf.sync('test-db/test-table');
      fs.mkdirSync('test-db/test-table');
      fs.writeFileSync('test-db/test-table/0002.json', '{"a":"alpha","id":2}');
      fs.writeFileSync('test-db/test-table/0003.json', '{"b":"bravo","id":3}');
      fs.writeFileSync('test-db/test-table/0009.json', '{"c":"charlie","id":9}');
    }
    xit("can write to and read from an already-existing table (folder)", function () {
      createFakeTableWithData();
      var table = new Table('test-db/test-table');
      var resultBefore = [table.read(2), table.read(3), table.read(9)];
      expect(resultBefore).to.eql([
        {a:'alpha',id:2},
        {b:'bravo',id:3},
        {c:'charlie',id:9}
      ]);
      table.insert({d:'delta'});
      var resultAfter = [table.read(2), table.read(3), table.read(9), table.read(10)];
      expect(resultAfter).to.eql([
        {a:'alpha',id:2},
        {b:'bravo',id:3},
        {c:'charlie',id:9},
        {d:'delta',id:10} // auto-incrementer counts up from the previous maximum
      ]);
    });

  });

  describe("enhanced indexing", function () {

    var testTable;
    beforeEach(function () {
      rmrf.sync('test-db/test-table');
      fs.mkdirSync('test-db/test-table');
      fs.writeFileSync('test-db/test-table/0002.json', '{"title":"alpha","id":2}');
      fs.writeFileSync('test-db/test-table/0003.json', '{"title":"bravo","id":3}');
      fs.writeFileSync('test-db/test-table/0009.json', '{"title":"charlie","id":9}');
      fs.writeFileSync('test-db/test-table/0010.json', '{"title":"bravo","id":10}');
      testTable = new Table('test-db/test-table');
    });

    xit("`addIndexTable` persistently creates an index table", function () {
      testTable.addIndexTable('title'); // should trigger a *persistent* change
      // another table instance will be able to load the already-made index table
      var otherTestTableInstance = new Table('test-db/test-table');
      expect(otherTestTableInstance.hasIndexTable('title')).to.equal(true);
      expect(otherTestTableInstance.getIndexTable('title')).to.eql({
        alpha: [ 2 ],
        bravo: [ 3, 10 ],
        charlie: [ 9 ]
      });
    });

    xit("`removeIndexTable` persistently removes an index table", function () {
      testTable.addIndexTable('title');
      testTable.removeIndexTable('title'); // should trigger a *persistent* change
      var otherTestTableInstance = new Table('test-db/test-table');
      expect(otherTestTableInstance.hasIndexTable('title')).to.equal(false);
    });

    xit("`write` also updates any index tables", function () {
      testTable.addIndexTable('title');
      testTable.insert({title: 'delta'});
      var otherTestTableInstance = new Table('test-db/test-table');
      var indexTableData = otherTestTableInstance.getIndexTable('title');
      expect(indexTableData).to.have.property('delta');
      expect(indexTableData.delta).to.eql([ 11 ]);
      testTable.insert({title: 'bravo'});
      indexTableData = otherTestTableInstance.getIndexTable('title');
      expect(indexTableData).to.have.property('bravo')
      expect(indexTableData.bravo).to.eql([3, 10, 12]);
    });

    xit("`drop` also removes a table's index tables", function () {
      testTable.addIndexTable('title');
      testTable.drop();
      var otherTestTableInstance = new Table('test-db/test-table');
      expect(otherTestTableInstance.hasIndexTable('title')).to.equal(false);
    });

  });

  describe("enhanced queries", function () {

    var originals = {}, wouldHaveBeenWritten, wouldHaveBeenErased;
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

    var movieTable, movieQuery;
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
      expect(wouldHaveBeenErased).to.eql({ '7': true, '17': true, '22': true, '32': true });
    });

    xit("`set` alters any rows specified by the query", function () {
      expect(FQL.prototype.set).to.be.a('function');
      chai.spy.on(movieTable, 'write');
      movieQuery.where({rank: 7.5}).set({rank: 'C'});
      expect(movieTable.write).to.have.been.called.exactly(5);
      // wouldHaveBeenWritten is internally set up by specs (see above)
      // it keeps track of what movie ids get written to by Table.prototype.write and also what the written value would have been
      expect(wouldHaveBeenWritten).to.eql({
        '1': { id: 1, name: 'Animal House', year: 1978, rank: 'C' },
        '2': { id: 2, name: 'Apollo 13', year: 1995, rank: 'C' },
        '6': { id: 6, name: 'Few Good Men, A', year: 1992, rank: 'C' },
        '21': { id: 21, name: 'Ocean\'s Eleven', year: 2001, rank: 'C' },
        '23': { id: 23, name: 'Pi', year: 1998, rank: 'C' }
      });
    });

  });

});
