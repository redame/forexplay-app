"use strict";

// Include Gulp
var gulp = require('gulp');

 // Include plugins
 var plugins = require("gulp-load-plugins")({
 	pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
 	replaceString: /\bgulp[\-.]/
 });
 // Define default destination folder
 var dest = 'dev/';

// bower imports - JS
gulp.task('js', function() {
	gulp.src(plugins.mainBowerFiles())
	.pipe(plugins.filter('*.js'))
	.pipe(plugins.concat('external.min.js'))
	.on('error', plugins.notify.onError("Error: <%= error.message %>"))
	.pipe(gulp.dest(dest + 'js'))
	.pipe(plugins.uglify())
	.on('error', plugins.notify.onError("Error: <%= error.message %>"))
	.pipe(gulp.dest(dest + 'js/min/'))
	.pipe(plugins.notify({ message: "Completed concat.", onLast: true }));
});

// bower imports - CSS
gulp.task('css', function() {
	var cssFiles = ['src/css/*'];
	gulp.src(plugins.mainBowerFiles().concat(cssFiles))
	.pipe(plugins.filter('*.css'))
	.pipe(plugins.concat('_external.min.scss'))
	.on('error', plugins.notify.onError("Error: <%= error.message %>"))
	.pipe(plugins.minifyCss())
	.pipe(gulp.dest(dest + 'scss'))
	.pipe(plugins.notify({ message: "Completed css import.", onLast: true }));
});


// bower imports - images
gulp.task('img', function() { 
	gulp.src(plugins.mainBowerFiles())
	.pipe(plugins.filter('*.{gif,png,jpeg,jpg}'))
	.on('error', plugins.notify.onError("Error: <%= error.message %>"))
	.pipe(gulp.dest(dest + 'images'))
	.pipe(plugins.notify({ message: "Completed image optimization.", onLast: true }));
});

// bower imports - fontAwesome
gulp.task('fontawesome', function() { 
	gulp.src(plugins.mainBowerFiles())
	.pipe(plugins.filter('*.{eot,svg,ttf,woff,woff2,otf}'))
	.on('error', plugins.notify.onError("Error: <%= error.message %>"))
	.pipe(gulp.dest(dest + 'fonts'))
	.pipe(plugins.notify({ message: "Completed fonts import.", onLast: true }));
});

// image optimization
gulp.task('images', function() {
	return gulp.src(dest + 'images/*')
	.pipe(plugins.imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
	.on('error', plugins.notify.onError("Error: <%= error.message %>"))
	.pipe(gulp.dest(dest + 'images'))
	.pipe(plugins.notify({ message: "Completed image optimization.", onLast: true }));
});

// compass for sass / css
gulp.task('compass', function() {
	return gulp.src(dest + '/scss/*.scss')
	.pipe(plugins.compass({
		config_file: './config.rb',
		css: 'dev/css',
		sass: 'dev/scss'
	}))
	.on('error', plugins.notify.onError("Error: <%= error.message %>"))
	.pipe(gulp.dest(dest + 'css'))
	.pipe(plugins.notify({ message: "Completed compass.", onLast: true }));
});

// script / js shits
gulp.task('scripts', function() {
	return gulp.src(dest + 'js/script.js')
	.pipe(plugins.concat('script.min.js'))
	.on('error', plugins.notify.onError("Error: <%= error.message %>"))
	.pipe(gulp.dest(dest + 'js'))
	.pipe(plugins.uglify())
	.on('error', plugins.notify.onError("Error: <%= error.message %>"))
	.pipe(gulp.dest(dest + 'js/min/'))
	.pipe(plugins.notify({ message: "Completed script concat.", onLast: true }));
});

// Watch for changes in files
gulp.task('watch', function() {
	// Watch .js files
	gulp.watch(dest + 'js/*.js', ['scripts']);
	// Watch .scss files
	gulp.watch(dest + 'scss/*.scss', ['compass']);
	// Watch image files
	gulp.watch(dest + 'img/*', ['images']);
});


// default tasks
gulp.task("default", ["css", "js", "images", "compass", "scripts", "img", "fontawesome"]);
