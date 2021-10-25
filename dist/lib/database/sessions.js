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
                    return _ctx.abrupt("return", db.collection('sessions'));
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
function _fetchSession() {
    _fetchSession = _asyncToGenerator(regeneratorRuntime.mark(function _callee(id) {
        var collection;
        return regeneratorRuntime.wrap(function _callee$(_ctx) {
            while(1)switch(_ctx.prev = _ctx.next){
                case 0:
                    _ctx.next = 2;
                    return getCollection();
                case 2:
                    collection = _ctx.sent;
                    _ctx.next = 5;
                    return collection.findOne({
                        _id: id
                    });
                case 5:
                    return _ctx.abrupt("return", _ctx.sent);
                case 6:
                case "end":
                    return _ctx.stop();
            }
        }, _callee);
    }));
    return _fetchSession.apply(this, arguments);
}
export function fetchSession(id) {
    return _fetchSession.apply(this, arguments);
}
function _createSession() {
    _createSession = _asyncToGenerator(regeneratorRuntime.mark(function _callee(data) {
        var collection, insertedResponse;
        return regeneratorRuntime.wrap(function _callee$(_ctx) {
            while(1)switch(_ctx.prev = _ctx.next){
                case 0:
                    _ctx.next = 2;
                    return getCollection();
                case 2:
                    collection = _ctx.sent;
                    _ctx.next = 5;
                    return collection.insertOne(data);
                case 5:
                    insertedResponse = _ctx.sent;
                    return _ctx.abrupt("return", insertedResponse.insertedId.toString());
                case 7:
                case "end":
                    return _ctx.stop();
            }
        }, _callee);
    }));
    return _createSession.apply(this, arguments);
}
/** Create a user session and return the id of the created session */ export function createSession(data) {
    return _createSession.apply(this, arguments);
}
