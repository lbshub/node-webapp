// -----------------------------------------------------------
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs'); //定义模板为.html格式

// -----------------------------------------------------------
var config = require('./config'); //配置 
var log = require('./lib/log'); //日志 
var routes = require('./routes/routes'); //路由

// ====================================================

var app = express();

// -----------------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.__express); //or app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

// -----------------------------------------------------------
log(app);  

// -----------------------------------------------------------
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// -----------------------------------------------------------
routes(app);

// 404
app.use(function(req, res) {
    res.render('error', {
        title: '页面不存在',
        message: '您访问的页面不存在。'
    });
});

app.listen(config.port, function() {
    console.log('服务已经启动，监听端口是：' + config.port);
});

module.exports = app;