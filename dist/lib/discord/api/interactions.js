import regeneratorRuntime from "regenerator-runtime";
import { verifyKey } from 'discord-interactions';
import config from '$lib/config';
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
export var APPLICATIONS_BASE_API_URL = "https://discord.com/api/v9/applications/".concat(config.discord_client_id);
// const clientSecret = process.env['DISCORD_CLIENT_SECRET']
// if (!clientSecret) throw new Error('DISCORD_CLIENT_SECRET environment variable not set')
export function verifyInteraction(headers, rawBody) {
    var signature = headers['x-signature-ed25519'];
    var timestamp = headers['x-signature-timestamp'];
    return verifyKey(rawBody !== null && rawBody !== void 0 ? rawBody : '', signature, timestamp, config.discord_public_key);
}
function _handleInteraction() {
    _handleInteraction = _asyncToGenerator(regeneratorRuntime.mark(function _callee(data) {
        return regeneratorRuntime.wrap(function _callee$(_ctx) {
            while(1)switch(_ctx.prev = _ctx.next){
                case 0:
                    _ctx.t0 = data.type;
                    _ctx.next = _ctx.t0 === 1 ? 3 : 4;
                    break;
                case 3:
                    return _ctx.abrupt("return", {
                        // pong
                        type: 1
                    });
                case 4:
                    throw new Error('Unknown interaction type');
                case 5:
                case "end":
                    return _ctx.stop();
            }
        }, _callee);
    }));
    return _handleInteraction.apply(this, arguments);
}
export function handleInteraction(data) {
    return _handleInteraction.apply(this, arguments);
}
