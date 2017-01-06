var fs = require('fs');
var util = require('util');
var findup = require('findup-sync');
var path = require('path');
var exec = require('child_process').exec;
var walkSync = require('walk-sync');

var test = {
  contain: function (key, expected) {
    return function () {
      if (!util.isArray(expected)) expected = [expected];
      var str = this[key];
      expected.forEach(function (e) { expect(str).to.contain(e); });
    };
  }
};

describe('broccoli-taco build <destination>', function () {

  describe('Smoke test site', function () {
    var testSitePath = path.join(findup('test'), 'sites/smoke');
    var distName = 'dist';
    var testSitePathDistPath = path.join(testSitePath, distName);

    function rmDist (done) { exec('rm -rf '+distName, done); }

    function toString (filepath) {
      return fs.readFileSync(path.join(testSitePathDistPath, filepath)).toString();
    }

    before(function () { process.chdir(testSitePath); });

    before(rmDist);

    before(function (done) {
      var localPath = path.join(process.cwd(), 'node_modules');
      var cmd = 'BROCCOLI_TACO_ENV=production NODE_PATH='+localPath+' ../../../bin/broccoli-taco build '+distName;
      exec(cmd, done);
    });

    before(function () {
      this.indexHTML = toString('index.html');
    });

    after(rmDist);

    context('HTML', function () {
      it('builds the index page', test.contain('indexHTML', 'PAGES/INDEX'));
      //it('builds with delfault layout', test.contain('indexHTML', 'LAYOUTS/DEFAULT'));

      //it('builds with partials', test.contain('indexHTML', 'PARTIALS/NAV'));

      it('includes site.css on index page', test.contain('indexHTML', '<link href="/site'));
      it('includes page.css on index page', test.contain('indexHTML', '<link href="/page'));

      it('includes site.js on index page', test.contain('indexHTML', '<script src="/site'));
      it('includes page.js on index page', test.contain('indexHTML', '<script src="/page'));
    });

    context('Data', function () {
      it('makes data.js available to index.html', test.contain('indexHTML', 'INDEX_PAGE_DATA'));
    });

  });

});