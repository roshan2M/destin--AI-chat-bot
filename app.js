// This loads the environment variables from the .env file
require('dotenv-extended').load();

// Setup for requesting info
// var request = require('request');
// var cheerio = require('cheerio');
var Bing = require('node-bing-api')({ accKey: "6cc0926a2737425182fb6d86e289d6eb" });

// Don't change
var builder = require('botbuilder');
var restify = require('restify');
var Store = require('./store');
var spellService = require('./spell-service');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create connector and listen for messages
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', connector.listen());

// Start change
var bot = new builder.UniversalBot(connector, function (session) {
	
		session.send("Hi, I am the the world’s first virtual consultant for work relocation customized to your needs in 15 cities."
		+ "I can answer your questions about where to move, which country is best based on your specialized preferences."); 
		
		// session.beginDialog('City', session.message.text);
});

// You can provide your own model by specifing the 'LUIS_MODEL_URL' environment variable
// This Url can be obtained by uploading or creating your model from the LUIS portal: https://www.luis.ai/
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

// Stores a city name
chosenCity = 1;

/* Dialog example here (note anything in this $FORMAT$ means change to neccessary name
bot.dialog($NAME%, [
	function (session, args, next --only if there is another function after--){
	var $INTENT$ =  builder.EntityRecognizer.findEntity(args.intent.entities, '$ENTITYNAME$')
	}
	//other stuff in code
]).triggerAction({
	matches : $INTENT$
});
*/

// Gets which city they want to move to
bot.dialog('moveBot', [
	function (session, args, next) {
		
		// Retrieves the city
		var move = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.geography.city')
		
		// session.send(" %s is happened", move);
		
		// If move isnt null, it goes to the next function
		if (move){
			
			session.dialogData.searchType= 'builtin.geography.city';
			next({response: move.entity});
			
		}
		// Otherwise it asks for a new city
		else{
			session.send("Please type in a city name I recognize");
		}
	},
	
	// Asks if any additional info is required
	function(session, results) {
		var whichCity = results.response;
		session.send("I'm glad you chose to move to %s" +
		". So do you need any information regarding %s?" +
		" I can give you the weather, how safe it is, working conditions and so on", whichCity, whichCity);
		
		chosenCity = whichCity;
		
	}
	
	// Triggers when LUIS recognizes 'move' as the intent
	]).triggerAction({
		matches : 'move'
});

// Template for searching for info using bing API
bot.dialog('CrimeBot',  [

	function(session, args, next){
		
		// States that it is working on the problem
		session.send("Searching for info on crime in %s" ,chosenCity);
	
		//Bing API which gets a website for you
		Bing.web(chosenCity + " Crime Statistics", {
		top: 20 // Number of results (max 50) 
		  
	  }, function(error, res, body){
		  
		// session.send("here's a great website " + body.webPages.value[19].displayUrl);
		// session.send("here are some great websites");
		for(i = 0; i < 20; i++){
			
		if(decodeURIComponent(body.webPages.value[i].displayUrl).match("wikipedia") == "wikipedia"){
					session.send("here's a great website " + body.webPages.value[i].displayUrl);		
			}
		}
		
	  });
	}
	
	//triggers when LUIS recognizes 'crime' as the intent
	]).triggerAction({
		matches : 'crime'
});
	
// This provides job information
bot.dialog('jobBot', [
	function(session, args, next){
		var whichJob = builder.EntityRecognizer.findEntity(args.intent.entities, 'ITJobs');
		// session.send(whichJob);
		
		if(whichJob){
			next({response: whichJob.entity});
		}
		else{
			builder.Prompts.text(session, "please tell me what you want to do in life");
			next({response: session.message.text});
		}
		
	},
	function(session, results){
		var jobTitle = results.response;
		
		session.send("now searching for jobs for: %s",  jobTitle);
		
		Bing.web(jobTitle + " jobs in " + chosenCity, {
			top : 5
		}, function(error, res, body){
			session.send("Here are the best jobs");
			
			for(var i = 0; i < 3; i++){
				session.send(body.webPages.value[i].displayUrl);
			}
		});
	}

	]).triggerAction({
		matches : 'job'
});

// For none type commands
bot.dialog('noneBot', [
	function(session){
	session.send('I do not understand.');
	}]).triggerAction({
		matches : 'none'
});

// Template for displaying images from Bing API
bot.dialog('view', [

	function(session, args){
		// Gets 5 images, there are other parameters
		Bing.images(chosenCity, {
			top: 5
		}, function (error, res, body){
				// Calls a function in the store file in order to format the images
				Store.getImages(body).then(function (getImages){
				// Sends message saying that it has found the images
				session.send("These are some images of %s", chosenCity);
				
				// Creates a template in order to display pictures (NOTE: this requires a helper function (imagesAsAttachment))
				var message = new builder.Message().attachmentLayout(builder.AttachmentLayout.carousel).
				attachments(getImages.map(imagesAsAttachment));
				
				// Displays pictures
				session.send(message);
				session.endDialog();
			});
		});
		
		
	}
	]).triggerAction({
		matches : 'view'
});

// Don't copy
bot.dialog('hi', function(session){
	session.endDialog("Thanks for asking DestinBot!");
	}).triggerAction({
		matches : 'hi',
		onInterrupted: function (session) {
			session.send('Please provide a destination.');
    }
});

// Spell Check
if (process.env.IS_SPELL_CORRECTION_ENABLED === 'true') {
    bot.use({
        botbuilder: function (session, next) {
            spellService
                .getCorrectedText(session.message.text)
                .then(function (text) {
                    session.message.text = text;
                    next();
                })
                .catch(function (error) {
                    console.error(error);
                    next();
                });
        }
    });
}

// Helpers
// This function helps map an image to a template (very similar to Javax.swing)
function imagesAsAttachment(photo){
	return new builder.HeroCard()
	.title("")
        .subtitle("")
        .images([new builder.CardImage().url(photo.image)]);
}
function hotelAsAttachment(hotel) {
    return new builder.HeroCard()
        .title(hotel.name)
        .subtitle('%d stars. %d reviews. From $%d per night.', hotel.rating, hotel.numberOfReviews, hotel.priceStarting)
        .images([new builder.CardImage().url(hotel.image)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value('https://www.bing.com/search?q=hotels+in+' + encodeURIComponent(hotel.location))
        ]);
}

function reviewAsAttachment(review) {
    return new builder.ThumbnailCard()
        .title(review.title)
        .text(review.text)
        .images([new builder.CardImage().url(review.image)]);
}