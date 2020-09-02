export function Moderator() {
  return function(
    target: object,
    propertyKey: string,
  ) {
    const typedTarget = target as { __accessRequired: Array<{propertyKey}> }

    if (!typedTarget.__accessRequired) {
      typedTarget.__accessRequired = [];
    }

    typedTarget.__accessRequired.push({propertyKey});
  };
}