// Karma configuration
// Generated on Mon May 01 2017 19:24:50 GMT-0400 (Eastern Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    client: {
      captureConsole: true
    },

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        "./node_modules/moment/moment.js",
        "./node_modules/angular/angular.min.js",
        "../node_modules/angular-aria/angular-aria.js",
        './node_modules/angular-ui-router/release/angular-ui-router.js',
        "./node_modules/angular-animate/angular-animate.js",
        "./node_modules/angular-material/angular-material.js",
        "./node_modules/angular-messages/angular-messages.js",
        "./node_modules/chart.js/dist/Chart.js",
        "./node_modules/angular-chart.js/dist/angular-chart.js",
        './node_modules/angular-mocks/angular-mocks.js',
        './web/app.module.js',
        './web/app.config.js',
        './web/core/core.module.js',
        './web/sound-list/sound-list.module.js',
        './web/sound-list/sound-list.template.html',
        './web/sound-list/sound-list.component.js',
        './web/sound-list/sound-list.component.spec.js',
        './web/sound-detail/sound-detail.module.js',
        './web/sound-detail/sound-detail.template.html',
        './web/sound-detail/sound-detail.component.js',
        './web/sound-detail/sound-detail.component.spec.js',
        './web/sound-detail/service/sound-detail-charts-helper.service.js',
        './web/sound-detail/service/sound-detail-charts-helper.service.spec.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
