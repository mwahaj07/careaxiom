var http = require("http");
var url = require("url");
var querystring = require('querystring');
var requestModule = require("request");

function getData(url) {

	return new Promise(function (resolve, reject) {
		requestModule.get(url, function (err, resp, body) {
			if (err) {
				reject(err);
			} else {
				resolve(body);
			}
		})
	});
}

var server = http.createServer(function (request, response) {

	var urlObj = url.parse(request.url);
	var promises = [];

	if (request.method === 'GET' && urlObj.pathname == '/I/want/title/') {
		var count= 0;
		var urlParams = querystring.parse(urlObj.query);
		var urlList = {};
		var urlListBody = '';

		response.writeHead(200, { 'Content-Type': 'text/plain' });
		var responseString = `<html>
		<head></head>
		<body>
			<h1> Following are the titles of given websites: </h1>	
			<ul>`;
		response.write(responseString);

		if (typeof urlParams.address === 'string' || urlParams.address instanceof String) {
			urlList.address = [urlParams.address];
		}
		else {
			urlList.address = urlParams.address;
		}

		for (let i = 0; i < urlList.address.length; i++) {

			var promise = getData(urlList.address[i]);
			promise.then(function (result) {

				var title = result.match(/<title>(.*?)<\/title>/i)[1];
				urlListBody += '<li>' + urlList.address[i] + " - " + title + '<li> \n';
				count++;

				if(count > urlList.address.length - 1){
					var endString = `${urlListBody}
						</ul>
						</body>
						</html>`;
						response.end(endString);
				}

			}, function (err) {
				var title = "NO RESPONSE";
				urlListBody += '<li>' + urlList.address[i] + " - " + title + '</li> \n';
				count++;

				if(count > urlList.address.length - 1){
					var endString = `${urlListBody}
						</ul>
						</body>
						</html>`;
						response.end(endString);
				}
			});
		}
	}
	else {
		response.writeHead(404);
		response.end('Path not found');
	}
}).listen(8081);
