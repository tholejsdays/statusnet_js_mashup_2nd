// needs socket.io install with: npm install socket.io
var sys = require('sys'),
   url  = require('url'),
   qs   = require('querystring'),
   io   = require('socket.io'),
   http = require('http'),
   oexchange = require('oexchange'),
   server,
   ioServer,
   ioSendFunction;

server = http.createServer(function (req, res) {
    var parsedUrl = url.parse(req.url);
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
    });
    if (req.method == "POST") {
        sys.puts('received post');
        var buffer = [];
        req.on("data", function(chunk) {
           sys.puts(chunk);
           buffer.push(chunk);
        });
        req.on("end", function() {
            sys.puts('end post');
            if (ioSendFunction) {
               ioSendFunction(buffer.join(''));
            }
            res.end();
        });

    } else if (typeof(parsedUrl['query']) != "undefined") {
        sys.puts('received get');
        var params = qs.parse(parsedUrl['query']);
        if (typeof(params['hub.challenge']) != "undefined") {
            sys.puts(params['hub.mode']);
            sys.puts('got challenge' + params['hub.challenge']);
            res.write(params['hub.challenge']);
        	res.end();
        } else if (typeof(params['share.hostname']) != "undefined" && typeof(params['url']) != "undefined") {
			oexchange.getSharingUrl(params['share.hostname'], params, function(result) {
				console.log(result);
				if (result) {
					res.write(result);
				}
				res.end();
			});
		} else {
           res.end();
		}

    }
});

server.listen(8000);

sys.puts('Server running at http://127.0.0.1:8000/');

ioServer = io.listen(server);

ioServer.sockets.on('connection', function(client){
  ioSendFunction = function(text) {
      client.emit('message', text);
  }

  client.on('message', function(message){
  });

  client.on('disconnect', function(){
  });
});

