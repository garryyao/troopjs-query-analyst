#!/usr/bin/env casperjs

// Simple scrapper that read traffic from http://www.alexa.cn/?url=[query]
// [NOTE] This is not node script but phantom!

var casper = require('casper').create({
	pageSettings: {
		loadImages: false,        // The WebPage instance used by Casper will
		loadPlugins: false         // use these settings
	}
});

var utils = require('utils');
var args = require('system').args.slice(4);

if (!args.length) {
	console.log([
		"Intercept all the page's sent out troop queries within a period and report it.",
		"usage:  troopjs-query-analyst http://your-troopjs-app.com [timeout]"
	].join('\n'));
	casper.exit();
}

var site = args[0];
// Page completely load time.
var timeout = args[1] || 5000;
var queries = [];

casper.on('remote.alert', function (query) {
	queries = queries.concat(decodeURIComponent(query).split('|'));
});

casper.on('resource.requested', function (req) {
	if (req.headers.some(function (hd) {
		return hd.name === "x-troopjs-request-id";
	})) {
		console.log("analysing request:" + req.url);
	}
});

console.log("wait " + Math.floor(timeout / 1000) + " seconds for page load...\n");
casper.start(site, function () {
	this.evaluate(function () {
		require(['troopjs-core/component/service', 'jquery'], function interceptor(Service, $) {
			$(window.document).ajaxSend(function ($evt, xhr, options) {
				var query;
				if ("x-troopjs-request-id" in options.headers) {
					query = /^q=(.*)/.exec(options.data)[1];
				}
				// report the query.
				alert(query);
			});
		});
	});
	casper.wait(timeout, function () {
		this.echo(utils.unique(queries).join('|'));
	});
});
casper.run();
