var path               = require('path');
var fs                 = require('fs');
var util               = require('util');
var mkdirp             = require('mkdirp');
var clone              = require('clone');
var RSVP               = require('rsvp');
var helpers            = require('broccoli-kitchen-sink-helpers');
var BroccoliHandlebars = require('broccoli-handlebars');
var idFromData         = require('./id-from-data');

var Promise    = RSVP.Promise;

SiteHandlebars.prototype = Object.create(BroccoliHandlebars.prototype);
SiteHandlebars.prototype.constructor = SiteHandlebars;
function SiteHandlebars (inputTree, globsPatterns, options) {
  BroccoliHandlebars.call(this, inputTree, globsPatterns, options);
  this.globsPatterns = globsPatterns;
};

SiteHandlebars.prototype.description = 'broccoli-taco-handlebars';

SiteHandlebars.prototype.getTemplate = function (sourceFilepath) {
  var str = fs.readFileSync(sourceFilepath).toString();
  return this.handlebars.compile(str);
};

SiteHandlebars.prototype.writeTemplate = function (filepath, template, data) {
  mkdirp.sync(path.dirname(filepath));
  fs.writeFileSync(filepath, template(data));
};

SiteHandlebars.prototype.build = function () {
  this.write(this.inputPaths, this.outputPath);
};

SiteHandlebars.prototype.write = function (inputPaths, destDir) {
  var self = this;
  this.loadPartials();
  this.loadHelpers();
  for (let sourceDir of inputPaths) {
    var targetFiles = helpers.multiGlob(self.globsPatterns, {cwd: sourceDir});
    return RSVP.all(targetFiles.map(function (targetFile) {
      var sourceFilepath = path.join(sourceDir, targetFile);

      function write (context) {
        var targetHTMLFile = targetFile.replace(/(hbs|handlebars)$/, 'html');
        var destFilepath = path.join(destDir, targetHTMLFile);
        var dirname = path.dirname(destFilepath);
        var filename = path.basename(destFilepath);
        var template = self.getTemplate(sourceFilepath);

        if (util.isArray(context.page)) {
          context.page.forEach(function (pageContext) {
            var json = clone(context);
            json.page = pageContext;
            var dynamicFilepath = path.join(
              dirname.substring(0, dirname.lastIndexOf('/'))
            , idFromData(pageContext)
            , filename
            );
            self.writeTemplate(dynamicFilepath, template, json);
          });
        } else {
          self.writeTemplate(destFilepath, template, context);
        }
      }

      if ('function' !== typeof self.context) write(self.context);
      return Promise.resolve(self.context(targetFile)).then(write);
    }));
  }
  return null;
};

module.exports = SiteHandlebars;
