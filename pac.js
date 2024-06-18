function FindProxyForURL(url, host) {
    var noproxy =
        'localhost,192.168.*,127.0.0.1,*.local,timestamp.apple.com,sequoia.apple.com,seed-sequoia.siri.apple.com';
    noproxy.split(',').forEach(function (item) {
        if (shExpMatch(host, item)) {
            return 'DIRECT';
        }
    });

    // 如果请求的主机是localhost，则直接连接，不使用代理
    if (host === 'localhost') {
        return 'DIRECT';
    }

    // 将所有流量通过代理服务器转发
    return 'PROXY 192.168.31.100:7890';
}
