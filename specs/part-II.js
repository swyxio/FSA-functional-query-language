const chai = require('chai');
chai.use(require('chai-spies'));
const expect = require('chai').expect;

const Table = require('../source/table');
const FQL = require('../source/fql');
const Plan = require('../source/plan');

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

  let movieTable, movieQuery;
  beforeEach(function () {
    movieTable = new Table('film-database/movies-table');
    movieQuery = new FQL(movieTable);
  });

  describe('#limit', function () {

    xit("`Plan` instances (plans) hold a row limit", function () {
      expect(Plan.prototype.setLimit).to.be.a('function');
    });

    xit("`withinLimit` always returns true if no limit has been set", function () {
      expect(Plan.prototype.withinLimit).to.be.a('function');
      const plan = new Plan();
      const randomInteger = Math.floor(Math.random() * 1000);
      const randomlySizedArray = new Array(randomInteger);
      expect(plan.withinLimit(randomlySizedArray)).to.equal(true);
    });

    xit("plans can return whether a possible result is `withinLimit`", function () {
      const plan = new Plan();
      plan.setLimit(14);
      expect(plan.withinLimit([])).to.equal(true);
      const arrayOfThirteenThings = new Array(13);
      expect(plan.withinLimit(arrayOfThirteenThings)).to.equal(true);
      const arrayOfFourteenThings = new Array(14);
      expect(plan.withinLimit(arrayOfFourteenThings)).to.equal(false);
      const arrayOfABunchOfThings = new Array(76213);
      expect(plan.withinLimit(arrayOfABunchOfThings)).to.equal(false);
    });

    xit("`limit` returns a query and does not cause the query to execute, only `get` does that", function () {
      expect(FQL.prototype.limit).to.be.a('function');
      chai.spy.on(movieTable, 'read');
      chai.spy.on(movieTable, 'getRowIds');
      const limitQuery = movieQuery.limit(4);
      expect(limitQuery).to.be.instanceOf(FQL);
      expect(movieTable.read).not.to.have.been.called();
      expect(movieTable.getRowIds).not.to.have.been.called();
    });

    // note: each query will need a corresponding `Plan` instance for this to work
    xit("queries can limit the result set", function () {
      const limitQuery = movieQuery.limit(4);
      chai.spy.on(Plan.prototype, 'withinLimit');
      const result = limitQuery.get();
      expect(Plan.prototype.withinLimit).to.have.been.called();
      expect(result).to.eql([
        { id: '0000', name: 'Aliens', year: 1986, rank: 8.2 },
        { id: '0001', name: 'Animal House', year: 1978, rank: 7.5 },
        { id: '0002', name: 'Apollo 13', year: 1995, rank: 7.5 },
        { id: '0003', name: 'Batman Begins', year: 2005, rank: null }
      ]);
    });

    xit("the query minimizes reads from the table", function () {
      chai.spy.on(movieTable, 'read');
      movieQuery.limit(8).get();
      expect(movieTable.read).to.have.been.called.exactly(8);
    });

    xit("`limit` returns a new query, it does not mutate the existing one", function () {
      // BONUS: functional programming win
      movieQuery.limit(1);
      const resultForOriginal = movieQuery.get();
      // the original `movieQuery` itself remains unlimited
      expect(resultForOriginal).to.have.length(36);
    });

  });

  describe("#select", function () {

    xit("plans hold to-be-selected columns", function () {
      expect(Plan.prototype.setSelected).to.be.a('function');
    });

    xit("`selectColumns` takes a row and returns a row, always with the same columns and values if there are no selected columns", function () {
      expect(Plan.prototype.selectColumns).to.be.a('function');
      const plan = new Plan();
      const inputRow = {type: 'Tomatoe', price: 1000};
      expect(plan.selectColumns(inputRow)).to.eql(inputRow);
    });

    xit("given to-be-selected columns, a plan's `selectColumns` will return a narrowed row", function () {
      const planA = new Plan();
      planA.setSelected(['type']);
      expect(planA.selectColumns({type: 'Tomatoe', price: 1000})).to.eql({type: 'Tomatoe'});
      const planB = new Plan();
      planB.setSelected(['language', 'title']);
      const exampleRow = {title: 'The Road', author: 'Cormac McCarthy', language: 'English', rating: 9.1};
      expect(planB.selectColumns(exampleRow)).to.eql({language: 'English', title: 'The Road'});
    });

    xit("`select` returns a query and does not cause the query to execute, only `get` does that", function () {
      expect(FQL.prototype.select).to.be.a('function');
      chai.spy.on(movieTable, 'read');
      chai.spy.on(movieTable, 'getRowIds');
      const selectQuery = movieQuery.select('*');
      expect(selectQuery).to.be.instanceOf(FQL);
      expect(movieTable.read).not.to.have.been.called();
      expect(movieTable.getRowIds).not.to.have.been.called();
    });

    xit("queries can select all columns", function () {
      const result = movieQuery.select('*').get();
      expect(result).to.have.length(36);
      expect(result[35]).to.eql({ id: '0035', name: 'Vanilla Sky', year: 2001, rank: 6.9 });
    });

    xit("queries can select a certain column", function () {
      const result = movieQuery.select('name').get();
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
      const resultA = new FQL(movieTable).select('name', 'year').get();
      expect(resultA).to.have.length(36);
      expect(resultA[0]).to.eql({ name: 'Aliens', year: 1986 });
      resultA.forEach(function (row) {
        expect(row).to.have.property('name');
        expect(row).to.have.property('year');
        expect(row).to.not.have.property('id');
        expect(row).to.not.have.property('rank');
      });
      const resultB = new FQL(movieTable).select('rank', 'id', 'year').get();
      expect(resultB).to.have.length(36);
      expect(resultB[0]).to.eql({ id: '0000', year: 1986, rank: 8.2 });
      resultB.forEach(function (row) {
        expect(row).to.have.property('rank');
        expect(row).to.have.property('id');
        expect(row).to.have.property('year');
        expect(row).to.not.have.property('name');
      });
    });

    xit("`select` returns a new query, it does not mutate the existing one", function () {
      // BONUS: functional programming win
      const selectQueryA = movieQuery.select('id', 'name');
      const selectQueryB = movieQuery.select('id', 'rank');
      const resultForOriginal = movieQuery.get();
      const resultA = selectQueryA.get();
      const resultB = selectQueryB.get();
      // the original `movieQuery` itself selects all (the default)
      expect(resultForOriginal[0]).to.eql({ id: '0000', name: 'Aliens', year: 1986, rank: 8.2 });
      // the two select queries behave independently and as intended
      expect(resultA[0]).to.eql({ id: '0000', name: 'Aliens' });
      expect(resultB[0]).to.eql({ id: '0000', rank: 8.2 });
    });

  });

  describe('#where', function () {

    xit("plans hold search criteria", function () {
      expect(Plan.prototype.setCriteria).to.be.a('function');
    });

    xit("`matchesRow` accepts a row and always returns true if there are no criteria", function () {
      expect(Plan.prototype.matchesRow).to.be.a('function');
      const plan = new Plan();
      expect(plan.matchesRow({a: 123})).to.equal(true);
      expect(plan.matchesRow({})).to.equal(true);
      expect(plan.matchesRow({x: null, y: null})).to.equal(true);
    });

    xit("for a plan with criteria `matchesRow` returns true only if the given row matches all criteria column values", function () {
      const planA = new Plan();
      planA.setCriteria({color: 'yellow'});
      expect(planA.matchesRow({color: 'yellow'})).to.equal(true);
      expect(planA.matchesRow({color: 'green'})).to.equal(false);
      expect(planA.matchesRow({color: 'purple', otherThing: 'whocares'})).to.equal(false);
      expect(planA.matchesRow({color: 'yellow', otherThing: 'whocares'})).to.equal(true);
      const planB = new Plan();
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
      const whereQuery = movieQuery.where({rank: 7});
      expect(whereQuery).to.be.instanceOf(FQL);
      expect(movieTable.read).not.to.have.been.called();
      expect(movieTable.getRowIds).not.to.have.been.called();
    });

    xit("given criteria, queries can narrow the result set", function () {
      const resultA = new FQL(movieTable).where({name: 'Shrek'}).get();
      expect(resultA).to.eql([
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1 }
      ]);
      const resultB = new FQL(movieTable).where({year: 1999}).get();
      expect(resultB).to.eql([
        { id: '0007', name: 'Fight Club', year: 1999, rank: 8.5 },
        { id: '0017', name: 'Matrix, The', year: 1999, rank: 8.5 },
        { id: '0022', name: 'Office Space', year: 1999, rank: 7.6 },
        { id: '0032', name: 'Stir of Echoes', year: 1999, rank: 7 }
      ]);
    });

    xit("works with multiple fields", function () {
      const result = movieQuery.where({
        rank: 8.5,
        year: 1999
      }).get();
      expect(result).to.eql([
        { id: '0007', name: 'Fight Club', year: 1999, rank: 8.5 },
        { id: '0017', name: 'Matrix, The', year: 1999, rank: 8.5 }
      ]);
    });

    xit("a criterion can match a value OR use a predicate function", function () {
      const result = movieQuery.where({
        name: function (nameValueForARow) {
          return nameValueForARow.toLowerCase().indexOf('e') === -1;
        }
      }).get();
      // movies without the letter 'e' in their name
      expect(result).to.eql([
        { id: '0002', name: 'Apollo 13', year: 1995, rank: 7.5 },
        { id: '0005', name: 'Fargo', year: 1996, rank: 8.2 },
        { id: '0007', name: 'Fight Club', year: 1999, rank: 8.5 },
        { id: '0011', name: 'Hollow Man', year: 2000, rank: 5.3 },
        { id: '0012', name: 'JFK', year: 1991, rank: 7.8 },
        { id: '0013', name: 'Kill Bill: Vol. 1', year: 2003, rank: 8.4 },
        { id: '0014', name: 'Kill Bill: Vol. 2', year: 2004, rank: 8.2 },
        { id: '0016', name: 'Lost in Translation', year: 2003, rank: 8 },
        { id: '0023', name: 'Pi', year: 1998, rank: 7.5 },
        { id: '0026', name: 'Pulp Fiction', year: 1994, rank: 8.7 },
        { id: '0030', name: 'Snatch.', year: 2000, rank: 7.9 },
        { id: '0031', name: 'Star Wars', year: 1977, rank: 8.8 },
        { id: '0033', name: 'Titanic', year: 1997, rank: 6.9 },
        { id: '0034', name: 'UHF', year: 1989, rank: 6.6 },
        { id: '0035', name: 'Vanilla Sky', year: 2001, rank: 6.9 }
      ]);
    });

    xit("any combination of predicates and values works", function () {
      const result = movieQuery.where({
        rank: 7.5,
        year: function (yearVal) { return yearVal < 2000; }
      }).get();
      expect(result).to.eql([
        { id: '0001', name: 'Animal House', year: 1978, rank: 7.5 },
        { id: '0002', name: 'Apollo 13', year: 1995, rank: 7.5 },
        { id: '0006', name: 'Few Good Men, A', year: 1992, rank: 7.5 },
        { id: '0023', name: 'Pi', year: 1998, rank: 7.5 }
      ]);
    });

    xit("`where` returns a new query, it does not mutate the existing one", function () {
      // BONUS: functional programming win
      const whereQueryA = movieQuery.where({name: 'Pi'});
      const whereQueryB = movieQuery.where({rank: 8.5, year: 1999});
      const resultForOriginal = movieQuery.get();
      const resultA = whereQueryA.get();
      const resultB = whereQueryB.get();
      // the original `movieQuery` itself gets all (the default)
      expect(resultForOriginal).to.have.length(36);
      // the two select queries behave independently and as intended
      expect(resultA).to.eql([
        { id: '0023', name: 'Pi', year: 1998, rank: 7.5 }
      ]);
      expect(resultB).to.eql([
        { id: '0007', name: 'Fight Club', year: 1999, rank: 8.5 },
        { id: '0017', name: 'Matrix, The', year: 1999, rank: 8.5 }
      ]);
    });

  });

  /****************************************
  ***************** BONUS *****************
  ****************************************/

  describe("#joining", function () {

    let roleTable, roleQuery;
    beforeEach(function () {
      roleTable = new Table('film-database/roles-table');
      roleQuery = new FQL(roleTable);
    });

    // this will be useful for concatenating two rows
    xit("`FQL.merge` merges two objects' key/value pairs", function () {
      expect(FQL.merge).to.be.a('function');
      const merged = FQL.merge({a: 1, b: 2}, {a: 100, c: 3});
      expect(merged).to.eql({a: 100, b: 2, c: 3});
    });

    // make sure `where` is working properly before attempting the next specs
    xit("queries can inner join other queries given a matching condition for the self and foreign row", function () {
      expect(FQL.prototype.innerJoin).to.be.a('function');
      const result = movieQuery
      .where({
        name: 'Shrek'
      })
      .innerJoin(roleQuery, function (mRow, rRow) {
        return mRow.id === rRow.movie_id;
      })
      .get();
      expect(result).to.eql([
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0001', movie_id: '0029', role: 'Duloc Mascot' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0031', movie_id: '0029', role: 'Merry Man' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0090', movie_id: '0029', role: 'Bishop' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0097', movie_id: '0029', role: 'Merry Man' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0106', movie_id: '0029', role: 'Baby Bear' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0182', movie_id: '0029', role: 'Pinocchio/Three Pigs' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0202', movie_id: '0029', role: 'Monsieur Hood' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0278', movie_id: '0029', role: 'Captain of Guards' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0318', movie_id: '0029', role: 'Ogre Hunter' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0434', movie_id: '0029', role: 'Peter Pan' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0476', movie_id: '0029', role: 'Merry Man' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0706', movie_id: '0029', role: 'Blind Mouse/Thelonious' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0771', movie_id: '0029', role: 'Lord Farquaad of Duloc' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0906', movie_id: '0029', role: 'Geppetto/Magic Mirror' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0928', movie_id: '0029', role: 'Donkey' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '0935', movie_id: '0029', role: 'Shrek/Blind Mouse/Narrator' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '1013', movie_id: '0029', role: 'Ogre Hunter' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '1086', movie_id: '0029', role: 'Merry Man' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '1221', movie_id: '0029', role: 'Blind Mouse' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '1345', movie_id: '0029', role: 'Gingerbread Man' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '1348', movie_id: '0029', role: 'Merry Man' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '1482', movie_id: '0029', role: 'Wrestling Fan' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '1561', movie_id: '0029', role: 'Princess Fiona' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '1598', movie_id: '0029', role: 'Old Woman' },
        { id: '0029', name: 'Shrek', year: 2001, rank: 8.1, actor_id: '1602', movie_id: '0029', role: 'Additional Voices' }
      ]);
    });

  });

});
