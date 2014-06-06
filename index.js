#!/usr/bin/env casperjs

// Simple scrapper that read traffic from http://www.alexa.cn/?url=[query]
// [NOTE] This is not node script but phantom!
var utils = require('utils');
var _ = require('lodash');
var args = require('system').args.slice(4);

if(!args.length){
	console.log([
		"troopjs-query-analyst - intercept all the page's troop queries sent out within the specified period.",
		"usage:",
		"troopjs-query-analyst http://your-troopjs-app.com [timeout]"
	].join('\n'));
}

var site = args[0];
// Page completely load time.
var timeout = args[1] || 5000;

var queries = [];
var casper = require('casper').create({
  clientScripts: ['interceptor.js'],
  pageSettings: {
        loadImages:  false,        // The WebPage instance used by Casper will
        loadPlugins: false         // use these settings
  }
});

casper.on('remote.alert', function(query){
    queries = queries.concat(decodeURIComponent(query).split('|'));
});

casper.on('resource.requested', function(req){
	if( _.some(req.headers, function(hd){
    return hd.name === "x-troopjs-request-id";
  }))
  {
    console.log("analysing request:" + req.url);
  }
});

console.log("wait " + Math.floor(timeout/1000) + " seconds for page load...");
casper.start(site, function() {
  casper.wait(timeout, function(){
    this.echo(_.uniq(queries).join('|'));
  });
});
casper.run();
