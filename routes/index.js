import pino from 'pino'; const log = pino();
import dotenv from 'dotenv'; const dotenvconfig = dotenv.config();
import express from 'express'; const app = express();
import expressPinoLogger from 'express-pino-logger';
import Poloniex from 'poloniex-api-node';
import Kraken from 'kraken-api';
import BigNumber from 'bignumber.js';
import balance from './balance';

const poloniex = new Poloniex(
    process.env.POLONIEX_KEY,
    process.env.POLONIEX_SIGN
);
const kraken = new Kraken(
    process.env.KRAKEN_KEY,
    process.env.KRAKEN_SECRET
);

const router = express.Router({
    caseSensitive: false,
    strict: false
});

router.route( '/' )
.get( ( req, res ) => {
    let links = new Array();
    res.send({
        name: "Quintana",
        links: links
    });
});

router.route( '/balance' )
.get( balance );

router.route( '/balanceOLD' )
.get( ( req, res ) => {
    let response = {};

    try {
        poloniex.returnTicker( ( err, tickers ) => {
            if ( err ) {
                log.error( "ERROR (poloniex.returnTicker)", err.message );
                response = err.message;
            } else {
                let response = { kraken:{}, poloniex:{} };
                let BTCUSD = new BigNumber( tickers['USDT_BTC'].last );

                poloniex.returnCompleteBalances( 'all', ( err, poloniexBalances ) => {
                    if ( err ) {
                        log.error( "ERROR (poloniex.returnCompleteBalances)", err.message );
                        response = err.message;
                    } else {
                        let totalUsdValue = new BigNumber( 0 );

                        kraken.api( 'TradeBalance', {}, ( err, krakenBalances ) => {
                            if ( err ) {
                                log.error( "ERROR (kraken.TradeBalance)", err.message );
                                response = err.message;
                            } else {
                                response.kraken = krakenBalances;
                                let krakenEquivalentBalance = new BigNumber( krakenBalances.result.eb );

                                if ( ! krakenEquivalentBalance.equals( 0 ) ) {
                                    response.kraken.usdValue = krakenEquivalentBalance.round( 2 );
                                    totalUsdValue = totalUsdValue.plus( krakenEquivalentBalance );
                                }

                                for ( let ticker in poloniexBalances ) {
                                    let balance = poloniexBalances[ticker];
                                    let btcValue = new BigNumber( balance.btcValue );

                                    if ( ! btcValue.equals( 0 ) ) {
                                        let available = new BigNumber( balance.available );
                                        let onOrders = new BigNumber( balance.onOrders );
                                        let total = available.plus( onOrders );
                                        let last = new BigNumber( tickers['USDT_' + ticker].last );
                                        let usdValue = btcValue.times( BTCUSD );

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
                                                // BTCUSD: BTCUSD.round( 8 ),
                                                last: last.round( 8 ),
                                            };
                                        }
                                    }
                                }

                                response.totalUsdValue = totalUsdValue.round( 2 );
                            }

                            res.json( response );
                        });
                    }
                });
            }
        });
    } catch ( exception ) {
        log.error( exception );
    }
});

router.route( '/balance/:ticker' )
.get( ( req, res ) => {
    let response = {};
    poloniex.returnBalances( ( err, poloniexBalances ) => {
        if ( err ) {
            log.error( err.message );
            response = err.message;
        } else {
            response = poloniexBalances[req.params.ticker];
        }

        res.json( response );
    });
});

// Handle 404 errors
router.use( ( req, res, next ) => {
    res.status( 404 ).send( "<html><body><h3>404 Not Found</h3></body></html>" );
});

module.exports = router;
