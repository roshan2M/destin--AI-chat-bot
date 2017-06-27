var Bing = require('node-bing-api')({ accKey: "6cc0926a2737425182fb6d86e289d6eb" });
Bing.web("Toronto Crime", {
    top: 10,  // Number of results (max 50) 
    skip: 3   // Skip first 3 results 
  }, function(error, res, body){
 
    // body has more useful information besides web pages 
    // (image search, related search, news, videos) 
    // but for this example we are just 
    // printing the first two web page results 
    console.log(body.webPages.value[0]);
    console.log(body.webPages.value[1]);
  });