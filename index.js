var http = require( "http" );

var send = function( res, code, data ) {
    if ( res.send ) { return res.send( code, data ); } // express response
    if ( code ) { res.writeHead( code ); }
    if ( data ) { res.write( data ) }
    res.end();
};

module.exports = function( errors ) {
    errors || ( errors = arguments.callee.errors );
    return function( req, res, next ) {
        if ( res.callback ) { return next(); }
        res.callback = function( err, data ) {
            var code = 200;
            if ( err ) {
                code = err.http_code || errors[ err.name ] || 500;
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
    var reason = http.STATUS_CODES[ code ].replace( " ", "" );
    module.exports.errors[ reason ] = code;
    module.exports.errors[ reason + "Error" ] = code;
}