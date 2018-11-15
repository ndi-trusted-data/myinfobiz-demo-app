const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const nonce = require('nonce')();
const crypto = require('crypto');
const qs = require('querystring');
const jwt = require('jsonwebtoken');
// const jose = require('jose');
const jose = require('node-jose');
const URLSafeBase64 = require('urlsafe-base64');
const colors = require('colors');

var security = {};

// Sorts a JSON object based on the key value in alphabetical order
function sortJSON(json) {
  if (_.isNil(json)) {
    return json;
  }

  var newJSON = {};
  var keys = Object.keys(json);
  keys.sort();

  for (key in keys) {
    newJSON[keys[key]] = json[keys[key]];
  }

  return newJSON;
};

/**
 * @param url Full API URL
 * @param params JSON object of params sent, key/value pair.
 * @param method
 * @param appId ClientId
 * @param keyCertContent Private Key Certificate content
 * @param keyCertPassphrase Private Key Certificate Passphrase
 * @returns {string}
 */
function generateSHA256withRSAHeader(url, params, method, strContentType, appId, keyCertContent, keyCertPassphrase, realm) {
  var nonceValue = nonce();
  var timestamp = (new Date).getTime();

  // A) Construct the Authorisation Token Parameters
  var defaultApexHeaders = {
    "apex_l2_eg_app_id": appId, // App ID assigned to your application
    "apex_l2_eg_nonce": nonceValue, // secure random number
    "apex_l2_eg_signature_method": "SHA256withRSA",
    "apex_l2_eg_timestamp": timestamp, // Unix epoch time
    "apex_l2_eg_version": "1.0"
  };

  // B) Forming the Base String
  // Base String is a representation of the entire request (ensures message integrity)

  // i) Normalize request parameters
  var baseParams = sortJSON(_.merge(defaultApexHeaders, params));

  var baseParamsStr = qs.stringify(baseParams);
  baseParamsStr = qs.unescape(baseParamsStr); // url safe

  // ii) construct request URL ---> url is passed in to this function
  // NOTE: need to include the ".e." in order for the security authorisation header to work
  //myinfosgstg.api.gov.sg -> myinfosgstg.e.api.gov.sg
  url = _.replace(url, ".api.gov.sg", ".e.api.gov.sg");

  // iii) concatenate request elements (HTTP method + url + base string parameters)
  var baseString = method.toUpperCase() + "&" + url + "&" + baseParamsStr;

  console.log("Base String:".green);
  console.log(baseString);

  // C) Signing Base String to get Digital Signature
  var signWith = {
    key: fs.readFileSync(keyCertContent, 'utf8')
  }; // Provides private key

  // Load pem file containing the x509 cert & private key & sign the base string with it to produce the Digital Signature
  var signature = crypto.createSign('RSA-SHA256')
    .update(baseString)
    .sign(signWith, 'base64');

  // D) Assembling the Authorization Header
  var strApexHeader = "apex_l2_eg realm=\"" + realm + // Defaults to 1st part of incoming request hostname
    "\",apex_l2_eg_timestamp=\"" + timestamp +
    "\",apex_l2_eg_nonce=\"" + nonceValue +
    "\",apex_l2_eg_app_id=\"" + appId +
    "\",apex_l2_eg_signature_method=\"SHA256withRSA\"" +
    ",apex_l2_eg_version=\"1.0\"" +
    ",apex_l2_eg_signature=\"" + signature +
    "\"";

  return strApexHeader;
};

/**
 * @param url API URL
 * @param params JSON object of params sent, key/value pair.
 * @param method
 * @param appId API ClientId
 * @param passphrase API Secret or certificate passphrase
 * @returns {string}
 */
security.generateAuthorizationHeader = function(url, params, method, strContentType, authType, appId, keyCertContent, passphrase, realm) {

  if (authType == "L2") {
    return generateSHA256withRSAHeader(url, params, method, strContentType, appId, keyCertContent, passphrase, realm);
  } else {
    return "";
  }

};


// Verify & Decode JWS or JWT
security.verifyJWS = function verifyJWS(jws, publicCert) {
  // verify token
  // ignore notbefore check because it gives errors sometimes if the call is too fast.
  try {
    var decoded = jwt.verify(jws, fs.readFileSync(publicCert, 'utf8'), {
      algorithms: ['RS256'],
      ignoreNotBefore: true
    });
    return decoded;
  }
  catch(error) {
    console.error("Error with verifying and decoding JWE: %s".red, error);
    throw("Error with verifying and decoding JWS");
  }
}

// Decrypt JWE using private key
security.decryptJWE = function decryptJWE(header, encryptedKey, iv, cipherText, tag, privateKey) {
  console.log("Decrypting JWE".green + " (Format: " + "header".red + "." + "encryptedKey".cyan + "." + "iv".green + "." + "cipherText".magenta + "." + "tag".yellow + ")");
  console.log(header.red + "." + encryptedKey.cyan + "." + iv.green + "." + cipherText.magenta + "." + tag.yellow);
  return new Promise((resolve, reject) => {

    var keystore = jose.JWK.createKeyStore();

    console.log((new Buffer(header,'base64')).toString('ascii'));

    var data = {
      "type": "compact",
      "ciphertext": cipherText,
      "protected": header,
      "encrypted_key": encryptedKey,
      "tag": tag,
      "iv": iv,
      "header": JSON.parse(jose.util.base64url.decode(header).toString())
    };
    keystore.add(fs.readFileSync(privateKey, 'utf8'), "pem")
      .then(function(jweKey) {
        // {result} is a jose.JWK.Key
        jose.JWE.createDecrypt(jweKey)
          .decrypt(data)
          .then(function(result) {
            resolve(JSON.parse(result.payload.toString()));
          })
          .catch(function(error) {
            reject(error);
          });
      });

  })
  .catch (error => {
    console.error("Error with decrypting JWE: %s".red, error);
    throw "Error with decrypting JWE";
  })
}

module.exports = security;
