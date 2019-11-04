import pino from 'pino'; const log = pino();
import dotenv from 'dotenv'; const dotenvconfig = dotenv.config();
import express from 'express'; const app = express();
import expressPinoLogger from 'express-pino-logger';
import Kraken from 'kraken-api';
import BigNumber from 'bignumber.js';
import balance from './balance';

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

// Handle 404 errors
router.use( ( req, res, next ) => {
    res.status( 404 ).send( "<html><body><h3>404 Not Found</h3></body></html>" );
});

module.exports = router;
