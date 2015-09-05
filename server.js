var express = require('express');
var app = express();
var server = require('http').createServer(app);
var SkyRTC = require('skyrtc').listen(server);
var path = require("path");

var fs = require('fs');
var morgan = require('morgan');
var multipart = require('connect-multiparty');

/*********** 通过 mongodb模块连接数据库    *****/
/*var MongoClient = require('mongodb').MongoClient,
	assert = require('assert');

var urlDb = 'mongodb://localhost:27017/myproject';

MongoClient.connect(urlDb, function(err, db) {
	assert.equal(null, err);
	console.log("Connected correctly to server");

	insertDocuments(db, function () {
		db.close();
	});
});

var insertDocuments = function (db, callback) {
	var collection = db.collection('document1');
	//noinspection JSDeprecatedSymbols
	collection.insert([{a : 1}, {b : 2}, {c : 3}], function (err, result) {
		assert.equal(err, null);
		assert.equal(3, result.result.n);
		assert.equal(3, result.ops.length);
		console.log("inserted 3 documents into the document collection");
		callback(result);
	});
}*/
/**************************/

/*********通过mongoose模块连接数据库************/
var mongoose = require('mongoose');
con = mongoose.connect('mongodb://localhost/test-new');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
	console.log("connect success  一次打开记录");
});

var kittySchema = mongoose.Schema({
	name: String
});

/*add methods must be added to schema before compiling it with mongoose.model*/
kittySchema.methods.speak = function () {
	var greeting = this.name
		? "Meow name is " + this.name
		: "I don't have a name";
	console.log(greeting);
};

var Kitten = mongoose.model('Kitten', kittySchema);
var fluffy = new Kitten({name: 'fluffy'});
fluffy.speak();

fluffy.save(function (err, fluffy) {
	if (err) return console.error(err);
	fluffy.speak();
});

/*Kitten.find(function (err, kittens) {
	if (err) return console.error(err);
	console.log(kittens);
})*/

var conditions = {name: 'fluffy'};

/*Kitten.remove(conditions, function (err, res) {
	if (err) return console.error(err);
	console.log("fluffy remove success");
});*/
/*Kitten.findOneAndRemove({name: 'fluffy'}, function (err, node) {
	if(!err) {
		console.log("remove ss")
	}
});*/

/*Kitten.remove({}, function (err) {
	console.log('collection removed');

});*/

mongoose.connection.on('open', function () {
	con.connection.db.dropCollection('Kitten');
});
/*******************/

var port = process.env.PORT || 3000;
/*PORT是系统环境为node.js配置的默认端口*/

server.listen(port, function () {
	console.log("port is: " + port);
});
app.use(express.static(path.join(__dirname)));
app.use(morgan('dev'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});
app.post('/upload', multipart(), function (req, res) {
	//get filename
	var filename = req.files.files.originalFilename || path.basename(req.files.files.ws.path);
	//copy file to a public directory
	var targetPath = path.dirname(__filename) + '/public/' + filename;
	console.log("targetPath:" + targetPath);

	console.log("file name: " + req.files.files.originalFilename);
	console.log(req.body, req.files);
	//copy file
	fs.createReadStream(req.files.files.path).pipe(fs.createWriteStream(targetPath));
	//return file url
	res.json({code: 200, msg: {url: 'http://' + req.headers.host + '/' + filename}});
});

app.get('/env', function(req, res){
	console.log("process.env.VCAP_SERVICES: ", process.env.VCAP_SERVICES);
	console.log("process.env.DATABASE_URL: ", process.env.DATABASE_URL);
	console.log("process.env.VCAP_APPLICATION: ", process.env.VCAP_APPLICATION);
	res.json({
		code: 200
		, msg: {
			VCAP_SERVICES: process.env.VCAP_SERVICES
			, DATABASE_URL: process.env.DATABASE_URL
		}
	});
});

SkyRTC.rtc.on('new_connect', function(socket) {
	console.log('创建新连接');
});

SkyRTC.rtc.on('remove_peer', function(socketId) {
	console.log(socketId + "用户离开");
});

SkyRTC.rtc.on('new_peer', function(socket, room) {
	console.log("新用户" + socket.id + "加入房间" + room);
});

SkyRTC.rtc.on('socket_message', function(socket, msg) {
	console.log("接收到来自" + socket.id + "的新消息：" + msg);
});

SkyRTC.rtc.on('ice_candidate', function(socket, ice_candidate) {
	console.log("接收到来自" + socket.id + "的ICE Candidate");
});

SkyRTC.rtc.on('offer', function(socket, offer) {
	console.log("接收到来自" + socket.id + "的Offer");
});

SkyRTC.rtc.on('answer', function(socket, answer) {
	console.log("接收到来自" + socket.id + "的Answer");
});

SkyRTC.rtc.on('error', function(error) {
	console.log("发生错误：" + error.message);
});