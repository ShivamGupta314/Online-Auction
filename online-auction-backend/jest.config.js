export default {
  testEnvironment: 'node',
  setupFiles: ['./tests/setup.js'],
  transform: {}, // No transform needed for ESM
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
}
  