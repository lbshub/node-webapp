
var index = require('./blogs').index; // 处理首页
var blogs = require('./blogs').blog; //处理

// ---------------------------------------------------------- 

module.exports = function(app) {
	app.get('/', index.run); 
	app.get('/blog', index.run);
	app.get('/good', index.run);
	app.get('/rank', index.run);
	app.get('/news', index.run);
	app.get('/search', index.run);
	app.get('/:page/:id', index.run);

	// ----------------------------------------------------------
	app.get('/show', blogs.list); //类别列表 返回json
	app.get('/detail', blogs.detail); //内容详情 返回json

	// ----------------------------------------------------------
};