import config from 'config';
import pino from 'pino'; const log = pino();
import express from 'express'; const app = express();
import expressPinoLogger from 'express-pino-logger';
import path from 'path';
import routes from './routes';
import Kraken from './lib/kraken';

const K = new Kraken;
/*
(async () => {
    let krakenBalance = await K.getBalance();//.then( ( err, data ) => {
    //    console.log( "K's BALANCE = " + data );
    //});
    console.log( krakenBalance );
})();
*/
/*
K.getBalance()
.then( ( krakenBalance ) => {
    console.log( krakenBalance )
});
*/

const publicPath = path.join( __dirname, './public' );

app.set( 'views', __dirname + '/views' );
app.set( 'json spaces', 2 );
app.enable( 'strict routing' );

app.use( expressPinoLogger( { logger: log } ) );
app.use( express.static( publicPath ) );
app.use( routes );

app.use( ( err, req, res, next ) => {
    log.error( err );

    if ( res.headersSent ) {
        return next( err );
    }

    res.status( 500 );
    res.send( { error: err } );
});

app.listen( config.express.port, () => {
    log.info( 'Server running at http://127.0.0.1:' + config.express.port + '/' );
});
