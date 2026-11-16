import * as migration_20261116_081440_initial from './20261116_081440_initial';

export const migrations = [
  {
    up: migration_20261116_081440_initial.up,
    down: migration_20261116_081440_initial.down,
    name: '20261116_081440_initial'
  },
];
