var mongoose = require('mongoose');


mongoose.connect('mongodb://localhost/search_engine', function (error) {
		    if (error) {
		        console.log(error);
		    }
		});

		var Schema = mongoose.Schema;
		var UserSchema = new Schema({
    		word: String,
    		data: {
    			score: String,
    			documents: String
    		}
		});

		var User = mongoose.model('User', userSchema);

module.exports = function(app) {
	app.get('/api/search/results', function(req, res){
		//get the result here
		//res.json(JSON.parse(result.text));

		if (req.params.word) {
        User.find({ word: req.params.word }, function (err, docs) {
        	console.log(docs);

            return (res.json(docs));
        });
    }

		})


	
		

		
	});
}