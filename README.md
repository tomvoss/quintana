# Quintana

## To get started you'll need to create a .env file like the following:
```
POLONIEX_KEY=
POLONIEX_SIGN=
BITTREX_KEY=
BITTREX_SECRET=
KRAKEN_KEY=
KRAKEN_SECRET=
```
Be sure to use read-only keys from the corresponding exchanges.

## Configure the listening port in config/default.json
```
{
    "express": {
        "port": 3000
    }
}
```

## To launch quintana:
```
yarn start
```
