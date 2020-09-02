import {Inject, Service} from '../helpers/di';
import TelegramBot from 'node-telegram-bot-api';
import {User} from '../entities/user.entity';
import {LocationService} from './location.service';
import {logger} from '../logger';
import {State} from '../entities/state.entity';
import {EState} from '../types/EState';
import {config} from '../config';
import {changeState, getText} from './common';
import {TMetadata} from '../helpers/metadata.decorator';
import {Command} from '../types/commands';

@Service
export class SosService {
  @Inject(LocationService)
  private locationService: LocationService;

  public async call(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    const {user, state: currentState} = metadata;

    if (!currentState || currentState.state !== EState.Empty) {
      logger.warn('call, state is not Empty');
    }

    if (!user || !user.latitude || !user.longitude) {
      return 'Мы не можем вас найти!\n' +
             'Отправьте вашу геопозицию и повторите команду';
    }

    if (currentState && currentState.state === EState.SetHelpMessageRequest) {
      clearTimeout(+currentState.note);
    }

    const timeoutId = setTimeout(this.sendHelpRequest.bind(this), +config.helpRequestTime, bot, user);

    await changeState(EState.SetHelpMessageRequest, metadata, timeoutId.toString());

    const markup = {
      reply_markup: {
        inline_keyboard: [
          [{ text: Command.Cancel, callback_data: Command.Cancel }],
        ]
      },
      parse_mode: 'Markdown'
    } as TelegramBot.SendMessageOptions;

    await bot.sendMessage(
      message.from.id,
      'Уточните, какая помощь требуется.' +
      '\n' +
      '*Запрос автоматически отправится через 1 минуту*',
      markup
    );
  }

  public async helpMessage(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    const {user, state: currentState} = metadata;

    if (!user) {
      logger.error(`Unknown exception! User doesn\`t exist: ${message.from.username}`);
      return;
    }

    if (!currentState) {
      logger.warn('Lost state, ' + user.telegramUserId);
      return; // Не можем продолжать, так как нужен state.note
    }

    if (currentState.state !== EState.SetHelpMessageRequest) {
      logger.warn('helpMessage, state is not SetHelpMessageRequest');
      return;
    }

    clearTimeout(+currentState.note);

    const text = getText(message, true);

    await this.sendHelpRequest(bot, user, text);

    return 'Просьба о помощи отправлена!\nЖдите, подмога близко!';
  }

  public async sendHelpRequest(bot: TelegramBot, from: User, text?: string) {
    const currentState = await State.findOne({telegramUserId: from.telegramUserId});

    if (!currentState) {
      logger.warn('Lost state, ' + from.telegramUserId);
    }

    if (currentState.state !== EState.SetHelpMessageRequest) {
      logger.warn('sendHelpRequest, state is not SetHelpMessageRequest');
      return;
    }

    try {
      const result = await this.locationService.getNearbyUsers(from);

      if (!result.length) {
        logger.warn(`Не удалось никого найти рядом с ${from.telegramUserId}`);
        return;
      }

      text = `Человеку рядом с вами нужна помощь!\n` +
          `На карте отмечено его местоположение.\n\n` +
          `Вы можете написать ему: @${from.telegramUserId}` +
        (text ? '\n\nСообщение: ' + text : '');

      for (const to of result) {
        await this.locationService.sendDirection(bot, to, from, text);
      }
    } finally {
      await changeState(EState.Empty, {user: from, state: currentState});
    }
  }
}
