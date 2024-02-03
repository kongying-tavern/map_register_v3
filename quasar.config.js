/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { configure } = require("quasar/wrappers");

let env = {};
const envName = process.env.NODE_ENV || "development";
const envPaths = [
  path.resolve(__dirname, `./.env.${envName}.local`),
  path.resolve(__dirname, `./.env.${envName}`),
  path.resolve(__dirname, "./.env.local"),
  path.resolve(__dirname, "./.env"),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    env = dotenv.config({ path: envPath }).parsed;
    break;
  }
}

module.exports = configure((/** ctx */) => ({
  // https://v2.quasar.dev/quasar-cli/prefetch-feature
  // preFetch: true,

  // app boot file (/src/boot)
  // --> boot files are part of "main.js"
  // https://v2.quasar.dev/quasar-cli/boot-files
  boot: ["axios", "dom-purify"],

  // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
  css: ["app.scss"],

  // https://github.com/quasarframework/quasar/tree/dev/extras
  extras: [
    // 'ionicons-v4',
    "mdi-v7",
    // 'fontawesome-v6',
    // 'eva-icons',
    // 'themify',
    // 'line-awesome',
    // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

    "roboto-font", // Optional, you are not bound to it
    "material-icons", // Optional, you are not bound to it
  ],

  // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
  build: {
    target: {
      browser: ["es2019", "edge88", "firefox78", "chrome87", "safari13.1"],
      node: "node16",
    },

    vueRouterMode: "hash", // Available values: 'hash', 'history'
    // vueRouterBase,
    // vueDevtools,
    // vueOptionsAPI: false,

    // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

    // publicPath: '/',
    // analyze: true,
    env,
    // RawDefine: {}
    // ignorePublicFolder: true,
    // minify: false,
    // polyfillModulePreload: true,
    // distDir

    // extendViteConf (viteConf) {},
    // viteVuePluginOptions: {},

    // vitePlugins: [
    //   [ 'package-name', { ..options.. } ]
    // ]
  },

  // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
  devServer: {
    // Https: true
    open: true, // Opens browser window automatically
    proxy: {
      // 将所有以/api开头的请求代理
      "/api": {
        target: env.VITE_API_PROXY_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

  // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
  framework: {
    config: {},

    // IconSet: 'material-icons', // Quasar icon set
    lang: "zh-CN", // Quasar language pack

    // For special cases outside of where the auto-import strategy can have an impact
    // (like functional components as one of the examples),
    // you can manually specify Quasar components/directives to be available everywhere:
    //
    // components: [],
    // directives: [],

    // Quasar plugins
    plugins: ["Cookies", "Notify", "Dialog", "Loading"],
  },
  htmlVariables: {
    productName: "原神地图打点页_v3",
  },
  // Animations: 'all', // --- includes all animations
  // https://v2.quasar.dev/options/animations
  animations: ["fadeInLeft", "fadeOutLeft"],

  // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-sourcefiles
  // sourceFiles: {
  //   rootComponent: 'src/App.vue',
  //   router: 'src/router/index',
  //   store: 'src/store/index',
  //   registerServiceWorker: 'src-pwa/register-service-worker',
  //   serviceWorker: 'src-pwa/custom-service-worker',
  //   pwaManifestFile: 'src-pwa/manifest.json',
  //   electronMain: 'src-electron/electron-main',
  //   electronPreload: 'src-electron/electron-preload'
  // },

  // https://v2.quasar.dev/quasar-cli/developing-ssr/configuring-ssr
  ssr: {
    // SsrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
    // will mess up SSR

    // extendSSRWebserverConf (esbuildConf) {},
    // extendPackageJson (json) {},

    pwa: false,

    // ManualStoreHydration: true,
    // manualPostHydrationTrigger: true,

    prodPort: 3000, // The default port that the production server should use
    // (gets superseded if process.env.PORT is specified at runtime)

    middlewares: [
      "render", // Keep this as last one
    ],
  },

  // https://v2.quasar.dev/quasar-cli/developing-pwa/configuring-pwa
  pwa: {
    workboxMode: "generateSW", // Or 'injectManifest'
    injectPwaMetaTags: true,
    swFilename: "sw.js",
    manifestFilename: "manifest.json",
    useCredentialsForManifestTag: false,
    // ExtendGenerateSWOptions (cfg) {}
    // extendInjectManifestOptions (cfg) {},
    // extendManifestJson (json) {}
    // extendPWACustomSWConf (esbuildConf) {}
  },

  // Full list of options: https://v2.quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
  cordova: {
    // NoIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
  },

  // Full list of options: https://v2.quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
  capacitor: {
    hideSplashscreen: true,
  },

  // Full list of options: https://v2.quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
  electron: {
    // ExtendElectronMainConf (esbuildConf)
    // extendElectronPreloadConf (esbuildConf)

    inspectPort: 5858,

    bundler: "packager", // 'packager' or 'builder'

    packager: {
      // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
      // OS X / Mac App Store
      // appBundleId: '',
      // appCategoryType: '',
      // osxSign: '',
      // protocol: 'myapp://path',
      // Windows only
      // win32metadata: { ... }
    },

    builder: {
      // https://www.electron.build/configuration/configuration

      appId: "quasar-project",
    },
  },

  // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
  bex: {
    contentScripts: ["my-content-script"],

    // ExtendBexScriptsConf (esbuildConf) {}
    // extendBexManifestJson (json) {}
  },
}));
