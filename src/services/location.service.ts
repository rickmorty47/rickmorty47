import {Inject, Service} from '../helpers/di';
import TelegramBot from 'node-telegram-bot-api';
import {User} from '../entities/user.entity';
import {config} from '../config';
import {logger} from '../logger';
import {selectNearbyUsers} from './common';
import {BotService} from './bot.service';
import {TMetadata} from '../helpers/metadata.decorator';
import {EState} from '../types/EState';

const axios = require('axios');

@Service
export class LocationService {
  @Inject(BotService)
  private botService: BotService;

  public async updateUserLocation(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    const newUser = {
      telegramUserId: message.from.username,
      chatId: message.chat.id,
      latitude: message.location.latitude,
      longitude: message.location.longitude
    } as Partial<User>;

    if (metadata.user) {
      newUser.id = metadata.user.id;
    }

    await User.save(newUser as User);

    if (metadata.state && metadata.state.state === EState.AskGeoRequest) {
      await this.botService.sendKeyboardMenu(bot, message, metadata, 'Ваше местоположение получено.');
      await this.botService.mainMenu(bot, message, metadata);
    }
  }

  public async sendDirection(
    bot: TelegramBot,
    user: User,
    from: { chatId: number, latitude?: number, longitude?: number },
    text: string
  ) {
    const url = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&path=color:0xff0000bb|${from.latitude},${from.longitude}|${user.latitude},${user.longitude}&key=${config.googleApiKey}`;
    const map = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    await bot.sendPhoto(user.chatId, map.data, {caption: text}).catch(e => logger.error(e));
  }

  public async getNearbyUsers(user: User) {
    const minRadiusUsers = await selectNearbyUsers(user, config.minSendDistance);

    if (minRadiusUsers.length) {
      return minRadiusUsers;
    }

    return selectNearbyUsers(user, config.maxSendDistance);
  }
}
