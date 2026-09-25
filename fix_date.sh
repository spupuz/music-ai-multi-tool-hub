#!/bin/bash
DATE=$(date +%Y-%m-%d)
sed -i "s/\$(date +%Y-%m-%d)/$DATE/g" .Jules/bolt.md
