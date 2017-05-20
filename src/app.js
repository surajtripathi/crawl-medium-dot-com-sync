"use strict";

//To handle case of redirect loop
var maxRedirect = {'maxRedirects': 3}

var request = require('request').defaults(maxRedirect);
var async = require('async');
var url_lib = require('url');
var fs = require('fs');
var Sync = require('sync');

let match = 'ahref=';
let state = {
	'a': 'a',
	'h': 'ah',
	'r': 'ahr',
	'e': 'ahre',
	'f': 'ahref',
	'=': 'ahref='
};
let visited = {};

var valid_protocols = ['http:', 'https:'];

function getURL(url_obj) {
	return (url_obj.protocol + "//" + url_obj.hostname);
}

function make_request(url, sync_callback) {
	console.log("Crawling : ", url);
	var url_obj = url_lib.parse(url);
	let urls_to_be_processed = [];
	request({
		url: url,
		method: 'GET',
		timeout: 60000
	}, function(err, response, body) {
		if(err) {
			console.log(err);
		}
		if(typeof body === 'string') {
			urls_to_be_processed = extract_url(getURL(url_obj), body, visited);
		}
		sync_callback(null, urls_to_be_processed);
	});
}

function extract_url(base_url, body, visited) {
	let temp_href;
	let temp_url
	let current_match = '';
	let urls = [];
	for(let i = 0; i < body.length; i++) {
		if(body[i] === ' ') {
			//ignore
		} else if(body[i] === '=') {
			temp_href += '=';
			if(temp_href == match) {
				temp_url = '';
				while ((body[i] != '"' && body[i] != "'") && i < body.length) {
					i++;
				}
				i++;
				while ((body[i] != '"' && body[i] != "'") && i < body.length) {
					temp_url += body[i];
					i++;
				}
				let url_obj = url_lib.parse(temp_url);
				if(!url_obj.protocol || valid_protocols.indexOf(url_obj.protocol) >= 0) {
					if(!url_obj.hostname) {
						temp_url = base_url + ((url_obj.path  &&  ((url_obj.path[0] != '/') ? ('/' + url_obj.path) :  url_obj.path)) || '');
					}
					if(!visited[temp_url]) {
						urls.push(temp_url);
						visited[temp_url] = true;
					} else {
						//console.log("URL already visited ", temp_url);
					}
				} else {
					console.log("Error: Not Crawling invalid URL ", url_obj.href);
				}
			}
			temp_href = '';
		} else if (state[body[i]]){
			temp_href += body[i];
		} else {
			temp_href = '';
		}
	}
	return urls;
}

Sync(function() {
	let result = fs.writeFile.sync(null, 'crawl.csv', 'URLS\nhttp://medium.com');

	let seed_url_array = ["http://medium.com"];
	let seed_visited_map = {"http://medium.com": true};
	let urls_to_be_processed = [];
	let visited = seed_visited_map;
	let url_array = seed_url_array;

	for(let index = 0; index < url_array.length; index++) {
		let url = url_array[index];
		let urls_to_be_saved = make_request.sync(null, url);
		
		if(urls_to_be_saved.length > 0){
			url_array.push.apply(url_array, urls_to_be_saved);
			let results = fs.appendFile.sync(null, 'crawl.csv', '\n' + urls_to_be_saved.join('\n'));
		}
	}
	console.log("Crawling done");
});

//Functions in followed code have not been inplemented
//So the program will not close instantly
process.stdin.resume();
function exitHandler(err) {
	console.log("Exiting process");
    process.exit();
}

//Do something when app is closing
process.on('exit', exitHandler);

//Catches ctrl+c event
process.on('SIGINT', exitHandler);

//Catches uncaught exceptions
process.on('uncaughtException', exitHandler);