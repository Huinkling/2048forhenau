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

    // 禁用网页滑动功能并设置样式
    function disablePageScroll() {
        // 方法3：通过CSS固定body
        $('<style>')
            .prop('type', 'text/css')
            .html(`
                html, body {
                    position: relative !important;
                    width: 100% !important;
                    height: 100% !important;
                    overflow: auto !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .container {
                    padding: 15px !important;
                    max-width: 100% !important;
                }
                .main {
                    text-align: center !important;
                }
                .gameName {
                    font-size: 28px !important;
                    margin-bottom: 10px !important;
                    font-weight: bold !important;
                }
                .maxScore {
                    font-size: 18px !important;
                    margin-bottom: 20px !important;
                }
                /* 游戏棋盘布局 */
                #gameBody.gameBoard, .gameBoard {
                    background-color: rgba(0,0,0,0.1) !important;
                    border-radius: 10px !important;
                    padding: 15px !important;
                    margin: 0 auto !important;
                    touch-action: none !important;
                    display: grid !important;
                    grid-template-columns: repeat(4, 1fr) !important;
                    grid-template-rows: repeat(4, 1fr) !important;
                    grid-gap: 10px !important;
                    width: 300px !important;
                    max-width: 90% !important;
                    box-sizing: border-box !important;
                    float: none !important;
                }
                #gameBody .row {
                    display: flex !important;
                    margin: 0 !important; 
                    padding: 0 !important;
                    width: 100% !important;
                }
                #gameBody .item, .gameBoard .item {
                    background-color: rgba(255,255,255,0.3) !important;
                    border-radius: 5px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 24px !important;
                    font-weight: bold !important;
                    aspect-ratio: 1/1 !important;
                    box-sizing: border-box !important;
                    float: none !important;
                    width: auto !important;
                    height: auto !important;
                }
                .gameRule {
                    margin-top: 15px !important;
                    font-size: 14px !important;
                    color: #666 !important;
                }
                .scoreAndRefresh {
                    margin-top: 15px !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    width: 300px !important;
                    max-width: 90% !important;
                    margin: 15px auto !important;
                }
                .gameScore {
                    font-size: 18px !important;
                    margin: 0 !important;
                }
                .refreshBtn {
                    margin-left: 15px !important;
                }
                /* 确保主题切换按钮可点击 */
                #themeToggle, .theme-toggle {
                    position: absolute !important;
                    top: 10px !important;
                    right: 10px !important;
                    z-index: 1000 !important;
                    width: 40px !important;
                    height: 40px !important;
                    background: rgba(255,255,255,0.3) !important;
                    border-radius: 50% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                    pointer-events: auto !important;
                    border: 1px solid rgba(0,0,0,0.1) !important;
                }
                .theme-icon {
                    font-size: 20px !important;
                    color: #333 !important;
                }
                /* 数字方块样式 - 使用浅色调 */
                .item-2 { background-color: #eee4da !important; color: #776e65 !important; transition: all 0.25s ease !important; }
                .item-4 { background-color: #ede0c8 !important; color: #776e65 !important; transition: all 0.25s ease !important; }
                .item-8 { background-color: #f5d1aa !important; color: #776e65 !important; transition: all 0.25s ease !important; }
                .item-16 { background-color: #f5c089 !important; color: #776e65 !important; transition: all 0.25s ease !important; }
                .item-32 { background-color: #f5b075 !important; color: #776e65 !important; transition: all 0.25s ease !important; }
                .item-64 { background-color: #f5a063 !important; color: #776e65 !important; transition: all 0.25s ease !important; }
                .item-128 { background-color: #f9e79f !important; color: #776e65 !important; transition: all 0.25s ease !important; box-shadow: 0 0 10px rgba(249, 231, 159, 0.3) !important; }
                .item-256 { background-color: #f7dc6f !important; color: #776e65 !important; transition: all 0.25s ease !important; box-shadow: 0 0 10px rgba(247, 220, 111, 0.3) !important; }
                .item-512 { background-color: #f4d03f !important; color: #776e65 !important; transition: all 0.25s ease !important; box-shadow: 0 0 10px rgba(244, 208, 63, 0.3) !important; }
                .item-1024 { background-color: #f1c40f !important; color: #776e65 !important; transition: all 0.25s ease !important; font-size: 18px !important; box-shadow: 0 0 10px rgba(241, 196, 15, 0.3) !important; }
                .item-2048 { background-color: #f39c12 !important; color: #776e65 !important; transition: all 0.25s ease !important; font-size: 18px !important; box-shadow: 0 0 10px rgba(243, 156, 18, 0.3) !important; }
                .item-4096 { background-color: #e67e22 !important; color: #fff !important; transition: all 0.25s ease !important; font-size: 18px !important; box-shadow: 0 0 10px rgba(230, 126, 34, 0.3) !important; }
                .item-8192 { background-color: #d35400 !important; color: #fff !important; transition: all 0.25s ease !important; font-size: 16px !important; box-shadow: 0 0 10px rgba(211, 84, 0, 0.3) !important; }
                
                /* 深色主题下的方块颜色调整 - 更柔和的色调 */
                .dark-theme .item-2 { background-color: #5d6d7e !important; color: #f9f6f2 !important; }
                .dark-theme .item-4 { background-color: #566573 !important; color: #f9f6f2 !important; }
                .dark-theme .item-8 { background-color: #5499c7 !important; color: #f9f6f2 !important; }
                .dark-theme .item-16 { background-color: #4a90c0 !important; color: #f9f6f2 !important; }
                .dark-theme .item-32 { background-color: #3f85b8 !important; color: #f9f6f2 !important; }
                .dark-theme .item-64 { background-color: #347ab0 !important; color: #f9f6f2 !important; }
                .dark-theme .item-128 { background-color: #5dade2 !important; color: #f9f6f2 !important; box-shadow: 0 0 10px rgba(93, 173, 226, 0.3) !important; }
                .dark-theme .item-256 { background-color: #4a98d6 !important; color: #f9f6f2 !important; box-shadow: 0 0 10px rgba(74, 152, 214, 0.3) !important; }
                .dark-theme .item-512 { background-color: #3883ca !important; color: #f9f6f2 !important; box-shadow: 0 0 10px rgba(56, 131, 202, 0.3) !important; }
                .dark-theme .item-1024 { background-color: #266fbd !important; color: #f9f6f2 !important; font-size: 18px !important; box-shadow: 0 0 10px rgba(38, 111, 189, 0.3) !important; }
                .dark-theme .item-2048 { background-color: #145a9c !important; color: #f9f6f2 !important; font-size: 18px !important; box-shadow: 0 0 10px rgba(20, 90, 156, 0.3) !important; }
                .dark-theme .item-4096 { background-color: #024887 !important; color: #f9f6f2 !important; font-size: 18px !important; box-shadow: 0 0 10px rgba(2, 72, 135, 0.3) !important; }
                .dark-theme .item-8192 { background-color: #013667 !important; color: #f9f6f2 !important; font-size: 16px !important; box-shadow: 0 0 10px rgba(1, 54, 103, 0.3) !important; }
                
                /* 方块合并动画 */
                @keyframes tile-pop {
                    0% { transform: scale(0.8); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                .item:not(.emptyItem) {
                    animation: tile-pop 0.25s ease !important;
                    transition: background-color 0.25s ease, color 0.25s ease, transform 0.25s ease !important;
                }
                
                /* 空方块样式 */
                .emptyItem {
                    background-color: rgba(238, 228, 218, 0.15) !important;
                    transition: background-color 0.25s ease !important;
                }
                
                .dark-theme .emptyItem {
                    background-color: rgba(93, 109, 126, 0.15) !important;
                }
                /* 微信浏览器专用样式 */
                .wechat-browser html, .wechat-browser body {
                    height: 100% !important;
                    width: 100% !important;
                }
                .wechat-browser .container {
                    padding: 10px !important;
                }
                /* 桌面端样式 */
                @media (min-width: 768px) {
                    .container {
                        max-width: 600px !important;
                        margin: 0 auto !important;
                        padding: 20px !important;
                        box-sizing: border-box !important;
                    }
                    .main {
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    .gameName {
                        font-size: 32px !important;
                        margin-bottom: 15px !important;
                    }
                    .maxScore {
                        font-size: 20px !important;
                        margin-bottom: 25px !important;
                    }
                    #gameBody.gameBoard, .gameBoard {
                        width: 360px !important;
                        height: 360px !important;
                        padding: 10px !important;
                        grid-gap: 6px !important;
                        border-radius: 8px !important;
                        background-color: rgba(0,0,0,0.15) !important;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
                        box-sizing: border-box !important;
                        margin: 0 auto !important;
                        display: inline-grid !important;
                    }
                    #gameBody .item, .gameBoard .item {
                        width: 100% !important;
                        aspect-ratio: 1/1 !important;
                        box-sizing: border-box !important;
                        font-size: 24px !important;
                        border-radius: 6px !important;
                        box-shadow: none !important;
                        background-color: rgba(255,255,255,0.2) !important;
                        transition: all 0.1s ease !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .item:not(.emptyItem) {
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
                    }
                    .gameRule {
                        font-size: 15px !important;
                        margin-top: 20px !important;
                        color: rgba(255,255,255,0.7) !important;
                    }
                    .scoreAndRefresh {
                        width: 360px !important;
                        display: flex !important;
                        justify-content: space-between !important;
                        margin: 20px auto 0 !important;
                        box-sizing: border-box !important;
                    }
                    .gameScore {
                        font-size: 20px !important;
                        display: flex !important;
                        align-items: center !important;
                    }
                    .btn {
                        font-size: 15px !important;
                        padding: 8px 16px !important;
                        border-radius: 4px !important;
                    }
                }
                /* 移动端样式 */
                @media (max-width: 767px) {
                    .container {
                        padding: 10px;
                    }
                    .gameBoard {
                        padding: 10px;
                        grid-gap: 8px;
                    }
                    .item {
                        font-size: 20px;
                    }
                    .item-1024, .item-2048, .item-4096 {
                        font-size: 16px;
                    }
                }
            `)
            .appendTo('head');
            
        // 检测微信浏览器并添加类名
        if (isWeixinBrowser()) {
            $('body').addClass('wechat-browser');
            
            // 仅阻止页面级滚动，允许游戏内元素交互
            document.addEventListener('touchmove', function(e) {
                if (!$(e.target).closest('.gameBoard').length && 
                    !$(e.target).closest('.theme-toggle').length && 
                    !$(e.target).closest('#themeToggle').length) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
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

        // 主题切换按钮点击事件 - 使用事件委托，确保在所有环境下都能工作
        $(document).on('click touchend', '.theme-toggle, #themeToggle', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if ($('html').hasClass('light-theme')) {
                $('html').removeClass('light-theme').addClass('dark-theme');
                localStorage.setItem('theme', 'dark-theme');
            } else {
                $('html').removeClass('dark-theme').addClass('light-theme');
                localStorage.setItem('theme', 'light-theme');
            }
            
            return false;
        });
    }

    // 修复移动端触摸事件
    function setupMobileTouchEvents() {
        if ($('#gameBody').length) {
            var gameBody = document.getElementById("gameBody");
            
            // 移除旧事件监听器
            $(gameBody).off('touright touleft touup toudown');
            
            // 清除可能的旧事件处理函数
            var oldTouchStart = gameBody.ontouchstart;
            var oldTouchEnd = gameBody.ontouchend;
            var oldTouchMove = gameBody.ontouchmove;
            gameBody.ontouchstart = null;
            gameBody.ontouchend = null;
            gameBody.ontouchmove = null;
            
            // 定义新的滑动检测
            let startX, startY, endX, endY;
            const minDistance = 30; // 最小滑动距离
            
            gameBody.addEventListener('touchstart', function(e) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }, false);
            
            gameBody.addEventListener('touchmove', function(e) {
                e.preventDefault(); // 阻止页面滚动
            }, { passive: false });
            
            gameBody.addEventListener('touchend', function(e) {
                endX = e.changedTouches[0].clientX;
                endY = e.changedTouches[0].clientY;
                
                // 计算移动距离和方向
                const distX = endX - startX;
                const distY = endY - startY;
                const absX = Math.abs(distX);
                const absY = Math.abs(distY);
                
                // 判断是否为有效滑动
                if (Math.max(absX, absY) < minDistance) {
                    return; // 滑动距离太小
                }
                
                // 判断滑动方向
                if (absX > absY) {
                    // 水平滑动
                    if (distX > 0) {
                        // 向右滑动
                        console.log("向右滑动");
                        isNewRndItem = false;
                        move('right');
                        isGameOver();
                    } else {
                        // 向左滑动
                        console.log("向左滑动");
                        isNewRndItem = false;
                        move('left');
                        isGameOver();
                    }
                } else {
                    // 垂直滑动
                    if (distY > 0) {
                        // 向下滑动
                        console.log("向下滑动");
                        isNewRndItem = false;
                        move('down');
                        isGameOver();
                    } else {
                        // 向上滑动
                        console.log("向上滑动");
                        isNewRndItem = false;
                        move('up');
                        isGameOver();
                    }
                }
            }, false);
            
            // 禁用原有触摸事件处理
            // 仍保留 mobilwmtouch 调用以防其他地方有依赖，但不使用其结果
            try {
                mobilwmtouch(gameBody);
            } catch(e) {
                console.log("Touch event initialization error:", e);
            }
        }
    }
    
    // 手机屏幕划动触发函数
    function mobilwmtouch(obj) {
        var stoux, stouy;
        var etoux, etouy;
        var xdire, ydire;
        
        // 基本兼容性定义
        function evenzc(eve) {
            if (typeof document.CustomEvent === 'function') {
                this.event = new document.CustomEvent(eve, {
                    bubbles: true,
                    cancelable: true
                });
                if (!document["evetself" + eve]) {
                    document["evetself" + eve] = this.event;
                }
            } else if (typeof document.createEvent === 'function') {
                this.event = document.createEvent('HTMLEvents');
                this.event.initEvent(eve, true, true);
                if (!document["evetself" + eve]) {
                    document["evetself" + eve] = this.event;
                }
            } else {
                return false;
            }
            return document["evetself" + eve];
        }
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
        
        // 应用内联样式
        applyNumberStyles();
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
            
            // 应用内联样式
            applyNumberStyles();
            return;
        }
    }

    // 添加数字对应的 CSS 类和直接设置样式
    function addNumberClass(element) {
        var value = element.html();
        if (value) {
            // 先移除所有可能的数字类
            removeNumberClasses(element);
            
            // 添加数据属性记录数字值
            element.attr('data-value', value);
            
            // 直接设置样式
            applyStyleToElement(element, value);
        }
    }

    // 移除所有数字相关的 CSS 类
    function removeNumberClasses(element) {
        element.removeClass(function(index, className) {
            return (className.match(/(^|\s)item-\d+/g) || []).join(' ');
        });
        // 移除数据属性
        element.removeAttr('data-value');
    }
    
    // 直接给元素应用样式
    function applyStyleToElement(element, value) {
        // 基本样式
        var styles = {
            'transition': 'all 0.2s ease',
            'font-weight': 'bold'
        };
        
        // 根据数字设置样式
        switch (value) {
            case '2':
                styles['background-color'] = '#eee4da';
                styles['color'] = '#776e65';
                break;
            case '4':
                styles['background-color'] = '#ede0c8';
                styles['color'] = '#776e65';
                break;
            case '8':
                styles['background-color'] = '#f5d1aa';
                styles['color'] = '#776e65';
                break;
            case '16':
                styles['background-color'] = '#f5c089';
                styles['color'] = '#776e65';
                break;
            case '32':
                styles['background-color'] = '#f5b075';
                styles['color'] = '#776e65';
                break;
            case '64':
                styles['background-color'] = '#f5a063';
                styles['color'] = '#776e65';
                break;
            case '128':
                styles['background-color'] = '#f9e79f';
                styles['color'] = '#776e65';
                styles['box-shadow'] = '0 0 10px rgba(249, 231, 159, 0.3)';
                break;
            case '256':
                styles['background-color'] = '#f7dc6f';
                styles['color'] = '#776e65';
                styles['box-shadow'] = '0 0 10px rgba(247, 220, 111, 0.3)';
                break;
            case '512':
                styles['background-color'] = '#f4d03f';
                styles['color'] = '#776e65';
                styles['box-shadow'] = '0 0 10px rgba(244, 208, 63, 0.3)';
                break;
            case '1024':
                styles['background-color'] = '#f1c40f';
                styles['color'] = '#776e65';
                styles['box-shadow'] = '0 0 10px rgba(241, 196, 15, 0.3)';
                styles['font-size'] = '18px';
                break;
            case '2048':
                styles['background-color'] = '#f39c12';
                styles['color'] = '#776e65';
                styles['box-shadow'] = '0 0 10px rgba(243, 156, 18, 0.3)';
                styles['font-size'] = '18px';
                break;
            case '4096':
                styles['background-color'] = '#e67e22';
                styles['color'] = '#fff';
                styles['box-shadow'] = '0 0 10px rgba(230, 126, 34, 0.3)';
                styles['font-size'] = '18px';
                break;
            case '8192':
                styles['background-color'] = '#d35400';
                styles['color'] = '#fff';
                styles['box-shadow'] = '0 0 10px rgba(211, 84, 0, 0.3)';
                styles['font-size'] = '16px';
                break;
            default:
                if (parseInt(value) > 8192) {
                    styles['background-color'] = '#c0392b';
                    styles['color'] = '#fff';
                    styles['box-shadow'] = '0 0 10px rgba(192, 57, 43, 0.3)';
                    styles['font-size'] = '16px';
                }
        }
        
        // 使用attr方法直接设置style属性
        var styleString = '';
        for (var prop in styles) {
            styleString += prop + ':' + styles[prop] + ' !important;';
        }
        
        // 直接设置style属性
        element.attr('style', styleString);
    }

    // 应用样式到所有方块
    function applyNumberStyles() {
        $('.item').each(function() {
            var $this = $(this);
            var value = $this.html();
            
            if (value === '') {
                // 空方块样式
                $this.attr('style', 'background-color:rgba(238, 228, 218, 0.15) !important; transition:background-color 0.2s ease !important;');
            } else {
                // 有数字的方块
                applyStyleToElement($this, value);
            }
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
        
        // 应用内联样式
        applyNumberStyles();
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
        
        // 设置移动端触摸事件
        setupMobileTouchEvents();
        
        // 应用内联样式
        applyNumberStyles();
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
            
            // 应用内联样式
            applyNumberStyles();
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

    // 确保在DOM加载完成后应用样式
    $(document).ready(function() {
        // 初始化时应用样式
        setTimeout(function() {
            applyNumberStyles();
        }, 100);
        
        // 每秒检查一次确保样式应用
        setInterval(function() {
            applyNumberStyles();
        }, 1000);
    });
});