import regeneratorRuntime from "regenerator-runtime";
import cookie from 'cookie';
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
export var handle = _asyncToGenerator(regeneratorRuntime.mark(function _callee(param) {
    var request = param.request, resolve = param.resolve;
    var cookies;
    return regeneratorRuntime.wrap(function _callee$(_ctx) {
        while(1)switch(_ctx.prev = _ctx.next){
            case 0:
                cookies = cookie.parse(request.headers.cookie || '');
                _ctx.next = 3;
                return resolve(request);
            case 3:
                return _ctx.abrupt("return", _ctx.sent);
            case 4:
            case "end":
                return _ctx.stop();
        }
    }, _callee);
}));
export var getSession = function(param) {
    var locals = param.locals;
    return {
        user: locals.user
    };
};
