#!/bin/bash

dir=$(cd -P -- "$(dirname -- "$0")" && pwd -P)

sudo cp $dir/db/dump.agz ~/yandex_wallet/db/backup/dump.agz

docker exec yandex-mongodb-production /bin/bash -c 'mongorestore --drop --gzip --archive=/backup/dump.agz --nsFrom=test_yandex_wallet.* --nsTo=yandex_wallet.*'