const gulp = require('gulp');
const browserSync = require('browser-sync');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cleancss = require('gulp-clean-css');
const del = require('del');

const workboxBuild = require('workbox-build');

// Clean "build" directory
function clean() {
  return del(['build/*'], {dot: true});
};

function copy() {
    return gulp.src([
      'app/*.html',
      'app/**/*.jpg',
      'app/**/*.svg',
      'app/**/*.png',
      'app/**/*.scss',
      'app/webfonts/**',
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
        'sw.js'
      ] 
    }).then(resources => {
      console.log(`Injected ${resources.count} resources for precaching, ` +
          `totaling ${resources.size} bytes.`);
    }).catch(err => {
      console.log('Uh oh 😬', err);
    });
  }

function processJs() {
    return gulp.src(['app/assets/js/*.js'])
    .pipe(babel({
        presets: ['env']
    }))
    .pipe(uglify())
    //.pipe(rename({
    //    suffix: '.min'
    //}))
    .pipe(gulp.dest('build/assets/js'));
}

gulp.task('processJs', processJs);

function watchJs() {
    gulp.watch('app/assets/js/*.js', processJs);
}

function processCss() {
    return gulp.src('app/assets/css/*.css')
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

gulp.task('buildAndServe', gulp.series(
    clean,
	copy, 
	processJs, 
    processCss, 
    buildSw,
    gulp.parallel(watchCss, watchJs, serve)
    )
);
