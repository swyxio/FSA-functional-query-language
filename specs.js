'use strict';

var chai = require('chai');
chai.use(require('chai-spies'));
var expect = require('chai').expect;

var Table = require('./source/table');
var FQL = require('./source/fql');
var Plan = require('./source/plan');

describe("The FQL runtime", function () {

  describe("bedrock", function () {

    xit("`Table.toFilename` converts an ID to a four-digit zero-padded filename", function () {
      expect(Table.toFilename(3895)).to.equal('3895.json');
      expect(Table.toFilename(216)).to.equal('0216.json');
      expect(Table.toFilename(42)).to.equal('0042.json');
      expect(Table.toFilename(7)).to.equal('0007.json');
    });

    xit("`Table.toId` converts an filename to an ID (number)", function () {
      expect(Table.toId('4444.json')).to.equal(4444);
      expect(Table.toId('0333.json')).to.equal(333);
      expect(Table.toId('0022.json')).to.equal(22);
      expect(Table.toId('0001.json')).to.equal(1);
    });

    // HINT: check out `JSON.parse` (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
    xit("`Table` instances (tables) can read from a folder, given an ID", function () {
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
    xit("tables can scan across all rows using `each`", function () {
      var movieTable = new Table('film-database/movies-table');
      chai.spy.on(movieTable, 'read');
      var count = 0;
      var fightClub = null;
      movieTable.each(function (row) {
        count++;
        if (row.name === 'Fight Club') {
          fightClub = row;
        }
      });
      expect(movieTable.read).to.have.been.called.exactly(36);
      expect(count).to.equal(36);
      expect(fightClub).to.eql({
        id: 7,
        name: 'Fight Club',
        year: 1999,
        rank: 8.5
      });
    });

    xit("`FQL` instances (queries) can retrieve all rows from their table", function () {
      var movieTable = new Table('film-database/movies-table');
      var movieQuery = new FQL(movieTable);
      chai.spy.on(movieTable, 'each');
      var result = movieQuery.exec();
      expect(movieTable.each).to.have.been.called.exactly(1);
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
      var movieTable = new Table('film-database/movies-table');
      var movieQuery = new FQL(movieTable);
      var result = movieQuery.count();
      expect(result).to.equal(36);
    });

    xit("queries have a plan", function () {
      var movieTable = new Table('film-database/movies-table');
      var movieQuery = new FQL(movieTable);
      expect(movieQuery).to.have.property('plan');
      expect(movieQuery.plan).to.be.instanceOf(Plan);
    });

  });

  describe('#limit', function () {

    var movieTable, movieQuery;
    beforeEach(function () {
      movieTable = new Table('film-database/movies-table');
      movieQuery = new FQL(movieTable);
    });

    xit("`.each` allows for stopping early by accepting a continue predicate", function () {
      var count = 0;
      movieTable.each(
        // iterator
        function (row) {
          count++;
        },
        // continue condition, returns boolean
        function () {
          return count < 10;
        }
      );
      expect(count).to.equal(10);
    });

    xit("queries can limit the result set", function () {
      var limitQuery = movieQuery.limit(4);
      expect(limitQuery).to.be.instanceOf(FQL);
      var count = limitQuery.count();
      expect(count).to.equal(4);
      var result = limitQuery.exec();
      expect(result).to.eql([
        { id: 0, name: 'Aliens', year: 1986, rank: 8.2 },
        { id: 1, name: 'Animal House', year: 1978, rank: 7.5 },
        { id: 2, name: 'Apollo 13', year: 1995, rank: 7.5 },
        { id: 3, name: 'Batman Begins', year: 2005, rank: null }
      ]);
    });

    xit("`Plan` instances (plans) hold the query's continue conditions", function () {
      expect(movieQuery.plan).to.have.property('continueConditions');
      expect(movieQuery.plan.continueConditions).to.eql([]);
      var limitQuery = movieQuery.limit(4);
      expect(limitQuery.plan.continueConditions).to.have.length(1);
      expect(limitQuery.plan.continueConditions[0]).to.be.instanceOf(Function);
    });

    xit("plans combine their continue conditions in `.shouldContinue`", function () {
      var plan = new Plan();
      var bool = true;
      plan.continueConditions.push(function () {
        return bool;
      });
      expect(plan.shouldContinue()).to.equal(true);
      bool = false;
      expect(plan.shouldContinue()).to.equal(false);
    });

    xit("queries use their plan's `.shouldContinue` when executing", function () {
      var limitQuery = movieQuery.limit(10);
      chai.spy.on(limitQuery.plan, 'shouldContinue');
      limitQuery.exec();
      expect(limitQuery.plan.shouldContinue).to.have.been.called.exactly(11);
    });

  });

  describe("#select", function () {

    var movieTable, movieQuery;
    beforeEach(function () {
      movieTable = new Table('film-database/movies-table');
      movieQuery = new FQL(movieTable);
    });

    xit("queries can select a certain column", function () {
      var result = movieQuery.select('name').exec();
      expect(result).to.eql([
        { name: 'Aliens' },
        { name: 'Animal House' },
        { name: 'Apollo 13' },
        { name: 'Batman Begins' },
        { name: 'Braveheart' },
        { name: 'Fargo' },
        { name: 'Few Good Men, A' },
        { name: 'Fight Club' },
        { name: 'Footloose' },
        { name: 'Garden State' },
        { name: 'Godfather, The' },
        { name: 'Hollow Man' },
        { name: 'JFK' },
        { name: 'Kill Bill: Vol. 1' },
        { name: 'Kill Bill: Vol. 2' },
        { name: 'Little Mermaid, The' },
        { name: 'Lost in Translation' },
        { name: 'Matrix, The' },
        { name: 'Memento' },
        { name: 'Mystic River' },
        { name: 'O Brother, Where Art Thou?' },
        { name: 'Ocean\'s Eleven' },
        { name: 'Office Space' },
        { name: 'Pi' },
        { name: 'Pirates of the Caribbean' },
        { name: 'Planes, Trains & Automobiles' },
        { name: 'Pulp Fiction' },
        { name: 'Reservoir Dogs' },
        { name: 'Shawshank Redemption, The' },
        { name: 'Shrek' },
        { name: 'Snatch.' },
        { name: 'Star Wars' },
        { name: 'Stir of Echoes' },
        { name: 'Titanic' },
        { name: 'UHF' },
        { name: 'Vanilla Sky' }
      ]);
    });

    xit("plans hold the query's row transformers", function () {
      expect(movieQuery.plan).to.have.property('rowTransformers');
      expect(movieQuery.plan.rowTransformers).to.eql([]);
      var selectQuery = movieQuery.select('name');
      expect(selectQuery.plan.rowTransformers).to.have.length(1);
      expect(selectQuery.plan.rowTransformers[0]).to.be.instanceOf(Function);
    });

    xit("plans combine their row transformers in `.transformRow`", function () {
      var plan = new Plan();
      var exampleRow = {
        id: 28,
        name: 'Shawshank Redemption, The',
        year: 1994,
        rank: 9
      };
      // without any row transformers
      expect(plan.transformRow(exampleRow)).to.eql({ id: 28, name: 'Shawshank Redemption, The', year: 1994, rank: 9 });
      // add a row transformer
      plan.rowTransformers.push(function (row) {
        return {
          yearAndRank: [row.year, row.rank]
        }
      });
      expect(plan.transformRow(exampleRow)).to.eql({yearAndRank: [1994, 9]});
      // add another row transformer, which should run on the once-transformed row
      plan.rowTransformers.push(function (row) {
        return {
          strYear: row.yearAndRank[0] + '', strRank: row.yearAndRank[1] + ''
        }
      });
      expect(plan.transformRow(exampleRow)).to.eql({strYear: '1994', strRank: '9'});
    });

    xit("queries use their plan's `.transformRow` when executing", function () {
      var selectQuery = movieQuery.select('year');
      chai.spy.on(selectQuery.plan, 'transformRow');
      selectQuery.exec();
      expect(selectQuery.plan.transformRow).to.have.been.called.exactly(36);
    });

    xit("queries can select multiple columns", function () {
      var resultA = new FQL(movieTable).select('name', 'year').exec();
      expect(resultA).to.have.length(36);
      expect(resultA[0]).to.eql({ name: 'Aliens', year: 1986 });
      resultA.forEach(function (row) {
        expect(row).to.have.property('name');
        expect(row).to.have.property('year');
        expect(row).to.not.have.property('id');
        expect(row).to.not.have.property('rank');
      });
      var resultB = new FQL(movieTable).select('rank', 'id', 'year').exec();
      expect(resultB).to.have.length(36);
      expect(resultB[0]).to.eql({ id: 0, year: 1986, rank: 8.2 });
      resultB.forEach(function (row) {
        expect(row).to.have.property('rank');
        expect(row).to.have.property('id');
        expect(row).to.have.property('year');
        expect(row).to.not.have.property('name');
      });
    });

  });

  describe('#where', function () {

    var movieTable, movieQuery;
    beforeEach(function () {
      movieTable = new Table('film-database/movies-table');
      movieQuery = new FQL(movieTable);
    });

    xit("given criteria, queries can narrow the result set", function () {
      var resultA = new FQL(movieTable).where({name: 'Shrek'}).exec();
      expect(resultA).to.eql([
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1 }
      ]);
      var resultB = new FQL(movieTable).where({year: 1999}).exec();
      expect(resultB).to.eql([
        { id: 7, name: 'Fight Club', year: 1999, rank: 8.5 },
        { id: 17, name: 'Matrix, The', year: 1999, rank: 8.5 },
        { id: 22, name: 'Office Space', year: 1999, rank: 7.6 },
        { id: 32, name: 'Stir of Echoes', year: 1999, rank: 7 }
      ]);
    });

    xit("plans hold the query's row matchers", function () {
      expect(movieQuery.plan).to.have.property('rowMatchers');
      expect(movieQuery.plan.rowMatchers).to.eql([]);
      var whereQuery = movieQuery.where({year: 1999});
      expect(whereQuery.plan.rowMatchers).to.have.length(1);
      expect(whereQuery.plan.rowMatchers[0]).to.be.instanceOf(Function);
    });

    xit("plans combine their row matchers in `.matchRow`", function () {
      var plan = new Plan();
      var exampleRow = {
        id: 28,
        name: 'Shawshank Redemption, The',
        year: 1994,
        rank: 9
      };
      // without any row matcher
      expect(plan.matchRow(exampleRow)).to.eql(true);
      // try a failing row matcher
      plan.rowMatchers.push(function (row) {
        return row.year === 2000;
      });
      expect(plan.matchRow(exampleRow)).to.eql(false);
      // try a different row matcher, passing this time
      plan.rowMatchers.pop()
      plan.rowMatchers.push(function (row) {
        return row.year === 1994;
      });
      expect(plan.matchRow(exampleRow)).to.eql(true);
      // add another row matcher, one that will fail
      plan.rowMatchers.push(function (row) {
        return row.rank < 8;
      });
      expect(plan.matchRow(exampleRow)).to.eql(false);
      // try a different second row matcher, one that will pass
      plan.rowMatchers.pop();
      plan.rowMatchers.push(function (row) {
        return row.rank > 8;
      });
      expect(plan.matchRow(exampleRow)).to.eql(true);
    });

    xit("queries use their plan's `.matchRow` when executing", function () {
      var whereQuery = movieQuery.where({name: 'Shrek'});
      chai.spy.on(whereQuery.plan, 'matchRow');
      whereQuery.exec();
      expect(whereQuery.plan.matchRow).to.have.been.called.exactly(36);
    });

    xit("works with multiple fields", function () {
      var result = movieQuery.where({
        rank: 8.5,
        year: 1999
      }).exec();
      expect(result).to.eql([
        { id: 7, name: 'Fight Club', year: 1999, rank: 8.5 },
        { id: 17, name: 'Matrix, The', year: 1999, rank: 8.5 }
      ]);
    });

    xit("a criterion can match a value OR use a predicate function", function () {
      var result = movieQuery.where({
        name: function (nameValueForARow) {
          return nameValueForARow.toLowerCase().indexOf('e') === -1;
        }
      }).exec();
      // movies without the letter 'e' in their name
      expect(result).to.eql([
        { id: 2, name: 'Apollo 13', year: 1995, rank: 7.5 },
        { id: 5, name: 'Fargo', year: 1996, rank: 8.2 },
        { id: 7, name: 'Fight Club', year: 1999, rank: 8.5 },
        { id: 11, name: 'Hollow Man', year: 2000, rank: 5.3 },
        { id: 12, name: 'JFK', year: 1991, rank: 7.8 },
        { id: 13, name: 'Kill Bill: Vol. 1', year: 2003, rank: 8.4 },
        { id: 14, name: 'Kill Bill: Vol. 2', year: 2004, rank: 8.2 },
        { id: 16, name: 'Lost in Translation', year: 2003, rank: 8 },
        { id: 23, name: 'Pi', year: 1998, rank: 7.5 },
        { id: 26, name: 'Pulp Fiction', year: 1994, rank: 8.7 },
        { id: 30, name: 'Snatch.', year: 2000, rank: 7.9 },
        { id: 31, name: 'Star Wars', year: 1977, rank: 8.8 },
        { id: 33, name: 'Titanic', year: 1997, rank: 6.9 },
        { id: 34, name: 'UHF', year: 1989, rank: 6.6 },
        { id: 35, name: 'Vanilla Sky', year: 2001, rank: 6.9 }
      ]);
    });

    xit("any combination of predicates and values works", function () {
      var result = movieQuery.where({
        rank: 7.5,
        year: function (yearVal) { return yearVal < 2000; }
      }).exec();
      expect(result).to.eql([
        { id: 1, name: 'Animal House', year: 1978, rank: 7.5 },
        { id: 2, name: 'Apollo 13', year: 1995, rank: 7.5 },
        { id: 6, name: 'Few Good Men, A', year: 1992, rank: 7.5 },
        { id: 23, name: 'Pi', year: 1998, rank: 7.5 }
      ]);
    });

  });

  describe("#joining", function () {

    var movieTable, movieQuery, actorTable, actorQuery, roleTable, roleQuery;
    beforeEach(function () {
      movieTable = new Table('film-database/movies-table');
      movieQuery = new FQL(movieTable);
      actorTable = new Table('film-database/actors-table');
      actorQuery = new FQL(actorTable);
      roleTable = new Table('film-database/roles-table');
      roleQuery = new FQL(roleTable);
    });

    // this will be useful for concatenating two rows
    xit("`FQL.merge` merges two objects' key/value pairs", function () {
      var merged = FQL.merge({a:1, b:2}, {a:100, c:3});
      expect(merged).to.eql({a:100, b:2, c:3});
    });

    // make sure `.where` is working properly before attempting the next specs
    xit("queries can inner join other queries given a matching condition for the self and foreign row", function () {
      var result = movieQuery
      .where({
        name: 'Shrek'
      })
      .innerJoin(roleQuery, function (mRow, rRow) {
        return mRow.id === rRow.movie_id;
      })
      .exec();
      expect(result).to.eql([
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 1, movie_id: 29, role: 'Duloc Mascot' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 31, movie_id: 29, role: 'Merry Man' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 90, movie_id: 29, role: 'Bishop' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 97, movie_id: 29, role: 'Merry Man' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 106, movie_id: 29, role: 'Baby Bear' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 182, movie_id: 29, role: 'Pinocchio/Three Pigs' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 202, movie_id: 29, role: 'Monsieur Hood' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 278, movie_id: 29, role: 'Captain of Guards' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 318, movie_id: 29, role: 'Ogre Hunter' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 434, movie_id: 29, role: 'Peter Pan' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 476, movie_id: 29, role: 'Merry Man' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 706, movie_id: 29, role: 'Blind Mouse/Thelonious' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 771, movie_id: 29, role: 'Lord Farquaad of Duloc' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 906, movie_id: 29, role: 'Geppetto/Magic Mirror' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 928, movie_id: 29, role: 'Donkey' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 935, movie_id: 29, role: 'Shrek/Blind Mouse/Narrator' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 1013, movie_id: 29, role: 'Ogre Hunter' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 1086, movie_id: 29, role: 'Merry Man' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 1221, movie_id: 29, role: 'Blind Mouse' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 1345, movie_id: 29, role: 'Gingerbread Man' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 1348, movie_id: 29, role: 'Merry Man' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 1482, movie_id: 29, role: 'Wrestling Fan' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 1561, movie_id: 29, role: 'Princess Fiona' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 1598, movie_id: 29, role: 'Old Woman' },
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1, actor_id: 1602, movie_id: 29, role: 'Additional Voices' }
      ]);
    });

    xit("plans hold the query's result transformers", function () {
      expect(movieQuery.plan).to.have.property('resultTransformers');
      expect(movieQuery.plan.resultTransformers).to.eql([]);
      var joinQuery = movieQuery
      .where({
        name: 'Shrek'
      })
      .innerJoin(roleQuery, function (mRow, rRow) {
        return mRow.id === rRow.movie_id;
      });
      expect(joinQuery.plan.resultTransformers).to.have.length(1);
      expect(joinQuery.plan.resultTransformers[0]).to.be.instanceOf(Function);
    });

    xit("plans combine their result transformers in `.transformResult`", function () {
      var plan = new Plan();
      var exampleResult = [
        { id: 28, name: 'Shawshank Redemption, The', year: 1994, rank: 9 },
        { id: 12, name: 'JFK', year: 1991, rank: 7.8 }
      ];
      // without any result transformers
      expect(plan.transformResult(exampleResult)).to.eql([
        { id: 28, name: 'Shawshank Redemption, The', year: 1994, rank: 9 },
        { id: 12, name: 'JFK', year: 1991, rank: 7.8 }
      ]);
      // add a result transformer
      plan.resultTransformers.push(function (result) {
        return result.length;
      });
      expect(plan.transformResult(exampleResult)).to.eql(2);
    });

    xit("queries use their plan's `.transformResult` when executing", function () {
      var joinQuery = movieQuery
      .where({
        name: 'Shrek'
      })
      .innerJoin(roleQuery, function (mRow, rRow) {
        return mRow.id === rRow.movie_id;
      });
      chai.spy.on(joinQuery.plan, 'transformResult');
      joinQuery.exec();
      expect(joinQuery.plan.transformResult).to.have.been.called.exactly(1);
    });

  });

  describe("#indexing", function () {

    var movieTable, movieQuery, actorTable, actorQuery;
    beforeEach(function () {
      movieTable = new Table('film-database/movies-table');
      movieQuery = new FQL(movieTable);
      actorTable = new Table('film-database/actors-table');
      actorQuery = new FQL(actorTable);
    });

    xit("tables can be indexed by a column", function () {
      // `.hasIndexTable`
      expect(movieTable.hasIndexTable('year')).to.equal(false);
      // `.addIndexTable`
      movieTable.addIndexTable('year');
      expect(movieTable.hasIndexTable('year')).to.equal(true);
      // `.getIndexTable`
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

    xit("`.each` accepts an optional ID list, and if so will only read those rows", function () {
      chai.spy.on(movieTable, 'read');
      var names = [];
      movieTable.each(
        // iterator
        function (row) {
          names.push(row.name);
        },
        // continue condition
        null,
        // ID list
        [5, 32]
      );
      expect(names).to.eql([
        'Fargo', 'Stir of Echoes'
      ]);
      expect(movieTable.read).to.have.been.called.exactly(2);
    });

    xit("where queries take advantage of indexed columns to minimize table reads", function () {
      // non-indexed query
      chai.spy.on(movieTable, 'read');
      var nonIndexedResult = new FQL(movieTable)
      .where({year: 1999})
      .exec();
      expect(movieTable.read).to.have.been.called.exactly(36);
      // indexed query
      movieTable.addIndexTable('year');
      chai.spy.on(movieTable, 'read');
      var indexedResult = new FQL(movieTable)
      .where({year: 1999})
      .exec();
      expect(movieTable.read).to.have.been.called.exactly(4);
      // results should still be the same
      expect(nonIndexedResult).to.eql(indexedResult);
    });

    xit("produces results more quickly for sparse finds", function () {
      // non-indexed
      console.time('non-indexed query');
      var nonIndexedResult = new FQL(actorTable).where({last_name: 'Miller'}).exec();
      console.timeEnd('non-indexed query');
      // indexed
      actorTable.addIndexTable('last_name');
      console.time('indexed query');
      var indexedResult = new FQL(actorTable).where({last_name: 'Miller'}).exec();
      console.timeEnd('indexed query');
      // check out the console!
      expect(nonIndexedResult).to.eql(indexedResult);
    });

    xit("plans hold the query's ID getters", function () {
      expect(movieQuery.plan).to.have.property('idGetters');
      expect(movieQuery.plan.idGetters).to.eql([]);
      movieTable.addIndexTable('rank');
      var indexedQuery = movieQuery.where({rank: 7.5});
      expect(indexedQuery.plan.idGetters).to.have.length(1);
      expect(indexedQuery.plan.idGetters[0]).to.be.instanceOf(Function);
    });

    xit("plans combine their ID getters in `.getIds`", function () {
      var plan = new Plan();
      // without any indexed stuff
      expect(plan.getIds()).to.be.falsey;
      // add an ID getter
      plan.idGetters.push(function () {
        return [1, 3, 5, 7];
      });
      expect(plan.getIds()).to.eql([1, 3, 5, 7]);
      // add another ID getter
      plan.idGetters.push(function () {
        return [3, 4, 5];
      });
      // `.getIds` returns the union of the ID getter results
      expect(plan.getIds()).to.eql([3, 5]);
    });

    xit("queries use their plan's `.getIds` when executing", function () {
      movieTable.addIndexTable('year');
      var indexedQuery = movieQuery
      .where({
        year: 2000
      });
      chai.spy.on(indexedQuery.plan, 'getIds');
      indexedQuery.exec();
      expect(indexedQuery.plan.getIds).to.have.been.called.exactly(1);
    });

  });

});
