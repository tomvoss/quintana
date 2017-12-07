import pino from 'pino'; const log = pino();
import KrakenAPI from 'kraken-api';

export default class Kraken {
    constructor( key, secret ) {
        this.key = key;
        this.secret = secret;
        this.kraken = new KrakenAPI( process.env.KRAKEN_KEY, process.env.KRAKEN_SECRET );
    };

    test() {
        log.info( "****************** THIS IS A TEST ******************" );
        return 'test';
    };

    getBalance() {
        /*
        let x = this.kraken.api( 'Balance', {}, ( err, balance ) => {
            if ( err ) {
                log.error( err.message );
                return ( err, null );
            } else {
                log.info( this.balance );
                return ( null, balance );
            }
        });

        return JSON.stringify(x);
        */
        return this.kraken.api( 'Balance' );
    }
}
