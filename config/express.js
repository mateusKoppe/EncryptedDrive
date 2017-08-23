let express = require('express');
let load = require('express-load');
let bodyParser = require('body-parser');

module.exports = function(){
  let app = express();

  app.use(express.static('./app/assets/'));
  app.set('view engine', 'ejs');
  app.set('views', './app/views');

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  load('controllers', {
    cwd: 'app'
  })
    .then('services', {
      cwd: 'app'
    })
    .into(app)

  return app;
}
