import pino from 'pino'; const log = pino();
import KrakenAPI from 'kraken-api';
import BittrexAPI from 'node-bittrex-api';
import BinanceAPI from 'node-binance-api';
import parallel from 'async/parallel';
import BigNumber from 'bignumber.js';

export default function balance( req, res ) {
    let response = {};
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
                            case "XLTC":
                                ticker = "LTC";
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

        KrakenTickerLTCUSD( done ) {
            kraken.api( 'Ticker', { pair: 'XLTCZUSD' } )
            .then( ( tickers ) => {
                let response = {};

                response = {
                    LTC: {
                        last: tickers.result.XLTCZUSD.c[0],
                    },
                };

                done( null, response );
            })
            .catch ( ( err ) => {
                taskError.taskName = "KrakenTickerLTCUSD";
                taskError.msg = err.message;
                taskError.error = err;
                log.error( taskError );
                done( taskError );
            });
            // done( null, {LTC:{last:0}} );
        },

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

        
        BinanceTicker( done ) {
            binance.prices( ( tickers ) => {
                // console.log( tickers );
                done( null, tickers );
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
        

        BittrexTicker( done ) {
            bittrex.getmarketsummaries( ( bittrexMarketSummaries, err ) => {
                if ( err ) {
                    taskError.taskName = "BittrexTicker";
                    taskError.msg = err.message;
                    taskError.error = err;
                    log.error( taskError );
                    done( taskError );
                } else {
                    done( null, bittrexMarketSummaries );
                }
            });
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
            let response = {summary:{},exchanges:{}};
            response.exchanges.kraken = {};
            let KrakenBalances = results.KrakenBalances;
            let KrakenTickerBTCUSD = results.KrakenTickerBTCUSD;
            let KrakenTickerXRPUSD = results.KrakenTickerXRPUSD;
            let KrakenTickerLTCUSD = results.KrakenTickerLTCUSD;
            let KrakenTickers = {
                BTC: {
                    last: KrakenTickerBTCUSD.BTC.last,
                },
                XRP: {
                    last: KrakenTickerXRPUSD.XRP.last,
                },
                LTC: {
                    last: KrakenTickerLTCUSD.LTC.last,
                }
            };
            let KrakenTradeBalance = results.KrakenTradeBalance;
            response.exchanges.binance = {};
            response.exchanges.bittrex = {};
            let BittrexTicker = results.BittrexTicker.result;
            let BinanceTicker = results.BinanceTicker;
            let BinanceBalances = results.BinanceBalances;
            let BittrexBalances = results.BittrexBalances;
            let krakenBTCUSD = new BigNumber( KrakenTickerBTCUSD.BTC.last );
            let krakenXRPUSD = new BigNumber( KrakenTickerXRPUSD.XRP.last );
            let krakenLTCUSD = new BigNumber( KrakenTickerLTCUSD.LTC.last );
            //let bittrexBTCUSD = BittrexTicker.BTCUSDT ? new BigNumber( BittrexTicker.BTCUSDT ) : new BigNumber( 0 );
            let binanceBTCUSD = BinanceTicker.BTCUSDT ? new BigNumber( BinanceTicker.BTCUSDT ) : new BigNumber( -1 );
            let subtotal = new BigNumber( 0 );
            let totalUsdValue = new BigNumber( 0 );
            let krakenEquivalentBalance = new BigNumber( KrakenTradeBalance.result.eb );

            response.exchanges.kraken = KrakenBalances;
            if ( response.exchanges.kraken.BTC ) {
                response.exchanges.kraken.BTC.last = krakenBTCUSD.round( 2 );
                response.exchanges.kraken.BTC.balance.usdValue = krakenBTCUSD.times( response.exchanges.kraken.BTC.balance.total ).round( 2 );
            }
            if ( response.exchanges.kraken.XRP ) {
                response.exchanges.kraken.XRP.last = krakenXRPUSD.round( 5 );
                response.exchanges.kraken.XRP.balance.usdValue = krakenXRPUSD.times( response.exchanges.kraken.XRP.balance.total ).round( 2 );
            }
            if ( response.exchanges.kraken.LTC ) {
                response.exchanges.kraken.LTC.last = krakenLTCUSD.round( 5 );
                response.exchanges.kraken.LTC.balance.usdValue = krakenLTCUSD.times( response.exchanges.kraken.LTC.balance.total ).round( 2 );
            }
            
            if ( ! krakenEquivalentBalance.equals( 0 ) ) {
                response.exchanges.kraken.usdValue = krakenEquivalentBalance.round( 2 );
                totalUsdValue = totalUsdValue.plus( krakenEquivalentBalance );
            }

            let bittrexTickers = {};
            let bittrexBTCUSD = null;
            for ( let tickerObject of BittrexTicker ) {
                let ticker = tickerObject.MarketName;
                bittrexTickers[ticker] = tickerObject.Last;

                if ( ticker === 'USDT-BTC' ) {
                    bittrexBTCUSD = new BigNumber( tickerObject.Last );
                }
            }

            subtotal = new BigNumber( 0 );
            for ( let tickerObject of BittrexBalances.result ) {
                let ticker = tickerObject.Currency;
                let balance = new BigNumber( tickerObject.Balance );
                let available = new BigNumber( tickerObject.Available );
                let pending = new BigNumber( tickerObject.Pending );
                let btcValue = bittrexTickers['BTC-' + ticker] ? (new BigNumber( bittrexTickers['BTC-' + ticker] )).times( balance ) : new BigNumber( 0 );
                if ( ticker === 'BTC' ) { btcValue = balance; }
                let usdValue = btcValue.times( bittrexBTCUSD );

                if ( ! balance.equals( 0 ) ) {
                    subtotal = subtotal.plus( usdValue );
                    totalUsdValue = totalUsdValue.plus( usdValue );

                    response.exchanges.bittrex[ticker] = {
                        balance: {
                            available: available.round( 8 ),
                            onOrders: balance.minus( available ).round( 8 ),
                            total: balance.round( 8 ),
                            btcValue: btcValue.round( 8 ),
                            usdValue: usdValue.toFixed( 2 ),
                        }
                    };
                }
            }

            response.exchanges.bittrex.usdValue = subtotal.round( 2 );


            
            subtotal = new BigNumber( 0 );
            for ( let ticker in BinanceBalances ) {
                let available = new BigNumber( BinanceBalances[ticker].available );
                let onOrder = new BigNumber( BinanceBalances[ticker].onOrder );
                let total = available.plus( onOrder );
                let btcValue = BinanceTicker[ticker + 'BTC'] ? (new BigNumber( BinanceTicker[ticker + 'BTC'] )).times( total ) : new BigNumber( 0 );
                if ( ticker === 'BTC' ) { btcValue = total; }
                let usdValue = btcValue ? btcValue.times( binanceBTCUSD ) : new BigNumber( 0 );

                if ( ! total.equals( 0 ) ) {
                    subtotal = subtotal.plus( usdValue );
                    totalUsdValue = totalUsdValue.plus( usdValue );

                    response.exchanges.binance[ticker] = {
                        balance: {
                            available: available.round( 8 ),
                            onOrders: onOrder.round( 8 ),
                            total: total.round( 8 ),
                            btcValue: btcValue.round( 8 ),
                            usdValue: usdValue.toFixed( 2 ),
                        }
                    };
                }
            }

            response.exchanges.binance.usdValue = subtotal.round( 2 );
            


            response.summary.totalUsdValue = totalUsdValue.round( 2 );

            res.json( response );
        }
    });
}
