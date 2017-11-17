# raidcomp


[![Build Status](https://travis-ci.org/WhateverSkynet/raidcomp.svg?branch=master)](https://travis-ci.org/WhateverSkynet/raidcomp)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Developing

## Requirements

## Requirements

* NodeJS 8.x.x
* Yarn (`npm i yarn -g`)
* MongoDB for server

## Client

* `cd client`
* `yarn install` install dependencies
* `yarn start` start dev server

## Server

Mongodb is required for storing data. Default configuration expects that there is locally available mongodb server on port 27017. Configuration is under server/config.


* Set `BLIZZARD_ID` and `BLIZZARD_SECRET` environment variables to credentials generated from https://dev.battle.net
* `cd server`
* `yarn install` install dependencies
* `yarn start` start dev server