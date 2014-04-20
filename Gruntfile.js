'use strict';
/* global module, require */

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  var files = require('./files').files;

  grunt.initConfig({
    builddir: 'build',
    buildtag: '-dev-' + grunt.template.today('yyyy-mm-dd'),
    clean: [ '<%= builddir %>' ],
    copy: {
      dist: {
        files: [{
          dest: 'dist',
          expand: true,
          filter: 'isFile',
          flatten: true,
          src: ['build/*.js']
        }]
      }
    },
    concat: {
      options: {
        banner: '<%= meta.banner %>\n\n'+
                '(function (window, angular, undefined) {\n'+
                '"use strict";\n',
        footer: '})(window, window.angular);',
        process: function(src, filepath) {
          return '// Source: ' + filepath + '\n' +
            src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
        },
      },
      build: {
        dest: '<%= builddir %>/<%= pkg.name %>.js',
        src: files.src
      }
    },
    jshint: {
      afterConcat: {
        src: [ '<%= concat.build.dest %>' ]
      },
      beforeConcat: {
        src: ['Gruntfile.js', 'src/**/*.js']
      },
      options: {
        boss: true,
        curly: true,
        eqeqeq: true,
        eqnull: true,
        globalstrict: true,
        globals: {
          angular: true
        },
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        unused: true,
      }
    },
    karma: {
      build: {
        browsers: [ grunt.option('browser') || 'PhantomJS' ],
        configFile: 'config/karma/build.conf.js',
        singleRun: true
      },
      debug: {
        background: false,
        browsers: [ grunt.option('browser') || 'Chrome' ],
        configFile: 'config/karma/src.conf.js',
        singleRun: false
      },
      min: {
        browsers: [ grunt.option('browser') || 'PhantomJS' ],
        configFile: 'config/karma/min.conf.js',
        singleRun: true
      },
      unit: {
        browsers: [ grunt.option('browser') || 'PhantomJS' ],
        configFile: 'config/karma/src.conf.js',
        singleRun: true
      }
    },
    meta: {
      banner: '/**\n' +
        ' * <%= pkg.description %>\n' +
        ' * @version v<%= pkg.version %><%= buildtag %>\n' +
        ' * @link <%= pkg.homepage %>\n' +
        ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
        ' */'
    },
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        files: {
          '<%= builddir %>/<%= pkg.name %>.min.js': ['<banner:meta.banner>', '<%= concat.build.dest %>']
        }
      },
      options: {
        banner: '<%= meta.banner %>\n'
      }
    },
    watch: {
      files: ['./**/*.js'],
      tasks: ['default']
    }
  });

  grunt.registerTask('default', ['karma:unit', 'build']);
  grunt.registerTask('build', 'Perform a normal build', ['jshint:beforeConcat', 'concat', 'jshint:afterConcat', 'karma:build', 'uglify', 'karma:min']);
  grunt.registerTask('dist', 'Perform a clean build', ['clean', 'build', 'copy:dist']);
};
