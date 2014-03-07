/*!
 * @preserve
 * Screentime.js | v0.1
 * Copyright (c) 2014 Rob Flaherty (@robflaherty)
 * Licensed under the MIT and GPL licenses.
 */

(function($, window, document) {

  var defaults = {
    fields: [],
    buffer: '25%'
  };

  $.screentime = function(options) {
    options = $.extend({}, defaults, options);

    var counter = {};
    var cache = {};

    /*
     * Utilities
     */

    /*
     * Throttle function borrowed from:
     * Underscore.js 1.5.2
     * http://underscorejs.org
     * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
     * Underscore may be freely distributed under the MIT license.
     */

    function throttle(func, wait) {
      var context, args, result;
      var timeout = null;
      var previous = 0;
      var later = function() {
        previous = new Date;
        timeout = null;
        result = func.apply(context, args);
      };
      return function() {
        var now = new Date;
        if (!previous) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
        } else if (!timeout) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    }

    function random() {
      return Math.round(Math.random() * 2147483647);
    }

    /*
     * Constructors
     */

    function Field(selector) {
      this.selector = selector;
      $elem = this.$elem = $(selector);

      this.top = $elem.offset().top;
      this.height = $elem.height();
      this.bottom = this.top + this.height;
      this.width = $elem.width();
    }

    function Viewport() {
      var $window = $(window);

      this.top = $window.scrollTop();
      this.height = $window.height();
      this.bottom = this.top + this.height;
      this.width = $window.width();
    }


    /*
     * Do Stuff
     */

    function onScreen(viewport, field) {
      var buffer = parseInt(options.buffer.replace('%', ''), 10);

      var cond1 = (field.top >= viewport.top && field.top < viewport.bottom);
      var cond2 = (field.bottom > viewport.top && field.bottom <= viewport.bottom);
      var cond3 = (field.height > viewport.height && field.top <= viewport.top && field.bottom >= viewport.bottom);

      return ( cond1 || cond2 || cond3 );
    }


    function checkViewport() {
      var viewport = new Viewport();

      $.each(cache, function(key, val) {

        if (onScreen(viewport, val)) {
          counter[key] += 1;
        }

      });

      //console.log(counter);
    }

    function init() {

      $.each(options.fields, function(index, elem) {
        if ($(elem).length) {
          var field = new Field(elem);
          cache[field.selector] = field;
          counter[field.selector] = 0;
        }
      });

      setInterval(function() {
        checkViewport();
      }, 1000);

    }

    init();

  };

})(jQuery, window, document);