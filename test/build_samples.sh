#!/bin/sh
pandoc -t json -i sample1.md -o sample1.json
pandoc -t json -i sample2.md -o sample2.json
