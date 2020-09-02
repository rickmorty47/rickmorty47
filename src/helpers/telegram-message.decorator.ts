import {TelegramBotConfig, TListenerType} from '../telegram-bot.config';
import {container} from './di';
import TelegramBot from 'node-telegram-bot-api';
import {config} from '../config';
import {logger} from '../logger';
import {getMetadata} from './metadata.decorator';
import {routes} from './router';

interface TMessageTarget {type: TListenerType, propertyKey: string, path: string}

export function Message(path: string) {
  return function(
    target: object,
    propertyKey: string,
  ): void {
    const typedTarget = target as { __onMessage: TMessageTarget[] }

    if (!typedTarget.__onMessage) {
      typedTarget.__onMessage = [];
    }

    typedTarget.__onMessage.push({type: 'text', propertyKey, path});
  };
}

export function Photo(path: string) {
  return function(
    target: object,
    propertyKey: string,
  ): void {
    const typedTarget = target as { __onMessage: TMessageTarget[] }

    if (!typedTarget.__onMessage) {
      typedTarget.__onMessage = [];
    }

    typedTarget.__onMessage.push({type: 'photo', propertyKey, path});
  };
}

export function UpdateLocation() {
  return function(
    target: object,
    propertyKey: string,
  ): void {
    const typedTarget = target as { __onLocation: Array<{propertyKey}> }

    if (!typedTarget.__onLocation) {
      typedTarget.__onLocation = [];
    }

    typedTarget.__onLocation.push({propertyKey});
  };
}

export function TelegramController<T extends new (...args: any[]) => {}>(constructor: T) {
  return class extends constructor {
    [key: string]: any;

    private __onMessage: Array<{type: TListenerType, propertyKey: string, path: string}>
    private __onLocation: Array<{propertyKey: string}>;
    private __inject: Array<{propertyKey, name}>;

    private __accessRequired: Array<{propertyKey}>;
    private __metadataRequired: Array<{propertyKey}>;

    constructor(...args: any[]) {
      super(...args);

      const botConfig = container.get('telegramBotConfig') as TelegramBotConfig;

      if (this.__accessRequired) {
        this.__accessRequired.forEach(item => {
          const method = this[item.propertyKey];
          this[item.propertyKey] = function (bot: TelegramBot, message: TelegramBot.Message) {
            if (message.from.username === config.telegramAdminLogin) {
              return method.bind(this)(bot, message);
            } else {
              logger.warn('Attempted unauthorized operation');
            }
          }
        });
      }

      if (this.__metadataRequired) {
        this.__metadataRequired.forEach(item => {
          const method = this[item.propertyKey];
          this[item.propertyKey] = async function (bot: TelegramBot, message: TelegramBot.Message) {
            const metadata = await getMetadata(message);
            return method.bind(this)(bot, message, metadata);
          }
        });
      }

      if (this.__onMessage) {
        this.__onMessage.forEach(item => {
          routes.push(item.path);
          const method = this[item.propertyKey].bind(this);

          botConfig.setListener(item.type, item.path, method);
        });
      }

      if (this.__onLocation) {
        this.__onLocation.forEach(item => {
          const method = this[item.propertyKey].bind(this);

          botConfig.setLocationListener(method);
        });
      }

      if (this.__inject) {
        this.__inject.forEach(item => {
          this[item.propertyKey] = container.get(item.name);
        })
      }
    }
  };
}
