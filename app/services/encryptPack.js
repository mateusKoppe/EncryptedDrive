const encryptor = require('file-encryptor');
const Cryptr = require('cryptr');
const fs = require('fs');
const md5 = require('md5');

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
		let folderName = md5(md5(this._pack) + md5(this._key));
		return `${this.encryptDir}/${folderName}`;
	}

	get decryptedPack() {
		let folderName = md5(md5(this._pack) + md5(this._key));
		return `${this.decryptDir}/${folderName}`;
	}

	getDecryptedFiles (callback) {
		this._getFilesInFolder(this.decryptedPack, callback);
	}

	getEncryptedFiles (callback) {
		this._getFilesInFolder(this.encryptedPack, callback);
	}

	encrypt (files, callback) {
		this._createFolderIfNotExist(this.encryptDir);
		this._createFolderIfNotExist(this.encryptedPack);
		if(!files || !files.length){
			callback ? callback() : null;
			return;
		}
		files.forEach((file, index) => {
			const cryptr = new Cryptr(this._key);
			let fileName = cryptr.encrypt(file.originalname);
			encryptor.encryptFile(
				`./temp/${file.filename}`,
				`${this.encryptedPack}/${fileName}`,
				this._key,
				() => {
					fs.unlink(`./temp/${file.filename}`);
					if(index +1 === files.length){
						callback ? callback() : null;
					}
				}
			);
		});
	}

	decrypt (callback) {
		fs.readdir(this.encryptedPack, (err, files) => {
			if(!files || !files.length){
				callback ? callback() : null;
				return;
			}
			this._createFolderIfNotExist(this.decryptDir);
			this._createFolderIfNotExist(this.decryptedPack);
			files.forEach( (item, index) => {
				const cryptr = new Cryptr(this._key);
				const decryptedFileName = cryptr.decrypt(item);
				encryptor.decryptFile(
					`${this.encryptedPack}/${item}`,
					`${this.decryptedPack}/${decryptedFileName}`,
					this._key,
					() => {
						if(index + 1 === files.length){
							callback ? callback() : null;
						}
					}
				);
			});
		});
	}

	deleteDecryptedFiles(callback) {
		this._removeRecursiveFolder(this.decryptedPack, callback);
	}

	deleteEncryptedFiles(callback) {
		this.deleteDecryptedFiles(() => {
			this._removeRecursiveFolder(this.encryptedPack, callback);
		});
	}

	deleteFileInPack(file, callback) {
		const cryptr = new Cryptr(this._key);
		let fileNameEncrypted = cryptr.encrypt(file);
		this._deleteDecryptedFile(file);
		fs.unlinkSync(`${this.encryptedPack}/${fileNameEncrypted}`);
		callback();
	}

	renameFile(fileName, newName, callback) {
		const cryptr = new Cryptr(this._key);
		this._deleteDecryptedFile(fileName);
		let fileNameEncrypted = cryptr.encrypt(fileName);
		let newFileNameEncrypted = cryptr.encrypt(newName);
		fs.renameSync(
			`${this.encryptedPack}/${fileNameEncrypted}`,
			`${this.encryptedPack}/${newFileNameEncrypted}`
		);
		callback ? callback() : null;
	}

	getDencrypt(callback) {
		this.decrypt(() => {
			this.getDecryptedFiles(callback);
		});
	}

	/* Private function */

	_deleteDecryptedFile(file) {
		fs.unlinkSync(`${this.decryptedPack}/${file}`);
	}

	_getFilesInFolder(folder, callback) {
		let decryptedFiles = [];
		let files = [];
		if(fs.existsSync(folder)){
			files = fs.readdirSync(folder);
		}
		if(files && files.length){
			files.forEach(file => {
				decryptedFiles.push(`${folder}/${file}`);
			});
		}
		callback ? callback(decryptedFiles) : null;
	}

	_createFolderIfNotExist(folder) {
		if(!fs.existsSync(folder)){
			fs.mkdirSync(folder);
		}
	}

	_removeRecursiveFolder(folder, callback) {
		fs.readdir(folder, (err, files) => {
			if(files && files.length){
				files.forEach(file => fs.unlinkSync(`${folder}/${file}`));
			}
			if(fs.existsSync(folder)){
				fs.rmdirSync(folder);
			}
			callback ? callback() : null;
		});
	}

};
