import {Service} from '../helpers/di';
import TelegramBot from 'node-telegram-bot-api';
import {User} from '../entities/user.entity';
import {config} from '../config';
import {logger} from '../logger';
import {changeState, getText} from './common';
import {EState} from '../types/EState';
import {TMetadata} from '../helpers/metadata.decorator';
import {State} from '../entities/state.entity';

@Service
export class BotService {

  public static async sendMessageToAdmin(bot: TelegramBot, message: string) {
    if (config.telegramAdminLogin) {
      const admin = await User.findOne({telegramUserId: config.telegramAdminLogin});

      if (!admin) {
        logger.warn(`Telegram admin ${config.telegramAdminLogin} doesn\`t exist`);
        return;
      }

      await bot.sendMessage(admin.chatId, message).catch();
    }
  }

  public async start(bot: TelegramBot, message: TelegramBot.Message) {
    if (!message?.from?.username) {
      console.log(message);
      return 'Мы не смогли получить ваш логин.\nЕсли это ошибка, напишите, пожалуйста, "Техподдержка" и ваше сообщение';
    }

    const text =
      'Добро пожаловать!\n' +
      '\n' +
      'Для использования бота поделитесь своим местоположением через вложения.\n' +
      '\n' +
      '*Значок скрепки → Геопозиция → Транслировать геопозицию*'

    let user = await User.findOne({telegramUserId: message.from.username});
    let state = null;

    if (!user) {
      user = await User.save(User.create({
        telegramUserId: message.from.username,
        chatId: message.chat.id,
      }));
    } else {
      state = await State.findOne({telegramUserId: message.from.username});
    }

    await changeState(EState.AskGeoRequest, {user, state});

    await bot.sendMessage(message.from.id, text, {parse_mode: 'Markdown'});
  }

  public async mainMenu(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    const text = 'Выберите желаемое действие.';

    const markup = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Запросить помощь', callback_data: 'Запросить помощь'}],
          [{ text: 'Предложить помощь', callback_data: 'Предложить помощь'}],
          [{ text: 'Найти точки помощи', callback_data: 'Найти точки помощи'}],
        ]
      }
    } as TelegramBot.SendMessageOptions;

    await changeState(EState.Empty, metadata);

    await bot.sendMessage(message.from.id, text, markup);
  }

  public async sendKeyboardMenu(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata, text: string) {
    const keyboardMurkup = {
      reply_markup: {
        keyboard: [
          [{
            text: 'Меню',
          }], [{
            text: 'Техподдержка'
          }], [{
            text: 'Сотрудничество'
          }]
        ]
      }
    } as TelegramBot.SendMessageOptions;

    await bot.sendMessage(message.from.id, text, keyboardMurkup);
  }

  public async setPointMenu(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    const text =
      'Выберите, чем вы можете помочь.\n' +
      '*Другие пользователи рядом с вами будут видеть вас на карте.*'

    const markup = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Предоставлю медпомощь', callback_data: 'Предоставлю медпомощь' }],
          [{ text: 'Обеспечу транспорт', callback_data: 'Обеспечу транспорт' }],
          [{ text: 'Отмечу укрытие', callback_data: 'Отмечу укрытие' }],
        ]
      }
    } as TelegramBot.SendMessageOptions;

    await changeState(EState.AskSetPointMenuRequest, metadata);

    await bot.sendMessage(message.from.id, text, markup);
  }

  public async getPointMenu(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    const text = 'Выберите, что вы хотите найти';

    const markup = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Медпомощь', callback_data: 'Медпомощь' }],
          [{ text: 'Транспорт', callback_data: 'Транспорт' }],
          [{ text: 'Укрытие', callback_data: 'Укрытие' }],
        ]
      }
    } as TelegramBot.SendMessageOptions;

    await changeState(EState.AskGetPointMenuRequest, metadata);

    await bot.sendMessage(message.from.id, text, markup);
  }

  public async cancel(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
      const {user, state: currentState} = metadata;

      if (!user) {
        logger.error('Unknown user on "cancel" method!');
        return;
      }

      if (!currentState) {
        logger.error('Empty state on "cancel" method!');
        return;
      }

      let text = 'Отменено';
      if (currentState.state === EState.SetPointMessageRequest) {
        text = 'Создание точки отменено';
      } else if (currentState.state === EState.SetHelpMessageRequest) {
        text = 'Запрос помощи отменен';
      }

      await changeState(EState.Empty, metadata);

      return text;
  }

  public async setLowDistance(bot: TelegramBot, message: TelegramBot.Message) {
    const user = await User.findOne({telegramUserId: message.from.username});
    if (!user || !user.latitude || !user.longitude) {
      return 'Мы не можем вас найти!\n' +
        'Отправьте вашу геопозицию и повторите команду';
    }

    await User.update({telegramUserId: message.from.username}, {allowMaxDistance: false});
  }

  public async createNewPost(bot: TelegramBot, message: TelegramBot.Message) {
    const fileId = message.photo && message.photo[message.photo.length - 1].file_id;
    const text = getText(message, true);
    let skip = 0;
    const take = 30;
    let eof = false;
    while (!eof) {
      const users = await User.find({skip, take});

      if (users.length) {
        await this.blockMailing(bot, fileId, text, users);
      } else {
        eof = true;
      }

      skip += users.length < take ? users.length : take;
    }

    return `Новый пост отправлен. ${skip} получателей`;
  }

  public async privateMessage(bot: TelegramBot, message: TelegramBot.Message) {
    const [login, ...parts] = getText(message, true).trim().split(' ');

    if (!parts || !parts.length) {
      return 'Неверная команда, используйте /private {login} {сообщение}';
    }

    const user = await User.findOne({telegramUserId: login});

    if (!user) {
      return `Пользователь ${login} не найден`;
    }

    await bot.sendMessage(user.chatId, 'Moderator:\n' +parts.join(' ')).catch(e => logger.error(e));
  }

  public async privateByChatId(bot: TelegramBot, message: TelegramBot.Message) {
    const [chatId, ...parts] = getText(message, true).trim().split(' ');

    if (!parts || !parts.length) {
      return 'Неверная команда, используйте /private {login} {сообщение}';
    }

    const user = await User.findOne({chatId: +chatId});

    if (!user) {
      return `Пользователь ${chatId} не найден`;
    }

    await bot.sendMessage(user.chatId, 'Moderator:\n' + parts.join(' ')).catch(e => logger.error(e));
  }

  private async blockMailing(bot: TelegramBot, fileId: string, text: string, users: User[]) {
    if (fileId) {
      for (const user of users) {
        await bot.sendPhoto(user.chatId, fileId, {caption: text}).catch(e => logger.warn(e));
      }
    } else {
      for (const user of users) {
        await bot.sendMessage(user.chatId, text).catch(e => logger.warn(e));
      }
    }
  }
}
