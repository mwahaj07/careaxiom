//P.S. empty callbacks have been used response of service calls to make sure iterator goes through all links. We could have sent the error in callback as soon as one service 
//has failed bu then next services call would not have executed

var http = require("http");
var url = require("url");
var querystring = require('querystring');
var requestModule = require("request");
var async = require("async");

var server = http.createServer(function (request, response) {

	var urlObj = url.parse(request.url);

	if (request.method === 'GET' && urlObj.pathname == '/I/want/title/') {
		var urlParams = querystring.parse(urlObj.query);
		var urlList = {};
		var urlListBody = '';

		if (typeof urlParams.address === 'string' || urlParams.address instanceof String) {
			urlList.address = [urlParams.address];
		}
		else {
			urlList.address = urlParams.address;
		}

		async.each(urlList.address, function (address, callback) {

			requestModule(address, function (error, urlResponse, body) {

				if (!error) {
					var title = body.match(/<title>(.*?)<\/title>/i)[1];
					urlListBody += '<li>' + address + " - " + title + '<li> \n';
					callback();
				}
				else {
					var title = "NO RESPONSE";
					urlListBody += '<li>' + address + " - " + title + '</li> \n';
					callback();
				}
			});

		}, function (err) {
			if (err) {

			} else {
				var responseString = `<html>
				<head></head>
				<body>
					<h1> Following are the titles of given websites: </h1>	
					<ul>
						${urlListBody}
					</ul>
					</body>
				</html>`;
	
				response.writeHead(200, { 'Content-Type': 'text/plain' });
				response.end(responseString);
			}
		});

	}
	else {
		response.writeHead(404);
		response.end('Path not found');
	}
}).listen(8081);
