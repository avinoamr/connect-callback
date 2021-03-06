var http = require( "http" );

var send = function( res, code, data ) {
    if ( res.send ) { return res.send( code, data ); } // express response
    if ( code ) { res.writeHead( code, http.STATUS_CODES[ code ] ); }
    if ( data ) { res.write( data ) }
    res.end();
};

module.exports = function( errors, options ) {
    errors || ( errors = arguments.callee.errors );
    options || ( options = {} );
    return function( req, res, next ) {
        if ( res.callback ) { return next(); }
        res.callback = function( err, data ) {
            var code = 200;
            if ( err ) {
                if ( typeof err == "string" ) {
                    data = err;
                    err = new Error( err );
                    err.name = "Invalid";
                }

                code = err.http_code || errors[ err.name ] || 500;
                if ( code == 400 ) { // bad request errors can be verbose
                    data = err.toString()
                } else if ( !data ) {
                    data = http.STATUS_CODES[ code ];
                }

                if ( options.log ) {
                    console.error( "ERROR (connect-callback) " + code, err )
                }
            }
            send( res, code, data );
        }
        next();
    };
};

module.exports.errors = {
    "Invalid": 400,
    "ValidationError": 400
};

for ( var code in http.STATUS_CODES ) {
    if ( code < 400 ) continue;
    var reason = http.STATUS_CODES[ code ].replace( /\ /g, "" );
    module.exports.errors[ reason ] = code;
    module.exports.errors[ reason + "Error" ] = code;
}
