module.exports = function (grunt) {
    grunt.initConfig({
        getAllReadMes: {
            all: {
                files: {
                    "subs.md": "node_modules/koa*/readme.md"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerMultiTask('getAllReadMes', 'Get all nested readme.md files', function () {
        grunt.log.writeln('Get all nested readme.md files');
        var file = this.files.pop();
        var dest = file.dest;
        var glob = file.orig.src[0];
        var readmes = grunt.file.glob.sync(glob);
        grunt.log.writeln("from %s to %s", glob, dest);
        grunt.log.writeln(readmes);
        var files = {};
        files[dest] = readmes;
        grunt.config('concat.readmes', {files: files});
        grunt.task.run('concat:readmes');
    });


    grunt.registerTask('default', ['getAllReadMes']);
};
