const multer = require('multer');
const upload = multer({dest: 'temp/'});

module.exports = function(app) {

	app.get('/', (req, res) => {
		res.render('index/index', {
			unencryptedFiles: []
		});
	});

	app.post('/', upload.array('files'), (req, res) => {
		const encryptPack = app.services.encryptPack(req.body.pack, req.body.password);
		let viewData = {
			unencryptedFiles: [],
		};

		if(req.files){
			encryptPack.encrypt(req.files, () => {
				res.render('index/index', viewData);
			});
		} else {
			encryptPack.getDencrypt(unencryptedFiles => {
				viewData.unencryptedFiles = unencryptedFiles.map(_formatFileView);
				res.render('index/index', viewData);
			});
		}
	});

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
