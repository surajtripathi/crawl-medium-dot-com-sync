'use strict';
const INTERVAL = 10; //millisecond

function eachLimit(items, limit, iterator, final) {
	let cuncrrent_job = 0;
	let current_job_index = 0;
	let done_map = {};
	if(current_job_index < items.length){
		let interval = setInterval(function() {
			(function(item, index) {
				if(cuncrrent_job < limit && index < items.length) {
					cuncrrent_job++;
					current_job_index++;
					iterator(item, function() {
						//console.log("index " ,index);
						if(done_map[index]) {
							console.log("Callback called multiple time")
						} else {
							cuncrrent_job--;
							done_map[index] = true;
							if(index === (items.length - 1)) {
								clearInterval(interval);
								final(null);
							}
						}
					});
				} else {
						//do nothing
				}
			})(items[current_job_index], current_job_index);
		}, INTERVAL)
	}
}

//test code
if(require.main === module) {
	var  a = [1,2,3,4,5,6,7,8,9,10];

	eachLimit(a, 2, function(num, cb) {
		setTimeout(function() {
			console.log(num);
			cb();
		}, 2000);
	}, function(err) {
		console.log("done");
	});
}

module.exports = eachLimit;