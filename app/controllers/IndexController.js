let multer = require('multer');
let upload = multer({dest: 'temp/'});
let encryptor = require('file-encryptor');
let fs = require('fs');
let md5 = require('md5');

module.exports = function(app) {

  app.get('/', (req, res) => {
    res.render('index/index');
  })

  app.post('/', upload.array('files'), (req, res) => {
    let pack = md5(req.body.pack);
    let key = md5(req.body.password);
    req.files.forEach(file => {
      let extension = file.originalname.split(".").reverse()[0];
      if(!fs.existsSync(`./encrypted/${pack}`)){
        fs.mkdirSync(`./encrypted/${pack}`);
      }
      fs.rename(`./temp/${file.filename}`, `./encrypted/${pack}/${file.originalname}`);
      encryptor.encryptFile(`./encrypted/${pack}/${file.originalname}`, `./encrypted/${pack}/${md5(file.originalname)}.${extension}`, key, () => {});
      fs.unlink(`./encrypted/${pack}/${file.originalname}`);
    });
    res.render('index/index');
  })

  app.post('/files', (req, res) => {
    let pack = md5(req.body.pack);
    let key = md5(req.body.password);
    if(!fs.existsSync(`./unencrypted/${pack}`)){
      fs.mkdirSync(`./unencrypted/${pack}`);
    }
    fs.readdir(`./encrypted/${pack}/`, (err, data) => {
      encryptor.decryptFile(`./encrypted/${pack}/${data}`, `./unencrypted/${pack}/${data}`, key, () => {});
    })
  })
}
