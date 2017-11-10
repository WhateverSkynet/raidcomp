#!/usr/bin/env sh
CHANGES=$(git --no-pager diff --name-only FETCH_HEAD $(git merge-base FETCH_HEAD master))
docker login --username="$DOCKER_USERNAME" --password="$DOCKER_PASSWORD"
if [ "$2" == "client" ] && [ -n "$(grep '^client' <<< "$CHANGES")" ]
  then
    echo "building client"
    cd client
    yarn install
    yarn build
    yarn test
    if [ "$TRAVIS_BRANCH" == "master" ]
      then
        docker build -t dvoicescuks/raidcomp-client .
        docker push dvoicescuks/raidcomp-client
    fi
fi

if [ "$2" == "server" ] && [ -n "$(grep '^server' <<< "$CHANGES")" ]
  then
    echo "building server"
    cd server
    yarn install
    yarn build
    yarn test
    if [ "$TRAVIS_BRANCH" == "master" ]
      then
        yarn install --production --ignore-scripts --prefer-offline
        docker build -t dvoicescuks/raidcomp-server .
        docker push dvoicescuks/raidcomp-server
    fi
fi
