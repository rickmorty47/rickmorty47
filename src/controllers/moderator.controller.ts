import {Message, Photo, TelegramController} from '../helpers/telegram-message.decorator';
import TelegramBot from 'node-telegram-bot-api';
import {BotService} from '../services/bot.service';
import {Inject} from '../helpers/di';
import {config} from '../config';
import {Command} from '../types/commands';
import {Moderator} from '../helpers/check-moderator.decorator';

@TelegramController
export class ModeratorController {

  @Inject(BotService)
  private readonly botService: BotService;

  @Photo(Command.NewPost)
  @Message(Command.NewPost)
  @Moderator()
  public async createNewPost(bot: TelegramBot, message: TelegramBot.Message) {
    return this.botService.createNewPost(bot, message);
  }

  @Photo(Command.PrivateMessage)
  @Message(Command.PrivateMessage)
  @Moderator()
  public async privateMessage(bot: TelegramBot, message: TelegramBot.Message) {
    return this.botService.privateMessage(bot, message);
  }

  @Photo(Command.PrivateByChatId)
  @Message(Command.PrivateByChatId)
  @Moderator()
  public async privateByChat(bot: TelegramBot, message: TelegramBot.Message) {
    return this.botService.privateByChatId(bot, message);
  }
}

