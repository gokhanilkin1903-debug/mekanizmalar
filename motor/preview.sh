#!/bin/bash
# usage: preview.sh EP [lang] [times]
EP=$1; L=${2:-tr}; TS=${3:-"2,7,12,19,25,30"}
D=prev/$EP; rm -rf $D; mkdir -p $D
node render.js 3d $L $D/3d 30 $TS $EP | grep -E "err|page" ; node render.js overlay $L $D/ov 30 $TS $EP | grep -E "err|page"
args=""; n=0
for t in ${TS//,/ }; do ffmpeg -v error -y -i $D/3d/t$t.jpg -i $D/ov/t$t.png -filter_complex "overlay,scale=360:-1" $D/c$n.png; args="$args -i $D/c$n.png"; n=$((n+1)); done
if [ $n -gt 1 ]; then ffmpeg -v error -y $args -filter_complex hstack=$n $D/strip.png; else cp $D/c0.png $D/strip.png; fi
