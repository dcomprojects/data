const gulp = require('gulp');
const browserSync = require('browser-sync');
const babel = require('gulp-babel');
const uglify = require('gulp-terser');
const rename = require('gulp-rename');
const cleancss = require('gulp-clean-css');
const filter = require('gulp-filter');
const del = require('del');

const workboxBuild = require('workbox-build');


const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const log = require('gulplog');

'use strict';

function processAnalysis2() {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './app/analysis/growthrate.js',
    debug: true
  });

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', log.error)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./build/'));
}

function processAnalysis3() {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './app/analysis/usesdata.js',
    debug: true
  });

  return b.bundle()
    .pipe(source('datamodule.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', log.error)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./build/'));
}

// Clean "build" directory
function clean() {
  return del(['build/*'], {
    dot: true
  });
};

function copy() {
  return gulp.src([
      'app/*.html',
      'app/**/*.jpg',
      'app/**/*.svg',
      'app/**/*.png',
      'app/**/*.scss',
      'app/**/webfonts/*',
      'app/**/d3/d3.js',
      'app/**/data/*'
    ])
    .pipe(gulp.dest('build'));
}

gulp.task('copy', copy);

function serve() {
  return browserSync.init({
    server: 'build',
    open: false,
    port: 3000
  });
}

function buildSw() {
  return workboxBuild.injectManifest({
    swSrc: 'app/sw.js',
    swDest: 'build/sw.min.js',
    globDirectory: 'build',
    globPatterns: [
      '**',
    ],
    globIgnores: [
      'sw.js', 'datamodule.js'
    ]
  }).then(resources => {
    console.log(`Injected ${resources.count} resources for precaching, ` +
      `totaling ${resources.size} bytes.`);
  }).catch(err => {
    console.log('Uh oh 😬', err);
  });
}

function processJs() {
  return gulp.src([
    'app/assets/js/*.js',
  ])
    //.pipe(babel({
    //  presets: ['env']
    //}))
    //.pipe(uglify())
    //.pipe(rename({
    //    suffix: '.min'
    //}))
    .pipe(gulp.dest('build/assets/js'));
}

function processAnalysis() {
  return gulp.src([
    'app/analysis/*.js',
  ])
    //.pipe(babel({
    //  presets: ['env']
    //}))
    //.pipe(uglify())
    //.pipe(rename({
    //    suffix: '.min'
    //}))
    .pipe(gulp.dest('build/analysis'));
}


function copyHtml() {
  return gulp.src(['app/*.html'])
    //.pipe(babel({
    //  presets: ['env']
    //}))
    //.pipe(uglify())
    //.pipe(rename({
    //    suffix: '.min'
    //}))
    .pipe(gulp.dest('build/'));
}


gulp.task('processJs', processJs);

function watchJs() {
  gulp.watch('app/assets/js/*.js', processJs);
}

function watchAnalysis() {
  //gulp.watch('app/analysis/*.js', processAnalysis);
  gulp.watch('app/analysis/*.js', gulp.series(processAnalysis3));
}

function watchHtml() {
  gulp.watch('app/*.html', copyHtml);
}

function processCss() {
  return gulp.src('app/assets/css/*.css')
    .pipe(filter([
      'app/assets/css/main.css',
      'app/assets/css/noscript.css',
      'app/assets/css/fontawesome-all.min.css'
    ]))
    .pipe(cleancss())
    //.pipe(rename({
    //    suffix: '.min'
    //}))
    .pipe(gulp.dest('build/assets/css/'))
}

gulp.task('processCss', processCss)

function watchCss() {
  gulp.watch('app/assets/css/*.css', processCss);
}

function watch() {
  gulp.parallel(watchCss, watchJs);
}

gulp.task('watch', watch);

gulp.task("build", gulp.series(
  clean,
  copy,
  processJs,
  processAnalysis3,
  processCss,
  buildSw
));

gulp.task('buildAndServe', gulp.series("build", gulp.parallel(
    watchCss, 
    watchJs, 
    watchAnalysis, 
    watchHtml, 
    serve)
));
