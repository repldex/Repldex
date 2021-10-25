import regeneratorRuntime from "regenerator-runtime";
import { ObjectId } from 'mongodb';
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
                    return _ctx.abrupt("return", db.collection('users'));
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
function _fetchUser() {
    _fetchUser = _asyncToGenerator(regeneratorRuntime.mark(function _callee(data) {
        var collection, fetchUserQuery;
        return regeneratorRuntime.wrap(function _callee$(_ctx) {
            while(1)switch(_ctx.prev = _ctx.next){
                case 0:
                    _ctx.next = 2;
                    return getCollection();
                case 2:
                    collection = _ctx.sent;
                    fetchUserQuery = Object.fromEntries(Object.keys(data).map(function(k) {
                        return k === 'id' ? [
                            '_id',
                            new ObjectId(data[k])
                        ] : [
                            k,
                            data[k]
                        ];
                    }));
                    _ctx.next = 6;
                    return collection.findOne(fetchUserQuery);
                case 6:
                    return _ctx.abrupt("return", _ctx.sent);
                case 7:
                case "end":
                    return _ctx.stop();
            }
        }, _callee);
    }));
    return _fetchUser.apply(this, arguments);
}
/** Fetch a user by any of their attributes */ export function fetchUser(data) {
    return _fetchUser.apply(this, arguments);
}
function _createUser() {
    _createUser = _asyncToGenerator(regeneratorRuntime.mark(function _callee(data) {
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
    return _createUser.apply(this, arguments);
}
/** Create a Repldex user and return their Repldex user id */ export function createUser(data) {
    return _createUser.apply(this, arguments);
}
