
var mongoose = require('mongoose');


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
		if(keys){ keywords = keys.split(" ");}
		console.log(keywords);
		if (keywords[0]) {
        	User.find({word: keywords[0]}, function (err, docs) {
        	console.log(docs);
            return (res.json(docs));
        });
    }

		})


}