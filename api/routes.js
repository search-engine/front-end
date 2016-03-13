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
		var map2 = new HashMap();
		var status = 0;

		function doOperation(){
			//console.log(status);
			if(status === 0){
				map = map2.clone();
			}else if(status === 1){
				var newMap = map.clone();
        		map.clear();
        		newMap.forEach(function(value, key){
        			if(map2.has(key)){
        				var oldScore = map2.get(key);
        				map.set(key, oldScore+value);
        			}
        		});
			}else{
				map2.forEach(function(value, key){
					if(map.has(key)){
						var oldScore = map.get(key);
						map.set(key, (oldScore > value ? oldScore : value));
					}else{
						map.set(key, value);
					}
				});
			}
			map2.clear();
		}


		if(keys){ keywords = keys.split(" ");}

		async.eachSeries(keywords, function (item, callback) {
			if(item === "AND"){
				doOperation();
				status = 1;
				callback();
			}else if(item === "OR"){
				doOperation();
				status = 2;
				callback();
			}else{
  				User.findOne({word: item.toLowerCase()}, function (err, docs) {
  					if(docs){
  						var ranking = docs.ranks;
        				for (var i = 0; i < ranking.length; i++) {
        					if(map2.has(ranking[i].url)){
        						var oldScore = map2.get(ranking[i].url);
        						map2.set(ranking[i].url, (ranking[i].score+oldScore));
        					}else{
        						map2.set(ranking[i].url, ranking[i].score);
        					}
    					}
    				}
    				//status = 0;
    				callback();
        		});
  			}	
		}, function done() {
			doOperation();
 	 		//console.log("keys", map.keys());
 	 		var results = {};
 	 		var urls = [];
 	 		var finalRank = map.values();
 	 		var keys = map.keys();
 	 		sortWithIndeces(finalRank);
 	 		for(var i = 0; i < finalRank.sortIndices.length; i++){
 	 			urls.push(keys[finalRank.sortIndices[i]]);
 	 		}
 	 		results["urls"] = urls;


			if (keywords.length) {
	        User.find({word:new RegExp('^'+keywords[keywords.length -1], 'i')}, 'word', function (err, docs) {
				results["similarTerms"] = docs;
				return res.send(results);
	        }).limit(5);
	    }
 		})
	})
}
