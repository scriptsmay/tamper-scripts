// ==UserScript==
// @name         微博评论自动刷新
// @namespace    wb_comment_refresh
// @version      0.0.4
// @description  微博评论自动刷新，优化版
// @author       scriptsmay
// @match        *://weibo.com/*
// @match        *://www.weibo.com/*
// @exclude      *://weibo.com/u/*
// @exclude      https://weibo.com/tv/*
// @exclude      https://www.weibo.com/tv/*
// @exclude      https://weibo.com/p/*
// @exclude      https://www.weibo.com/p/*
// @icon         https://weibo.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @downloadURL  https://raw.githubusercontent.com/scriptsmay/tamper-scripts/main/wb_comment_refresh.js
// @updateURL    https://raw.githubusercontent.com/scriptsmay/tamper-scripts/main/wb_comment_refresh.js
// ==/UserScript==

// ============ 常量定义区 ============
// DOM 类名常量
const CLASS = {
  // 主文章容器
  ARTICLE: 'article.woo-panel-main',

  // 工具栏相关
  TOOLBAR_BOX_CLASS: 'woo-box-flex',
  TOOLBAR_ITEM: 'woo-box-item-flex toolbar_item_1ky_D toolbar_cursor_34j5V',
  TOOLBAR_BUTTON_WRAP:
    'woo-box-flex woo-box-alignCenter woo-box-justifyCenter toolbar_likebox_1rLfZ toolbar_wrap_np6Ug',
  TOOLBAR_BUTTON: 'woo-like-main toolbar_btn_Cg9tz',
  TOOLBAR_ACTIVE: '_cur_198pe_148',
  TOOLBAR_NUM: 'toolbar_num_JXZul',
  TOOLBAR_LEFT:
    'woo-box-flex woo-box-alignCenter toolbar_left_2vlsY toolbar_main_3Mxwo',

  // 按钮相关
  LIKE_ICON_WRAP: 'woo-like-iconWrap',
  LIKE_ICON: 'woo-font woo-font--refresh woo-like-icon',
  FILTER_ICON: 'woo-font woo-font--check woo-like-icon',

  // 自定义按钮类名
  REFRESH_BUTTON: 'my-refresh-button',
  FILTER_BUTTON: 'author-filter-button',

  // 其他元素
  DETAIL_PAGE: '._detail_zsq3w_2',
  TIME_LINK: 'head-info_time_6sFQg',
  PICTURE_VIEWER: 'picture-viewer_pic_37YQ3',
};

// 按钮配置
const BUTTON_CONFIG = {
  REFRESH: {
    title: '刷新',
    iconClass: CLASS.LIKE_ICON,
    text: '刷新',
  },
  FILTER: {
    title: '只看博主',
    iconClass: CLASS.FILTER_ICON,
    text: '过滤',
  },
};

// API配置
const API_CONFIG = {
  SHOW_STATUS: '/ajax/statuses/show',
  BUILD_COMMENTS: '/ajax/statuses/buildComments',
};

// 全局设置键名
const SETTINGS = {
  FILTER_AUTHOR: 'filterAuthor',
};

// ============ 全局变量 ============
let globalTimerId;

