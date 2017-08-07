const Plan = require('./plan');

function FQL (x) {
    this.table = x
    this.plan = new Plan()
}
FQL.merge = function (a, b) {
    return Object.assign({}, a,b)
}

FQL.prototype.get = function () {
    var ans = []
    var arr = this.table.getRowIds()
    var idxt = this.table.hasIndexTable() && this.table.getIndexTable(this.table.indextablestring)


    if (idxt && this.plan.criteria && Object.keys(this.plan.criteria).includes(this.table.indextablestring)) {
        idxt[this.plan.criteria[this.table.indextablestring]].forEach(x => {
            ans.push(
                    this.plan.selectColumns(
                        this.table.read(x)
                    )
            )
        })
    } else {
        for (var i = 0; i<arr.length; i++){
            if (this.plan.withinLimit(ans)) 
                ans.push(
                    this.plan.selectColumns(
                        this.table.read(arr[i])
                    )
                )
        }
    }

    
    ans = ans.filter(row => this.plan.matchesRow(row))
    if (this.innerJoinQuery) {
        var a = ans // https://stackoverflow.com/a/17500836/1106414
        var b = this.innerJoinQuery.query2.get()
        var m = a.length, n = b.length, c = [];
        for (var i = 0; i < m; i++) {
            for (var j = 0; j < n; j++) { // cartesian product - all combinations
                var y = this.innerJoinQuery.joinOnFn(a[i], b[j]);  // filter out the rows and columns you want
                if (y) c.push(FQL.merge(a[i], b[j]));         // if a row is returned add it to the table
            }
        }
        ans = c
    }
    return ans
}
FQL.prototype.count = function () {
    return this.table.getRowIds().length
}

FQL.prototype.limit = function (x) {
    let newq = new FQL(this.table)
    newq.plan.setLimit(x)
   return newq
}

FQL.prototype.select = function () {
    let newq = new FQL(this.table)
    newq.plan.setSelected(arguments)
    return newq
}

FQL.prototype.where = function(x) {
    let newq = new FQL(this.table)
    newq.plan.setCriteria(x)
    return newq
}

FQL.prototype.innerJoin = function (query2, joinOnFn) {
    let newq = new FQL(this.table)
    newq.innerJoinQuery = { query2, joinOnFn }
    newq.plan = this.plan
    return newq
}

module.exports = FQL;
