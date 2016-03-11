var mongoose = require('mongoose');
var async = require('async');
var HashMap = require('hashmap');

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

module.exports = function(app) {
	app.get('/api/search/results', function(req, res){
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
  						var ranking = docs.ranks;
        				for (var i = 0; i < ranking.length; i++) {
        					if(map.has(ranking[i].url)){
        						var oldScore = map.get(ranking[i].url);
        						map.set(ranking[i].url, (ranking[i].score+oldScore));
        					}else{
        						map.set(ranking[i].url, ranking[i].score);
        					}
    					}
    					status = 0;
    					console.log("done");
    					callback();
        			});
  				}else if(status === 1){
  					//AND case
  					
  					User.findOne({word: item.toLowerCase()}, function (err, docs) {
  						console.log("ANAND here");
        				var ranking = docs.ranks;
        				for (var i = 0; i < ranking.length; i++) {
        					if(map.has(ranking[i].url)){
        						var oldScore = map.get(ranking[i].url);
        						map.set(ranking[i].url, (ranking[i].score+oldScore));
        					}else{
        						map.set(ranking[i].url, ranking[i].score);
        					}
    					}
    					status = 0;
    					callback();
        			});
  				}else{
  					//OR case
  					User.findOne({word: item.toLowerCase()}, function (err, docs) {
  						console.log("OR here");
  						
        				var ranking = docs.ranks;
        				for (var i = 0; i < ranking.length; i++) {
        					if(map.has(ranking[i].url)){
        						var oldScore = map.get(ranking[i].url);
        						map.set(ranking[i].url, (ranking[i].score > oldScore? ranking[i].score : oldScore));
        					}else{
        						map.set(ranking[i].url, ranking[i].score);
        					}
    					}
    					status = 0;
    					callback();
        			});
  				}
  			}
		}, function done() {
 	 		//console.log("keys", map.keys());
 	 		return res.send({keys: map.keys(), values: map.values});
 		})
	})


}