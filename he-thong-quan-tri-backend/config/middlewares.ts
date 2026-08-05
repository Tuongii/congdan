import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
    'strapi::logger',
    'strapi::errors',
    {
        name: 'strapi::security',
        config: {
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    'connect-src': ["'self'", 'https:', 'http:', 'wss:', 'ws:'],
                    'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'https:'],
                    'media-src': ["'self'", 'data:', 'blob:', 'https:'],
                    upgradeInsecureRequests: null,
                },
            },
            frameguard: {
                action: 'deny',
            },
            hsts: {
                maxAge: 31536000, // 1 năm
                includeSubDomains: true,
                preload: true,
            },
            xssFilter: true,
            noSniff: true,
        },
    },
    {
        name: 'strapi::cors',
        config: {
            origin: [
                'http://localhost:3000',
                'http://localhost:3001',
                'https://phongtiepdantructruyen-qk2.top',
                'http://phongtiepdantructruyen-qk2.top',
                'https://www.phongtiepdantructruyen-qk2.top',
                'http://www.phongtiepdantructruyen-qk2.top',
                'https://api.phongtiepdantructruyen-qk2.top',
                'http://api.phongtiepdantructruyen-qk2.top',
            ],
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
            headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
            keepHeaderOnError: true,
        },
    },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
];

export default config;
