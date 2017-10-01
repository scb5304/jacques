// Karma configuration
// Generated on Mon May 01 2017 19:24:50 GMT-0400 (Eastern Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",

    client: {
      captureConsole: true
    },

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["jasmine"],


    // list of files / patterns to load in the browser
    files: [
        "./node_modules/moment/moment.js",
        "./node_modules/angular/angular.min.js",
        "./node_modules/angular-ui-router/release/angular-ui-router.js",
        "./node_modules/angular-animate/angular-animate.js",
        "./node_modules/angular-material/angular-material.js",
        "./node_modules/angular-messages/angular-messages.js",
        "./node_modules/chart.js/dist/Chart.js",
        "./node_modules/angular-chart.js/dist/angular-chart.js",
        "./node_modules/angular-mocks/angular-mocks.js",
        "jacques-web/app.module.js",
        "jacques-web/app.config.js",
        "jacques-web/sound-list/sound-list.module.js",
        "jacques-web/sound-detail/sound-detail.module.js",
        "jacques-web/**/*.js",
        "jacques-web/**/*.html"
    ],


    // list of files to exclude
    exclude: [
        "./jacques-web/jacques-web.js"
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: { "./jacques-web/**/!(*.spec).js": ["coverage"] },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["progress", "coverage"],

    coverageReporter: {
        type: "lcovonly",
        dir: "coverage/",
        subdir: "lcov-report-client"
    },


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
    browsers: ["PhantomJS"],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};
