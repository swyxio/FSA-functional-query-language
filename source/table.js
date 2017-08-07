const fs = require('fs');
const rimraf = require('./rimraf')

function Table (path) {
    this.path = path
    if (!fs.existsSync(path)) {
    // } else {
        fs.mkdirSync(path)
    }
}

Table.prototype.drop = function () {
    rimraf.sync(this.path)
}
Table.prototype.erase = function (x) {
    fs.unlinkSync(this.path + '/' + x + '.json')
}

Table.prototype.write = function (file, obj) {
    fs.writeFileSync(this.path + '/' + file + '.json', JSON.stringify(obj))
}
Table.prototype.update = function (file, obj) {
    var mypath = this.path + '/' + file + '.json'
    var abc = obj
    if (fs.existsSync(mypath)) {
        var x = this.read(file)
        abc = Object.assign({}, x, abc)
    }
    fs.writeFileSync(mypath, JSON.stringify(abc))
}
function pad(a){return(1e5+a+"").slice(-4)}
Table.prototype.insert = function (obj) {
    var files = this.getRowIds()
    var id = files.length < 1 ? 0 : Math.max(...files)
    while (fs.existsSync(this.path + '/' + pad(id) + '.json')) {
        id++
    }
    this.write(pad(id), Object.assign({}, obj, {id : pad(id)}))
}

Table.toFilename = function (x){
    return x + '.json'
}
Table.toId = function (x){
    return x.split('.json')[0]
}
Table.prototype.read = function (x) {
    try {
        const y = fs.readFileSync(this.path + '/' + Table.toFilename(x))
        return JSON.parse(y.toString())
    } catch (err) {}
}
Table.prototype.getRowIds = function () {
    try {
        return fs.readdirSync(this.path).map(y => Table.toId(y))
    } catch (err) {}
}

Table.prototype.hasIndexTable = function () {
    return !!this.indextable
}
Table.prototype.addIndexTable = function (x) {
    this.indextablestring = x
    var ans = {}, ids = this.getRowIds(), data //, data = ids.map(y => this.read(y))
    ids.forEach(y => {
        data = this.read(y)
        if (ans[data[x]])
            ans[data[x]].push(y)
        else
            ans[data[x]] = [y]
    })
    this.indextable = ans
}
Table.prototype.getIndexTable = function (x) {
    return this.indextable
}


module.exports = Table;
