var router = require('express').Router();

var request = require('request')

const url = require('url');

var request = require("request");



var cache = {};
var dbfolder = "./data/";
var saved = false;
var saving = false;
var savetimer = false;

var hashCode = function(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}

const fs = require('fs');
const fse = require('fs-extra');

var loaddata = function(filename, cb){
    //var data = fs.readFileSync(dbfolder + filename, "base64");
    fs.readFile(dbfolder + filename, 'base64', function (err, data) {
        if (err) {
            return cb(err, null);
        }
        
   
        var buffer = new Buffer(data, "base64");
        cb(null, buffer);    
        //console.log("The file was saved!");

    });
}

var savedata = function(filename, buffer, cb){
    var data = buffer.toString('base64');
    fse.outputFile(dbfolder + filename, data, 'base64', function (err) {
        if (err) {
            return cb(err, null);
        }
    
        cb(null, null);    
        //console.log("The file was saved!");

    });
}

var checkdata = function(filename, cb){

    fs.stat(dbfolder + filename, function(err, stat) {
        if(err == null) {
            cb(null, stat);
            //console.log('File exists');
        } else if(err.code == 'ENOENT') {
            cb(err, null);
            // file does not exist
            //fs.writeFile('log.txt', 'Some log\n');
        } else {
            cb(err, null);
            //console.log('Some other error: ', err.code);
        }
    });
};

router.get('/proxy',function(req,res,next){
    
    //var url = "http://avaa.tdata.fi/geoserver/osm_finland/wms";
    var url0 = req.query.url || "about:blank";
    
    var urlbits = url0.split("://")
    var protocol = urlbits[0];
    var url = urlbits[1] || "";
    
    var params = req.query;
    
    var paramstring = "";
    
    delete params.url;
    
    
    //console.log(params);
    
    var more = false;
    for (var property in params) {
        if (params.hasOwnProperty(property)) {
            // do stuff
            if (more) {
                paramstring += "&";
            }
            paramstring += property + "=" + params[property];
            
            more = true;
        }
    }
    
    
    
    var requesturl = protocol + "://" + url + "?" + paramstring;
	//console.log(requesturl);
	
	var hashstring = hashCode(requesturl);
	
	
	
	checkdata(hashstring, function(err, stat) {
    	if (!err && stat) {
    	    console.log(hashstring + ": loading from cache");
    	    
    	    loaddata(hashstring, function(err, data) {
                if (err) {
                    console.log(hashstring + ": " + err);
                    return res.end(err);
                }
                //console.log(hashstring + ": loaded");
                return res.end(data);
            });
                
    	    
    	}
    	else
    	{
    	
        	request({
                url: requesturl,
                encoding: null
            }, function(error, response, body) {
                
                if(error || !response) {
                    
                    console.log(hashstring + ": loading failed");
                    return res.status(404).send("error proxifying " + requesturl);
                }
                
                console.log(hashstring + ": loading from online");
                savedata(hashstring, body, function(err) {
                    if (err) {
                        return console.log(hashstring + ": " + err);
                    }
                    //console.log(hashstring + ": saved");
                });
          
      
                return res.end(body);
            });
    	}

	    
	});
});



module.exports= router;