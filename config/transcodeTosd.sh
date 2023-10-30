#!/bin/bash

input_rtmp="rtmp://localhost:1935/live/$1"
output_path="/var/www/hls/$1"

rm -rf  "$output_path/480"
mkdir -p "$output_path/480/"
chmod 777 "$output_path/480/"
ffmpeg -i "$input_rtmp" -vf "scale=854:480" -c:v libx264 -b:v 2500k -preset medium -g 30 -c:a aac -b:a 160k -r:a 48000 -f hls -hls_time 4 -hls_playlist_type event -hls_flags delete_segments -hls_segment_filename "$output_path/480/%03d.ts" "$output_path/480/index.m3u8"
