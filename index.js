let app = require('./config/express')();
let http = require('http').Server(app);

http.listen(3030, () => console.log('Server is running'))
