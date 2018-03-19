#!/usr/bin/env bash
echo "Deploying application!"
time rsync -avz ./ dylan@nielsendb.com:/opt/apps/x-effect-api/
time ssh root@nielsendb.com systemctl restart x-effect-api
echo "...done!"
