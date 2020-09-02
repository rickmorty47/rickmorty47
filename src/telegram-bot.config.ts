import TelegramBot from 'node-telegram-bot-api';
import {config} from './config';
import {container} from './helpers/di';
import {BotService} from './services/bot.service';
import {logger} from './logger';
import {State} from './entities/state.entity';
import {EState} from './types/EState';
import {Command} from './types/commands';
import {getRoute} from './helpers/router';

export type TListenerType = 'text' | 'location' | 'photo' | 'edited_message';
export type TListenerMethod = (bot: TelegramBot, message: TelegramBot.Message) => string | null;
interface TListener {type: TListenerType, method: TListenerMethod}

export class TelegramBotConfig {
  private readonly telegramBot: TelegramBot;

  private listeners: { [path: string]: TListener[] } = {};
  private locationListeners: TListenerMethod[] = [];

  constructor(token?: string, options?: TelegramBot.ConstructorOptions) {
    this.telegramBot = new TelegramBot(
      token || config.telegramBotToken,
      options || {polling: true}
    );

    this.telegramBot.on('location', async (message: any) => {
      return this.onLocation(message);
    });

    this.telegramBot.on('edited_message', message => {
      if (message.location) {
        return this.onLocation(message)
      }
      logger.warn('edited_message without location is not implemented!');
    });

    this.telegramBot.on('photo', async (message: TelegramBot.Message) =>
      this.onMessage('photo', message));

    this.telegramBot.on('text', (message: TelegramBot.Message) =>
      this.onMessage('text', message));

    this.telegramBot.on('callback_query', async (query: TelegramBot.CallbackQuery) => {
      const message = {
        ...query.message,
        from: {
          ...query.message.chat,
          is_bot: false,
        },
        text: query.data
      } as TelegramBot.Message;

      return this.onMessage('text', message);
    });
  }

  public setListener(type: TListenerType, path: string, method: TListenerMethod) {
    if (!this.listeners[path]) {
      this.listeners[path] = [];
    }
    this.listeners[path].push({type, method});
  }

  public setLocationListener(method: TListenerMethod) {
    this.locationListeners.push(method);
  }

  private async onMessage(type: TListenerType, message: TelegramBot.Message) {
    const text = message.text ? message.text.trim() : message.caption ? message.caption.trim() : '';
    let path = getRoute(text);

    logger.debug(`New message from ${message.chat.username}: ${text}`);
    try {

      if (!this.listeners[path]) {
        const state = await State.findOne({telegramUserId: message.from.username});

        if (state && state.state === EState.SetHelpMessageRequest) {
          path = Command.SetHelpMessage;
        } else  if (state && state.state === EState.SetPointMessageRequest) {
          path = Command.SetPointMessage;
        } else {
          return BotService.sendMessageToAdmin(this.telegramBot, `@${message.from.username}, ${message.chat.id}\n${text}`);
        }
      }

      for (const listener of this.listeners[path]) {
        if (listener.type === type) {
          const response = await listener.method(this.telegramBot, message);

          if (response) {
            await this.telegramBot.sendMessage(message.chat.id, response);
          }
        }
      }
    } catch (e) {
      logger.error(e.message);
      logger.debug(e.stack);
    }
  }

  private async onLocation(message: TelegramBot.Message) {
    logger.debug(`Location updated from ${message.chat.username}`);
    try {
      for (const method of this.locationListeners) {
        const response = await method(this.telegramBot, message);

        if (response) {
          await this.telegramBot.sendMessage(message.chat.id, response);
        }
      }
    } catch (e) {
      logger.error(e.message);
      logger.debug(e.stack);
    }
  }
}

export function initConfig(containerName: string, token?: string, options?: TelegramBot.ConstructorOptions) {
  const telegramBot = new TelegramBotConfig(token, options);
  container.set(containerName, telegramBot);
}