const upload = require('multer')({dest: 'temp/'});
const md5 = require('md5');
const EncryptPack = require('../services/encryptPack');

module.exports = function(app) {

	app.get('/', (req, res) => {
		if((req.session.pack) && (req.session.key)){
			const encryptPack = new EncryptPack(req.session.pack, req.session.key);
			encryptPack.getDencrypt(decryptedFiles => {
				res.render('files-manager', {
					decryptedFiles: decryptedFiles.map(_formatFileView)
				});
			});
		} else {
			res.render('index');
		}
	});

	app.post('/', upload.array('files'), (req, res) => {
		req.session.pack = md5(req.body.pack);
		req.session.key = md5(req.body.key);

		if(req.files){
			const encryptPack = new EncryptPack(req.session.pack, req.session.key);
			encryptPack.encrypt(req.files, () => {
				res.redirect('/');
			});
		}else{
			res.redirect('/');
		}
	});

	app.get('/encrypt-pack', (req, res) => {
		if((req.session.pack) && (req.session.key)){
			const encryptPack = new EncryptPack(req.session.pack, req.session.key);
			encryptPack.deleteDecryptedFiles(() => {
				_deleteSessionPack(req);
				res.redirect('/');
			});
		} else {
			res.redirect('/');
		}
	});

	app.get('/delete-pack', (req, res) => {
		if((req.session.pack) && (req.session.key)){
			const encryptPack = new EncryptPack(req.session.pack, req.session.key);
			encryptPack.deleteEncryptedFiles(() => {
				_deleteSessionPack(req);
				res.redirect('/');
			});
		}
	});

	function _deleteSessionPack(req) {
		delete req.session.pack;
		delete req.session.key;
	}

	function _formatFileView(file) {
		return {
			dir: file,
			name: _getLastPiece('/', file),
		};
	}

	function _getLastPiece(separator, value) {
		return value.split(separator).reverse()[0];
	}

};
