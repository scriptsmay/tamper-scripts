# 没有必要了，改成用 mondo rescure 来备份

cd /
tar cvpzf backup.tgz / --exclude=/proc --exclude=/lost+found --exclude=/mnt --exclude=/sys --exclude=backup.tgz

