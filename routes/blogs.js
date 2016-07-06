var request = require('request');
var cheerio = require('cheerio');

// ----------------------------------------------------------
var App = {};

App.urls = {
	blog: 'http://wcf.open.cnblogs.com/blog/sitehome/paged/',
	rank48hours: 'http://wcf.open.cnblogs.com/blog/48HoursTopViewPosts/',
	rank10days: 'http://wcf.open.cnblogs.com/blog/TenDaysTopDiggPosts/',
	detail: 'http://wcf.open.cnblogs.com/blog/post/body/',
	good: 'http://www.cnblogs.com/mvc/AggSite/PostList.aspx?CategoryType=%22Picked%22&ItemListActionName=%22PostList%22&ParentCategoryId=0&CategoryId=-2&PageIndex=',
	news: 'http://www.cnblogs.com/mvc/AggSite/NewsList.aspx?CategoryType=%22News%22&ItemListActionName=%22NewsList%22&CategoryId=-1&ParentCategoryId=0&PageIndex=',
	search: 'http://zzk.cnblogs.com/s?t=b&w='
};
// var key = 'node.js', page = 1;
// var url = 'http://zzk.cnblogs.com/s?t=b&w='+ key +'&p='+ page;

App.formatHtmlID = function(url) {
	// return url.replace(/\D/g, '').trim();
	return url.slice(url.lastIndexOf('/') + 1).replace(/\D/g, '').trim() || 0;
};
App.formatHtmlTime = function(text) {
	return text.slice(text.indexOf('发布于') + 3, text.lastIndexOf('评论')).trim();
};

App.parseHtmlData = function(url, count, res) {
	var count = count || 1;
	var url = url + count;
	var arr = [];
	request(encodeURI(url), function(err, ares) {
		if (err) return console.log(err);
		var $ = cheerio.load(ares.body.toString());
		$('.post_item').each(function() {
			var info = {
				id: App.formatHtmlID($(this).find('.titlelnk').attr('href')), // 文章ID
				title: $(this).find('.titlelnk').text().trim(), // 文章标题
				link: $(this).find('.titlelnk').attr('href').trim(), // 文章链接
				summary: $(this).find('.post_item_summary').text().trim(), // 文章简介
				author: $(this).find('.lightblue').text().trim(), // 文章作者
				time: App.formatHtmlTime($(this).find('.post_item_foot').text()).trim(), // 文章发布时间
				view: $(this).find('.article_view').text().replace(/\D/g,'').trim(), // 文章查看次数
				comment: $(this).find('.article_comment').text().replace(/\D/g,'').trim(), // 文章评论次数
				diggs: $(this).find('.diggit').text().replace(/\D/g,'').trim() // 文章推荐数
			};
			arr.push(info);
		});
		res.json(arr);
	});
};
App.parseXmlData = function(url, count, res) {
	var url = url + count;
	var arr = [];
	request(encodeURI(url), function(err, ares) {
		if (err) return console.log(err);
		var $ = cheerio.load(ares.body.toString());
		$('entry').each(function() {
			var info = {
				id: $(this).find('id').text(), // 文章ID
				title: $(this).find('title').text(), // 文章标题
				link: $(this).find('link').attr('href'), // 文章链接
				summary: $(this).find('summary').text(), // 文章简介
				author: $(this).find('author').find('name').text(), // 文章作者
				time: $(this).find('updated').text().replace(/[a-zA-Z]/ig, ' '), // 文章发布时间
				view: $(this).find('views').text(), // 文章阅读数
				comment: $(this).find('comments').text(), // 文章评论数
				diggs: $(this).find('diggs').text() // 文章推荐数
			};
			arr.push(info);
		});
		res.json(arr);
	});
};

App.parseHtmlDetail = function(url, res) {
	request(encodeURI(url), function(err, ares) {
		if (err) return console.log(err);
		var $ = cheerio.load(ares.body.toString());
		var o = {
			title: $('.postTitle').text(),
			content: $('#cnblogs_post_body').html()
		};
		res.json(o);
	});
};
App.parseXmlDetail = function(url, res) {
	request(encodeURI(url), function(err, ares) {
		if (err) return console.log(err);
		var $ = cheerio.load(ares.body.toString());
		var o = {
			content: $('string').html()
		};
		res.json(o);
	});
};

App.parseHtmlSearch = function(url, key, count, res) {
	var count = count || 1;
	var url = url + key + '&p=' + count;
	var arr = [];
	request(encodeURI(url), function(err, ares) {
		if (err) return console.log(err);
		var $ = cheerio.load(ares.body.toString());
		$('.searchItem').each(function() {
			var info = {
				id: App.formatHtmlID($(this).find('.searchItemTitle a').attr('href')), // 文章ID
				title: $(this).find('.searchItemTitle a').text().trim(), // 文章标题
				link: $(this).find('.searchItemTitle a').attr('href').trim(), // 文章链接
				summary: $(this).find('.searchCon').text().trim(), // 文章简介
				author: $(this).find('.searchItemInfo-userName a').text().trim(), // 文章作者
				time: $(this).find('.searchItemInfo-publishDate').text().trim(), // 文章发布时间
				view: $(this).find('.searchItemInfo-views').text().replace(/\D/g, '').trim(), // 文章查看次数
				comment: $(this).find('.searchItemInfo-comments').text().replace(/\D/g, '').trim(), // 文章评论次数
				diggs: $(this).find('.searchItemInfo-good').text().replace(/\D/g, '').trim() // 文章推荐数
			};
			arr.push(info);
		});
		res.json(arr);
	});
};

// ----------------------------------------------------------

App.index = {};
App.index.run = function(req, res) {
	var path = req.path;
	var type = path.split('/')[1];
	// console.log(type +'==================01')
	var render = function(type, title) {
		res.render('index', {
			type: type,
			title: title
		});
	};
	switch (type) {
		case '':
		case 'index':
		case 'blog':
			render('blog', '博客');
			break;
		case 'good':
			render('good', '精华');
			break;
		case 'rank':
			render('rank', '48小时阅读排行');
			break;
		case 'news':
			render('news', '新闻');
			break;
		case 'search':
			render('search', '搜索');
	};
};

// ----------------------------------------------------------

App.blog = {};
App.blog.list = function(req, res) {
	var type = req.query.pageType;
	var count = req.query.count || 1;
	var key = req.query.key || '';
	// console.log( type +'=============='+ count )
	switch (type) {
		case 'blog':
			App.parseXmlData(App.urls.blog, count + '/20', res);
			// App.parseHtmlData(App.urls.blog, count, res);
			break;
		case 'good':
			App.parseHtmlData(App.urls.good, count, res);
			break;
		case 'rank':
			// App.parseHtmlData(App.urls.rank, count, res);
			App.parseXmlData(App.urls.rank48hours, 60, res);
			break;
		case 'news':
			// App.parseHtmlData(App.urls.news, count, res);
			App.parseXmlData(App.urls.rank10days, 100, res);
			break;
		case 'search':
			App.parseHtmlSearch(App.urls.search, key, count, res);
			break;
	}
};
App.blog.detail = function(req, res) {
	var id = req.query.id || 0;
	App.parseXmlDetail(App.urls.detail + id, res);
};

// ----------------------------------------------------------

module.exports = App;