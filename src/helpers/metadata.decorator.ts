import TelegramBot from 'node-telegram-bot-api';
import {logger} from '../logger';
import {User} from '../entities/user.entity';
import {State} from '../entities/state.entity';

export interface TMetadata {user: User, state: State}

export function Metadata() {
  return function(
    target: object,
    propertyKey: string,
  ) {
    const typedTarget = target as { __metadataRequired: Array<{propertyKey}> }

    if (!typedTarget.__metadataRequired) {
      typedTarget.__metadataRequired = [];
    }

    typedTarget.__metadataRequired.push({propertyKey});
  };
}

export async function getMetadata(message: TelegramBot.Message) {
  if (!message) {
    logger.warn('Unknown operation. Cannot find message in "getMetadata"');
    return;
  }
  const user = await User.findOne({telegramUserId: message.from.username});

  const state = await State.findOne({telegramUserId: message.from.username});

  return {user, state};
}