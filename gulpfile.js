var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var header = require('gulp-header');
var del = require('del');
var pkg = require('./package.json');

//var scripts = [
//  'src/1-intro.js',
//  'src/2-plugin.js',
//  'src/3-init.js',
//  'src/4-outro.js',
//];

var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */\n',
  ''].join('\n');

gulp.task('scripts', function() {
  return gulp.src(scripts)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('feedify.js'))
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .pipe(notify({message: 'Scripts task complete'}));
});

gulp.task('clean', function(cb) {
  del(['dist'], cb);
});

//gulp.task('default', ['clean'], function() {
  //gulp.start('scripts');
//});
