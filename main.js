$(function () {
    //是否产生新元素
    var isNewRndItem = false;
    var gameScore = 0;
    //最高分
    var maxScore = 0;
    // 用户信息，从微信公众号获取
    var userInfo = {
        userId: '',
        name: '',
        className: '',
        isLoggedIn: false
    };

    // 禁用网页的上下左右滑动
    disablePageScroll();

    // 主题切换功能
    initThemeToggle();

    if (localStorage.maxScore) {
        maxScore = localStorage.maxScore - 0;
    } else {
        maxScore = 0;
    }

    //游戏初始化
    gameInit();

    // 微信接口初始化
    initWechatAPI();

    // 禁用网页滑动功能
    function disablePageScroll() {
        document.body.addEventListener('touchmove', function(e) {
            if (!$(e.target).closest('#gameBody').length) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 添加桌面端显示优化样式
        $('<style>')
            .prop('type', 'text/css')
            .html(`
                @media (min-width: 768px) {
                    .gameBoard {
                        max-width: 500px;
                        margin: 0 auto;
                    }
                    .item {
                        height: 100px;
                        line-height: 100px;
                        font-size: 36px;
                    }
                }
            `)
            .appendTo('head');
    }

    // 主题切换功能初始化
    function initThemeToggle() {
        // 设置默认主题为白色
        if (!localStorage.getItem('theme')) {
            localStorage.setItem('theme', 'light-theme');
        }
        
        // 检查本地存储中是否有主题设置
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            $('html').removeClass().addClass(savedTheme);
        } else {
            // 默认使用白色主题
            $('html').removeClass().addClass('light-theme');
        }

        // 主题切换按钮点击事件
        $('#themeToggle').click(function() {
            if ($('html').hasClass('light-theme')) {
                $('html').removeClass('light-theme').addClass('dark-theme');
                localStorage.setItem('theme', 'dark-theme');
            } else {
                $('html').removeClass('dark-theme').addClass('light-theme');
                localStorage.setItem('theme', 'light-theme');
            }
        });
    }

    // 排行榜按钮点击事件
    $('#showRankingBtn').click(function() {
        fetchRankingList();
        $('#gameOverModal').modal('hide');
        $('#rankingModal').modal('show');
    });

    // 主页排行榜按钮点击事件
    $('#rankingBtn').click(function() {
        fetchRankingList();
        $('#rankingModal').modal('show');
    });

    function refreshGame() {
        var items = $('.gameBoard .item');
        for (var i = 0; i < items.length; i++) {
            items.eq(i).html('').removeClass('nonEmptyItem').addClass('emptyItem');
            // 移除数字对应的 CSS 类
            removeNumberClasses(items.eq(i));
        }
        gameScore = 0;
        //分数清零
        $('#gameScore').html(gameScore);
        $('#finalScore').html(gameScore);
        //随机生成两个新元素
        newRndItem();
        newRndItem();
        //刷新颜色
        $('#gameOverModal').modal('hide');
        $('#rankingModal').modal('hide');
    }

    function getSideItem(currentItem, direction) {
        //当前元素的位置
        var currentItemX = currentItem.attr('x') - 0;
        var currentItemY = currentItem.attr('y') - 0;

        //根据方向获取旁边元素的位置
        switch (direction) {
            case 'left':
                var sideItemX = currentItemX;
                var sideItemY = currentItemY - 1;
                break;
            case 'right':
                var sideItemX = currentItemX;
                var sideItemY = currentItemY + 1;
                break;
            case 'up':
                var sideItemX = currentItemX - 1;
                var sideItemY = currentItemY;
                break;
            case 'down':
                var sideItemX = currentItemX + 1;
                var sideItemY = currentItemY;
                break;
        }
        //旁边元素
        var sideItem = $('.gameBoard .x' + sideItemX + 'y' + sideItemY);
        return sideItem;
    }

    function itemMove(currentItem, direction) {
        var sideItem = getSideItem(currentItem, direction);

        if (sideItem.length == 0) {//当前元素在最边上
            //不动

        } else if (sideItem.html() == '') { //当前元素不在最后一个且左（右、上、下）侧元素是空元素
            sideItem.html(currentItem.html()).removeClass('emptyItem').addClass('nonEmptyItem');
            // 设置数字对应的 CSS 类
            addNumberClass(sideItem);
            
            currentItem.html('').removeClass('nonEmptyItem').addClass('emptyItem');
            // 移除数字对应的 CSS 类
            removeNumberClasses(currentItem);
            
            itemMove(sideItem, direction);
            isNewRndItem = true;

        } else if (sideItem.html() != currentItem.html()) {//左（右、上、下）侧元素和当前元素内容不同
            //不动

        } else {//左（右、上、下）侧元素和当前元素内容相同
            //向右合并
            var newValue = (sideItem.html() - 0) * 2;
            sideItem.html(newValue);
            
            // 更新数字对应的 CSS 类
            removeNumberClasses(sideItem);
            addNumberClass(sideItem);
            
            currentItem.html('').removeClass('nonEmptyItem').addClass('emptyItem');
            // 移除数字对应的 CSS 类
            removeNumberClasses(currentItem);
            
            gameScore += newValue * 10;
            $('#gameScore').html(gameScore);
            $('#finalScore').html(gameScore);
            
            if (maxScore < gameScore) {
                maxScore = gameScore;
                $('#maxScore').html(maxScore);
                localStorage.maxScore = maxScore;
                
                // 如果用户已登录，则更新服务器上的最高分
                if (userInfo.isLoggedIn) {
                    updateUserScore(gameScore);
                }
            }
            isNewRndItem = true;
            return;
        }
    }

    // 添加数字对应的 CSS 类
    function addNumberClass(element) {
        var value = element.html();
        if (value) {
            element.addClass('item-' + value);
        }
    }

    // 移除所有数字相关的 CSS 类
    function removeNumberClasses(element) {
        element.removeClass(function(index, className) {
            return (className.match(/(^|\s)item-\d+/g) || []).join(' ');
        });
    }

    function move(direction) {
        //获取所有非空元素
        var nonEmptyItems = $('.gameBoard .nonEmptyItem');
        //如果按下的方向是左或上，则正向遍历非空元素
        if (direction == 'left' || direction == 'up') {
            for (var i = 0; i < nonEmptyItems.length; i++) {
                var currentItem = nonEmptyItems.eq(i);
                itemMove(currentItem, direction);
            }
        } else if (direction == 'right' || direction == 'down') {//如果按下的方向是右或下，则反向遍历非空元素
            for (var i = nonEmptyItems.length - 1; i >= 0; i--) {
                var currentItem = nonEmptyItems.eq(i);
                itemMove(currentItem, direction);
            }
        }

        //是否产生新元素
        if (isNewRndItem) {
            newRndItem();
            isNewRndItem = false;
        }
    }

    function isGameOver() {
        //获取所有元素
        var items = $('.gameBoard .item');
        //获取所有非空元素
        var nonEmptyItems = $('.gameBoard .nonEmptyItem');
        if (items.length == nonEmptyItems.length) {//所有元素的个数 == 所有非空元素的个数  即没有空元素
            //遍历所有非空元素
            for (var i = 0; i < nonEmptyItems.length; i++) {
                var currentItem = nonEmptyItems.eq(i);
                if (getSideItem(currentItem, 'up').length != 0 && currentItem.html() == getSideItem(currentItem, 'up').html()) {
                    //上边元素存在 且 当前元素中的内容等于上边元素中的内容
                    return;
                } else if (getSideItem(currentItem, 'down').length != 0 && currentItem.html() == getSideItem(currentItem, 'down').html()) {
                    //下边元素存在 且 当前元素中的内容等于下边元素中的内容
                    return;
                } else if (getSideItem(currentItem, 'left').length != 0 && currentItem.html() == getSideItem(currentItem, 'left').html()) {
                    //左边元素存在 且 当前元素中的内容等于左边元素中的内容
                    return;
                } else if (getSideItem(currentItem, 'right').length != 0 && currentItem.html() == getSideItem(currentItem, 'right').html()) {
                    //右边元素存在 且 当前元素中的内容等于右边元素中的内容
                    return;
                }
            }
            
            // 如果用户已登录，则更新服务器上的分数
            if (userInfo.isLoggedIn) {
                updateUserScore(gameScore);
            }
            
            $('#finalScore').html(gameScore);
            $('#gameOverModal').modal('show');
        } else {
            return;
        }
    }

    //游戏初始化
    function gameInit() {
        //初始化分数
        $('#gameScore').html(gameScore);
        $('#finalScore').html(gameScore);
        //最大分值
        $('#maxScore').html(maxScore);
        //为刷新按钮绑定事件
        $('.refreshBtn').click(refreshGame);
        //随机生成两个新元素
        newRndItem();
        newRndItem();
    }

    //随机生成新元素
    function newRndItem() {
        //随机生成新数字
        var newRndArr = [2, 2, 4];
        var newRndNum = newRndArr[getRandom(0, 2)];
        //随机生成新数字的位置
        var emptyItems = $('.gameBoard .emptyItem');
        if (emptyItems.length > 0) {
            var newRndSite = getRandom(0, emptyItems.length - 1);
            emptyItems.eq(newRndSite).html(newRndNum).removeClass('emptyItem').addClass('nonEmptyItem');
            
            // 添加数字对应的 CSS 类
            addNumberClass(emptyItems.eq(newRndSite));
        }
    }

    //产生随机数，包括min、max
    function getRandom(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    //刷新颜色
    function refreshColor() {
        var items = $('.gameBoard .item');
        for (var i = 0; i < items.length; i++) {
            // 已经在 addNumberClass 和 removeNumberClasses 中处理了
        }
    }

    // 电脑的方向键监听事件
    $('body').keydown(function (e) {
        switch (e.keyCode) {
            case 37:
                // left
                isNewRndItem = false;
                move('left');
                isGameOver();
                break;
            case 38:
                // up
                isNewRndItem = false;
                move('up');
                isGameOver();
                break;
            case 39:
                // right
                isNewRndItem = false;
                move('right');
                isGameOver();
                break;
            case 40:
                // down
                isNewRndItem = false;
                move('down');
                isGameOver();
                break;
        }
    });

    // 手机屏幕划动触发
    (function () {
        mobilwmtouch(document.getElementById("gameBody"))
        document.getElementById("gameBody").addEventListener('touright', function (e) {
            e.preventDefault();
            // alert("方向向右");
            isNewRndItem = false;
            move('right');
            isGameOver();
        });
        document.getElementById("gameBody").addEventListener('touleft', function (e) {
            // alert("方向向左");
            isNewRndItem = false;
            move('left');
            isGameOver();
        });
        document.getElementById("gameBody").addEventListener('toudown', function (e) {
            // alert("方向向下");
            isNewRndItem = false;
            move('down');
            isGameOver();
        });
        document.getElementById("gameBody").addEventListener('touup', function (e) {
            // alert("方向向上");
            isNewRndItem = false;
            move('up');
            isGameOver();
        });

        function mobilwmtouch(obj) {
            var stoux, stouy;
            var etoux, etouy;
            var xdire, ydire;
            obj.addEventListener("touchstart", function (e) {
                stoux = e.targetTouches[0].clientX;
                stouy = e.targetTouches[0].clientY;
                //console.log(stoux);
            }, false);
            obj.addEventListener("touchend", function (e) {
                etoux = e.changedTouches[0].clientX;
                etouy = e.changedTouches[0].clientY;
                xdire = etoux - stoux;
                ydire = etouy - stouy;
                chazhi = Math.abs(xdire) - Math.abs(ydire);
                //console.log(ydire);
                if (xdire > 0 && chazhi > 0) {
                    //console.log("right");
                    //alert(evenzc('touright',alerts));
                    obj.dispatchEvent(evenzc('touright'));

                } else if (ydire > 0 && chazhi < 0) {
                    //console.log("down");
                    obj.dispatchEvent(evenzc('toudown'));
                } else if (xdire < 0 && chazhi > 0) {
                    //console.log("left");
                    obj.dispatchEvent(evenzc('touleft'));
                } else if (ydire < 0 && chazhi < 0) {
                    //console.log("up");
                    obj.dispatchEvent(evenzc('touup'));
                }
            }, false);

            function evenzc(eve) {
                if (typeof document.CustomEvent === 'function') {

                    this.event = new document.CustomEvent(eve, {//自定义事件名称
                        bubbles: false,//是否冒泡
                        cancelable: false//是否可以停止捕获
                    });
                    if (!document["evetself" + eve]) {
                        document["evetself" + eve] = this.event;
                    }
                } else if (typeof document.createEvent === 'function') {


                    this.event = document.createEvent('HTMLEvents');
                    this.event.initEvent(eve, false, false);
                    if (!document["evetself" + eve]) {
                        document["evetself" + eve] = this.event;
                    }
                } else {
                    return false;
                }

                return document["evetself" + eve];

            }
        }
    })();

    // 微信公众号接口相关功能
    function initWechatAPI() {
        // 检查是否在微信环境中，且是否为河南农业大学微信公众号
        if (isWeixinBrowser()) {
            // 尝试获取用户信息
            fetchUserInfo();
        }
    }

    // 检查是否在微信浏览器中
    function isWeixinBrowser() {
        var ua = navigator.userAgent.toLowerCase();
        return ua.indexOf('micromessenger') !== -1;
    }

    // 获取用户信息
    function fetchUserInfo() {
        // 实际项目中，这里应该调用微信公众号的接口获取用户信息
        // 此处为模拟实现，实际开发时需替换为真实接口调用
        $.ajax({
            url: '/api/user/info',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.code === 0) {
                    userInfo = {
                        userId: response.data.userId,
                        name: response.data.name,
                        className: response.data.className,
                        isLoggedIn: true
                    };
                    
                    // 获取用户历史最高分
                    fetchUserMaxScore();
                }
            },
            error: function() {
                console.log('获取用户信息失败，可能未登录或不在微信公众号环境');
            }
        });
    }

    // 获取用户历史最高分
    function fetchUserMaxScore() {
        $.ajax({
            url: '/api/user/score',
            type: 'GET',
            data: {
                userId: userInfo.userId
            },
            dataType: 'json',
            success: function(response) {
                if (response.code === 0 && response.data.maxScore > maxScore) {
                    maxScore = response.data.maxScore;
                    localStorage.maxScore = maxScore;
                    $('#maxScore').html(maxScore);
                }
            }
        });
    }

    // 更新用户分数
    function updateUserScore(score) {
        $.ajax({
            url: '/api/user/score',
            type: 'POST',
            data: {
                userId: userInfo.userId,
                score: score
            },
            dataType: 'json',
            success: function(response) {
                if (response.code === 0) {
                    console.log('分数更新成功');
                }
            }
        });
    }

    // 获取排行榜
    function fetchRankingList() {
        $.ajax({
            url: '/api/ranking/list',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.code === 0) {
                    renderRankingList(response.data);
                }
            },
            error: function() {
                // 模拟数据，实际开发时删除此部分
                var mockData = [
                    { rank: 1, name: '张三', className: '计算机2001', score: 25600 },
                    { rank: 2, name: '李四', className: '农学2002', score: 20480 },
                    { rank: 3, name: '王五', className: '机械2003', score: 15360 },
                    { rank: 4, name: '赵六', className: '土木2001', score: 10240 },
                    { rank: 5, name: '孙七', className: '生物2002', score: 8192 }
                ];
                renderRankingList(mockData);
            }
        });
    }

    // 渲染排行榜
    function renderRankingList(data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var isCurrentUser = userInfo.isLoggedIn && userInfo.name === item.name;
            var rowClass = isCurrentUser ? 'currentUser' : '';
            
            html += '<tr class="' + rowClass + '">' +
                    '<td>' + item.rank + '</td>' +
                    '<td>' + item.name + '</td>' +
                    '<td>' + item.className + '</td>' +
                    '<td>' + item.score + '</td>' +
                    '</tr>';
        }
        $('#rankingBody').html(html);
    }
});