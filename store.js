var Promise = require('bluebird');
var acctKey = '6cc0926a2737425182fb6d86e289d6eb';

var Bing =  require('node-bing-api')({accKey: '6cc0926a2737425182fb6d86e289d6eb'});

var ReviewsOptions = [
    '“Very stylish, great stay, great staff”',
    '“good hotel awful meals”',
    '“Need more attention to little things”',
    '“Lovely small hotel ideally situated to explore the area.”',
    '“Positive surprise”',
    '“Beautiful suite and resort”'];

module.exports = {
	
	//this function helps to pull all the photos from their URLs
	getImages : function(imageContainer){
		//note: takes a body as a parameter
		return new Promise(function (resolve){
			var photos = [];
			for(var i = 0; i < 5; i++){
				//adds a photo to the photos stack
				photos.push({
					image: decodeURIComponent(imageContainer.value[i].thumbnailUrl)
				});
			}
			//returns photos back to app.js
			setTimeout(function () { resolve(photos); }, 1000);
		});
	},
/*	searchWeb: function(action, city){
		return new Promise (function (resolve){
			var stuff = [];
			Bing.web(acton + " " + city, {
				top:10
				
			}, function (error, res, body){
				stuff.push({
					name:city
					description: body.webPages.value[0]
				
				});
			});
			
			});
			setTimeout(function () { resolve(stuff); }, 1000);
		
	},*/
    searchHotels: function (destination) {
        return new Promise(function (resolve) {

            // Filling the hotels results manually just for demo purposes
            var hotels = [];
            for (var i = 1; i <= 5; i++) {
                hotels.push({
                    name: destination + ' Hotel ' + i,
                    location: destination,
                    rating: Math.ceil(Math.random() * 5),
                    numberOfReviews: Math.floor(Math.random() * 5000) + 1,
                    priceStarting: Math.floor(Math.random() * 450) + 80,
                    image: 'https://placeholdit.imgix.net/~text?txtsize=35&txt=Hotel+' + i + '&w=500&h=260'
                });
            }

            hotels.sort(function (a, b) { return a.priceStarting - b.priceStarting; });

            // complete promise with a timer to simulate async response
            setTimeout(function () { resolve(hotels); }, 1000);
        });
    },

    searchHotelReviews: function (hotelName) {
        return new Promise(function (resolve) {

            // Filling the review results manually just for demo purposes
            var reviews = [];
            for (var i = 0; i < 5; i++) {
                reviews.push({
                    title: ReviewsOptions[Math.floor(Math.random() * ReviewsOptions.length)],
                    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris odio magna, sodales vel ligula sit amet, vulputate vehicula velit. Nulla quis consectetur neque, sed commodo metus.',
                    image: 'https://upload.wikimedia.org/wikipedia/en/e/ee/Unknown-person.gif'
                });
            }

            // complete promise with a timer to simulate async response
            setTimeout(function () { resolve(reviews); }, 1000);
        });
    }
};