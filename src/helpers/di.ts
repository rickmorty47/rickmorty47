import {logger} from '../logger';

class Container {
  private containers= {};

  public get(name: string | {name: string}) {
    if (!name) {
      logger.warn('Container empty name');
      return;
    }

    return this.containers[typeof name === 'string' ? name : name.name];
  }

  public set(name: string | {name: string}, instance: any) {
    this.containers[typeof name === 'string' ? name : name.name] = instance;
  }
}

export const container = new Container();

export function Service<T extends new (...args: any[]) => {}>(Constructor: T) {
  const name = Constructor.name;
  const constructor = class extends Constructor {
    [key: string]: any;

    private __inject: Array<{ propertyKey, name }>;

    constructor(...args: any[]) {
      super(...args);

      if (this.__inject) {
        this.__inject.forEach(item => {
          this[item.propertyKey] = container.get(item.name);
        });
      }
    }
  }

  container.set(name, new constructor());

  return constructor;
}

export function Inject<T extends new (...args: any[]) => {}>(service: T) {
  return function (target: any, propertyKey: string) {
    const typedTarget = target as { __inject: Array<{propertyKey, name}> }

    if (!typedTarget.__inject) {
      typedTarget.__inject = [];
    }

    let name = service && service.name;

    if (name === 'constructor') {
      name = Object.getPrototypeOf(service.prototype).constructor.name;
    }

    typedTarget.__inject.push({propertyKey, name});
  }
}