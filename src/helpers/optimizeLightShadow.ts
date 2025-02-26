import { Light } from 'three';

export function optimizeLightShadow(light: Light, quality: 'high' | 'medium' | 'low'): void {
  if (!light.castShadow) {
    console.warn('The provided light does not cast shadows.');
    return;
  }

  if (!light.shadow) {
    console.warn('The provided light does not have a shadow property.');
    return;
  }

  switch (quality) {
    case 'high':
      light.shadow.mapSize.width = 2048;
      light.shadow.mapSize.height = 2048;
      light.shadow.radius = 10;
      break;
    case 'medium':
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      light.shadow.radius = 5;
      break;
    case 'low':
      light.shadow.mapSize.width = 512;
      light.shadow.mapSize.height = 512;
      light.shadow.radius = 2;
      break;
    default:
      console.warn('Unknown quality level. Please use "high", "medium", or "low".');
  }
}
