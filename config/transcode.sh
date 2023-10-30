#!/bin/bash

input_rtmp="rtmp://localhost:1935/live/$1"
output_path="/var/www/hls/$1"

# Create HLS directories and set permissions

rm -rf  "$output_path/720"
mkdir -p "$output_path/720/"
chmod 777 "$output_path/720/"

# Function to clean up old segments, keeping the last 5 segments
#cleanup_segments() {
#  find "$1" -name "*.ts" | sort -V | head -n -5 | xargs rm
#}

ffmpeg -i "$input_rtmp" -vf "scale=1280:720" -c:v libx264 -b:v 2500k -preset medium -g 30 -c:a aac -b:a 160k -r:a 48000 -f hls -hls_time 4 -hls_playlist_type event -hls_flags delete_segments -hls_segment_filename "$output_path/720/%03d.ts" "$output_path/720/index.m3u8"

#ffmpeg -i "$input_rtmp" -vf "scale=1280:720" -c:v libx264 -b:v 2500k -preset medium -g 30 -c:a aac -b:a 160k -r:a 48000 -f hls -hls_time 4 -hls_playlist_type vod -hls_list_size 5 -hls_segment_filename "$output_path/720/%03d.ts"  "$output_path/720/index.m3u8" 

# ffmpeg -i "$input_rtmp" -vf "scale=854:480" -c:v libx264 -b:v 2500k -preset fast -g 30 -c:a aac -b:a 160k -r:a 48000 -f hls -hls_time 4 -hls_playlist_type vod -hls_segment_filename "$output_path/480/%03d.ts" -hls_list_size 5 "$output_path/480/index.m3u8" &

# Wait for the transcode processes to finish
#wait

# Clean up segments for each quality
#cleanup_segments "$output_path/720/"
#cleanup_segments "$output_path/480/"
