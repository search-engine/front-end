var mongoose = require('mongoose');
var async = require('async');
var HashMap = require('hashmap');

//http://stackoverflow.com/questions/3730510/javascript-sort-array-and-return-an-array-of-indicies-that-indicates-the-positi
function sortWithIndeces(toSort) {
  for (var i = 0; i < toSort.length; i++) {
    toSort[i] = [toSort[i], i];
  }
  toSort.sort(function(left, right) {
    return left[0] > right[0] ? -1 : 1;
  });
  toSort.sortIndices = [];
  for (var j = 0; j < toSort.length; j++) {
    toSort.sortIndices.push(toSort[j][1]);
    toSort[j] = toSort[j][0];
  }
  return toSort;
}


mongoose.connect('mongodb://localhost/search_engine', function (error) {
		    if (error) {
		        console.log(error);
		    }
		});
		var Schema = mongoose.Schema;
		var userSchema = new Schema({
    		word: String ,
    		ranks: [{
    			score: Number,
    			url: String
    		}]
		},{ collection: 'index' });

		var User = mongoose.model('index', userSchema);
		module.exports = User;

module.exports = function(app) {
	app.get('/api/search/results', function(req, res){

		//get the result here
		//res.json(JSON.parse(result.text));
		var keys = req.query.q;
		var keywords = [];
		var map = new HashMap();
		var status = 0;

		if(keys){ keywords = keys.split(" ");}

		async.eachSeries(keywords, function (item, callback) {
			console.log(item);
			if(item === "AND"){
				status = 1;
				console.log("found ANAND")
				callback();
			}else if(item === "OR"){
				status = 2;
				console.log("found OR")
				callback();
			}else{
				if(status === 0){
					//normal case
  					User.findOne({word: item.toLowerCase()}, function (err, docs) {
  						if(docs){
  						var ranking = docs.ranks;
        				for (var i = 0; i < ranking.length; i++) {
        					if(map.has(ranking[i].url)){
        						var oldScore = map.get(ranking[i].url);
        						map.set(ranking[i].url, (ranking[i].score+oldScore));
        					}else{
        						map.set(ranking[i].url, ranking[i].score);
        					}
    					}
    					}
    					status = 0;
    					console.log("done");
    					callback();
        			});
  				}else if(status === 1){
  					//AND case

  					User.findOne({word: item.toLowerCase()}, function (err, docs) {
  						console.log("AND here");
  						if(docs){
  						console.log("doing AND stuff");
        				var ranking = docs.ranks;
        				var newMap = map.clone();
        				map.clear();
        				for (var i = 0; i < ranking.length; i++) {
        					if(newMap.has(ranking[i].url)){
        						var oldScore = newMap.get(ranking[i].url);
        						map.set(ranking[i].url, (ranking[i].score+oldScore));
        					}
    					}
    					}else{
    						map.clear();
    					}
    					status = 0;
    					console.log("done");
    					callback();
        			});
  				}else{
  					//OR case
  					User.findOne({word: item.toLowerCase()}, function (err, docs) {
  						console.log("OR here");
  						if(docs){
  						console.log("doing OR stuff");
        				var ranking = docs.ranks;
        				for (var i = 0; i < ranking.length; i++) {
        					if(map.has(ranking[i].url)){
        						var oldScore = map.get(ranking[i].url);
        						map.set(ranking[i].url, (ranking[i].score > oldScore? ranking[i].score : oldScore));
        					}else{
        						map.set(ranking[i].url, ranking[i].score);
        					}
    					}
    					}
    					status = 0;
    					console.log("done");
    					callback();
        			});
  				}
  			}
		}, function done() {
 	 		//console.log("keys", map.keys());
 	 		var results = {};
 	 		var urls = [];
 	 		var finalRank = map.values();
 	 		var keys = map.keys();
 	 		sortWithIndeces(finalRank);
 	 		for(var i = 0; i < finalRank.sortIndices.length; i++){
 	 			//console.log(finalRank[i]);
 	 			//console.log(keys[i]);
 	 			urls.push(keys[finalRank.sortIndices[i]]);
 	 			//console.log(keys[i]);
 	 		}
 	 		results["urls"] = urls;
 	 		//console.log(map.keys());
 	 		//console.log(map.values());
 	 		//console.log(urls);


			if (keywords.length) {
	        User.find({word:new RegExp('^'+keywords[keywords.length -1], 'i')}, 'word', function (err, docs) {
							results["similarTerms"] = docs;
							console.log(results);
							return res.send(results);
	        }).limit(5);
	    }
 		})
	})
}
