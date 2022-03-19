// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const isDocker = require('is-docker')()

module.exports = function(config) {
  config.set({
    customLaunchers: {
      ChromiumCustom: {
        base: 'ChromiumHeadless',
        // We must disable the Chrome sandbox when running Chrome inside Docker (Chrome's sandbox needs
        // more permissions than Docker allows by default)
        flags: isDocker ? ['--no-sandbox'] : [],
      },
    },
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      '@angular-devkit/build-angular/plugins/karma',
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-junit-reporter',
      'karma-coverage',
      'karma-jenkins-reporter',
    ],
    files: [
      {
        pattern: './src/assets/**',
        watched: false,
        included: false,
        nocache: false,
        served: true,
      },
    ],
    proxies: {
      '/assets/': '/base/src/assets/',
    },
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    reporters: ['progress', 'junit', 'coverage'],
    coverageReporter: {
      type: 'cobertura',
      dir: 'target/coverage-reports/',
    },
    // saves report at `target/surefire-reports/TEST-*.xml` because Jenkins
    // looks for this location and file prefix by default.
    junitReporter: {
      outputDir: 'target/surefire-reports/',
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromiumCustom'],
    singleRun: false,
    restartOnFileChange: true,
  })
}
