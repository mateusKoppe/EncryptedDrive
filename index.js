let app = require('./config/express')();
let http = require('http').Server(app);

const HTTP_PORT = process.env.HTTP_PORT || 3030;

http.listen(HTTP_PORT, () => console.log('Server is running on port ' + HTTP_PORT));
