module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        lcovMerge: {
            options: {
                emitters: ['event', 'file'],
                outputFile: 'coverage/mergeLcov.info'
            },
            src: ['coverage/*.info', 'coverage/**/*.info']
        }
    });

    grunt.loadNpmTasks('grunt-lcov-merge');

};
