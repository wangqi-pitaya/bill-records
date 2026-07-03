import { defineConfig } from '@tarojs/cli'

export default defineConfig({
  projectName: 'bill-app',
  designWidth: 375,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [
    '@tarojs/plugin-framework-react',
    '@tarojs/plugin-platform-h5',
    '@tarojs/plugin-platform-weapp',
    '@tarojs/plugin-platform-alipay',
    '@tarojs/plugin-platform-rn',
    '@tarojs/plugin-platform-harmony-cpp',
    '@tarojs/plugin-platform-harmony-ets'
  ],
  framework: 'react',
  compiler: 'swc',
  swc: {
    jsc: {
      target: 'ESNext',
      transform: {
        react: {
          runtime: 'automatic'
        }
      },
      parser: {
        syntax: 'typescript',
        tsx: true
      }
    }
  },
  h5: {
    publicPath: '/',
    output: {
      filename: 'js/[name].[hash].js',
      chunkFilename: 'js/[name].[hash].js'
    },
    devServer: {
      port: 5173
    }
  },
  mini: {
    output: {
      filename: 'js/[name].[hash].js',
      chunkFilename: 'js/[name].[hash].js'
    }
  },
  rn: {
    output: 'ios'
  },
  harmony: {
    compiler: 'vite',
    projectPath: '/tmp/harmony-project',
    hapName: 'entry'
  }
})
