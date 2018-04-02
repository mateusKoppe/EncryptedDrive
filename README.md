# EncryptedDrive

An open source alternative to Dropbox that encrypt all files and don't need any database.

This project was made just for study purposes, so it may have bug, so feel free to open issues or send pull requests.

## Install
For this project you'll need to have [node and npm](https://nodejs.org/en/) and [bower](https://bower.io/) in your computer.

First clone the project and enter into the folder:
```
git clone https://github.com/mateusKoppe/EncryptedDrive &&
cd EncryptedDrive
```

Now instal the dependencies:
```
npm install
bower install
```

I know you don't like bower, but this is just for separete the server dependencies from the front-end dependencies, it'll work.

## Start
To start the server just run:
```
npm start
```
This is it, nothing more is needed to setup the project.

The default port is 3030, if you want to use another port you can run:
```
HTTP_PORT=<port> npm start
```

## Development
If you want to change some code start the server in dev mode, just run:
```
npm run dev
```

To use the linter run:
```
npm run linter
```

## Contributing
If something is wrong feel free to open an issues, you can send PR's if you want. You can use this project you whatever you want.