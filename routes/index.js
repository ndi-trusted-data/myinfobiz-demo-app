var express = require('express');
var router = express.Router();

const restClient = require('superagent-bluebird-promise');
const path = require('path');
const url = require('url');
const util = require('util');
const Promise = require('bluebird');
const _ = require('lodash');
const querystring = require('querystring');
const securityHelper = require('../lib/security/security');
const crypto = require('crypto');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


// ####################
// Setup Configuration
// ####################

// LOADED FRON ENV VARIABLE: public key from MyInfo Consent Platform given to you during onboarding for RSA digital signature
var _publicCertContent = process.env.MYINFO_CONSENTPLATFORM_SIGNATURE_CERT_PUBLIC_CERT;
// LOADED FRON ENV VARIABLE: your private key for RSA digital signature
var _privateKeyContent = process.env.DEMO_APP_SIGNATURE_CERT_PRIVATE_KEY;
// LOADED FRON ENV VARIABLE: your client_id provided to you during onboarding
var _clientId = process.env.MYINFO_APP_CLIENT_ID;
// LOADED FRON ENV VARIABLE: your client_secret provided to you during onboarding
var _clientSecret = process.env.MYINFO_APP_CLIENT_SECRET;
// redirect URL for your web application
var _redirectUrl = process.env.MYINFO_APP_REDIRECT_URL;
// default realm for your web application
var _realm = process.env.MYINFO_APP_REALM;

// URLs for MyInfo APIs
var _authLevel = process.env.AUTH_LEVEL;

var _authApiUrl = process.env.MYINFOBIZ_API_AUTHORISE;
var _tokenApiUrl = process.env.MYINFOBIZ_API_TOKEN;
// var _personApiUrl = process.env.MYINFOBIZ_API_PERSON;
var _entitypersonApiUrl = process.env.MYINFOBIZ_API_ENTITYPERSON;

// Requested attributes

// default myinfo app attributes
// var _attributes = "name,sex,race,nationality,dob,email,mobileno,regadd,housingtype,hdbtype,marital,edulevel";

// Full (myinfo+myinfobiz) attributes
 var _attributes ="name,sex,race,nationality,dob,regadd,housingtype,email,mobileno,marital,edulevel,basic-profile,addresses,appointments";

// myinfo attributes (without uinfin & uen)
//var _attributes ="name,hanyupinyinname,aliasname,hanyupinyinaliasname,marriedname,sex,race,secondaryrace,dialect,nationality,dob,birthcountry,residentialstatus,passportnumber,passportexpirydate,regadd,mailadd,billadd,housingtype,hdbtype,ownerprivate,email,homeno,mobileno,marital,marriagecertno,countryofmarriage,marriagedate,divorcedate,childrenbirthrecords,edulevel,gradyear,schoolname,occupation,employment,workpassstatus,workpassexpirydate,householdincome,assessableincome,assessyear,cpfcontributions,cpfbalances,vehno";

// myinfo attributes (uinfin & uen)
//var _attributes ="uinfin,uen,name,hanyupinyinname,aliasname,hanyupinyinaliasname,marriedname,sex,race,secondaryrace,dialect,nationality,dob,birthcountry,residentialstatus,passportnumber,passportexpirydate,regadd,mailadd,billadd,housingtype,hdbtype,ownerprivate,email,homeno,mobileno,marital,marriagecertno,countryofmarriage,marriagedate,divorcedate,childrenbirthrecords,edulevel,gradyear,schoolname,occupation,employment,workpassstatus,workpassexpirydate,householdincome,assessableincome,assessyear,cpfcontributions,cpfbalances,vehno";




/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../views/html/index.html'));
});

// callback function - directs back to home page
router.get('/callback', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../views/html/index.html'));
});

// function for getting environment variables to the frontend
router.get('/getEnv', function(req, res, next) {
  if (_clientId == undefined || _clientId == null)
    res.jsonp({
      status: "ERROR",
      msg: "client_id not found"
    });
  else
    res.jsonp({
      status: "OK",
      clientId: _clientId,
      redirectUrl: _redirectUrl,
      authApiUrl: _authApiUrl,
      attributes: _attributes,
      authLevel: _authLevel
    });
});

