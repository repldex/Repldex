import regeneratorRuntime from "regenerator-runtime";
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
var clientSecret = process.env['DISCORD_CLIENT_SECRET'];
if (!clientSecret) throw new Error('DISCORD_CLIENT_SECRET environment variable not set');
export var get = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req) {
    var discordOauthCode, redirectUri, discordOauthTokenData, accessToken;
    return regeneratorRuntime.wrap(function _callee$(_ctx) {
        while(1)switch(_ctx.prev = _ctx.next){
            case 0:
                discordOauthCode = req.query.get('code');
                redirectUri = new URL('/login', "https://".concat(req.host)).toString();
                if (discordOauthCode) {
                    _ctx.next = 4;
                    break;
                }
                return _ctx.abrupt("return", {
                    // redirect to discord login
                    status: 302,
                    headers: {
                        location: "https://discord.com/oauth2/authorize?client_id=".concat(config.discord_client_id, "&redirect_uri=").concat(redirectUri, "&response_type=code&scope=identify")
                    }
                });
            case 4:
                _ctx.next = 6;
                return fetch('https://discord.com/api/oauth2/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        client_id: config.discord_client_id,
                        client_secret: clientSecret,
                        grant_type: 'authorization_code',
                        code: discordOauthCode,
                        redirect_uri: redirectUri
                    }).toString()
                }).then(function(res) {
                    return res.json();
                });
            case 6:
                discordOauthTokenData = _ctx.sent;
                accessToken = discordOauthTokenData.access_token;
            case 8:
            case "end":
                return _ctx.stop();
        }
    }, _callee);
// const discordUserData = await fetch('https://discord.com/api/users/@me', {
// 	headers: {
// 		Authorization: `Bearer ${accessToken}`,
// 	},
// }).then(res => res.json())
// const existingRepldexUser = await fetchUser({
// 	accounts: {
// 		discord: discordUserData.id,
// 	},
// })
// // the user has a repldex account
// if (existingRepldexUser)
// 	const sessionId = await createSession({
// 		use,
// 	})
// console.log(discordOauthTokenData)
}));
