function Plan (x) {
    this.limit = x
}

Plan.prototype.setLimit = function (x) {
    this.limit = x
}

Plan.prototype.withinLimit = function (x) {
    if (!this.limit) return true
    return x.length < this.limit
}

Plan.prototype.setSelected = function (x) {
    this.selectedCols = x
}
Plan.prototype.selectColumns = function (x) {
    var ans = {}, sc = this.selectedCols
    if (sc) {
        if (sc[0] == '*') return x
        else Object.values(sc).forEach(y => ans[y] = x[y])
    } else {
        ans = x
    }
    return ans
}
Plan.prototype.setCriteria = function (x) {
    this.criteria = x
}
Plan.prototype.matchesRow = function (row) {
    if (!this.criteria) return true
    var bool = true
    Object.keys(this.criteria).forEach(k => {
        if (typeof this.criteria[k] == 'function') {
            if (!row[k] || !this.criteria[k](row[k])) bool = false
        } else {
            if (!row[k] || row[k] != this.criteria[k]) bool = false
        }
    })
    return bool
}

module.exports = Plan;
