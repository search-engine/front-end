var mongoose = require('mongoose');
var async = require('async');
var HashMap = require('hashmap');
var thesaurus = require('thesaurus');

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
				var itemLowerCase = item.toLowerCase()
         	 	var temp = thesaurus.find(itemLowerCase);
          		var synonyms = [];
          		for(var i = 0; i < temp.length; i++){
          			var tempLowerCase = temp[i].toLowerCase();
          			if(temp[i].includes(" ")) continue;
          			if(itemLowerCase === tempLowerCase) continue;
            		synonyms.push(temp[i].replace(/[^a-zA-Z]/g, "").toLowerCase());
          		}
          		console.log("the word is", item);
          		var synMap = new HashMap();
          		async.eachSeries(synonyms, function(syn, cb){
          			console.log(syn);
            		User.findOne({word: syn}, function (err1, doc) {
            			//console.log(doc);
              			if(doc){
                			var rk = doc.ranks;
                			for(var i=0; i < rk.length; i++){
                  				if(synMap.has(rk[i].url)){
                    				var oldScore = synMap.get(rk[i].url);
                    				//console.log("put 1");
                    				synMap.set(rk[i].url, (rk[i].score > oldScore ? rk[i].score : oldScore));
                  				}else{
                  					//console.log("put 2");
                    				synMap.set(rk[i].url, rk[i].score);
                  				}
                			}
              			}
              			cb();
            		})
          		}, function done(){
          			//console.log(synMap.count());
            		User.findOne({word: itemLowerCase}, function (err, docs) {
    					if(docs){
    						//console.log("1",synMap.count());
    						//console.log("has doc");
    						var ranking = docs.ranks;
    						//console.log(ranking.length);
                			for (var i = 0; i < ranking.length; i++) {
                  				synMap.set(ranking[i].url, (ranking[i].score+2));
                			}
                		}
                		synMap.forEach(function(v, k){
                  			if(map2.has(k)){
                    			var oldScore = map2.get(k);
                    			map2.set(k, (oldScore+v+1));
                    			//console.log(k, "new score", (oldScore+v+1));
                  			}else{
                    			map2.set(k, v);
                    			// console.log(k, "score", v);
                  			}
                  		});
                  		//console.log("2",map2.count());
                		callback();
      				});
            	});
          	}
		}, function done() {
			//console.log(map2.count());
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
 		});
	})
}
