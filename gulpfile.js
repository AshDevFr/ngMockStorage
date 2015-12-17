(function() {
  'use strict';
  var gulp       = require('gulp'),
      gutil      = require('gulp-util'),
      sourcemaps = require('gulp-sourcemaps'),
      source     = require('vinyl-source-stream'),
      buffer     = require('vinyl-buffer'),
      browserify = require('browserify'),
      watchify   = require('watchify'),
      babel      = require('babelify'),
      jshint     = require('gulp-jshint'),
      jscs       = require('gulp-jscs'),
      uglify     = require('gulp-uglify'),
      rimraf     = require('gulp-rimraf'),
      sources    = 'ngMockStorage.js',
      destFile   = 'ngMockStorage.min.js',
      destDir    = './dist';

  function rebundle(bundler) {
    bundler.bundle()
      .on('error', (err) => {
        gutil.log(gutil.colors.red(err));
        this.emit('end');
      })
      .pipe(source(destFile))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps : true}))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(destDir));
  }

  function compile(watch) {
    var bundler;


    if (watch) {
      bundler = watchify(browserify(sources, {debug : true}).transform(babel, {presets : ['es2015']}));
      bundler.on('update', function() {
        gutil.log('Bundling ...');
        rebundle(bundler);
      });
    } else {
      bundler = browserify(sources, {debug : true}).transform(babel, {presets : ['es2015']});
    }

    return rebundle(bundler);
  }

  function watch() {
    return compile(true);
  }

  gulp.task('clean', () => {
    return gulp.src(destDir, {read : false})
      .pipe(rimraf({force : true}));
  });

  gulp.task('lint', () => {
    return gulp.src(sources)
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
  });

  gulp.task('jscs', () => {
    return gulp.src(sources)
      .pipe(jscs())
      .pipe(jshint.reporter('default'));
  });

  gulp.task('build', ['clean', 'lint', 'jscs'], () => {
    return compile();
  });

  gulp.task('watch', () => {
    return watch();
  });

  gulp.task('default', ['build']);
})();
