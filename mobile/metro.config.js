const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

config.resolver.extraNodeModules = {
  '@bsv/wallet-toolbox': require.resolve('@bsv/wallet-toolbox/out/src/index.mobile'),
  '@bsv/sdk': path.resolve(__dirname, 'node_modules/@bsv/sdk'),
}

module.exports = config