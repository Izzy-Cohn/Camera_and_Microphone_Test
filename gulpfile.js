const gulp = require('gulp');
const inlineSource = require('gulp-inline-source');
const htmlmin = require('gulp-htmlmin');
const inline = require('gulp-inline');

// Step 2: Define the Gulp task, adding a comment for each line
// Define a Gulp task to combine files
gulp.task('combineFiles', function () {
    return gulp.src('index.html')
        .pipe(inline({
            base: '.',
            disabledTypes: ['svg', 'img'], // Only inline css and js files
        }))
        .pipe(htmlmin({ collapseWhitespace: true })) // Minify the HTML for better performance
        .pipe(gulp.dest('dist')); // Output to 'dist' folder
});

// Optional: Watch for changes to automatically rebuild
gulp.task('watch', function () {
    gulp.watch(['index.html', 'styles.css', 'app.js'], gulp.series('combineFiles'));
});

// Default task
gulp.task('default', gulp.series('combineFiles'));