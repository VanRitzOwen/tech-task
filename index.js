const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const apiRouter = require('./api/index');

const init = async () => {

    const server = Hapi.server({
        port: 5550,
        host: 'localhost'
    });

    await server.register(Jwt);

    server.auth.strategy('jwt_strategy_v1', 'jwt', {
        keys: 'secret_test_task',
        verify: {
            aud: 'urn:audience:test',
            iss: 'urn:issuer:test',
            sub: false,
            nbf: true,
            exp: true
        },
        validate: (artifacts, request, h) => {
            try{
                return {
                    isValid: true,
                    credentials: { user: artifacts.decoded.payload.user }
                };
            }catch (e) {
                console.log(e);
            }
        }
    });

    server.auth.default('jwt_strategy_v1');

    await server.register({
        plugin: require('hapi-server-session'),
        options: {
            cookie: {
                isSecure: false
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/',
        options: {
            auth: false
        },
        handler: (req, h) => {
            return 'Tech Task';
        }
    });

    await server.register({
            name: "ApiRouter",
            register: apiRouter.register
        }, {
            routes: {
                prefix: '/v1'
            }
        });

    await server.start();
    console.log('Server running on', server.info.uri)
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();