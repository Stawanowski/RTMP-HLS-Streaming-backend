# ExpressJS Streaming, authentication and ftp backend

## Setup

Recommended file tree:
    /
    ├── etc /
    │   └── nginx/
    │       └── nginx.conf
    └── var/
        ├── www/
        │   ├── transcode.sh
        │   └── transcodeTosd.sh
        └── hls/
            └── native/

Configure nginx and transcoding scripts
```
sudo apt install nginx libnginx-mod-rtmp && 
sudo cp ./config/nginx.conf /etc/nginx/ &&
sudo cp ./config/transcode.sh /var/www/ &&
sudo cp ./config/transcodeTosd.sh /var/www

```

Initialize ftp docker container
```
docker run -d -v /home/ftpserver:/home/vsftpd -p 20:20 -p 21:21 -p 47400-47470:47400-47470 -e FTP_USER=<ftpusername> -e FTP_PASS=<ftppassword> -e PASV_ADDRESS=127.0.0.1 --name ftp --restart=always bogem/ftp
```

Install required dependencies

```
npm i -g prisma nodemon
npm install
npx prisma migrate dev
```

## Development
```
sudo npm run dev
```
