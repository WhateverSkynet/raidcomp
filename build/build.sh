#!/usr/bin/env sh
if [ "$TRAVIS_PULL_REQUEST" == "false" ]
  then
    CHANGES=$(git diff --name-only HEAD HEAD~1)
  else
    CHANGES=$(git diff --name-only HEAD $(git merge-base HEAD $TRAVIS_BRANCH))
fi
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
