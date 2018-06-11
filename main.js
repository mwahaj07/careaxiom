var http = require("http");
var url = require("url");
var querystring = require('querystring');
var requestModule = require("request");

var server = http.createServer(function (request, response) {

	var urlObj = url.parse(request.url);
	var count = 0;

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

		for (let i = 0; i < urlList.address.length; i++) {

			requestModule(urlList.address[i], function (error, urlResponse, body) {
				count++;
				if (!error) {
					var title = body.match(/<title>(.*?)<\/title>/i)[1];
					urlListBody += '<li>' + urlList.address[i] + " - " + title + '<li> \n';
				}
				else {
					var title = "NO RESPONSE";
					urlListBody += '<li>' + urlList.address[i] + " - " + title + '</li> \n';
				}

				if (count === urlList.address.length - 1) {
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
	}
	else {
		response.writeHead(404);
		response.end('Path not found');
	}
}).listen(8081);
