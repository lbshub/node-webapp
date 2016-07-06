var config = require('../config');
var mysql = require('mysql');
var db = mysql.createConnection({
	host: config.db_host,
	user: config.db_user,
	password: config.db_password,
	database: config.db_database
});
db.connect(function(err) {
	if (err) {
		console.error('error connecting: ' + err.stack);
		return;
	}
	console.log('数据库已经连接，thread ID是 ' + db.threadId);
});
// db.end();

module.exports = db;

// exports.query = function(sql, callback) {
// 	db.query(sql, callback);
// }

// -------------------------------------------

// 断开 自动连接
/*
var mysql = require('mysql');
var db = null;
function connect() {
	db = mysql.createConnection({
		host: config.db_host,
		user: config.db_user,
		password: config.db_password,
		database: config.db_database
	});
	db.connect(handleError);
	db.on('error', handleError);
}
function handleError(err) {
	if (err) {
		// 如果是连接断开，自动重新连接
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			connect();
		} else {
			console.error('error connecting: ' + err.stack);
		}
		return;
	}
	console.log('数据库已经连接，thread ID是 ' + db.threadId);
}
connect();
module.exports = db;
*/

// =======================================================

// 连接池
/*
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 10,
	host: config.db_host,
	user: config.db_user,
	password: config.db_password
});
pool.getConnection(function(err, db) {
	db.query(sql,function(){
		// 
		// db.release();
	});
});
*/




