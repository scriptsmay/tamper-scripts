// const url1 = '';
const url =
  'https://weibo.com/ajax/statuses/buildComments?is_asc=0&is_reload=1&id=5204231859471582&is_show_bulletin=3&is_mix=0&count=10&uid=5372718359&fetch_level=0&locale=en';

const targetElement = document.querySelector('#scroller');
if (targetElement && targetElement.parentNode) {
  const newDiv = document.createElement('div');
  newDiv.id = 'my-comments';
  newDiv.textContent = '---------TODO---------';
  targetElement.parentNode.insertBefore(newDiv, targetElement);
}

function loadList() {
  // document.getElementById('my-comments').innerHTML = '<p>..........</p>';
  fetch(url)
    .then((res) => res.json())
    .then((res) => {
      const comments = res.data.filter((item) => item.is_mblog_author == true);
      comments.forEach((item) => {
        const t = new Date(item.created_at);
        console.log(t.toLocaleString(), item.text);
      });
      const html = comments
        .map((i) => `<div class="detail_wbtext_4CRf9 yawf-feed-detail-content">${i.text}</div>`)
        .join('');
      document.getElementById('my-comments').innerHTML =
        html + '<div class="detail_wbtext_4CRf9 yawf-feed-detail-content">------END------</div>';
    });
}

const tmpId = setInterval(() => {
  loadList();
}, 10000);

function stop() {
  clearInterval(tmpId);
}
