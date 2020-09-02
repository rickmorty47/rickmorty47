import {createConnection} from 'typeorm';
import { config } from './config';
import {container} from './helpers/di';
import {logger} from './logger';

export class DataBase {
    public async connect() {
        // FIXME: fix build and remove this
        const migrations = process.env.NODE_ENV === 'production' ?
          ['build/migrations/**/*.js'] : ['src/migrations/**/*.ts'];

        const entities = process.env.NODE_ENV === 'production' ?
          ['build/entities/**/*.js'] : ['src/entities/**/*.ts'];

        const connection = await createConnection({
            name: 'default',
            type: 'postgres',
            host: config.database.host,
            port: config.database.port,
            username: config.database.username,
            password: config.database.password,
            database: config.database.name,
            synchronize: false,
            dropSchema: false,
            migrationsRun: true,
            logging: config.env === 'debug',
            extra: {
                ssl: config.database.ssl,
                idleTimeoutMillis: config.database.connectionTimeout,
                poolSize: config.database.poolSize
            },
            entities,
            migrations,
            cli: {
                entitiesDir: 'src/models',
                migrationsDir: 'src/migrations'
            }
        });

        container.set('connection', connection);

        logger.info('database connected');
    }
}

export function initDatabase(callback: (connection?) => void) {
    const database = new DataBase();
    database.connect();
    const interval = setInterval(() => {
        const connection = container.get('connection')
        if (connection) {
            clearInterval(interval);
            callback(connection);
        }
    }, 100);
}