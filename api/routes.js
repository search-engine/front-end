
var mongoose = require('mongoose');


mongoose.connect('mongodb://localhost/search_engine', function (error) {
		console.log('hi');
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
		//get the result here
		//res.json(JSON.parse(result.text));
		console.log(req.query.q);
		if (req.query.q) {
        User.find({word:req.query.q}, function (err, docs) {
        	console.log(docs);

            return (res.json(docs));
        });
    }

		})


}