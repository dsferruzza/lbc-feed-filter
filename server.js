var fs = require('fs');
var URL = require('url');
var es = require('event-stream');
var express = require('express');
var request = require('request');
var FeedParser = require('feedparser');
var RSS = require('rss');
var iconv = require('iconv-lite');

var app = express();
app.configure(function() {
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
});

if (!fs.existsSync('config.json')) var config = {};
else var config = JSON.parse(fs.readFileSync('config.json'));

app.get(/^\/lbc\/(.+)$/, function(req, res) {
	var url = req.params[0];
	var feed = null;

	// Get the feed
	console.log('Fetching feed ' + url);
	request(url)
		.on('error', function(e) {
			res.send(500, e);
		})
		// Parse it
		.pipe(new FeedParser())
		.on('error', function(e) {
			res.send(500, 'Can\'t parse feed!');
		})
		// Fetch better description
		.pipe(es.map(function(data, cb) {
			var pageUrl = data.link;

			// Use proxy if a key is set
			if (typeof config.key != 'undefined' && typeof config.proxy != 'undefined')
				pageUrl = URL.resolve(config.proxy, '?key=' + config.key + '&url=' + pageUrl);

			console.log('Fetching description ' + data.link);
			request({
				url: pageUrl,
				encoding: null,
				timeout: 20000,
			}, function(error, response, body) {
				if (error || response.statusCode != 200) console.log('Can\'t fetch description! (' + data.link + ')');
				else {
					// Decode non UTF-* crappy encoding
					var enc = /<meta charset="(.+?)"/.exec(body)[1];
					body = iconv.decode(body, enc);

					// Extract description
					var description = /<div class="content">([^]+?)<\/div>/g.exec(body)[1];
					description = description.trim();

					// Insert it in the feed item
					data.description += '<p><strong>Description :</strong> <blockquote>' + description + '</blockquote></p>';
				}

				cb(null, data);
			});
		}))
		// For each item
		.on('data', function(data) {
			// Create an new feed if necessarry
			if (feed === null) feed = new RSS(data.meta);

			// Create url field
			data.url = data.link;

			// Add the item to the feed
			feed.item(data);
		})
		.on('end', function() {
			if (feed !== null) res.send(feed.xml());
		});
});

// Get port from CLI or use default
var port = 3000;
var arg = parseInt(process.argv[2], 10);
if (arg && arg < 65536 && arg > 0) port = arg;

app.listen(port);
console.log('Listening on port ' + port);
