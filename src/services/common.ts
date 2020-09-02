import TelegramBot from 'node-telegram-bot-api';
import {Connection} from 'typeorm';
import {User} from '../entities/user.entity';
import {container} from '../helpers/di';
import {MapPoint} from '../entities/map-point.entity';
import {getRoute} from '../helpers/router';
import {EState} from '../types/EState';
import {State} from '../entities/state.entity';
import {TMetadata} from '../helpers/metadata.decorator';

export function getText(message: TelegramBot.Message, clear?: true) {
  const text = message.text ? message.text.trim() :
    message.caption ? message.caption.trim() : '';

  if (clear) {
    const route = getRoute(text);

    if (!route) {
      return text;
    }

    return text.replace(route, '').replace(route.toLowerCase(), '');
  }

  return text;
}

export function selectNearbyUsers(from: User, radius: number) {
  const connection: Connection = container.get('connection');

  const qb = connection.getRepository(User)
    .createQueryBuilder('u')
    .select('u.id', 'id')
    .addSelect('u.telegram_user_id', 'telegramUserId')
    .addSelect('u.chat_id', 'chatId')
    .addSelect('u.longitude', 'longitude')
    .addSelect('u.latitude', 'latitude')
    .addSelect('u.point_id', 'pointId')
    .addSelect('u.updated_at', 'updatedAt')
    .addSelect('ST_Distance(user_geo,point_geo)', 'distance')
    .innerJoin(subquery =>
      subquery
        .select('id')
        .addSelect('longitude')
        .addSelect('latitude')
        .addSelect(`ST_SetSRID(ST_MakePoint(${from.longitude}, ${from.latitude}), 4326)::geography`, 'user_geo')
        .addSelect(`ST_SetSRID(ST_MakePoint(tmp.longitude,tmp.latitude), 4326)::geography`, 'point_geo')
        .from('public.users', 'tmp')
      ,
      'custom',
      'u.id = custom.id'
    )
    .where(`u.id <> '${from.id}'`)
    .andWhere(`ST_DWithin(
      user_geo,
      point_geo,
      ${radius}
    )`)
    .orderBy('distance', 'ASC');

  return qb.getRawMany();
}

export function selectNearbyPoints(from: User, radius: number) {
  const connection: Connection = container.get('connection');

  const qb = connection.getRepository(MapPoint)
    .createQueryBuilder('mp')
    .select('mp.id', 'id')
    .addSelect('mp.type', 'type')
    .addSelect('mp.longitude', 'longitude')
    .addSelect('mp.latitude', 'latitude')
    .addSelect('mp.note', 'note')
    .addSelect('mp.created_at', 'createdAt')
    .addSelect('ST_Distance(user_geo,point_geo)', 'distance')
    .innerJoin(subquery =>
      subquery
        .select('id')
        .addSelect('longitude')
        .addSelect('latitude')
        .addSelect(`ST_SetSRID(ST_MakePoint(${from.longitude}, ${from.latitude}), 4326)::geography`, 'user_geo')
        .addSelect(`ST_SetSRID(ST_MakePoint(tmp.longitude,tmp.latitude), 4326)::geography`, 'point_geo')
        .from('public.map_points', 'tmp')
      ,
      'custom',
      'mp.id = custom.id'
    )
    .where(`ST_DWithin(
      user_geo,
      point_geo,
      ${radius}
    )`)
    .orderBy('distance', 'ASC');

  return qb.getRawMany();
}

export function changeState(state: EState, metadata: TMetadata, note?: string) {
  const {user, state: currentState} = metadata

  if (currentState) {
    return State.update({id: currentState.id}, {
      telegramUserId: currentState.telegramUserId,
      state,
      note,
      requestId: currentState.requestId,
    })
  } else {
    const newState = State.create({telegramUserId: user.telegramUserId, state, note});
    return State.save(newState);
  }
}
