export const routes: string[] = [];

export function getRoute(text: string) {
  const textParts = text.toLowerCase().split(' ');

  const sortedRoutes = routes.sort().reverse();

  for (const route of sortedRoutes) {
    const routeParts = route.toLowerCase().split(' ');
    if (routeParts.length > textParts.length) {
      continue;
    }


    let found = true;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i] !== textParts[i]) {
        found = false;
        break;
      }
    }

    if (found) {
      return route;
    }
  }
}