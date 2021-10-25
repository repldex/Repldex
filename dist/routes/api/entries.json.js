import regeneratorRuntime from "regenerator-runtime";
import { fetchEntries } from '$lib/database/entries';
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
export var get = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req) {
    var ref, ref1, entries;
    return regeneratorRuntime.wrap(function _callee$(_ctx) {
        while(1)switch(_ctx.prev = _ctx.next){
            case 0:
                ;
                _ctx.next = 3;
                return fetchEntries({
                    limit: parseInt((ref = req.query.get('limit')) !== null && ref !== void 0 ? ref : '20'),
                    skip: parseInt((ref1 = req.query.get('skip')) !== null && ref1 !== void 0 ? ref1 : '0')
                });
            case 3:
                entries = _ctx.sent;
                return _ctx.abrupt("return", {
                    // we have to do this because sveltekit's types are kinda bad :(
                    body: entries
                });
            case 5:
            case "end":
                return _ctx.stop();
        }
    }, _callee);
}));
