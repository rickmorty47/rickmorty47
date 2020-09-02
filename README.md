# Deployment

**Install node**

https://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/

**Install postgresql**

You can start Postgresql from docker-compose or run it on the server
```shell script
docker-compose -f docker-compose.yaml up
```

Also, you should install PostGIS package (TODO: Dockerfile with installed PostGIS)
```shell script
docker exec -it rickmorty47_db bash
apt update
apt install postgresql-11-postgis-3
```

**Config and start**

* ```git pull```
* ```npm ci```
* ```copy .env.example -> .env```
* ```fill .env```
* ```pm2 start npm --name "rickmorty47 telegram server" -- start```

# Docker Deployment

* ```git pull```
* ```docker build -t rickmorty47/bot .```
* ```docker run -d --restart always -p 3000:3000 --name rickmorty47-bot rickmorty47/bot```
