// ==UserScript==
// @name         腾讯视频少儿模式
// @namespace    youth-qqvideo
// @version      2024-01-27-2016
// @description  腾讯视频网页默认进入少儿模式，导航只显示动漫和少儿，尝试屏蔽部分广告区域
// @author       You
// @match        *://*.youku.com/*
// @match        *://*.iqiyi.com/*
// @match        *://v.qq.com/*
// @match        *://m.v.qq.com/*
// @icon         data:image/png;base64,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
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @downloadURL  https://raw.githubusercontent.com/scriptsmay/tamper-scripts/main/youth_qqvideo.js
// ==/UserScript==

(function () {
    'use strict';

    var domHead = document.getElementsByTagName('head')[0];
    var domStyle = document.createElement('style');

    // domStyle.type = 'text/css';
    domStyle.rel = 'stylesheet';
    //平台判断
    const isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);

    /*--CONFIG--*/
    const CONFIG = {
        nowUrl: window.location.href,
        nowHost: window.location.host,
        // 展示nav-channel
        filters: [
            {
                channel: 'cartoon',
            },
            {
                channel: 'child',
            },
        ],
        hideStyle: 'GMV_Youth_hide',
        bodyStyle: 'GMV_Youth_doc',
        sideBarStyle: 'GMV_Youth_left_width',
        backiconStyle: 'GMV_Youth_backicon',
        historyMainStyle: 'GMV_Youth_history_main',
        historyHeadStyle: 'GMV_Youth_history_head',

        // 隐藏Dom list
        hideDOMList: [
            '#ssi-policy',
            '.ft_cell_feedback',
            '.ft_cell_download ',
            '.iwan-gamependant-container',
            '.site_footer',
            '.quick_upload',
            '.quick_client',
        ],
    };
    const mainSetStyle = `
        :root {
            --left-tab-width: 120px;
        }
        .GMV_Youth_doc {
            width: 100%!important;
            min-width: auto;
        }
        .GMV_Youth_hide { display: none!important;}
        .GMV_Youth_left_width {
            width: 120px;
        }
        .GMV_Youth_left_width .nav-wrap .nav-item {
            width: 110px;
        }
        .GMV_Youth_backicon {
            width: 60px;
            height: 60px;
        }
        .GMV_Youth_history_main {
            float: none;
            clear: both;
            padding-left: 20px;
        }
        .GMV_Youth_history_head {
            min-width: auto;
        }
        .GMV_Youth_history_mainwrap {
            width: 100%;
        }
    `;

    /*--Class--*/
    class BaseClass {
        constructor() {
            if (GM_getValue('iconPositionSetPage') != 0) {
            }

            this.setStyle();
        }

        setStyle() {
            domStyle.appendChild(document.createTextNode(mainSetStyle));

            domHead.appendChild(domStyle);
        }

        createElement(dom, domId) {
            var rootElement = document.body;
            var newElement = document.createElement(dom);

            newElement.id = domId;

            var newElementHtmlContent = document.createTextNode('');

            rootElement.appendChild(newElement);
            newElement.appendChild(newElementHtmlContent);
        }

        request(method, url, data, isCookie = '') {
            let request = new XMLHttpRequest();

            return new Promise((resolve, reject) => {
                request.onreadystatechange = function () {
                    if (request.readyState == 4) {
                        if (request.status == 200) {
                            resolve(request.responseText);
                        } else {
                            reject(request.status);
                        }
                    }
                };

                request.open(method, url);
                //request.withCredentials = true;
                if (isCookie) {
                    request.withCredentials = true;
                }
                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                request.send(data);
            });
        }

        setCookie(cname, cvalue, exdays) {
            var d = new Date();

            d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);

            var expires = 'expires=' + d.toGMTString();

            document.cookie = cname + '=' + cvalue + '; ' + expires;
        }

        getCookie(cname) {
            var name = cname + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i].trim();
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return '';
        }

        getQueryString(e) {
            var t = new RegExp('(^|&)' + e + '=([^&]*)(&|$)');
            var a = window.location.search.substr(1).match(t);
            if (a != null) return a[2];
            return '';
        }

        getUrlParams(url) {
            let reg = /([^?&+#]+)=([^?&+#]+)/g;
            let obj = {};
            url.replace(reg, (res, $1, $2) => {
                obj[$1] = $2;
            });
            return obj;
        }

        // 切割行文字
        getLine(text) {
            let textArr = text.split('\n');

            if (textArr.length > 0) {
                let lineObj = [];

                let match = /^(.+)(https?:\/\/.+)$/;

                textArr.forEach(function (item) {
                    item = item.replace(/\s*,*/g, '');

                    if (!item) return true;

                    let lineMatch = item.match(match);

                    if (lineMatch) {
                        lineObj.push({
                            name: lineMatch[1].substring(0, 4),
                            url: lineMatch[2],
                        });
                    } else {
                        lineObj = [];

                        return false;
                    }
                });
                return lineObj;
            }
        }

        // all参数默认空，是真时返回为数组
        static getElement(css, all = '') {
            return new Promise((resolve, reject) => {
                let num = 0;

                let timer = setInterval(function () {
                    num++;

                    let dom;

                    if (all == false) {
                        dom = document.querySelector(css);

                        if (dom) {
                            clearInterval(timer);

                            resolve(dom);
                        }
                    } else {
                        dom = document.querySelectorAll(css);

                        if (dom.length > 0) {
                            clearInterval(timer);

                            resolve(dom);
                        }
                    }

                    if (num == 20) {
                        clearInterval(timer);
                        resolve(false);
                    }
                }, 300);
            });
        }

        static toast(msg, duration) {
            duration = isNaN(duration) ? 3000 : duration;

            let toastDom = document.createElement('div');

            toastDom.innerHTML = msg;

            //toastDom.style.cssText="width: 60%;min-width: 150px;opacity: 0.7;height: 30px;color: rgb(255, 255, 255);line-height: 30px;text-align: center;border-radius: 5px;position: fixed;top: 40%;left: 20%;z-index: 999999;background: rgb(0, 0, 0);font-size: 12px;";
            toastDom.style.cssText =
                'padding:2px 15px;min-height: 36px;line-height: 36px;text-align: center;transform: translate(-50%);border-radius: 4px;color: rgb(255, 255, 255);position: fixed;top: 50%;left: 50%;z-index: 9999999;background: rgb(0, 0, 0);font-size: 16px;';

            document.body.appendChild(toastDom);

            setTimeout(function () {
                var d = 0.5;

                toastDom.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';

                toastDom.style.opacity = '0';

                setTimeout(function () {
                    document.body.removeChild(toastDom);
                }, d * 1000);
            }, duration);
        }

        static async hideDOM(selector, all = false) {
            BaseClass.addClass(selector, all, CONFIG.hideStyle);
        }
        static async addClass(selector, all = false, className) {
            const target = await BaseClass.getElement(selector, all);
            if (target) {
                if (!all) {
                    target.classList.add(className);
                } else {
                    target.forEach((item) => {
                        item.classList.add(className);
                    });
                }
            }
        }
    }

    class PlayVideoClass extends BaseClass {
        constructor() {
            super();
        }

        // 执行
        async setup() {
            this.nav();
            this.changeStyle();

            // final
            this.history();
            this.blockDOMs();
        }

        // 处理导航
        async nav() {
            // 首页的导航
            const navs = await BaseClass.getElement('.nav-wrap a.nav-item', true);
            const chns = CONFIG.filters.map((i) => i.channel);
            navs &&
                navs.forEach((dom) => {
                    const href = dom.href;
                    if (chns.find((i) => href.indexOf(i) > -1)) {
                        // console.log('filtered!!!')
                    } else {
                        // 隐藏导航
                        dom.classList.add(CONFIG.hideStyle);
                    }
                });
        }

        async changeStyle() {
            // 首页样式处理
            BaseClass.addClass('.left-nav-wrap', false, CONFIG.sideBarStyle);

            BaseClass.addClass('.ft_cell_backup', false, CONFIG.backiconStyle);
        }

        // 观看记录页面处理
        async history() {
            // 判断当前页面
            const isHistory = CONFIG.nowUrl.indexOf('/history') > -1;
            if (!isHistory) {
                return false;
            }
            console.log('处理历史记录页面');
            // 左侧隐藏
            BaseClass.hideDOM('#side_nav');
            // 右侧清除浮动
            BaseClass.addClass('.site_main', false, CONFIG.historyMainStyle);
            BaseClass.addClass('#new_vs_header', false, CONFIG.historyHeadStyle);
            BaseClass.addClass('.site_wrapper', false, 'GMV_Youth_history_mainwrap');

            BaseClass.addClass('body', false, CONFIG.bodyStyle);

            // 导航栏处理
            BaseClass.hideDOM('#nav-all');
            const chns = CONFIG.filters.map((i) => i.channel);
            const navs = await BaseClass.getElement('#main-top-nav-wrap a', true);
            navs &&
                navs.forEach((dom) => {
                    const href = dom.href;
                    if (chns.find((i) => href.indexOf(i) > -1)) {
                        // console.log('filtered!!!')
                    } else {
                        // 隐藏导航
                        dom.classList.add(CONFIG.hideStyle);
                    }
                });
        }

        // 隐藏部分DOM内容
        async blockDOMs() {
            CONFIG.hideDOMList &&
                CONFIG.hideDOMList.forEach((selector) => {
                    BaseClass.hideDOM(selector);
                });

            // 主卡片区域DOM，循环去广告
            const mainBox = await BaseClass.getElement('.video-card-module');
            if (mainBox) {
                this.startClearAds();
            } else {
                if (this._adsTimer) {
                    clearInterval(this._adsTimer);
                }
            }
        }

        // 动态清除广告
        startClearAds() {
            if (this._adsTimer) {
                clearInterval(this._adsTimer);
            }
            this._adsTimer = setInterval(async () => {
                // 去广告切片
                const ads = await BaseClass.getElement('.card-wrap .close-btn', true);
                if (ads) {
                    ads.forEach((item) => {
                        // 点击关闭广告
                        item.click();
                    });
                }
            }, 1500);
        }
    }

    class VersionClass extends BaseClass {
        constructor() {
            super();

            var _this = this;

            (async function () {
                let getVersionTime = GM_getValue('getVersionTime', 0);

                let versionNow = GM_info.script.version.split('.');

                console.log(getVersionTime, versionNow);

                // let resp = await _this.checkTime()
                // if (!resp) return
                // _this.checkRunTime()
                // console.log('CONFIG.nowUrl', CONFIG.nowUrl);
                console.log('isMobile', isMobile);

                GM_setValue('getVersionTime', Date.now());
            })();
        }

        getVersion(mothed, url) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: mothed,
                    url: url,
                    data: '',
                    headers: {
                        Accept: 'text/plain, text/html,application/json',
                    },
                    onload: function (res) {
                        let resArray = res.responseText.split('\n');

                        let versionArray = [];

                        for (let i = 0; i < resArray.length; i++) {
                            if (resArray[i].match(/^([0-999]{1,3})\.?([0-999]{1,3})?\.?([0-999]{1,3})?$/)) {
                                versionArray.push(resArray[i]);
                            }
                        }

                        resolve(versionArray);
                    },
                    onerror: function (err) {
                        console.log(err);
                    },
                });
            });
        }
    }

    // 执行
    var playVideoClass = new PlayVideoClass();
    playVideoClass.setup();
    new VersionClass();
})();
