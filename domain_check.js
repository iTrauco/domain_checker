/* jshint esnext: true, esversion: 6 */

/**
 * check a list of domains, list ones that are currently unregistered
 *
 * Usage: `node domain_check.js strings.txt`
 *
 * initial code prototype idea from
 * https://limpet.net/mbrubeck/2010/01/13/si-unit-domains-node-js.html
 */
var _ = require('lodash'),
  dns = require("dns"),
  fs = require('fs'),
  whois = require('whois-ux');

var showRegistered = false,
  minlength = 8,
  maxlength = 20,
  filename = process.argv[2],
  tld = ".com";

/**
 * load the text file full of strings to try
 */
loadFile(filename, function(error, lines) {
  if (error) {
    return console.error(new Error(error));
  }

  formatNames(lines, tld);
});

/**
* load the text file full of strings to try
*/
function loadFile(filename, cb) {
  var lines = [];

  if (!filename) {
    throw "please provide a filename";
  }

  fs.readFile(filename, 'utf8', function(err, data) {
    if (err) {
      throw err;
    }

    cb(err, data.split(/\r?\n/));
  });
}

/**
 * compose domain names from pairs in the list
 */
function formatNames(prefixes, tld) {
  var domain = "";

  for (var i = 0, count = prefixes.length; i < count; ++i) {
    for (var j = count - 1; j >= 1; --j) {
      if (i != j) {
        domain = prefixes[i] + prefixes[j] + tld;

        // don't make it too long…
        var len = domain.length;

        if (len < minlength) {
          console.error(new Error(`skipping domain (too short): ${domain}`));
        } else if (len > maxlength) {
          console.error(new Error(`skipping domain (too long): ${domain}`));
        } else {
          checkAvailable(domain);
        }
      }
    }
  }

}

function checkAvailable(name, callback) {
  checkDNS(name);
}

function checkDNS(name) {
  var arrNotFoundErrors = [dns.NOTFOUND, dns.SERVFAIL, dns.NODATA];

  dns.resolve4(name, (err, addresses) => {
    if (err) {
      if (arrNotFoundErrors.indexOf(err.errno) != -1) {
        checkWhois(name);

      } else {
        console.error(new Error(`unhandled error: ${err.errno} for name`));
      }
    } else if (showRegistered) {
      console.log(`addresses: ${JSON.stringify(addresses)}`);

      addresses.forEach((a) => {
        dns.reverse(a, (err, hostnames) => {
          if (err) {
            console.error(err);
          }
          console.log(`reverse for ${a}: ${JSON.stringify(hostnames)}`);
        });
      });
    }
  });
}

/**
 * query name server for registration
 */
function checkWhois(name) {
  try {
    whois.whois(name, function(err, data) {
      var outstring = '';

      if (err) {
        console.error(new Error(name));
      } else {
        if (_.isEmpty(data) || typeof data.Registrar === 'undefined') {
          outstring = name;
          console.log(outstring);
        } else {
          console.error(new Error(`${name} is already registered`));
        }
      }
    });

  } catch (ex) {
    console.error(ex);
  }
}
