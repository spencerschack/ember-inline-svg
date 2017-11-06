/* jshint node: true */
'use strict';

var fs          = require('fs');
var merge       = require('merge');
var mergeTrees  = require('broccoli-merge-trees');
var flatiron    = require('broccoli-flatiron');
var Funnel      = require('broccoli-funnel');
var SVGOptmizer = require('./svg-optimizer');

module.exports = {
  name: 'ember-inline-svg',

  included: function(app) {
    if (app.app) {
      app = app.app;
    }
    this.app = app;
  },

  options: function() {
    return merge(true, {}, {
      files:   [],
      optimize: { /* svgo defaults */ }
    }, (this.app && this.app.options && this.app.options.svg) || {});
  },

  optimizeSVGs: function(tree) {
    var config = this.options().optimize;
    if (!config) {
      return tree;
    }

    return new SVGOptmizer([tree], {svgoConfig: config});
  },

  treeForApp: function(tree) {
    var svgs = mergeTrees(this.options().files, {
      overwrite: true
    });

    var optimized = this.optimizeSVGs(svgs);

    var manifest = flatiron(optimized, {
      outputFile: 'svgs.js',
      trimExtensions: true
    });

    return mergeTrees([tree, manifest]);
  }
};