// function for frontend to call backend
router.post('/getentitypersonData', function(req, res, next) {
  // get variables from frontend
  var code = req.body.code;

  var data;
  var request;

  // **** CALL TOKEN API ****
  // Call the Token API (with the authorisation code)
  // t2step2 PASTE CODE BELOW
  request = createTokenRequest(code);
  request
    .buffer(true)
    .end(function(callErr, callRes) {
      if (callErr) {
        // ERROR
        console.log("Error from Token API:".red);
        console.log(callErr.status);
        console.log(callErr);
        // console.log(callErr.response.req.res.text);
        res.jsonp({
          status: "ERROR",
          msg: callErr
        });
      } else {
        // SUCCESSFUL
        var data = {
          body: callRes.body,
          text: callRes.text
        };
        console.log("Response from Token API:".green);
        console.log(JSON.stringify(data.body));

        var accessToken = data.body.access_token;


        if (accessToken == undefined || accessToken == null) {
          res.jsonp({
            status: "ERROR",
            msg: "ACCESS TOKEN NOT FOUND"
          });
        }

        // everything ok, call entity-person API
        callEntityPersonAPI(accessToken, res);
      }
    });
  // t2step2 END PASTE CODE

});

function callEntityPersonAPI(accessToken, res) {
  // validate and decode token to get UINFIN
  // t2step4 PASTE CODE BELOW
  var decoded = securityHelper.verifyJWS(accessToken, _publicCertContent);

  if (decoded == undefined || decoded == null) {
    res.jsonp({
      status: "ERROR",
      msg: "INVALID ACCESS TOKEN"
    })
  }

  console.log("Decoded Access Token:".green);
  console.log(JSON.stringify(decoded));

  var sub = decoded.sub.split("_");
  var uen = sub[0];
  var uinfin = sub[1];


  //uinfin = "S9991214F";
  //uen = "180084010K";


  if (uinfin == undefined || uinfin == null) {
    res.jsonp({
      status: "ERROR",
      msg: "UINFIN NOT FOUND"
    });
  }

  if (uen == undefined || uen == null) {
    res.jsonp({
      status: "ERROR",
      msg: "UEN NOT FOUND"
    });
  }

  console.log("uinfin:".blue + uinfin);
  console.log("uen:".blue + uen);
  // t2step4 END PASTE CODE

  // **** CALL ENTITY-PERSON API ****
  // Call Entity-Person API using accessToken
  // t2step5 PASTE CODE BELOW
  var request = createEntityPersonRequest(uen,uinfin, accessToken);

  // Invoke asynchronous call
  request
    .buffer(true)
    .end(function(callErr, callRes) {
      if (callErr) {
        console.log("Error from Entity-Person API:".red);
        console.log(callErr.status);
        console.log(callErr.response.req.res.text);
        res.jsonp({
          status: "ERROR",
          msg: callErr
        });
      } else {
        // SUCCESSFUL
        var data = {
          body: callRes.body,
          text: callRes.text
        };

        var entitypersonData = data.text;
        if (entitypersonData == undefined || entitypersonData == null) {
          res.jsonp({
            status: "ERROR",
            msg: "ENTITY-PERSON DATA NOT FOUND"
          });
        }
        else {
          if (_authLevel == "L0") {
            entitypersonData = JSON.parse(entitypersonData);
            entitypersonData.uinfin = uinfin; // add the uinfin into the data to display on screen

            console.log("Entity-Person Data :".green);
            console.log(JSON.stringify(entitypersonData));
            // successful. return data back to frontend
            res.jsonp({
              status: "OK",
              text: entitypersonData
            });

          }
          else if(_authLevel == "L2"){
            console.log("Response from Entity-Person API:".green);
            console.log(entitypersonData);
            //t3step3 PASTE CODE BELOW
            // header.encryptedKey.iv.ciphertext.tag
            var jweParts = entitypersonData.split(".");

            securityHelper.decryptJWE(jweParts[0], jweParts[1], jweParts[2], jweParts[3], jweParts[4], _privateKeyContent)
              .then(entitypersonData => {
                if (entitypersonData == undefined || entitypersonData == null)
                  res.jsonp({
                    status: "ERROR",
                    msg: "INVALID DATA OR SIGNATURE FOR ENTITY-PERSON DATA"
                  });
                entitypersonData.uinfin = uinfin; // add the uinfin into the data to display on screen

                console.log("Entity-Person Data (Decoded/Decrypted):".green);
                console.log(JSON.stringify(entitypersonData));
                // successful. return data back to frontend
                res.jsonp({
                  status: "OK",
                  text: entitypersonData
                });
              })
              .catch(error => {
                console.error("Error with decrypting JWE: %s".red, error);
              })
            //t3step3 END PASTE CODE
          }
          else {
            throw new Error("Unknown Auth Level");
          }
        } // end else
      }
    }); // end asynchronous call
  // t2step5 END PASTE CODE

}

