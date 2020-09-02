import {Message, TelegramController, UpdateLocation} from '../helpers/telegram-message.decorator';
import TelegramBot from 'node-telegram-bot-api';
import {Inject} from '../helpers/di';
import {SosService} from '../services/sos.service';
import {Command} from '../types/commands';
import {LocationService} from '../services/location.service';
import {Metadata, TMetadata} from '../helpers/metadata.decorator';

@TelegramController
export class SosController {

  @Inject(SosService)
  private readonly sosService: SosService;

  @Inject(LocationService)
  private readonly locationService: LocationService;

  @Message(Command.FindHelp)
  @Metadata()
  public start(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    return this.sosService.call(bot, message, metadata);
  }

  @UpdateLocation()
  @Metadata()
  public updateLocation(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    return this.locationService.updateUserLocation(bot, message, metadata);
  }

  @Message(Command.SetHelpMessage)
  @Metadata()
  public helpMessage(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    return this.sosService.helpMessage(bot, message, metadata);
  }
}


