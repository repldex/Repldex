import regeneratorRuntime from "regenerator-runtime";
import { getDatabase } from '.';
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _asyncToGenerator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _getCollection() {
    _getCollection = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var db;
        return regeneratorRuntime.wrap(function _callee$(_ctx) {
            while(1)switch(_ctx.prev = _ctx.next){
                case 0:
                    _ctx.next = 2;
                    return getDatabase();
                case 2:
                    db = _ctx.sent;
                    return _ctx.abrupt("return", db.collection('entries'));
                case 4:
                case "end":
                    return _ctx.stop();
            }
        }, _callee);
    }));
    return _getCollection.apply(this, arguments);
}
function getCollection() {
    return _getCollection.apply(this, arguments);
}
var dummyEntries = [
    {
        title: 'foobar',
        slug: 'foobar',
        content: 'The terms foobar (/ˈfuːbɑːr/), foo, bar, baz, and others are used as metasyntactic variables and placeholder names in computer programming or computer-related documentation. They have been used to name entities such as variables, functions, and commands whose exact identity is unimportant and serve only to demonstrate a concept.'
    },
    {
        title: 'Lorem ipsum',
        slug: 'lorem-ipsum',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras arcu ipsum, rhoncus a augue a, auctor euismod odio. Etiam sit amet vulputate libero. Maecenas eu nulla nibh. Quisque at urna rhoncus, dignissim risus vel, congue nisl. Fusce non maximus lacus. Nunc aliquam nulla a tempor vestibulum. Maecenas laoreet pharetra diam. Donec sit amet lorem a sapien luctus suscipit. Nunc convallis scelerisque massa eu sollicitudin. Phasellus convallis tempus metus, at tempor ligula faucibus sit amet. Nam ut lectus et elit aliquet fermentum. Nullam vehicula mi in dui fermentum, sed cursus sem sollicitudin. Nam sagittis malesuada augue, et finibus est auctor eget.'
    }, 
];
function _fetchEntries() {
    _fetchEntries = _asyncToGenerator(regeneratorRuntime.mark(function _callee(options) {
        return regeneratorRuntime.wrap(function _callee$(_ctx) {
            while(1)switch(_ctx.prev = _ctx.next){
                case 0:
                    return _ctx.abrupt("return", dummyEntries);
                case 1:
                case "end":
                    return _ctx.stop();
            }
        }, _callee);
    }));
    return _fetchEntries.apply(this, arguments);
}
/**
 * Fetch a number of entries
 */ export function fetchEntries(options) {
    return _fetchEntries.apply(this, arguments);
}
function _fetchEntry() {
    _fetchEntry = _asyncToGenerator(regeneratorRuntime.mark(function _callee(slug) {
        return regeneratorRuntime.wrap(function _callee$(_ctx) {
            while(1)switch(_ctx.prev = _ctx.next){
                case 0:
                    return _ctx.abrupt("return", dummyEntries.find(function(e) {
                        return e.slug === slug;
                    }));
                case 1:
                case "end":
                    return _ctx.stop();
            }
        }, _callee);
    }));
    return _fetchEntry.apply(this, arguments);
}
/**
 * Fetch an entry by its slug
 */ export function fetchEntry(slug) {
    return _fetchEntry.apply(this, arguments);
}
function _searchEntries() {
    _searchEntries = _asyncToGenerator(regeneratorRuntime.mark(function _callee(query) {
        return regeneratorRuntime.wrap(function _callee$(_ctx) {
            while(1)switch(_ctx.prev = _ctx.next){
                case 0:
                    return _ctx.abrupt("return", dummyEntries.filter(function(e) {
                        return e.title.includes(query);
                    }).sort(function(a, b) {
                        return a.title.length - b.title.length;
                    }));
                case 1:
                case "end":
                    return _ctx.stop();
            }
        }, _callee);
    }));
    return _searchEntries.apply(this, arguments);
}
/**
 * Search for a list of entries by name and content, sorted by relevance
 */ export function searchEntries(query) {
    return _searchEntries.apply(this, arguments);
}
