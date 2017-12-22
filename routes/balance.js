import pino from 'pino'; const log = pino();
import KrakenAPI from 'kraken-api';
import PoloniexAPI from 'poloniex-api-node';
import BittrexAPI from 'node-bittrex-api';
import BinanceAPI from 'node-binance-api';
import parallel from 'async/parallel';
import BigNumber from 'bignumber.js';

export default function balance( req, res ) {
    let response = {};
    const poloniex = new PoloniexAPI(
        process.env.POLONIEX_KEY,
        process.env.POLONIEX_SIGN
    );
    const kraken = new KrakenAPI(
        process.env.KRAKEN_KEY,
        process.env.KRAKEN_SECRET
    );
    const bittrex = BittrexAPI;
    bittrex.options({
        'apikey': process.env.BITTREX_KEY,
        'apisecret': process.env.BITTREX_SECRET,
    });
    const binance = BinanceAPI;
    binance.options({
        'APIKEY': process.env.BINANCE_KEY,
        'APISECRET': process.env.BINANCE_SECRET,
    })

    let taskError = {};

    parallel({
        /*
        KrakenBalances( done ) {
            kraken.api( 'Balance' )
            .then( ( balance ) => {
                let response = {};

                for ( let ticker in balance.result ) {
                    let total = new BigNumber( balance.result[ticker] );

                    if ( ! total.equals( 0 ) ) {
                        switch ( ticker ) {
                            case "ZUSD":
                                ticker = "USD";
                                break;
                            case "XXBT":
                                ticker = "BTC";
                                break;
                            case "XXRP":
                                ticker = "XRP";
                                break;
                        }

                        response[ticker] = {
                            balance: {
                                total: total,
                            },
                        };
                    }
                }

                done( null, response );
            })
            .catch( ( err ) => {
                taskError.taskName = "KrakenBalance";
                taskError.msg = err.message;
                taskError.error = err;
                log.error( taskError );
                done( taskError );
            });
            // done( null, {XRP:{balance:{total:0}}} );
        },
        */

        /*
        KrakenTickerBTCUSD( done ) {
            kraken.api( 'Ticker', { pair: 'XXBTZUSD' } )
            .then( ( tickers ) => {
                let response = {};

                response = {
                    BTC: {
                        last: tickers.result.XXBTZUSD.c[0],
                    },
                };

                done( null, response );
            })
            .catch ( ( err ) => {
                taskError.taskName = "KrakenTickerBTCUSD";
                taskError.msg = err.message;
                taskError.error = err;
                log.error( taskError );
                done( taskError );
            });
            // done( null, {BTC:{last:0}} );
        },
        */

        /*
        KrakenTickerXRPUSD( done ) {
            kraken.api( 'Ticker', { pair: 'XXRPZUSD' } )
            .then( ( tickers ) => {
                let response = {};

                response = {
                    XRP: {
                        last: tickers.result.XXRPZUSD.c[0],
                    },
                };

                done( null, response );
            })
            .catch ( ( err ) => {
                taskError.taskName = "KrakenTickerXRPUSD";
                taskError.msg = err.message;
                taskError.error = err;
                log.error( taskError );
                done( taskError );
            });
            // done( null, {XRP:{last:0}} );
        },
        */

        /*
        KrakenTradeBalance( done ) {
            kraken.api( 'TradeBalance' )
            .then( ( tradeBalance ) => {
                done( null, tradeBalance );
            })
            .catch( ( err ) => {
                taskError.taskName = "KrakenTradeBalance";
                taskError.msg = err.message;
                taskError.error = err;
                log.error( taskError );
                done( taskError );
            });
            // done( null, {result:{eb:0}} );
        },
        */

        PoloniexTicker( done ) {
            poloniex.returnTicker()
            .then( ( tickers ) => {
                done( null, tickers );
            })
            .catch( ( err ) => {
                taskError.taskName = "PoloniexTicker";
                taskError.msg = err.message;
                taskError.error = err;
                log.error( taskError );
                done( taskError );
            });
        },

        PoloniexBalances( done ) {
            poloniex.returnCompleteBalances( 'all' )
            .then( ( completeBalances ) => {
                done( null, completeBalances );
            })
            .catch( ( err ) => {
                taskError.taskName = "PoloniexBalances";
                taskError.msg = err.message;
                taskError.error = err;
                log.error( taskError );
                done( taskError );
            });
        },

        BinanceBalances( done ) {
            binance.balance( ( balances ) => {
                done( null, balances );
            });

            // binance.balance()
            // .then( ( balances ) => {
            //     done( null, balances );
            // })
            // .catch( ( err ) => {
            //     taskError.taskName = "BinanceBalances";
            //     taskError.msg = err.message;
            //     taskError.error = err;
            //     log.error( taskError );
            //     done( taskError );
            // });
        },

        BittrexBalances( done ) {
            bittrex.getbalances( ( bittrexBalances, err ) => {
                if ( err ) {
                    taskError.taskName = "BittrexBalances";
                    taskError.msg = err.message;
                    taskError.error = err;
                    log.error( taskError );
                    done( taskError );
                } else {
                    done( null, bittrexBalances );
                }
            });
        }
    }, ( err, results ) => {
        if ( err ) {
            res.json( err );
        } else {
            let response = {};
            // response.kraken = {};
            // let KrakenBalances = results.KrakenBalances;
            // let KrakenTickerBTCUSD = results.KrakenTickerBTCUSD;
            // let KrakenTickerXRPUSD = results.KrakenTickerXRPUSD;
            // let KrakenTickers = {
            //     BTC: {
            //         last: KrakenTickerBTCUSD.BTC.last,
            //     },
            //     XRP: {
            //         last: KrakenTickerXRPUSD.XRP.last,
            //     },
            // };
            // let KrakenTradeBalance = results.KrakenTradeBalance;
            response.poloniex = {};
            response.binance = {};
            let PoloniexTicker = results.PoloniexTicker;
            let PoloniexBalances = results.PoloniexBalances;
            let BinanceBalances = results.BinanceBalances;
            let BittrexBalances = results.BittrexBalances;
            // let krakenBTCUSD = new BigNumber( KrakenTickerBTCUSD.BTC.last );
            // let krakenXRPUSD = new BigNumber( KrakenTickerXRPUSD.XRP.last );
            let poloniexBTCUSD = PoloniexTicker.USDT_BTC ? new BigNumber( PoloniexTicker.USDT_BTC.last ) : null;
            let poloniexUsdValue = new BigNumber( 0 );
            let totalUsdValue = new BigNumber( 0 );
            // let krakenEquivalentBalance = new BigNumber( KrakenTradeBalance.result.eb );

            // response.kraken = KrakenBalances;
            // if ( response.kraken.BTC ) {
            //     response.kraken.BTC.last = krakenBTCUSD.round( 2 );
            //     response.kraken.BTC.balance.usdValue = krakenBTCUSD.times( response.kraken.BTC.balance.total ).round( 2 );
            // }
            // if ( response.kraken.XRP ) {
            //     response.kraken.XRP.last = krakenXRPUSD.round( 5 );
            //     response.kraken.XRP.balance.usdValue = krakenXRPUSD.times( response.kraken.XRP.balance.total ).round( 2 );
            // }
            //
            // if ( ! krakenEquivalentBalance.equals( 0 ) ) {
            //     response.kraken.usdValue = krakenEquivalentBalance.round( 2 );
            //     totalUsdValue = totalUsdValue.plus( krakenEquivalentBalance );
            // }

            response.bittrex = BittrexBalances.result;

            //response.binance = BinanceBalances;
            for ( let ticker in BinanceBalances ) {
                let available = new BigNumber( BinanceBalances[ticker].available );
                let onOrder = new BigNumber( BinanceBalances[ticker].onOrder );
                let total = available.plus( onOrder );

                if ( ! total.equals( 0 ) ) {
                    response.binance[ticker] = {
                        balance: {
                            available: available.round( 8 ),
                            onOrders: onOrder.round( 8 ),
                            total: total.round( 8 ),
                            btcValue: null,
                            usdValue: null,
                        }
                    };
                }
            }

            for ( let ticker in PoloniexBalances ) {
                let balance = PoloniexBalances[ticker];
                let btcValue = new BigNumber( balance.btcValue );

                if ( ! btcValue.equals( 0 ) ) {
                    let available = new BigNumber( balance.available );
                    let onOrders = new BigNumber( balance.onOrders );
                    let total = available.plus( onOrders );
                    //console.log( PoloniexTicker );
                    let last = PoloniexTicker['USDT_' + ticker] ? new BigNumber( PoloniexTicker['USDT_' + ticker].last ) : null;
                    let usdValue = btcValue.times( poloniexBTCUSD );
                    poloniexUsdValue = poloniexUsdValue.plus( usdValue );

                    totalUsdValue = totalUsdValue.plus( usdValue );

                    if ( ! available.plus( onOrders ).equals( 0 ) ) {
                        response.poloniex[ticker] = {
                            balance: {
                                available: available.round( 8 ),
                                onOrders: onOrders.round( 8 ),
                                total: total.round( 8 ),
                                btcValue: btcValue.round( 8 ),
                                usdValue: usdValue.toFixed( 2 ),
                            },
                        };

                        if ( last ) {
                            response.poloniex[ticker].last = last.round( 8 );
                        }
                    }
                }
            }

            response.poloniex.usdValue = poloniexUsdValue.round( 2 );

            response.totalUsdValue = totalUsdValue.round( 2 );

            res.json( response );
        }
    });
}
