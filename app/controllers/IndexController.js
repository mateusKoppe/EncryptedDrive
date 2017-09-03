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

	app.post('/access-path', (req, res) => {
		req.session.pack = md5(req.body.pack);
		req.session.key = md5(req.body.key);

		res.redirect('/');
	});

	app.get('/delete-file/:fileName', (req, res) => {
		const encryptPack = new EncryptPack(req.session.pack, req.session.key);
		encryptPack.deleteFileInPack(req.params.fileName, () => {
			res.redirect('/');
		});
	});

	app.post('/add-files', (upload.array('files')), (req, res) => {
		const encryptPack = new EncryptPack(req.session.pack, req.session.key);
		encryptPack.encrypt(req.files, () => {
			res.redirect('/');
		});
	});

	app.get('/encrypt-folder', (req, res) => {
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

	app.get('/delete-folder', (req, res) => {
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
			dir: file.split('/').slice(2).join('/'),
			name: _getLastPiece('/', file),
		};
	}

	function _getLastPiece(separator, value) {
		return value.split(separator).reverse()[0];
	}

};
