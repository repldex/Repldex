import regeneratorRuntime from "regenerator-runtime";
import { verifyInteraction, handleInteraction } from '$lib/discord/api/interactions';
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
export var post = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req) {
    var _rawBody, isValidRequest, interactionResponse;
    return regeneratorRuntime.wrap(function _callee$(_ctx) {
        while(1)switch(_ctx.prev = _ctx.next){
            case 0:
                ;
                isValidRequest = verifyInteraction(req.headers, (_rawBody = req.rawBody) !== null && _rawBody !== void 0 ? _rawBody : '');
                if (isValidRequest) {
                    _ctx.next = 4;
                    break;
                }
                return _ctx.abrupt("return", {
                    status: 401,
                    body: 'Invalid request'
                });
            case 4:
                _ctx.next = 6;
                return handleInteraction(req.body);
            case 6:
                interactionResponse = _ctx.sent;
                return _ctx.abrupt("return", {
                    body: interactionResponse,
                    status: 200
                });
            case 8:
            case "end":
                return _ctx.stop();
        }
    }, _callee);
}));