(function () {
  'use strict';

  // ============ 工具函数 ============

  /**
   * 对象转查询字符串
   */
  function objectToQueryString(obj) {
    const params = new URLSearchParams();
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        params.append(key, obj[key]);
      }
    }
    return params.toString();
  }

  /**
   * HTTP请求封装
   */
  function httpRequest(url, method = 'GET', data = null) {
    return new Promise(function (resolve, reject) {
      if (
        method.toUpperCase() === 'GET' &&
        typeof data === 'object' &&
        data !== null
      ) {
        const queryString = objectToQueryString(data);
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
      let oReq = new XMLHttpRequest();
      oReq.open(method, url);
      oReq.responseType = 'json';
      oReq.onload = (e) => {
        resolve(oReq.response);
      };
      oReq.onerror = (e) => {
        resolve(null);
      };
      oReq.onabort = (e) => {
        resolve(null);
      };
      oReq.ontimeout = (e) => {
        resolve(null);
      };
      oReq.setRequestHeader('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));

      if (method.toUpperCase() === 'GET') {
        oReq.send();
      } else if (typeof data === 'string') {
        oReq.setRequestHeader(
          'Content-Type',
          'application/x-www-form-urlencoded',
        );
        oReq.send(data);
      } else if (typeof data === 'object' && data !== null) {
        oReq.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        oReq.send(JSON.stringify(data));
      } else {
        oReq.send();
      }
    });
  }

  /**
   * 获取Cookie
   */
  function getCookie(key = null) {
    let cookiesArr = document.cookie.split('; ');
    let cookiesObj = {};
    for (const cookie of cookiesArr) {
      let [name, value] = cookie.split('=');
      cookiesObj[name] = value;
    }
    return key ? cookiesObj[key] : cookiesObj;
  }

  // ============ DOM操作函数 ============

  /**
   * 创建按钮元素
   */
  function createButtonElement(buttonConfig, customClass, clickHandler) {
    const buttonDiv = document.createElement('div');
    buttonDiv.className = CLASS.TOOLBAR_ITEM;

    const wrapDiv = document.createElement('div');
    wrapDiv.className = CLASS.TOOLBAR_BUTTON_WRAP;

    const button = document.createElement('button');
    button.className = `${CLASS.TOOLBAR_BUTTON} ${customClass}`;
    button.setAttribute('tabindex', '0');
    button.setAttribute('title', buttonConfig.title);

    button.innerHTML = `
      <span class="${CLASS.LIKE_ICON_WRAP}">
        <i class="${buttonConfig.iconClass}"></i>
      </span>
      <span class="${CLASS.TOOLBAR_NUM}">${buttonConfig.text}</span>
    `;

    if (clickHandler) {
      button.addEventListener('click', clickHandler);
    }

    wrapDiv.appendChild(button);
    buttonDiv.appendChild(wrapDiv);

    return { buttonDiv, button };
  }

  /**
   * 获取工具栏容器
   */
  function getToolbarContainer(footer) {
    return footer.querySelector(`.${CLASS.TOOLBAR_BOX_CLASS}`);
  }

  /**
   * 插入到工具栏第一个位置
   */
  function insertToToolbarFirst(toolbarContainer, buttonDiv) {
    if (toolbarContainer && toolbarContainer.firstChild) {
      toolbarContainer.insertBefore(buttonDiv, toolbarContainer.firstChild);
    } else if (toolbarContainer) {
      toolbarContainer.appendChild(buttonDiv);
    }
  }

  /**
   * 处理卡片，添加功能按钮
   */
  function handleCard(card) {
    const footer =
      card.querySelectorAll('footer')[1] || card.querySelector('footer');
    if (!footer) return;
    console.log('footer');

    const container = getToolbarContainer(footer);
    if (!container) return;

    console.log('container');

    // 检查是否已添加按钮
    if (container.getElementsByClassName(CLASS.REFRESH_BUTTON).length > 0) {
      console.log('按钮已添加');
      return;
    }

    // 添加刷新按钮
    addRefreshButton(container);

    // 添加过滤按钮
    addFilterButton(container);
  }

  /**
   * 添加刷新按钮
   */
  function addRefreshButton(container) {
    const { buttonDiv, button } = createButtonElement(
      BUTTON_CONFIG.REFRESH,
      CLASS.REFRESH_BUTTON,
      handleRefreshClick,
    );

    insertToToolbarFirst(container, buttonDiv);
  }

  /**
   * 从 URL 中解析微博帖子 ID（兼容路径后带 query / hash 参数的情况）
   * 例如 https://weibo.com/7778237414/Rffbp9buy?sudaref=xxx → Rffbp9buy
   */
  function getPostIdFromUrl(urlString) {
    try {
      const url = new URL(urlString);
      const segments = url.pathname.split('/').filter(Boolean);
      const last = segments.pop();
      if (last && /^[A-Za-z0-9]+$/.test(last)) {
        return last;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * 刷新按钮点击处理
   */
  async function handleRefreshClick(event) {
    event.preventDefault();

    if (globalTimerId) {
      clearInterval(globalTimerId);
      this.classList.remove(CLASS.TOOLBAR_ACTIVE);
      globalTimerId = null;
      return;
    }

    const postId = getPostIdFromUrl(location.href);
    if (!postId) {
      console.warn('[wb_comment_refresh] 无法从 URL 解析帖子 ID:', location.href);
      return;
    }

    // 显示高亮
    this.classList.add(CLASS.TOOLBAR_ACTIVE);

    const url = `https://${location.host}${API_CONFIG.SHOW_STATUS}?id=${postId}`;

    const resJson = await httpRequest(url);
    if (resJson && resJson.id && resJson.user) {
      startRefresh(resJson);
    } else {
      console.warn('[wb_comment_refresh] 获取帖子信息失败, postId:', postId, resJson);
      this.classList.remove(CLASS.TOOLBAR_ACTIVE);
    }
  }

  /**
   * 添加过滤按钮
   */
  function addFilterButton(container) {
    const isFilterActive = GM_getValue(SETTINGS.FILTER_AUTHOR, false);
    const activeClass = isFilterActive ? ` ${CLASS.TOOLBAR_ACTIVE}` : '';

    const { buttonDiv, button } = createButtonElement(
      BUTTON_CONFIG.FILTER,
      `${CLASS.FILTER_BUTTON}${activeClass}`,
      handleFilterClick,
    );

    insertToToolbarFirst(container, buttonDiv);
  }

  /**
   * 过滤按钮点击处理
   */
  async function handleFilterClick(event) {
    event.preventDefault();

    const newValue = !GM_getValue(SETTINGS.FILTER_AUTHOR, false);
    GM_setValue(SETTINGS.FILTER_AUTHOR, newValue);

    // 切换高亮状态
    this.classList.toggle(CLASS.TOOLBAR_ACTIVE);
  }

  // ============ 评论刷新功能 ============

  /**
   * 开始刷新评论
   */
  function startRefresh(data) {
    console.log('开始刷新评论');

    // 清除之前的定时器
    if (globalTimerId) {
      clearInterval(globalTimerId);
    }

    globalTimerId = setInterval(async function () {
      await handleCommentData(data.id, data.user.idstr);
    }, 5000);
  }

  /**
   * 处理评论数据
   */
  async function handleCommentData(postId, userId) {
    const url = `https://${location.host}${API_CONFIG.BUILD_COMMENTS}`;
    const params = {
      is_asc: 0,
      is_reload: 1,
      id: postId,
      is_show_bulletin: 3,
      is_mix: 0,
      count: 10,
      uid: userId,
      fetch_level: 0,
      locale: 'en',
    };

    const resJson = await httpRequest(url, 'GET', params);
    if (!resJson || !resJson.data) return;

    const filterAuthor = GM_getValue(SETTINGS.FILTER_AUTHOR, false);
    const comments = resJson.data.filter((item) => {
      return !filterAuthor || item.is_mblog_author == true;
    });

    console.log(`获取到评论:${comments.length}条`);
    renderComments(comments);
  }

  /**
   * 渲染评论列表
   */
  function renderComments(comments) {
    const html = comments.map((comment) => createCommentHTML(comment)).join('');
    const commentBox = document.getElementById('scroller');

    if (commentBox) {
      commentBox.innerHTML = `<div class="vue-recycle-scroller__item-wrapper" style="min-height: 600px;">${html}</div>`;
    }
  }

  /**
   * 创建评论HTML
   */
  function createCommentHTML(comment) {
    const imgs = extractImagesFromComment(comment);
    const time = new Date(comment.created_at);

    let imagesHTML = '';
    if (imgs.length > 0) {
      imagesHTML = imgs
        .map(
          (img) =>
            `<div><img src="${img}" class="${CLASS.PICTURE_VIEWER}" style="max-width:100%;"></div>`,
        )
        .join('');
    }

    return `
      <div class="wbpro-list">
        <div class="item1">
          <div class="text"><a>${comment.user.screen_name}</a>:<span>${comment.text}</span></div>
          <div class="info woo-box-flex woo-box-alignCenter woo-box-justifyBetween">
            <div>${time.toLocaleString()} <span>${comment.source}</span></div>
          </div>
          ${imagesHTML}
        </div>
      </div>
    `;
  }

  /**
   * 从评论中提取图片
   */
  function extractImagesFromComment(comment) {
    const imgs = [];

    if (comment.url_struct) {
      comment.url_struct.forEach((item) => {
        const picInfos = item.pic_infos;
        if (picInfos) {
          for (const pic of Object.values(picInfos)) {
            if (pic.large?.url) {
              imgs.push(pic.large.url);
            }
          }
        }
      });
    }

    return imgs;
  }

  // ============ 页面初始化 ============

  /**
   * 初始化页面
   */
  function initPage() {
    if (location.host !== 'weibo.com' && location.host !== 'www.weibo.com') {
      return false;
    }

    // 判断是否在详情页
    const detailPage = document.querySelector(CLASS.DETAIL_PAGE);
    if (!detailPage) {
      console.log('当前页面不是详情页');
      return false;
    }

    const cards = document.body.querySelectorAll(CLASS.ARTICLE);
    console.log('当前页面共有文章:', cards.length);
    cards.forEach((card) => handleCard(card));

    return true;
  }

  /**
   * 主要初始化函数
   */
  function main() {
    // // 尝试立即初始化
    // initPage();
    setTimeout(() => {
      initPage();
    }, 3000);

    console.log('当前过滤设置:', GM_getValue(SETTINGS.FILTER_AUTHOR, false));
  }

  // 启动脚本
  main();
})();
