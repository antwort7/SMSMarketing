const gulp = require('gulp')

const nodemon = require('gulp-nodemon')

gulp.task('start', () => {
	nodemon({
		script: './server',
		nodeArgs: ['--inspect=0.0.0.0:9229'],
		ext: 'js html',
	})
})

gulp.task('default', ['start'])
