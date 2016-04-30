'use strict';

var chai = require('chai');
chai.use(require('chai-spies'));
var expect = require('chai').expect;

var Table = require('../source/table');
var FQL = require('../source/fql');
var Plan = require('../source/plan');

// --------------------------------------------------
//  _______  _______  ______    _______    ___   ___  
// |       ||   _   ||    _ |  |       |  |   | |   | 
// |    _  ||  |_|  ||   | ||  |_     _|  |   | |   | 
// |   |_| ||       ||   |_||_   |   |    |   | |   | 
// |    ___||       ||    __  |  |   |    |   | |   | 
// |   |    |   _   ||   |  | |  |   |    |   | |   | 
// |___|    |__| |__||___|  |_|  |___|    |___| |___| 
//
// --------------------------------------------------

describe("Part II: query me this", function () {

  var movieTable, movieQuery;
  beforeEach(function () {
    movieTable = new Table('film-database/movies-table');
    movieQuery = new FQL(movieTable);
  });

  describe('#limit', function () {

    xit("Plan instances (plans) hold a row limit", function () {
      expect(Plan.prototype.setLimit).to.be.a('function');
    });

    xit("`withinLimit` always returns true if no limit has been set", function () {
      expect(Plan.prototype.withinLimit).to.be.a('function');
      var plan = new Plan();
      var randomInteger = Math.floor(Math.random() * 1000);
      var randomlySizedArray = new Array(randomInteger);
      expect(plan.withinLimit(randomlySizedArray)).to.equal(true);
    });

    xit("a plan can return whether a possible result is `withinLimit`", function () {
      var plan = new Plan();
      plan.setLimit(14);
      expect(plan.withinLimit([])).to.equal(true);
      var arrayOfThirteenThings = new Array(13);
      expect(plan.withinLimit(arrayOfThirteenThings)).to.equal(true);
      var arrayOfFourteenThings = new Array(14);
      expect(plan.withinLimit(arrayOfFourteenThings)).to.equal(false);
      var arrayOfABunchOfThings = new Array(76213);
      expect(plan.withinLimit(arrayOfFourteenThings)).to.equal(false);
    });

    xit("`limit` returns a query and does not cause the query to execute, only `get` does that", function () {
      expect(FQL.prototype.limit).to.be.a('function');
      chai.spy.on(movieTable, 'read');
      chai.spy.on(movieTable, 'getRowIds');
      var limitQuery = movieQuery.limit(4);
      expect(limitQuery).to.be.instanceOf(FQL);
      expect(movieTable.read).not.to.have.been.called();
      expect(movieTable.getRowIds).not.to.have.been.called();
    });

    xit("queries can limit the result set", function () {
      var limitQuery = movieQuery.limit(4);
      chai.spy.on(limitQuery.plan, 'withinLimit');
      var result = limitQuery.get();
      expect(limitQuery.plan.withinLimit).to.have.been.called.exactly(5);
      expect(result).to.eql([
        { id: 0, name: 'Aliens', year: 1986, rank: 8.2 },
        { id: 1, name: 'Animal House', year: 1978, rank: 7.5 },
        { id: 2, name: 'Apollo 13', year: 1995, rank: 7.5 },
        { id: 3, name: 'Batman Begins', year: 2005, rank: null }
      ]);
    });

    xit("the query minimizes reads from the table", function () {
      chai.spy.on(movieTable, 'read');
      movieQuery.limit(8).get();
      expect(movieTable.read).to.have.been.called.exactly(8);
    });

  });

  describe("#select", function () {

    xit("plans hold to-be-selected columns", function () {
      expect(Plan.prototype.setSelected).to.be.a('function');
    });

    xit("`selectColumns` takes a row and returns a row, always with the same columns and values if there are no selected columns", function () {
      expect(Plan.prototype.selectColumns).to.be.a('function');
      var plan = new Plan();
      var inputRow = {type: 'Tomatoe', price: 1000};
      expect(plan.selectColumns(inputRow)).to.eql(inputRow);
    });

    xit("given to-be-selected columns, a plan's `selectColumns` will return a narrowed row", function () {
      var planA = new Plan();
      planA.setSelected(['type']);
      expect(planA.selectColumns({type: 'Tomatoe', price: 1000})).to.eql({type: 'Tomatoe'});
      var planB = new Plan();
      planB.setSelected(['language', 'title']);
      var exampleRow = {title: 'The Road', author: 'Cormac McCarthy', language: 'English', rating: 9.1};
      expect(planB.selectColumns(exampleRow)).to.eql({language: 'English', title: 'The Road'});
    });

    xit("`select` returns a query and does not cause the query to execute, only `get` does that", function () {
      expect(FQL.prototype.select).to.be.a('function');
      chai.spy.on(movieTable, 'read');
      chai.spy.on(movieTable, 'getRowIds');
      var selectQuery = movieQuery.select('*');
      expect(selectQuery).to.be.instanceOf(FQL);
      expect(movieTable.read).not.to.have.been.called();
      expect(movieTable.getRowIds).not.to.have.been.called();
    });

    xit("queries can select all columns", function () {
      var result = movieQuery.select('*').get();
      expect(result).to.have.length(36);
      expect(result[35]).to.eql({ id: 35, name: 'Vanilla Sky', year: 2001, rank: 6.9 });
    });

    xit("queries can select a certain column", function () {
      var result = movieQuery.select('name').get();
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

    xit("queries can select multiple columns", function () {
      var resultA = new FQL(movieTable).select('name', 'year').get();
      expect(resultA).to.have.length(36);
      expect(resultA[0]).to.eql({ name: 'Aliens', year: 1986 });
      resultA.forEach(function (row) {
        expect(row).to.have.property('name');
        expect(row).to.have.property('year');
        expect(row).to.not.have.property('id');
        expect(row).to.not.have.property('rank');
      });
      var resultB = new FQL(movieTable).select('rank', 'id', 'year').get();
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

    xit("plans hold search criteria", function () {
      expect(Plan.prototype.setCriteria).to.be.a('function');
    });

    xit("`matchesRow` accepts a row and always returns true if there are no criteria", function () {
      expect(Plan.prototype.matchesRow).to.be.a('function');
      var plan = new Plan();
      expect(plan.matchesRow({a: 123})).to.equal(true);
      expect(plan.matchesRow({})).to.equal(true);
      expect(plan.matchesRow({x: null, y: null})).to.equal(true);
    });

    xit("for a plan with criteria `matchesRow` returns true only if the given row matches all criteria column values", function () {
      var planA = new Plan();
      planA.setCriteria({color: 'yellow'});
      expect(planA.matchesRow({color: 'yellow'})).to.equal(true);
      expect(planA.matchesRow({color: 'green'})).to.equal(false);
      expect(planA.matchesRow({color: 'purple', otherThing: 'whocares'})).to.equal(false);
      expect(planA.matchesRow({color: 'yellow', otherThing: 'whocares'})).to.equal(true);
      var planB = new Plan();
      planB.setCriteria({style: 'Jazz', year: 1915});
      expect(planB.matchesRow({style: 'Jazz', year: 1915})).to.equal(true);
      expect(planB.matchesRow({style: 'Ragtime', year: 1899, title: 'Maple Leaf Rag'})).to.equal(false);
      expect(planB.matchesRow({style: 'Jazz', year: 1899})).to.equal(false);
      expect(planB.matchesRow({style: 'Ragtime', year: 1915})).to.equal(false);
      expect(planB.matchesRow({title: 'Jelly Roll Blues', style: 'Jazz', year: 1915})).to.equal(true);
    });

    xit("`where` returns a query and does not cause the query to execute, only `get` does that", function () {
      expect(FQL.prototype.where).to.be.a('function');
      chai.spy.on(movieTable, 'read');
      chai.spy.on(movieTable, 'getRowIds');
      var whereQuery = movieQuery.where({rank: 7});
      expect(whereQuery).to.be.instanceOf(FQL);
      expect(movieTable.read).not.to.have.been.called();
      expect(movieTable.getRowIds).not.to.have.been.called();
    });

    xit("given criteria, queries can narrow the result set", function () {
      var resultA = new FQL(movieTable).where({name: 'Shrek'}).get();
      expect(resultA).to.eql([
        { id: 29, name: 'Shrek', year: 2001, rank: 8.1 }
      ]);
      var resultB = new FQL(movieTable).where({year: 1999}).get();
      expect(resultB).to.eql([
        { id: 7, name: 'Fight Club', year: 1999, rank: 8.5 },
        { id: 17, name: 'Matrix, The', year: 1999, rank: 8.5 },
        { id: 22, name: 'Office Space', year: 1999, rank: 7.6 },
        { id: 32, name: 'Stir of Echoes', year: 1999, rank: 7 }
      ]);
    });

    xit("works with multiple fields", function () {
      var result = movieQuery.where({
        rank: 8.5,
        year: 1999
      }).get();
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
      }).get();
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
      }).get();
      expect(result).to.eql([
        { id: 1, name: 'Animal House', year: 1978, rank: 7.5 },
        { id: 2, name: 'Apollo 13', year: 1995, rank: 7.5 },
        { id: 6, name: 'Few Good Men, A', year: 1992, rank: 7.5 },
        { id: 23, name: 'Pi', year: 1998, rank: 7.5 }
      ]);
    });

  });

});
