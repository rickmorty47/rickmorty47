# Prerequisites
## PostgreSQL with PostGIS

You can start PostgreSQL from the provided docker-compose or run it on the server
```shell script
docker-compose -f docker-compose.yaml up -d
```

Also, you should install PostGIS package (TODO: Dockerfile with installed PostGIS)
```shell script
docker exec -it rickmorty47_db bash
apt update
apt install postgresql-11-postgis-3
```

# Deployment

## Install node

https://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/

## Install pm2

https://pm2.keymetrics.io/docs/usage/quick-start/.

## Config and start

* ```git pull```
* ```npm ci```
* ```copy .env.example -> .env```
* ```fill .env``` (see "Configuration options")
* ```pm2 start npm --name "rickmorty47 telegram server" -- start```

### Configuration options

- `TELEGRAM_BOT_TOKEN`: https://core.telegram.org/bots
- `GOOGLE_API_KEY`: https://developers.google.com/maps/documentation/javascript/get-api-key. **Please note: token need the following permissions:**
  - [Places API](https://developers.google.com/maps/documentation/javascript/places-autocomplete#get-started)
  - [Geocoding API](https://developers.google.com/maps/documentation/javascript/geocoding#GetStarted)
- `TELEGRAM_ADMIN_LOGIN` (optional): nickname of bot admin (without `@`). Support / cooperation messages will be sent to the specified user. 
- other options can be left with default values (if DB connection doesn't need to be customized)

# Docker Deployment

* ```git pull```
* ```copy .env.example -> .env```
* ```fill .env``` (see "Configuration options")
* ```docker build -t rickmorty47/backend .```
* ```docker run -d --restart always --net host -p 3000:3000 --name backend rickmorty47/backend```
