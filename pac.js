function FindProxyForURL(url, host) {
    var noproxy =
        'localhost,192.168.*,127.0.0.1,*.local,timestamp.apple.com,sequoia.apple.com,seed-sequoia.siri.apple.com';
    var isDirect = false;
    var list = noproxy.split(',');
    for (let index = 0; index < list.length; index++) {
        var item = list[index];
        if (shExpMatch(host, item)) {
            isDirect = true;
            break;
        }
    }

    // 如果请求的主机是localhost，则直接连接，不使用代理
    if (isDirect || host === 'localhost') {
        return 'DIRECT';
    }

    // 将所有流量通过代理服务器转发
    return 'PROXY 192.168.1.3:7890';
}
