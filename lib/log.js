var logger = require('morgan');
var fs = require('fs');
var accessLog = fs.createWriteStream('./log/access.log', {
	flags: 'a'
});
var errorLog = fs.createWriteStream('./log/error.log', {
	flags: 'a'
});
module.exports = function(app) {
	// app.use(logger('dev')); //cmd控制台输出
	app.use(logger('combined', {
		stream: accessLog,
		skip: function (req, res) { return res.statusCode < 400 }
	})); // 写入日志
};