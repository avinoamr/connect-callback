var assert = require( "assert" );

var connectcb = require( "./index" );

describe( "connect-callback", function() {

    it( "adds the callback function to the result", function( done ) {
        var res = {};
        connectcb()( {}, res, function() {
            assert( res.callback );
            assert.equal( typeof res.callback, "function" );
            done();
        })
    });


    it( "doesn't override the existing callback function", function( done ) {
        var res = { callback: 5 };
        connectcb()( {}, res, function() {
            assert( res.callback );
            assert.equal( res.callback, 5 );
            done();
        })
    });


    it( "uses the Express send function if it exists", function( done ) {
        var res = {
            send: function( code, body ) {
                assert.equal( code, 200 );
                assert.equal( body, "hello" );
                done();
            }
        };
        connectcb()( {}, res, function() {
            res.callback( null, "hello" );
        });
    });


    it( "allows setting an explicit http code", function( done ) {
        var code, body;
        var res = {
            writeHead: function( lcode ) {
                code = lcode;
            },
            write: function( lbody ) {
                body = lbody;
            },
            end: function() {
                assert.equal( code, 102 );
                assert.equal( body, "hello" );
                done();
            }
        };
        connectcb()( {}, res, function() {
            res.callback( { http_code: 102 }, "hello" );
        });
    });


    it( "supports named errors", function( done ) {
        function MethodNotAllowedError( msg ) {
            Error.call( this, msg );
            this.message = msg;
            this.name = arguments.callee.name;
        }
        MethodNotAllowedError.prototype = Error.prototype;

        var code;
        var body;
        var res = {
            writeHead: function( _code ) {
                code = _code;
            },
            write: function( _body ) {
                body = _body;
            },
            end: function() {
                assert.equal( code, 405 );
                // assert.equal( body, "MethodNotAllowedError: You're not an admin" )
                done();
            }
        };
        connectcb()( {}, res, function() {
            var err = new MethodNotAllowedError( "You're not an admin" );
            res.callback( err );
        });
    });


    it( "treats validation errors as bad requests (400)", function( done ) {
        function ValidationError( msg ) {
            Error.call( this, msg );
            this.message = msg;
            this.name = arguments.callee.name;
        }
        ValidationError.prototype = Error.prototype;

        var code;
        var body;
        var res = {
            writeHead: function( _code ) {
                code = _code;
            },
            write: function( _body ) {
                body = _body;
            },
            end: function() {
                assert.equal( code, 400 );
                assert.equal( body, "ValidationError: something is invalid" )
                done();
            }
        };
        connectcb()( {}, res, function() {
            var err = new ValidationError( "something is invalid" );
            res.callback( err );
        });
    });


});