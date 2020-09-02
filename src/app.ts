import * as express from 'express';
import {config} from './config';
import {initConfig} from './telegram-bot.config';
import {initControllers} from './controllers/init';
import {initDatabase} from './database';
import {logger} from './logger';


export class App {
    public app: express.Application;

    constructor() {
        initDatabase(() => {
            initConfig('telegramBotConfig')
            initControllers();

            logger.info(`Listening on ${config.port}`);
        });

    }
}

export const app = new App().app;
