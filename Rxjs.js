var http = require("http");
var url = require("url");
var querystring = require('querystring');
var requestModule = require("request");
var Rx = require('rx');

function getData(url) {

	return new Promise(function (resolve, reject) {
		requestModule.get(url, function (err, resp, body) {
			let obj = {};
			obj.url = url;
			if (err) {
				obj.err = err;
				reject(obj);
			} else {
				obj.body = body;
				resolve(obj);
			}
		})
	});
}

var server = http.createServer(function (request, response) {

	var urlObj = url.parse(request.url);
	var count = 0;

	if (request.method === 'GET' && urlObj.pathname == '/I/want/title/') {
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

		Rx.Observable.from(urlList.address)
			.flatMap(x => {
				var options = {
					uri: url,
					headers: {
						"Content-Type": "application/json"
					}
				};
				return getData(x)
					.catch(() => x);
			})
			.subscribe(responseObj => {
				var title = responseObj.body ? responseObj.body.match(/<title>(.*?)<\/title>/i)[1] : 'NO RESPONSE';
				var orgUrl = responseObj.url ? responseObj.url : responseObj;
				urlListBody += '<li>' + orgUrl + " - " + title + '<li> \n';
			},
			() => {
				var endString = `${urlListBody}
				</ul>
			   </body>
			   </html>`;
				response.end(endString);
			});
	}
	else {
		response.writeHead(404);
		response.end('Path not found');
	}
}).listen(8081);
