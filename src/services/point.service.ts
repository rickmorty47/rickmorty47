import TelegramBot from 'node-telegram-bot-api';
import {TMetadata} from '../helpers/metadata.decorator';
import {EState} from '../types/EState';
import {changeState, getText, selectNearbyPoints} from './common';
import {State} from '../entities/state.entity';
import {logger} from '../logger';
import {MapPoint} from '../entities/map-point.entity';
import {EMapPointType} from '../types/EMapPointType';
import {config} from '../config';
import {Service} from '../helpers/di';
import * as _ from 'lodash';
import {Command} from '../types/commands';

const axios = require('axios');

const pointTypesConfig = {
  [EMapPointType.AID]: {
    color: 'red',
    name: 'Медпомощь',
    // labels can only contain 1 letter
    // P.S. it's latin "M", Google Maps don't support russian letters in labels
    label: 'M'
  },
  [EMapPointType.POLICE]: {
    color: 'blue',
    name: 'Полиция',
    label: 'P'
  },
  [EMapPointType.ENTRANCE]: {
    color: 'green',
    name: 'Укрытие',
    label: 'Y'
  },
  [EMapPointType.TRANSPORT]: {
    color: 'brown',
    name: 'Транспорт',
    label: 'T'
  },
  [EMapPointType.USER]: {
    color: 'white',
    name: 'Пользователь',
    label: 'U'
  }
}

const LEGEND = '\n\n' +
  'U - ваше местоположение\n' +
  'М - медпомощь\n' +
  'Т - транспорт\n' +
  'У - укрытие\n' +
  'P - милиция\n';

@Service
export class PointService {
  public async getPoint(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata, type: EMapPointType) {
    const {user, state: currentState} = metadata;

    if (!currentState || currentState.state !== EState.AskGetPointMenuRequest) {
      logger.warn('Get point, state is not AskGetPointMenuRequest');
    }

    if (!user || !user.latitude || !user.longitude) {
      return 'Мы не можем вас найти!\n' +
        'Отправьте вашу геопозицию и повторите команду';
    }

    let searchPointsDistance = config.minSearchPointsDistance;

    let points = await selectNearbyPoints(user, searchPointsDistance);
    let pointsFilteredByType = _.filter(points, point => point.type === type);

    if (
      // if there is no points at all or no points of the required type in min distance
      // then query max distance
      (!points || !points.length) ||
      (!pointsFilteredByType.length && searchPointsDistance)
    ) {
      searchPointsDistance = config.maxSearchPointsDistance;
      points = await selectNearbyPoints(user, searchPointsDistance);
      pointsFilteredByType = _.filter(points, point => point.type === type);
    }

    let path = '';
    // TODO: we can also send distance to the nearest point
    // const distanceToTheNearestPointKm = pointsFilteredByType[0].distance / 1000;
    let text = 'Красная линия - ближайшее место, где находится ' + pointTypesConfig[type].name.toLowerCase();
    if (pointsFilteredByType.length > 0) {
      path = `color:0xff0000bb|
        ${pointsFilteredByType[0].latitude},${pointsFilteredByType[0].longitude}|
        ${user.latitude},${user.longitude}
      `;

      const pointNote = pointsFilteredByType[0].note;
      if (pointNote) {
        text += `\n\n${pointNote}`;
      }

      const filteredPoints = [];
      for (const point of points) {
        filteredPoints.push(point);
        if (point.type === type) {
          break;
        }
      }

      points = filteredPoints;
      if(points.length > 0) {
        const targetPoint = pointsFilteredByType[0];
        const reverseGeocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?language=be&latlng=${targetPoint.latitude},${targetPoint.longitude}&key=${config.googleApiKey}`;
        const response = await axios.get(reverseGeocodingUrl);
        if (response?.data?.results.length > 0 && response.data.results[0].formatted_address !== undefined) {
          // TODO: formatted_address has extra fields which we don't need: country, zip-code
          text += '\n' + 'Адрес: ' + response.data.results[0].formatted_address;
        }
      }
    } else {
      const searchPointsDistanceKm = searchPointsDistance / 1000;
      text = `Не найдено ${pointTypesConfig[type].name} в радиусе ${searchPointsDistanceKm} км`;
    }

    text += LEGEND;

    // add a marker with user location
    points.push({
      type: EMapPointType.USER,
      latitude: user.latitude,
      longitude: user.longitude
    });

    const markers = points.map(
      point => {
        const pointTypeConfig = pointTypesConfig[point.type];
        return `color:${pointTypeConfig.color}%7Clabel:${pointTypeConfig.label}%7C${point.latitude},${point.longitude}`;
      }
    ).join('&markers=');

    const url = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&markers=${markers}&key=${config.googleApiKey}&path=${path}`;

    const map = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    try {
      await bot.sendPhoto(user.chatId, map.data, { caption: text, parse_mode: 'Markdown' })
    } catch(e) {
      logger.error(e);
    }
  }

  public async setPoint(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata, type: EMapPointType) {
    const {user, state: currentState} = metadata;

    if (!currentState || currentState.state !== EState.AskSetPointMenuRequest) {
      logger.warn('Set point, state is not AskSetPointMenuRequest');
    }

    if (!user || !user.latitude || !user.longitude) {
      return 'Мы не можем вас найти!\n' +
        'Отправьте вашу геопозицию и повторите команду';
    }

    await changeState(EState.SetPointMessageRequest, metadata, type);

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
      'Пожалуйста, расскажите подробнее, чем вы можете помочь',
      markup
    );

    return
  }

  public async setPointMessage(bot: TelegramBot, message: TelegramBot.Message, metadata: TMetadata) {
    const {user, state: currentState} = metadata;

    if (!currentState || currentState.state !== EState.SetPointMessageRequest) {
      logger.warn('Set point message, state is not SetPointMessageRequest');
      return;
    }

    if (!user || !user.latitude || !user.longitude) {
      return 'Мы не можем вас найти!\n' +
        'Отправьте вашу геопозицию и повторите команду';
    }

    let text = getText(message, true);
    // TODO: add "creator" field with user id in "map_point" table
    if (message.from.username !== undefined && message.from.username.length > 0) {
      text = `Добавлено: @${message.from.username}\n_${text}_`;
    }
    try {
      const mapPoint = MapPoint.create({
        type: EMapPointType[currentState.note],
        latitude: user.latitude,
        longitude: user.longitude,
        note: text
      })

      if (user.pointId) {
        mapPoint.id = user.pointId;
      }

      await MapPoint.save(mapPoint);

      return 'Готово, теперь другие пользователи увидят отметку на карте и смогут обратиться к вам за помощью!';
    } finally {
      await State.update({telegramUserId: user.telegramUserId}, {
        state: EState.Empty
      });
    }
  }
}
