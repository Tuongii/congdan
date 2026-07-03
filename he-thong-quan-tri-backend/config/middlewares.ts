import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
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
                'https://om3kr5lpjy.tenten.vn',
                'http://om3kr5lpjy.tenten.vn'
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
