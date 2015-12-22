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
      rename     = require('gulp-rename'),
      uglify     = require('gulp-uglify'),
      rimraf     = require('gulp-rimraf'),
      serve      = require('gulp-serve'),
      sources    = 'ngMockStorage.js',
      destFile   = 'ngMockStorage.js',
      destMinFile   = 'ngMockStorage.min.js',
      destDir    = './dist';

  function rebundle(bundler) {
    return bundler.bundle()
      .on('error', (err) => {
        gutil.log(gutil.colors.red(err));
        this.emit('end');
      })
      .pipe(source(destFile))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps : true}))
      .pipe(gulp.dest(destDir))
      .pipe(rename(destMinFile))
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
        gulp.start('copy:dist');
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

  gulp.task('copy:dist', () => {
    return gulp.src(destDir + '/**/*')
      .pipe(gulp.dest('./samples/node_modules/ngmockstorage/dist'));
  });

  gulp.task('serve', ['build', 'copy:dist'], serve('samples'));

  gulp.task('default', ['build']);
})();
