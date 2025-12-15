module.exports = {
  root: true,
  env: {
    node: true,
    mocha: true
  },
  extends: [
    'digitalbazaar',
    'digitalbazaar/jsdoc',
    'digitalbazaar/module'
  ],
  globals: {
    should: 'readonly'
  },
  rules: {
    'unicorn/prefer-node-protocol': 'error'
  }
};

