import {BotController} from './bot.controller';
import {SosController} from './sos.controller';
import {ModeratorController} from './moderator.controller';
import {PointController} from './point.controller';

export function initControllers() {
  new BotController();
  new SosController();
  new ModeratorController();
  new PointController();
}