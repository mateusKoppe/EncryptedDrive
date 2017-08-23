let multer = require('multer');
let upload = multer({dest: 'temp/'});
let encryptor = require('file-encryptor');
let fs = require('fs');
let md5 = require('md5');

module.exports = function(app) {

  app.get('/', (req, res) => {
    res.render('index/index', {unencryptedFiles: []});
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
    res.render('index/index', {unencryptedFiles: []});
  })

  app.post('/files', (req, res) => {
    let pack = md5(req.body.pack);
    let key = md5(req.body.password);
    let unencryptedFiles = [];
    if(!fs.existsSync(`./app/assets/unencrypted/${pack}`)){
      fs.mkdirSync(`./app/assets/unencrypted/${pack}`);
    }
    fs.readdir(`./encrypted/${pack}/`, (err, data) => {
      encryptor.decryptFile(`./encrypted/${pack}/${data}`, `./app/assets/unencrypted/${pack}/${data}`, key, (err) => {
        fs.readdir(`./app/assets/unencrypted/${pack}/`, (err, files) => {
          files.forEach(file => {
            unencryptedFiles.push(`./unencrypted/${pack}/${file}`);
            console.log(unencryptedFiles);
          })
          res.render('index/index', {
            unencryptedFiles: unencryptedFiles
          });
        })
      });
    })
  })
}
