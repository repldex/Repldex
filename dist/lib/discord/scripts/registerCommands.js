import regeneratorRuntime from "regenerator-runtime";
import { commands, GLOBAL_COMMAND_API_URL } from '../api/commands';
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
function _registerCommands() {
    _registerCommands = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var bulkUpdate, json;
        return regeneratorRuntime.wrap(function _callee$(_ctx) {
            while(1)switch(_ctx.prev = _ctx.next){
                case 0:
                    bulkUpdate = commands.map(function(c) {
                        return c.json;
                    });
                    _ctx.next = 3;
                    return fetch(GLOBAL_COMMAND_API_URL, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(bulkUpdate)
                    }).then(function(res) {
                        return res.json();
                    });
                case 3:
                    json = _ctx.sent;
                    console.log(json);
                case 5:
                case "end":
                    return _ctx.stop();
            }
        }, _callee);
    }));
    return _registerCommands.apply(this, arguments);
}
function registerCommands() {
    return _registerCommands.apply(this, arguments);
}
registerCommands();
