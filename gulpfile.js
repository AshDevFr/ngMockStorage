(function() {
  'use strict';
  const gulp       = require('gulp'),
        gutil      = require('gulp-util'),
        sourcemaps = require('gulp-sourcemaps'),
        source     = require('vinyl-source-stream'),
        buffer     = require('vinyl-buffer'),
        browserify = require('browserify'),
        watchify   = require('watchify'),
        babel      = require('babelify');

  function compile(watch) {
    var bundler = watchify(browserify('ngMockStorage.js', {debug : true}).transform(babel, {presets:['es2015']}));

    function rebundle() {
      bundler.bundle()
        .on('error', function(err) {
          gutil.log(gutil.colors.red(err));
          this.emit('end');
        })
        .pipe(source('ngMockStorage.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps : true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'));
    }

    if (watch) {
      bundler.on('update', function() {
        gutil.log('Bundling ...');
        rebundle();
      });
    }

    rebundle();
  }

  function watch() {
    return compile(true);
  }

  gulp.task('build', function() {
    return compile();
  });

  gulp.task('watch', function() {
    return watch();
  });

  gulp.task('default', ['watch']);
})();
