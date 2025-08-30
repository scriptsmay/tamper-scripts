// ==UserScript==
// @name         微博评论自动刷新
// @namespace    wb_comment_refresh
// @version      0.0.1
// @description  微博评论自动刷新
// @author       scriptsmay
// @match        *://weibo.com/*
// @match        *://www.weibo.com/*
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

let globalTimerId;

(function () {
  'use strict';

  // GM_setValue('filterAuthor', document.getElementById('filterAuthor').checked);

  function objectToQueryString(obj) {
    const params = new URLSearchParams();
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        params.append(key, obj[key]);
      }
    }
    return params.toString();
  }
  function httpRequest(url, method = 'GET', data = null) {
    return new Promise(function (resolve, reject) {
      if (method.toUpperCase() === 'GET' && typeof data === 'object' && data !== null) {
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
      // 对于GET请求，不需要发送数据体
      if (method.toUpperCase() === 'GET') {
        oReq.send();
      } else if (typeof data === 'string') {
        oReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        oReq.send(data);
      } else if (typeof data === 'object' && data !== null) {
        oReq.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        oReq.send(JSON.stringify(data));
      } else {
        oReq.send();
      }
    });
  }

  function getCookie(key = null) {
    let cookiesArr = document.cookie.split('; ');
    let cookiesObj = {};
    for (const cookie of cookiesArr) {
      let [name, value] = cookie.split('=');
      cookiesObj[name] = value;
    }
    if (key) {
      return cookiesObj[key];
    } else {
      return cookiesObj;
    }
  }

  new MutationObserver(() => {
    // console.log(mutationList);
    if (location.host == 'weibo.com' || location.host == 'www.weibo.com') {
      const cards = document.body.querySelectorAll('article.woo-panel-main');
      // console.log(cards);
      for (const card of cards) {
        handleCard(card);
      }
    }
  }).observe(document.body, { attributes: false, childList: true, subtree: true });

  // 添加刷新按钮
  function handleCard(card) {
    const footer = card.querySelectorAll('footer')[1] || card.querySelector('footer');
    // console.log(imgs);
    if (footer) {
      if (footer.getElementsByClassName('my-refresh-button').length > 0) {
        console.log('already added my-refresh button');
      } else {
        // console.log(footer.parentElement);
        addRefreshBtn(footer);
        addFilterBtn(footer);
      }
    }
  }

  function addRefreshBtn(footer) {
    // console.log('add my-refresh button');
    let dlBtnDiv = document.createElement('div');
    dlBtnDiv.className = 'woo-box-item-flex toolbar_item_1ky_D toolbar_cursor_34j5V';
    let divInDiv = document.createElement('div');
    divInDiv.className =
      'woo-box-flex woo-box-alignCenter woo-box-justifyCenter toolbar_like_20yPI toolbar_likebox_1rLfZ toolbar_wrap_np6Ug';
    let dlBtn = document.createElement('button');
    dlBtn.className = 'woo-like-main toolbar_btn_Cg9tz my-refresh-button';
    dlBtn.setAttribute('tabindex', '0');
    dlBtn.setAttribute('title', '刷新');
    dlBtn.innerHTML =
      '<span class="woo-like-iconWrap"><i class="woo-font woo-font--refresh woo-like-icon"></i></span><span class="woo-like-count">开始刷新</span>';
    dlBtn.addEventListener('click', async function (event) {
      event.preventDefault();
      const article = this.closest('article.woo-panel-main');
      if (article) {
        const header = article.getElementsByTagName('header')[0];
        const postLink = header.getElementsByClassName('head-info_time_6sFQg')[0];
        let postId = postLink.href.split('/')[postLink.href.split('/').length - 1];
        const resJson = await httpRequest('https://' + location.host + '/ajax/statuses/show?id=' + postId);
        startRefresh(resJson);
      }
    });
    divInDiv.appendChild(dlBtn);
    dlBtnDiv.appendChild(divInDiv);
    footer.firstChild.firstChild.firstChild.appendChild(dlBtnDiv);
  }

  function addFilterBtn(footer) {
    // console.log('add my-refresh button');
    let filBtnDiv = document.createElement('div');
    filBtnDiv.className = 'woo-box-item-flex toolbar_item_1ky_D toolbar_cursor_34j5V';
    let divInDiv = document.createElement('div');
    divInDiv.className =
      'woo-box-flex woo-box-alignCenter woo-box-justifyCenter toolbar_like_20yPI toolbar_likebox_1rLfZ toolbar_wrap_np6Ug';
    let filBtn = document.createElement('button');
    filBtn.className = 'woo-like-main toolbar_btn_Cg9tz author-filter-button';
    filBtn.setAttribute('tabindex', '0');
    filBtn.setAttribute('title', '只看博主');
    filBtn.innerHTML =
      '<span class="woo-like-iconWrap"><i class="woo-font woo-font--check woo-like-icon"></i></span><span class="woo-like-count">只看博主</span>';
    filBtn.addEventListener('click', async function (event) {
      event.preventDefault();
      GM_setValue('filterAuthor', !GM_getValue('filterAuthor', false));
    });
    divInDiv.appendChild(filBtn);
    filBtnDiv.appendChild(divInDiv);
    footer.firstChild.firstChild.firstChild.appendChild(filBtnDiv);
  }

  function startRefresh(data) {
    console.log('start refresh!!!');
    if (globalTimerId) {
      clearInterval(globalTimerId);
    }
    globalTimerId = setInterval(async function () {
      handleCommentData(data.id, data.user.idstr);
    }, 5000);
  }

  // function stopRefresh() {
  //   console.log('stop refresh');
  //   clearInterval(globalTimerId);
  // }

  async function handleCommentData(postId, userId) {
    const url = 'https://' + location.host + '/ajax/statuses/buildComments';
    const params = {
      is_asc: 0,
      is_reload: 1,
      // 5204231859471582
      id: postId,
      is_show_bulletin: 3,
      is_mix: 0,
      count: 10,
      // 5372718359
      uid: userId,
      fetch_level: 0,
      locale: 'en',
    };

    const resJson = await httpRequest(url, 'GET', params);
    console.log('resJson===>', resJson);

    const comments = resJson.data.filter((item) => {
      if (!GM_getValue('filterAuthor', false)) {
        return true;
      }
      return item.is_mblog_author == true;
    });
    comments.forEach((item) => {
      const t = new Date(item.created_at);
      console.log(t.toLocaleString(), item.text);
    });
    const html = comments
      .map((i) => {
        const t = new Date(i.created_at);
        return `
        <div class="wbpro-list yawf-feed-comment">
        <div class="item1">
          <div class="text yawf-feed-comment-text">${
            i.user.screen_name
          }:<span class="yawf-feed-comment-content yawf-feed-detail-content-handler">${i.text}</span></div>
          <div class="info woo-box-flex woo-box-alignCenter woo-box-justifyBetween" yawf-component-tag="woo-box">
            <div>${t.toLocaleString()} <span> ${i.source}</span></div>
          </div>
          </div>
        </div>
        `;
      })
      .join('');

    const commentBox = document.getElementById('scroller');
    commentBox.innerHTML = html;
  }
})();
