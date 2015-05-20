// http://www.mikestreety.co.uk/blog/a-simple-sass-compilation-gulpfilejs
var gulp = require('gulp');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var connect = require('gulp-connect');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var clean = require('gulp-clean');

var paths = {
    scripts: [ 'app/**/*.js', '!app/bower_components/**/*.js' ],
    html: [
      './app/**/*.html',
      '!./app/index.html',
      '!./app/bower_components/**/*.html'
    ],
    index: './app/index.html',
    build: './build/',
    styles: {
        src: './app/assets/styles',
        files: './app/assets/styles/*.scss',
        dest: './app/assets/styles/'
    }
}

// A display error function, to format and make custom errors more uniform
// Could be combined with gulp-util or npm colors for nicer output
var displayError = function(error) {

    // Initial building up of the error
    var errorString = '[' + error.plugin + ']';
    errorString += ' ' + error.message.replace("\n",''); // Removes new line at the end

    // If the error contains the filename or line number add it to the string
    if(error.fileName)
        errorString += ' in ' + error.fileName;

    if(error.lineNumber)
        errorString += ' on line ' + error.lineNumber;

    // This will output an error like the following:
    // [gulp-sass] error message in file_name on line 1
    console.error(errorString);
}

// Setting up the sass task
gulp.task('sass', function (){
    // Taking the path from the above object
    gulp.src(paths.styles.files)
    // Sass options - make the output compressed and add the source map
    // Also pull the include path from the paths object
    .pipe(sass({
        outputStyle: 'compressed',
        sourceComments: 'map',
        includePaths : [paths.styles.src]
    }))
    // If there is an error, don't stop compiling but use the custom displayError function
    .on('error', function(err){
        displayError(err);
    })
    // Pass the compiled sass through the prefixer with defined
    .pipe(prefix(
        'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'
    ))
    // Finally put the compiled sass into a css file
    .pipe(gulp.dest(paths.styles.dest))
});

gulp.task('connect', function() {
    connect.server({
        root: 'app/',
    });
});

//figure out later
// gulp.task('copy', function() {
//   gulp.src(['./app/**/*.html', '!./app/index.html'], {base: './app'})
//   .pipe(gulp.dest('build/'));
// });
gulp.task('copy', [ 'clean' ], function() {
    gulp.src( paths.html )
        .pipe(gulp.dest('build/'));
});



gulp.task('usemin', function () {
  return gulp.src('./app/*.html')
      .pipe(usemin({
        css: [minifyCss(), 'concat'],
        html: [minifyHtml({empty: true})],
        js: [uglify(), rev()]
      }))
      .pipe(gulp.dest('build/'));
});

gulp.task('clean', function(){
  gulp.src( paths.build, { read: false } )
    .pipe(clean());
});

gulp.task('build', ['sass', 'copy', 'usemin']);

// This is the default task - which is run when `gulp` is run
// The tasks passed in as an array are run before the tasks within the function
gulp.task('default', ['connect', 'sass'], function() {
    // Watch the files in the paths object, and when there is a change, fun the functions in the array
    gulp.watch(paths.styles.files, ['sass'])
    // Also when there is a change, display what file was changed, only showing the path after the 'sass folder'
    .on('change', function(evt) {
        console.log(
            '[watcher] File ' + evt.path.replace(/.*(?=sass)/,'') + ' was ' + evt.type + ', compiling...'
        );
    });
});