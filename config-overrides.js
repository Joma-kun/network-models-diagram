// config-overrides.js
module.exports = function override(config, env) {
  config.module.rules.push({
    test: /\.ya?ml$/,
    use: 'js-yaml-loader'
  });
  return config;
};
