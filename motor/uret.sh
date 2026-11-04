#!/bin/bash
# resumable pipeline: batch3.sh "22 23 24"
cd "$(dirname "$0")"
EPS="$1"; OUT=/home/user/mekanizma_serisi; mkdir -p $OUT logs
for e in $EPS; do n=$(ls full/$e/3d 2>/dev/null | wc -l); [ "$n" -ge 930 ] || node render.js 3d tr full/$e/3d 30 all $e > logs/3d_$e.txt 2>&1; done
for e in $EPS; do for L in tr en; do n=$(ls full/$e/ov_$L 2>/dev/null | wc -l); [ "$n" -ge 930 ] || node render.js overlay $L full/$e/ov_$L 30 all $e > logs/ov_${e}_$L.txt 2>&1; done; done
for e in $EPS; do for L in tr en; do f=$OUT/mekanizma_${e}_$L.mp4; d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $f 2>/dev/null); [ "$d" = "31.000000" ] && continue
  ffmpeg -v error -y -framerate 30 -i full/$e/3d/%05d.jpg -framerate 30 -i full/$e/ov_$L/%05d.png -f lavfi -i anullsrc=r=44100:cl=stereo -filter_complex "[0][1]overlay=format=auto,format=yuv420p" -c:v libx264 -preset slow -crf 18 -c:a aac -shortest -movflags +faststart $f
done; done
echo "BITTI $EPS"
