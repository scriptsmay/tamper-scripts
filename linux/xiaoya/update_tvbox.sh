#/bin/bash

# 自定义配置目录
BASE_DIR=/Users/virola/workspace/docker/xiaoya-tvbox
PORT1=4567
PORT2=5344

TAG="latest"
UPDATE=false
LOGS=false
MOUNT=""

UPDATE=true

echo "使用配置目录：$BASE_DIR"
echo "端口映射： $PORT1:4567 | $PORT2:80"

mkdir -p $BASE_DIR

if ! grep "access.mypikpak.com" /etc/hosts >/dev/null
    echo "nothing..."
then
    echo "127.0.0.1\taccess.mypikpak.com" >> /etc/hosts
fi

docker container prune -f --filter "label=MAINTAINER=Har01d"
docker image prune -f --filter "label=MAINTAINER=Har01d"
docker volume prune -f --filter "label=MAINTAINER=Har01d"

platform="linux/amd64"
ARCH=$(uname -m)
if [ "$ARCH" = "armv7l" ]; then
  echo "不支持的平台"
  exit 1
elif [[ "$ARCH" = "aarch64" || "$ARCH" = "arm64" ]]; then
    platform="linux/arm64"
fi

IMAGE_ID=$(docker images -q haroldli/xiaoya-tvbox:${TAG})
echo "下载最新Docker镜像，平台：${platform}, image tag: ${TAG}"
for i in 1 2 3 4 5
do
   docker pull --platform ${platform} haroldli/xiaoya-tvbox:${TAG} && break
done

NEW_IMAGE=$(docker images -q haroldli/xiaoya-tvbox:${TAG})
if [ "$UPDATE" = "true" ] && [ "$IMAGE_ID" = "$NEW_IMAGE" ]; then
  echo "镜像没有更新"
  exit
fi

echo "重启应用"
docker rm -f xiaoya-tvbox 2>/dev/null
docker run -d -p $PORT1:4567 -p $PORT2:80 -e ALIST_PORT=$PORT2 -v "$BASE_DIR":/data $MOUNT --restart=always --name=xiaoya-tvbox haroldli/xiaoya-tvbox:${TAG}


echo "\n请使用以下命令查看日志输出："
echo "    docker logs -f xiaoya-tvbox\n"
echo "\n"
echo "默认端口变更为4567"

