import {Message, TelegramController} from '../helpers/telegram-message.decorator';
import TelegramBot from 'node-telegram-bot-api';
import {Inject} from '../helpers/di';
import {Command} from '../types/commands';
import {Metadata, TMetadata} from '../helpers/metadata.decorator';
import {PointService} from '../services/point.service';
import {EMapPointType} from '../types/EMapPointType';
import {EState} from '../types/EState';

@TelegramController
export class PointController {

  @Inject(PointService)
  private readonly pointService: PointService;

  @Message(Command.GetAid)
  @Metadata()
  public getAid(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    if (!metadata.state || metadata.state.state !== EState.AskGetPointMenuRequest) {
      return 'Вы указали неверную команду, попробуйте воспользоваться меню';
    }
    return this.pointService.getPoint(bot, message, metadata, EMapPointType.AID)
  }

  @Message(Command.SetAid)
  @Metadata()
  public setAid(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    if (!metadata.state || metadata.state.state !== EState.AskSetPointMenuRequest) {
      return 'Вы указали неверную команду, попробуйте воспользоваться меню';
    }
    return this.pointService.setPoint(bot, message, metadata, EMapPointType.AID)
  }

  @Message(Command.GetTransport)
  @Metadata()
  public getTransport(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    if (!metadata.state || metadata.state.state !== EState.AskGetPointMenuRequest) {
      return 'Вы указали неверную команду, попробуйте воспользоваться меню';
    }
    return this.pointService.getPoint(bot, message, metadata, EMapPointType.TRANSPORT)
  }

  @Message(Command.SetTransport)
  @Metadata()
  public setTransport(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    if (!metadata.state || metadata.state.state !== EState.AskSetPointMenuRequest) {
      return 'Вы указали неверную команду, попробуйте воспользоваться меню';
    }
    return this.pointService.setPoint(bot, message, metadata, EMapPointType.TRANSPORT)
  }

  @Message(Command.GetShelter)
  @Metadata()
  public getShelter(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    if (!metadata.state || metadata.state.state !== EState.AskGetPointMenuRequest) {
      return 'Вы указали неверную команду, попробуйте воспользоваться меню';
    }
    return this.pointService.getPoint(bot, message, metadata, EMapPointType.ENTRANCE)
  }

  @Message(Command.SetShelter)
  @Metadata()
  public setShelter(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    if (!metadata.state || metadata.state.state !== EState.AskSetPointMenuRequest) {
      return 'Вы указали неверную команду, попробуйте воспользоваться меню';
    }
    return this.pointService.setPoint(bot, message, metadata, EMapPointType.ENTRANCE)
  }

  @Message(Command.SetPointMessage)
  @Metadata()
  public setPointMessage(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    return this.pointService.setPointMessage(bot, message, metadata);
  }
}

