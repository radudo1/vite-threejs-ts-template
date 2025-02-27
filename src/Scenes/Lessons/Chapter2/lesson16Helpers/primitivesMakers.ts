import { BoxGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three';

const createBush = (scale: number, position: { x: number; y: number; z: number }): Mesh => {
  const bushGeometry = new SphereGeometry(1, 16, 16);
  const bushMaterial = new MeshStandardMaterial({ color: 'green' });
  const bush = new Mesh(bushGeometry, bushMaterial);
  bush.scale.set(scale, scale, scale);
  bush.position.set(position.x, position.y, position.z);
  return bush;
};

const createGraves = (count: number, graveGeometry: BoxGeometry, graveMaterial: MeshStandardMaterial): Group => {
  const graves = new Group();

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    //3 Is the radius of the house
    const radius = 3 + Math.random() * 4;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    const grave = new Mesh(graveGeometry, graveMaterial);
    grave.position.set(x, 0.4, z);
    grave.rotation.x = (Math.random() - 0.5) * 0.4;
    grave.rotation.y = (Math.random() - 0.5) * 0.4;
    grave.rotation.z = (Math.random() - 0.5) * 0.4;

    grave.castShadow = true;

    graves.add(grave);
  }

  return graves;
};

export { createBush, createGraves };
