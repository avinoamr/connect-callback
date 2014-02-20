connect-callback
================

A middleware for Connect and Express that allows sending data to a response stream using the callback API.

It extends the http response object to contain a `callback()` function which can be invoked directly using the conventional callback API with an `(err, result)` tuple. The error is transformed to an error HTTP code either by reading the error's `.http_code` attribute if it exists, or by reverse-lookup in the `http.STATUS_CODES` dictionary based o nthe error's `.name` attribute. 

## Installation

```
$ npm install connect-callback
```

## Usage Examples

```javascript
var connect = require("connect")
  , callback = require("connect-callback");

connect()
  .use(callback())
  .use( "/somefile" function( req, res ) {
    fs.readFile( "somefile.txt", res.callback ); // will return the file, or a 500 error
  })
  .use( "/admins", function( req, res ) {
    res.callback( { name: "Forbidden" } ); // 403 Forbidden
  })
  .use( "/isvalid", function( req, res ) {
    res.callback( new ValidationError() ); // 400 Bad Request
  })
  .use( "/update", function( req, res ) {
    res.callback( { http_code: 409 } ); // 409 Conflict
  })
  .use( function( req, res ) {
    res.callback( null, "All works!" ); // 200 OK
  })
  .listen(3000);
  
// ValidationError class
function ValidationError( msg ) {
  Error.call( this, msg );
  this.name = arguments.callee.name; // "ValidationError"
};
ValidationError.prototype = Error.prototype;
```
