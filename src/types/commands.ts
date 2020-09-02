export enum Command {
  // Команды меню
  Start = '/start',
  Menu = 'Меню',

  CanHelpMenu = 'Предложить помощь',
  FindPointsMenu = 'Найти точки помощи',
  SupportMessage = 'Техподдержка',
  CooperationMessage = 'Сотрудничество',

  // Команды админа
  NewPost = '/new_post',
  PrivateMessage = '/private',
  PrivateByChatId = '/private_by_chat',


  SetAid = 'Предоставлю медпомощь',
  SetTransport = 'Обеспечу транспорт',
  SetShelter = 'Отмечу укрытие',
  SetPolice = 'Милиция',

  // Точки
  GetAid = 'Медпомощь',
  GetTransport = 'Транспорт',
  GetShelter = 'Укрытие',

  // Методы
  FindHelp = 'Запросить помощь',
  Cancel = 'Отмена',

  // Системные методы
  SetHelpMessage = '/help_message',
  SetPointMessage = '/set_point_message'
}
