## About

The goal here is to build a JavaScript class called FQL that will be a pure JavaScript implementation of a (minimal) SQL-esque database management system and query language.  By working on this exercise, you will get a chance to explore how the inner workings of a database engine can work.

## Getting started

Fork and clone this repo, then `npm install`. Run these tests `npm test`. IMPORTANT: There are three files where you should be writing code: `source/table.js`, `source/plan.js`, and `source/fql.js`.

At the start, all but the first spec is pending, as specified by `xit`. As you work through the specs, change those `xit`s to `it`s. Work on these exercises and continue switching off each exercise with your pairing partner.

## Guidance

The role of `Table` instances is to handle the persistence. In this case that means dealing with the file system, because each table will be a folder where each of its rows is stored in a json file. A `Table` instance also exposes a `.read` method for `FQL` queries to utilize.

The role of `FQL` instances is to build up a multi-faceted query for a particular table and then return an array of the results when executed with `.get`. Essentially a query object contains information about *what to do later*. Only during `.get` will this information be applied to *actually running* the query. It does so by using its table's `.read` and `.getRowIds` methods.

The role of `Plan` instances is to simplify the role of queries. Each query should have a plan that contains all of the infromation the query should "remember" for later (when it executes). The plan is also responsible for abstracting some of what a query needs to do when executed. For example, it has `.withinLimit` method that returns whether or not a possible result is still within the plan's stored limit.