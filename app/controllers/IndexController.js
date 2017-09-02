const upload = require('multer')({dest: 'temp/'});
const md5 = require('md5');

module.exports = function(app) {

	app.get('/', (req, res) => {

		if((req.session.pack) && (req.session.password)){
			const encryptPack = app.services.encryptPack(req.session.pack, req.session.password);
			encryptPack.getDencrypt(unencryptedFiles => {
				_renderIndex(unencryptedFiles.map(_formatFileView));
			});
		} else {
			_renderIndex();
		}

		function _renderIndex(unencryptedFiles = []) {
			res.render('index/index', {unencryptedFiles});
		}

	});

	app.post('/', upload.array('files'), (req, res) => {
		req.session.pack = md5(req.body.pack);
		req.session.password = md5(req.body.password);

		if(req.files){
			const encryptPack = app.services.encryptPack(req.session.pack, req.session.password);
			encryptPack.encrypt(req.files, () => {
				res.redirect('/');
			});
		}else{
			res.redirect('/');
		}
	});

	app.get('/encrypt-pack', (req, res) => {
		if((req.session.pack) && (req.session.password)){
			const encryptPack = app.services.encryptPack(req.session.pack, req.session.password);
			encryptPack.deleteDecryptedFiles(() => {
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
