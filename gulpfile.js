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
      swSrc: 'build/scripts/sw.min.js',
      swDest: 'build/scripts/sw.imin.js',
      globDirectory: 'build',
      globPatterns: [
        '**\/*.css',
        'index.html',
        'js\/animation.js',
        'images\/home\/*.jpg',
        'images\/icon\/*.svg',
      ]
    }).then(resources => {
      console.log(`Injected ${resources.count} resources for precaching, ` +
          `totaling ${resources.size} bytes.`);
    }).catch(err => {
      console.log('Uh oh 😬', err);
    });
  }

function processJs() {
    return gulp.src('app/scripts/*.js')
    .pipe(babel({
        presets: ['env']
    }))
    .pipe(uglify())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('build/scripts'));
}

gulp.task('processJs', processJs);

function watchJs() {
    gulp.watch('app/scripts/*.js', processJs);
}

function processCss() {
    return gulp.src('app/styles/*.css')
    .pipe(cleancss())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('build/styles'))
}

gulp.task('processCss', processCss)
function watchCss() {
    gulp.watch('app/styles/*.css', processCss);
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
