let multer = require('multer');
let upload = multer({dest: 'temp/'});
let encryptor = require('file-encryptor');
let fs = require('fs');
let md5 = require('md5');

module.exports = function(app) {

	app.get('/', (req, res) => {
		res.render('index/index', {
			unencryptedFiles: []
		});
	});

	app.post('/', upload.array('files'), (req, res) => {
		const pack = md5(req.body.pack);
		const key = md5(req.body.password);

		let viewData = {
			unencryptedFiles: [],
		};

		if(req.files){
			_encryptFiles(req.files, pack, key, () => {
				res.render('index/index', viewData);
			});
		} else {
			_unencryptFiles(pack, key, () => {
				_readFiles(pack, (unencryptedFiles) => {
					viewData.unencryptedFiles = unencryptedFiles.map(file => ({
						dir: file,
						name: _getLastPiece('/', file),
					}));
					res.render('index/index', viewData);
				});
			});
		}

	});

	function _encryptFiles(files, pack, key, callback){
		files.forEach((file, index) => {
			const encryptDir = `./encrypted/${pack}`;
			encryptor.encryptFile(
				`./temp/${file.filename}`,
				`${encryptDir}/${file.originalname}`,
				key,
				() => {
					fs.unlink(`./temp/${file.filename}`);
					if(index +1 === files.length){
						callback();
					}
				}
			);
		});
	}

	function _unencryptFiles(pack, key, callback){
		const encryptedFiles = `./encrypted/${pack}`;
		const unencryptedFiles = `./static/unencrypted/${pack}`;
		fs.readdir(encryptedFiles, (err, files) => {

			if(!files){
				callback();
				return;
			}

			_createFoldeIfNotExist(unencryptedFiles);

			files.forEach( (item, index) => {
				encryptor.decryptFile(`${encryptedFiles}/${item}`, `${unencryptedFiles}/${item}`, key, () => {
					if(index + 1 === files.length){
						callback();
					}
				});
			});
		});
	}

	function _readFiles(pack, callback){
		const filesDir = `./static/unencrypted/${pack}/`;
		let unencryptedFiles = [];
		fs.readdir(filesDir, (err, files) => {
			if(!files.length){
				callback([]);
				return;
			}
			files.forEach((file, index) => {
				unencryptedFiles.push(`unencrypted/${pack}/${file}`);
				if(index +1 === files.length){
					callback(unencryptedFiles);
				}
			});
		});
	}

	function _createFoldeIfNotExist(folder) {
		if(!fs.existsSync(folder)){
			fs.mkdirSync(folder);
		}
	}

	function _getLastPiece(separator, value) {
		return value.split(separator).reverse()[0];
	}

};
