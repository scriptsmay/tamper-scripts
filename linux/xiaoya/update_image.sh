#!/bin/sh

# 自用的小雅每日更新脚本
# Ps. 我的机器是macos，仅在本机测试通过

# 自定义镜像名称
image_name=registry.cn-hangzhou.aliyuncs.com/virola/xiaoyaliu_alist:latest
config_dir=/Users/virola/workspace/docker/xiaoya


# 定义消息推送API的URL
API_URL="https://vercel.virola.me/api/send"
SEND_KEY=""

if [[ -f $config_dir/tg_send_key.txt ]] && [[ -s $config_dir/tg_send_key.txt ]]; then
    SEND_KEY=$(cat $config_dir/tg_send_key.txt)
fi

function SEND_MSG() {
    local TEXT="$1"

    # 判断是否设置了SEND_KEY
    [[ -z "$SEND_KEY" ]] && return 0

    # 获取当前日期和时间，并格式化
    current_time=$(date "+%Y-%m-%d %H:%M:%S")

    # 使用curl命令发送POST请求
    # 注意：如果API需要认证或其他特定的头部信息，请在这里添加
    PAYLOAD='{"text":"'$TEXT'\nTimestamp: '$current_time'","sendkey":"'$SEND_KEY'"}'

    RESPONSE_TEXT=$(curl -s -X POST -H "Content-Type: application/json" -d "$PAYLOAD" "$API_URL")

    # 检查curl请求是否成功
    if [ $? -ne 0 ]; then
        echo "curl请求失败。" >&2
        exit 1
    fi
}

# 更新容器
docker stop xiaoya 2>/dev/null
docker rm xiaoya 2>/dev/null
docker rmi $image_name
docker pull $image_name

if [[ -f $config_dir/proxy.txt ]] && [[ -s $config_dir/proxy.txt ]]; then
    proxy_url=$(head -n1 $config_dir/proxy.txt)
    docker create -p 5678:80 -p 2345:2345 -p 2346:2346 --env HTTP_PROXY="$proxy_url" --env HTTPS_PROXY="$proxy_url" --env no_proxy="*.aliyundrive.com" -v $config_dir:/data -v $config_dir/data:/www/data --restart=always --name=xiaoya $image_name
else
    docker create -p 5678:80 -p 2345:2345 -p 2346:2346 -v $config_dir:/data -v $config_dir/data:/www/data --restart=always --name=xiaoya $image_name
fi

# 更新数据
# bash -c "$(curl -sSL http://docker.xiaoya.pro/update_data.sh)" -s --no-upgrade
docker start xiaoya

SEND_MSG "docker xiaoya 更新完成"
