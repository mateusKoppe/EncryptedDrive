const express = require('express');
const load = require('express-load');
const bodyParser = require('body-parser');
const session = require('express-session');

module.exports = function(){
	const app = express();

	app.use(express.static('./static/'));
	app.set('view engine', 'ejs');
	app.set('views', './app/views');

	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());
	app.use(session({
		secret: 'securyfile',
		saveUninitialized: true,
		resave: false
	}));

	load('services', {
		cwd: 'app'
	})
		.then('controllers', {
			cwd: 'app'
		})
		.into(app);

	return app;
};
