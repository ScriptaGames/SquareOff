/* jshint node: true */
const del = require('del');
const gulp = require('gulp');
const path = require('path');
const argv = require('yargs').argv;
const gutil = require('gulp-util');
const source = require('vinyl-source-stream');
const buffer = require('gulp-buffer');
const gulpif = require('gulp-if');
const terser = require('gulp-terser');
const exorcist = require('exorcist');
const babelify = require('babelify');
const browserify = require('browserify');
const replace = require('gulp-string-replace');
const tap = require('gulp-tap');


/**
 * Using different folders/file names? Change these constants:
 */
const PHASER_PATH = './node_modules/phaser/build/';
const BUILD_PATH = './build';
const SCRIPTS_PATH = BUILD_PATH + '/scripts';
const SOURCE_PATH = './client/src';
const STATIC_PATH = './client/static';
const ENTRY_FILE = SOURCE_PATH + '/index.js';
const OUTPUT_FILE = 'game.js';

let keepFiles = false;

/**
 * Simple way to check for development/production mode.
 */
function isProduction() {
    return argv.production;
}

/**
 * Logs the current build mode on the console.
 */
function logBuildMode() {

    if (isProduction()) {
        gutil.log(gutil.colors.green('Running production build...'));
    } else {
        gutil.log(gutil.colors.yellow('Running development build...'));
    }

}

/**
 * Deletes all content inside the './build' folder.
 * If 'keepFiles' is true, no files will be deleted. This is a dirty workaround since we can't have
 * optional task dependencies :(
 * Note: keepFiles is set to true by gulp.watch (see serve()) and reseted here to avoid conflicts.
 */
async function cleanBuild() {
    if (!keepFiles) {
        del(['build/**/*.*']);
    } else {
        keepFiles = false;
    }
}

async function isProductionIndex(file, t) {
    if (isProduction() && path.extname(file.path) === '.html') {
        return t.through(replace, ["SO_ENV = 'dev'", "SO_ENV = 'prod'"])
    }
}

/**
 * Copies the content of the './static' folder into the '/build' folder.
 * Also set the global SO_ENV variable in the index.html to load the proper settings based on environment
 * Check out README.md for more info on the '/static' folder.
 */
async function copyStatic() {
    return gulp.src(STATIC_PATH + '/**/*')
        .pipe(tap(isProductionIndex))
        .pipe(gulp.dest(BUILD_PATH));
}

/**
 * Copies required Phaser files from the './node_modules/Phaser' folder into the './build/scripts' folder.
 * This way you can call 'npm update', get the lastest Phaser version and use it on your project with ease.
 */
async function copyPhaser() {

    let srcList = ['phaser.min.js'];

    if (!isProduction()) {
        srcList.push('phaser.map', 'phaser.js');
    }

    srcList = srcList.map(function(file) {
        return PHASER_PATH + file;
    });

    return gulp.src(srcList)
        .pipe(gulp.dest(SCRIPTS_PATH));

}

/**
 * Builds the package to be imported in the browser
 * Optionally: Creates a sourcemap file 'game.js.map' for debugging.
 *
 * In order to avoid copying Phaser and Static files on each build,
 * I've abstracted the build logic into a separate function. This way
 * two different tasks (build and fastBuild) can use the same logic
 * but have different task dependencies.
 */
async function build() {

    const sourcemapPath = SCRIPTS_PATH + '/' + OUTPUT_FILE + '.map';
    logBuildMode();

    return browserify({
        paths: [path.join(__dirname, SOURCE_PATH)],
        entries: ENTRY_FILE,
        debug: true
    })
        .transform(babelify)
        .bundle().on('error', function (error) {
            gutil.log(gutil.colors.red('[Build Error]', error.message));
            this.emit('end');
        })
        .pipe(gulpif(!isProduction(), exorcist(sourcemapPath)))
        .pipe(source(OUTPUT_FILE))
        .pipe(buffer())
        .pipe(gulpif(isProduction(), terser()))
        .pipe(gulp.dest(SCRIPTS_PATH));
}

gulp.task('cleanBuild', cleanBuild);
gulp.task('clean', cleanBuild);
gulp.task('copyStatic', gulp.series('cleanBuild', copyStatic));
gulp.task('copyPhaser', gulp.series('copyStatic', copyPhaser));
gulp.task('build', gulp.series('copyPhaser', build));
gulp.task('fastBuild', build);

/**
 * The tasks are executed in the following order:
 * 'cleanBuild' -> 'copyStatic' -> 'copyPhaser' -> 'build'
 *
 * Read more about task dependencies in Gulp:
 * https://medium.com/@dave_lunny/task-dependencies-in-gulp-b885c1ab48f0
 */
gulp.task('default', gulp.series('build'));
