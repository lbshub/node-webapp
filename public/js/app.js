 (function(){
    
    // ------------------------------------------

    var App = window.App = {};
    _.extend(App, Backbone.Events);

    // ------------------------------------------

    _.extend(App, {
        cache: {},
        exports: {},
        define: function(name, model) {
            App.exports[name] = model;
        },
        require: function(name) {
            // if (name in App.exports) return App.exports[name]; //000
            if (name in App.cache) return App.cache[name];
            if (name in App.exports) return App.cache[name] = App.exports[name]();
            throw 'Can\'t find module ' + name;
        },
        use: function(name) {
            // var model = App.require(name); // 000
            // App.cache[name] = model(); // 000
            App.require(name);
            return this;
        }
    });

    var define = App.define;
    var require = App.require;

    // ------------------------------------------

    App.store = {};
    _.extend(App.store, {
        cache: {},
        set: function(i, d) {
            !this.cache[i] && (this.cache[i] = []);
            this.cache[i].push(d);
        },
        get: function(i) {
            return this.cache[i];
        }
    });

    App.animate = {};
    _.extend(App.animate, {
        forward: function($el, cb) {
            var e = $el,
                p = e.prev();
            if (!p.length) return;
            p.addClass('animate-pt moveToLeft');
            e.addClass('animate-pt moveFormRight');
            setTimeout(function() {
                p.addClass('animate-moveToLeft');
                e.addClass('animate-moveFormRight').one('webkitAnimationEnd', function() {
                    p.removeClass('animate-pt moveToLeft animate-moveToLeft').remove();
                    e.removeClass('animate-pt moveFormRight animate-moveFormRight');
                    cb && cb();
                });
            }, 100);
        },
        back: function($el, cb) {
            var e = $el,
                p = e.prev();
            if (!p.length) return;
            p.addClass('animate-pt moveToRight');
            e.addClass('animate-pt moveFormLeft');
            setTimeout(function() {
                p.addClass('animate-moveToRight');
                e.addClass('animate-moveFormLeft').one('webkitAnimationEnd', function() {
                    p.removeClass('animate-pt moveToRight animate-moveToRight').remove();
                    e.removeClass('animate-pt moveFormLeft animate-moveFormLeft');
                    cb && cb();
                    // App.event.toggle(App.type);
                });
            }, 100);
        }
    });

    App.loading = {};
    _.extend(App.loading, {
        load: $('.loading'),
        show: function() {
            this.load.show();
        },
        hide: function() {
            this.load.hide();
        }
    });

    App.event = {};
    _.extend(App.event, {
        getType: function(type) {
            var types = {
                'blog': '博客',
                'good': '精华',
                'rank': '48小时阅读排行',
                'news': '新闻',
                'search': '搜索'
            };
            return types[type];
        },
        setTitle: function(type) {
            $('title').text(this.getType(type));
        },
        setHead: function(type) {
            $('.title').text(this.getType(type));
        },
        toggle: function(type) {
            $('.nav li').each(function(i, el) {
                $(el).attr('data-target') == type ? $(el).addClass('current') : $(el).removeClass('current');
            });
        },
        navigate: function() {
            $('.app').delegate('[data-target]', 'click', function(e) {
                e.stopPropagation();
                var self = $(this);
                var type = self.attr('data-target');
                // console.log( type + '=================000' )
                switch (type) {
                    case 'blog':
                    case 'good':
                    case 'rank':
                    case 'news':
                        return setTab();
                    case 'search':
                        return setSearch();
                    case 'back':
                        return history.back();
                    case 'more':
                        return setMore();
                    default:
                        setTarget();
                };

                function setTab() {
                    if (self.hasClass('current')) return;
                    App.part = true;
                    App.more = false;
                    setNavigate();
                }

                function setMore() {
                    App.more = true;
                    App.part = true;
                    var count = parseInt(Math.floor(self.prev('.list-content').find('li').length / 20)) + 1;
                    App.loading.show();
                    App.controller.list(App.type, count);
                }

                function setTarget() {
                    App.part = false;
                    App.more = false;
                    App.title = self.find('h3').text();
                    setNavigate();
                }

                function setSearch() {
                    App.part = false;
                    App.more = false;
                    setNavigate();
                }

                function setNavigate() {
                    App.router.navigate(type, {
                        trigger: true
                    });
                }

            });
        }
    });

    // 反转义
    App.escape2Html = function(str) {
        var arrEntities = {
            'lt': '<',
            'gt': '>',
            'nbsp': ' ',
            'amp': '&',
            'quot': '"'
        };
        return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) {
            return arrEntities[t];
        });
    };

    App.part = true;
    App.more = false;

    // App.type //分类类型
    // App.part //局部渲染
    // App.more //加载更多
    // App.title //标题

    // -------------------------------------

    App.define('model/detail', function() {
        var detail = Backbone.Model.extend({
            defaults: {},
            fetch: function(id) {
                // console.log( 'ok fetch!' + '====================01')
                var self = this,
                    renderDetail = function(data) {
                        self.set({
                            id: Date.now() || +new Date(), //增加一个变动的值 确保model每次set触发change事件
                            title: data.title || id,
                            content: App.escape2Html(data.content)
                        });
                    };
                if (App.store.get('detail' + id)) {
                    // console.log( 'ok fetch!' + '====================02')
                    renderDetail(App.store.get('detail' + id)[0]);
                    return this;
                }
                $.ajax({
                    url: '/detail?id=' + id,
                    type: 'GET',
                    dataType: 'json',
                    success: function(data) {
                        var detailData = {
                            title: App.title,
                            content: data.content
                        };
                        App.store.set('detail' + id, detailData);
                        renderDetail(detailData);
                    }
                });
            }
        });
        return new detail();
    });
    App.define('view/detail', function() {
        var model = require('model/detail');
        var detailView = Backbone.View.extend({
            className: 'page-detail',
            initialize: function() {
                this.listenTo(this.model, 'change', this.render);
            },
            render: function() {
                window.scrollTo(0, 0);
                var data = this.model.toJSON();
                $(this.el).html(template('template-detail', data)).appendTo('.app');
                App.loading.hide();
                App.animate.forward($(this.el));
                return this;
            }
        });
        return new detailView({
            model: model
        });
    });

    App.define('collection/list', function() {
        var listCollection = Backbone.Collection.extend({
            fetch: function(type, count) {
                App.type = type;
                var self = this,
                    count = count || 1,
                    renderList = function(data) {
                        // console.log(self.length+'===============001')
                        self.remove(self.models);
                        // console.log(self.length+'===============002')
                        _.each(data, function(item, i) {
                            self.add(item);
                        });
                        self.trigger('GetList');
                    };
                if (App.store.get(type)) {
                    if (!App.more) {
                        var n = [],
                            o = App.store.get(type);
                        _.each(o, function(item, i) {
                            n.push.apply(n, item);
                        });
                        renderList(n);
                        return this;
                    }
                }
                $.ajax({
                    url: '/show?pageType=' + type + '&count=' + count,
                    dataType: 'json',
                    cache: false,
                    success: function(data) {
                        App.store.set(type, data);
                        renderList(data);
                    }
                });
            }
        });
        return new listCollection();
    });
    App.define('view/list', function() {
        var list = require('collection/list');
        var listView = Backbone.View.extend({
            className: 'page-list',
            initialize: function() {
                this.collection.on('GetList', this.render, this);
            },
            render: function() {
                var isBlog = false;
                var isGood = false;
                var isRank = false;
                var isNews = false;
                App.title = App.event.getType(App.type);
                switch (App.type) {
                    case 'blog':
                        isBlog = true;
                        break;
                    case 'good':
                        isGood = true;
                        break;
                    case 'rank':
                        isRank = true;
                        break;
                    case 'news':
                        isNews = true;
                        break;
                };
                var data = {
                    isBlog: isBlog,
                    isGood: isGood,
                    isRank: isRank,
                    isNews: isNews,
                    type: App.type,
                    title: App.title,
                    list: this.collection.toJSON()
                };
                App.loading.hide();
                App.event.setTitle(App.type);
                if (App.part) {
                    App.event.setHead(App.type);
                    App.event.toggle(App.type);
                    !App.more ? $('.list-content').html(template('list', data)) : $('.list-content').append(template('list', data));
                } else {
                    $('.app').append($(this.el).html(template('template-list', data)));
                    App.animate.back($(this.el));
                }
                return this;
            }
        });
        return new listView({
            collection: list
        });
    });

    App.define('view/search', function() {
        var searchView = Backbone.View.extend({
            className: 'page-search',
            events: {
                'click .btn-search': 'getSearch',
                'input #i-text': 'setSearch',
                'keypress #i-text': 'searchOnEnter'
            },
            render: function() {
                window.scrollTo(0, 0);
                $(this.el).html(template('template-search')).appendTo('.app');
                App.loading.hide();
                App.event.setTitle('search');
                App.animate.forward($(this.el), function() {
                    $('#i-text').focus();
                });
                this.delegateEvents();
                return this;
            },
            setSearch: function() {
                $('#i-text').val().trim().length > 0 ? $('.btn-back').hide() : $('.btn-back').show();
            },
            getSearch: function(e) {
                e.stopPropagation();
                App.loading.show();
                App.controller.searchList('search', $('#i-text').val().trim());
            },
            searchOnEnter: function(e) {
                if (e.keyCode == 13) this.getSearch(e);
            }
        });
        return new searchView();
    });

    App.define('collection/searchList', function() {
        var searchListCollection = Backbone.Collection.extend({
            fetch: function(type, key, count) {
                var self = this,
                    count = count || 1,
                    renderList = function(data) {
                        self.remove(self.models);
                        _.each(data, function(item, i) {
                            self.add(item);
                        });
                        self.trigger('GetSearchList');
                    };
                $.ajax({
                    url: '/show?pageType=' + type + '&key=' + key + '&count=' + count,
                    dataType: 'json',
                    cache: false,
                    success: function(data) {
                        renderList(data);
                    }
                });
            }
        });
        return new searchListCollection();
    });
    App.define('view/searchList', function() {
        var list = require('collection/searchList');
        var searchListView = Backbone.View.extend({
            tagName: 'ul',
            className: 'list-content',
            initialize: function() {
                this.collection.on('GetSearchList', this.render, this);
            },
            render: function() {
                var data = {
                    type: 'search',
                    list: this.collection.toJSON()
                };
                App.loading.hide();
                $(this.el).html(template('list', data)).appendTo('.search-content');
                return this;
            }
        });
        return new searchListView({
            collection: list
        });
    });

    App.use('model/detail').use('collection/list').use('view/list').use('view/detail').use('view/search').use('collection/searchList').use('view/searchList');

    App.controller = {};
    _.extend(App.controller, {
        list: function(type, count) {
            var count = count || 1;
            var list = require('collection/list');
            list.fetch(type, count);
        },
        detail: function(id) {
            var detail = require('model/detail');
            detail.fetch(id);
        },
        search: function() {
            var view = require('view/search');
            view.render();
        },
        searchList: function(type, key, count) {
            var count = count || 1;
            var list = require('collection/searchList');
            list.fetch(type, key, count);
        }
    });

    // 路由
    var Router = Backbone.Router.extend({
        routes: {
            '': 'all',
            ':page': 'all',
            ':page/:id': 'all',
            ':page/': 'all',
            ':page/:id/': 'all'
        },
        all: function(page, id) {
            var type = location.pathname.split('/')[1];
            var id = id || location.pathname.split('/')[2];
            var self = this;
            var detail = function(id) {
                App.part = false;
                App.more = false;
                App.controller.detail(id);
            };
            var list = function(type) {
                if (parseInt(id) > 0) return detail(id);
                App.controller.list(type);
            };
            var search = function() {
                App.part = false;
                App.more = false;
                App.controller.search();
            };
            App.loading.show();
            type == '' && (type = 'blog');
            switch (type) {
                case 'blog':
                case 'good':
                case 'rank':
                case 'news':
                    list(type);
                    break;
                case 'search':
                    search();
                    break;
            };
        }
    });

    // -------------------------------------

    $(function(){
        var initEvent = function() {
            App.event.navigate();
        };
        App.router = new Router();
        Backbone.history.start({
            pushState: true,
            hashChange: false
        });
        initEvent();
        FastClick.attach(document.body);
    });

    // -------------------------------------

 }());
