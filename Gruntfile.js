module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        lcovMerge: {
            options: {
                emitters: ["event", "file"],
                outputFile: "coverage/lcov-all.info"
            },
            src: ["coverage/**/*.info"]
        }
    });

    grunt.loadNpmTasks("grunt-lcov-merge");

};