// function to prepare request for TOKEN API
function createTokenRequest(code) {
  console.log("******************************".green);
  console.log("**** Create Token Request ****".green);
  console.log("******************************".green);
  var cacheCtl = "no-cache";
  var contentType = "application/x-www-form-urlencoded";
  var method = "POST";
  var request = null;

  // preparing the request with header and parameters
  // t2step3 PASTE CODE BELOW
  // assemble params for Token API
  var strParams = "grant_type=authorization_code" +
    "&code=" + code +
    "&redirect_uri=" + _redirectUrl +
    "&client_id=" + _clientId +
    "&client_secret="+_clientSecret;
  var params = querystring.parse(strParams);


  // assemble headers for Token API
  var strHeaders = "Content-Type=" + contentType + "&Cache-Control=" + cacheCtl;
  var headers = querystring.parse(strHeaders);

  // Sign request and add Authorization Headers
  // t3step2a PASTE CODE BELOW
  var authHeaders = securityHelper.generateAuthorizationHeader(
    _tokenApiUrl,
    params,
    method,
    contentType,
    _authLevel,
    _clientId,
    _privateKeyContent,
    _clientSecret,
    _realm
  );

  if (!_.isEmpty(authHeaders)) {
    _.set(headers, "Authorization", authHeaders);
  }
  // t3step2a END PASTE CODE

  console.log("Request Header for Token API:".green);
  console.log(JSON.stringify(headers));
  console.log("Request Body for Token API:".green);
  console.log(JSON.stringify(params));

  var request = restClient.post(_tokenApiUrl);

  // Set headers
  if (!_.isUndefined(headers) && !_.isEmpty(headers))
    request.set(headers);

  // Set Params
  if (!_.isUndefined(params) && !_.isEmpty(params))
    request.send(params);
  // t2step3 END PASTE CODE

  console.log("Sending Token Request >>>".green);
  return request;
}

// function to prepare request for ENTITY-PERSON API
function createEntityPersonRequest(uen,uinfin, validToken) {
  console.log("*************************************".green);
  console.log("**** Create Entity-Person Request ***".green);
  console.log("*************************************".green);
  var url = _entitypersonApiUrl + "/" + uen + "/"+ uinfin + "/";
  var cacheCtl = "no-cache";
  var method = "GET";
  var request = null;
  // assemble params for Entity-Person API
  // t2step6 PASTE CODE BELOW
  var strParams = "client_id=" + _clientId +
    "&attributes=" + _attributes;
  var params = querystring.parse(strParams);

  // assemble headers for Entity-Person API
  var strHeaders = "Cache-Control=" + cacheCtl;
  var headers = querystring.parse(strHeaders);
  var authHeaders;

  // Sign request and add Authorization Headers
  // t3step2b PASTE CODE BELOW
  authHeaders = securityHelper.generateAuthorizationHeader(
    url,
    params,
    method,
    "", // no content type needed for GET
    _authLevel,
    _clientId,
    _privateKeyContent,
    _clientSecret,
    _realm
  );
  // t3step2b END PASTE CODE
  if (!_.isEmpty(authHeaders)) {
    _.set(headers, "Authorization", authHeaders + ",Bearer " + validToken);
  }
  else {
    // NOTE: include access token in Authorization header as "Bearer " (with space behind)
      _.set(headers, "Authorization", "Bearer " + validToken);
  }

  console.log("Request Header for Entity-Person API:".green);
  console.log(JSON.stringify(headers));

  // invoke token API
  var request = restClient.get(url);

  // Set headers
  if (!_.isUndefined(headers) && !_.isEmpty(headers))
    request.set(headers);

  // Set Params
  if (!_.isUndefined(params) && !_.isEmpty(params))
    request.query(params);
  // t2step6 END PASTE CODE
  console.log("Sending Entity-Person Request >>>".green);
  return request;
}

module.exports = router;
