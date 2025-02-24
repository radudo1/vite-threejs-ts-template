import { Clock, Object3D, Vector3 } from 'three';

function rotate(object: Object3D, clock: Clock, radiansPerSecond: number = Math.PI * 2, delay: number = 0) {
  const elapsedTime = clock.getElapsedTime() + delay;
  const initialPosition = object.userData.initialPosition as Vector3;
  object.rotation.x = Math.cos(elapsedTime * radiansPerSecond);
  object.rotation.y = Math.cos(elapsedTime * radiansPerSecond);
  object.position.x = initialPosition.x;
  object.position.z = initialPosition.z;
  object.position.y = Math.sin(delay) * Math.cos(delay * 2) * Math.sin(delay * 4) * 0.01;
}

function bounce(
  object: Object3D,
  clock: Clock,
  amplitude: number,
  frequency: number,
  phase: number,
  delay: number = 0
) {
  const elapsedTime = clock.getElapsedTime();
  const initialPosition = object.userData.initialPosition as Vector3;
  object.position.y = initialPosition.y + Math.sin(elapsedTime * frequency + phase + delay) * amplitude;
}

export { rotate, bounce };
