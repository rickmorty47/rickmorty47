import convict = require('convict');
import * as dotenv from 'dotenv';

dotenv.config();

const values = convict({
    env: {
        doc: 'The application environment.',
        format: ['production', 'development', 'test'],
        default: 'development',
        env: 'NODE_ENV',
        arg: 'node-env'
    },
    host: {
        default: 'localhost',
        env: 'APP_HOST',
        doc: 'Application host',
        format: String
    },
    port: {
        default: 3000,
        env: 'APP_PORT',
        doc: 'Application port',
        format: Number
    },
    logLevel: {
        default: 'debug',
        env: 'LOG_LEVEL',
        doc: 'Log level',
        format: String
    },
    telegramBotToken: {
        default: '',
        env: 'TELEGRAM_BOT_TOKEN',
        doc: 'Telegram bot token',
        format: String
    },
    googleApiKey: {
        default: '',
        env: 'GOOGLE_API_KEY',
        doc: 'GOOGLE_API_KEY',
        format: String
    },
    minSendDistance: {
        default: 2000,
        env: 'MIN_SEND_DISTANCE',
        format: Number
    },
    maxSendDistance: {
        default: 5000,
        env: 'MAX_SEND_DISTANCE',
        format: Number
    },
    minSearchPointsDistance: {
        default: 15000,
        env: 'MIN_SEARCH_POINTS_DISTANCE',
        format: Number
    },
    maxSearchPointsDistance: {
        default: 50000,
        env: 'MAX_SEARCH_POINTS_DISTANCE',
        format: Number
    },
    telegramAdminLogin: {
        default: '',
        env: 'TELEGRAM_ADMIN_LOGIN',
        format: String
    },
    helpRequestTime: {
        default: 60000,
        env: 'HELP_REQUEST_TIME',
        format: Number
    },
    database: {
        host: {
            default: 'localhost',
            env: 'DB_HOST',
            doc: 'Database host',
            format: String
        },
        port: {
            default: 5432,
            env: 'DB_PORT',
            doc: 'Database port',
            format: Number
        },
        username: {
            default: 'test',
            env: 'DB_USER',
            doc: 'Database username',
            format: String
        },
        password: {
            default: 'test',
            env: 'DB_PASSWORD',
            doc: 'Database password',
            format: String
        },
        name: {
            default: 'test',
            env: 'DB_NAME',
            doc: 'Database name',
            format: String
        },
        ssl: {
            default: 'false',
            env: 'DB_SSL',
            doc: 'Is SSL connection',
            format: Boolean
        },
        connectionTimeout: {
            default: 1200000,
            env: 'DB_TIMEOUT',
            doc: 'idleTimeoutMillis',
            format: Number
        },
        poolSize: {
            default: 50,
            env: 'DB_POOLSIZE',
            doc: 'Connection pool size',
            format: Number
        }
    },
});

values.validate({ allowed: 'strict' });

export const config = values.getProperties();
