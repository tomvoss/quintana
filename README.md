# Quintana
### Monitor cryptocurrency balances across multiple exchanges
Note: This initial commit has not been cleaned up and contains a lot of commented out code. It should work out-of-box for Poloniex once you get your keys put in the .env file.

## To get started you'll need to create a .env file like the following:
```
POLONIEX_KEY=
POLONIEX_SIGN=
BITTREX_KEY=
BITTREX_SECRET=
KRAKEN_KEY=
KRAKEN_SECRET=
BINANCE_KEY=
BINANCE_SECRET=
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

## To install the required dependencies:
```
yarn install
```

## To launch quintana:
```
yarn start
```

## By default Quintana will listen on port 3000 and your balances will be available at /balance:
```
http://127.0.0.1:3000/balance
```

## Useful? Consider a small donation:
<img src="public/donate.png" width="340" title="Donate Bitcoin">
3KCLszmFD5vscc844uzjuvPtiByugEGKtf
