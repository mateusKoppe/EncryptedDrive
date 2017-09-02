const encryptor = require('file-encryptor');
const Cryptr = require('cryptr');
const fs = require('fs');

module.exports = function () {
	return function (pack = '', key = '') {
		let encryptDir = './encrypted';
		let unencryptDir = './static/unencrypted';
		let encryptedPack = `${encryptDir}/${pack}`;

		let factory = {
			set pack(value) {
				pack = value;
				encryptedPack = `${encryptDir}/${pack}`;
			},
			set key(value) {
				key = value;
			},
			readFiles,
			encrypt,
			decrypt,
			deleteDecryptedFiles,
			getDencrypt,
		};

		return factory;

		function readFiles (callback) {
			const filesDir = `${unencryptDir}/${pack}/`;
			let unencryptedFiles = [];
			fs.readdir(filesDir, (err, files) => {
				if(!files || !files.length){
					callback([]);
					return;
				}
				files.forEach((file, index) => {
					unencryptedFiles.push(`${filesDir}/${file}`);
					if(index +1 === files.length){
						callback(unencryptedFiles);
					}
				});
			});
		}

		function encrypt (files, callback) {
			files.forEach((file, index) => {
				const cryptr = new Cryptr(key);
				let fileName = cryptr.encrypt(file.originalname);
				_createFolderIfNotExist(encryptedPack);
				encryptor.encryptFile(
					`./temp/${file.filename}`,
					`${encryptedPack}/${fileName}`,
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

		function decrypt (callback) {
			const unencryptedFiles = `${unencryptDir}/${pack}`;
			fs.readdir(encryptedPack, (err, files) => {

				if(!files){
					callback();
					return;
				}

				_createFolderIfNotExist(unencryptedFiles);

				files.forEach( (item, index) => {
					const cryptr = new Cryptr(key);
					const decryptedFileName = cryptr.decrypt(item);
					encryptor.decryptFile(`${encryptedPack}/${item}`, `${unencryptedFiles}/${decryptedFileName}`, key, () => {
						if(index + 1 === files.length){
							callback();
						}
					});
				});
			});
		}

		function deleteDecryptedFiles(callback) {
			readFiles(files => {
				files.forEach(file =>fs.unlinkSync(file));
				fs.rmdirSync(`${unencryptDir}/${pack}`);
				callback();
			});
		}

		function getDencrypt (callback) {
			decrypt(() => {
				readFiles(callback);
			});
		}

		function _createFolderIfNotExist(folder) {
			if(!fs.existsSync(folder)){
				fs.mkdirSync(folder);
			}
		}

	};
};
