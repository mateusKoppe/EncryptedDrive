const encryptor = require('file-encryptor');
const Cryptr = require('cryptr');
const fs = require('fs');

module.exports = class EncryptPack{

	constructor (pack = '', key = '') {
		this._pack = pack;
		this._key = key;
		this.encryptDir = './encrypted';
		this.decryptDir = './static/unencrypted';
	}

	set pack(value) {
		this._pack = value;
	}

	set key(value) {
		this._key = value;
	}

	get encryptedPack() {
		return `${this.encryptDir}/${this._pack}`;
	}

	getDecryptedFiles (callback) {
		const filesDir = `${this.decryptDir}/${this._pack}`;
		let decryptedFiles = [];
		fs.readdir(filesDir, (err, files) => {
			if(!files || !files.length){
				callback([]);
				return;
			}
			files.forEach((file, index) => {
				decryptedFiles.push(`${filesDir}/${file}`);
				if(index +1 === files.length){
					callback(decryptedFiles);
				}
			});
		});
	}

	getEncryptedFiles (callback) {
		const filesDir = `${this.encryptDir}/${this._pack}`;
		let encryptedFiles = [];
		fs.readdir(filesDir, (err, files) => {
			if(!files || !files.length){
				callback([]);
				return;
			}
			files.forEach((file, index) => {
				encryptedFiles.push(`${filesDir}/${file}`);
				if(index +1 === files.length){
					callback(encryptedFiles);
				}
			});
		});
	}

	encrypt (files, callback) {
		files.forEach((file, index) => {
			const cryptr = new Cryptr(this._key);
			let fileName = cryptr.encrypt(file.originalname);
			this._createFolderIfNotExist(this.encryptedPack);
			encryptor.encryptFile(
				`./temp/${file.filename}`,
				`${this.encryptedPack}/${fileName}`,
				this._key,
				() => {
					fs.unlink(`./temp/${file.filename}`);
					if(index +1 === files.length){
						callback();
					}
				}
			);
		});
	}

	decrypt (callback) {
		const unencryptedFiles = `${this.decryptDir}/${this._pack}`;
		fs.readdir(this.encryptedPack, (err, files) => {

			if(!files || !files.length){
				callback();
				return;
			}

			this._createFolderIfNotExist(unencryptedFiles);

			files.forEach( (item, index) => {
				const cryptr = new Cryptr(this._key);
				const decryptedFileName = cryptr.decrypt(item);
				encryptor.decryptFile(`${this.encryptedPack}/${item}`, `${unencryptedFiles}/${decryptedFileName}`, this._key, () => {
					if(index + 1 === files.length){
						callback();
					}
				});
			});
		});
	}

	deleteDecryptedFiles(callback) {
		this.getDecryptedFiles(files => {
			files.forEach(file => fs.unlinkSync(file));
			fs.rmdirSync(`${this.decryptDir}/${this._pack}`);
			callback();
		});
	}

	deleteEncryptedFiles(callback){
		this.deleteDecryptedFiles(() => {
			this.getEncryptedFiles(files => {
				files.forEach(file => fs.unlinkSync(file));
				fs.rmdirSync(`${this.encryptDir}/${this._pack}`);
				callback();
			});
		});
	}

	getDencrypt (callback) {
		this.decrypt(() => {
			this.getDecryptedFiles(callback);
		});
	}

	_createFolderIfNotExist(folder) {
		if(!fs.existsSync(folder)){
			fs.mkdirSync(folder);
		}
	}

};
