import {Message, TelegramController} from '../helpers/telegram-message.decorator';
import TelegramBot from 'node-telegram-bot-api';
import {BotService} from '../services/bot.service';
import {Inject} from '../helpers/di';
import {Command} from '../types/commands';
import {Metadata, TMetadata} from '../helpers/metadata.decorator';

@TelegramController
export class BotController {

  @Inject(BotService)
  private readonly botService: BotService;

  @Message(Command.Start)
  public start(bot: TelegramBot, message: TelegramBot.Message) {
    return this.botService.start(bot, message);
  }

  // @Message(Command.SetLowRadius)
  // async setLowDistance(bot: TelegramBot, message: TelegramBot.Message) {
  //   await this.botService.setLowDistance(bot, message);
  //
  //   return `Радиус уведомлений уменьшен до ${config.minSendDistance}`;
  // }

  @Message(Command.Menu)
  @Metadata()
  public menu(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    return this.botService.mainMenu(bot, message, metadata);
  }

  @Message(Command.CanHelpMenu)
  @Metadata()
  public canHelpMenu(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    return this.botService.setPointMenu(bot, message, metadata);
  }

  @Message(Command.FindPointsMenu)
  @Metadata()
  public findPointsMenu(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    return this.botService.getPointMenu(bot, message, metadata);
  }

  @Message(Command.Cancel)
  @Metadata()
  public cancel(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    return this.botService.cancel(bot, message, metadata);
  }

  @Message(Command.SupportMessage)
  public async supportMessage(bot: TelegramBot, message: TelegramBot.Message) {
    await bot.sendMessage(
      message.from.id,
      'Для связи с техподдержкой напишите сообщение в следующем формате: «Техподдержка: проблема».' +
      '\n' +
      '*Техподдержка: не отправляется геолокация.*',
      { parse_mode: 'Markdown' }
    );
  }

  @Message(Command.CooperationMessage)
  public async cooperationMessage(bot: TelegramBot, message: TelegramBot.Message) {
    await bot.sendMessage(
      message.from.id,
      'Для предложения сотрудничества напишите сообщение в следующем формате: «Сотрудничество: ваше предложение».' +
      '\n' +
      '*Сотрудничество: давайте сделаем интеграцию.*',
      { parse_mode: 'Markdown' }
    );
  }
}

