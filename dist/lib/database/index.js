import regeneratorRuntime from "regenerator-runtime";
import { MongoClient } from 'mongodb';
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
var uri = process.env['MONGODB_URI'];
if (!uri) throw new Error('MONGODB_URI environment variable not set');
var options = {
};
var client1;
export var clientPromise;
if (process.env['NODE_ENV'] === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (hot module replacement).
    if (!global._mongoClientPromise) {
        client1 = new MongoClient(uri, options);
        global._mongoClientPromise = client1.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    client1 = new MongoClient(uri, options);
    clientPromise = client1.connect();
}
function _getDatabase() {
    _getDatabase = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var client;
        return regeneratorRuntime.wrap(function _callee$(_ctx) {
            while(1)switch(_ctx.prev = _ctx.next){
                case 0:
                    _ctx.next = 2;
                    return clientPromise;
                case 2:
                    client = _ctx.sent;
                    return _ctx.abrupt("return", client.db());
                case 4:
                case "end":
                    return _ctx.stop();
            }
        }, _callee);
    }));
    return _getDatabase.apply(this, arguments);
}
export function getDatabase() {
    return _getDatabase.apply(this, arguments);
}
