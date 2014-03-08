/*!
 * @preserve
 * Screentime.js | v0.1
 * Copyright (c) 2014 Rob Flaherty (@robflaherty)
 * Licensed under the MIT and GPL licenses.
 */

(function($, window, document) {

  var defaults = {
    fields: [],
    buffer: '25%',
    reportInterval: 3,
    googleAnalytics: true
  };

  $.screentime = function(options) {
    options = $.extend({}, defaults, options);

    var counter = {};
    var cache = {};
    var log = {};
    var looker = null;
    var universalGA, classicGA;


    if (options.googleAnalytics) {

      if (typeof ga === "function") {
        universalGA = true;
      }

      if (typeof _gaq !== "undefined" && typeof _gaq.push === "function") {
        classicGA = true;
      }

    }


    /*
     * Utilities
     */

    /*!
     * visibly - v0.6 Aug 2011 - Page Visibility API Polyfill
     * http://github.com/addyosmani
     * Copyright (c) 2011 Addy Osmani
     * Dual licensed under the MIT and GPL licenses.
     *
     * Methods supported:
     * visibly.onVisible(callback)
     * visibly.onHidden(callback)
     * visibly.hidden()
     * visibly.visibilityState()
     * visibly.visibilitychange(callback(state));
     */
    (function(){window.visibly={q:document,p:undefined,prefixes:["webkit","ms","o","moz","khtml"],props:["VisibilityState","visibilitychange","Hidden"],m:["focus","blur"],visibleCallbacks:[],hiddenCallbacks:[],genericCallbacks:[],_callbacks:[],cachedPrefix:"",fn:null,onVisible:function(i){if(typeof i=="function"){this.visibleCallbacks.push(i)}},onHidden:function(i){if(typeof i=="function"){this.hiddenCallbacks.push(i)}},getPrefix:function(){if(!this.cachedPrefix){for(var i=0;b=this.prefixes[i++];){if(b+this.props[2]in this.q){this.cachedPrefix=b;return this.cachedPrefix}}}},visibilityState:function(){return this._getProp(0)},hidden:function(){return this._getProp(2)},visibilitychange:function(i){if(typeof i=="function"){this.genericCallbacks.push(i)}var t=this.genericCallbacks.length;if(t){if(this.cachedPrefix){while(t--){this.genericCallbacks[t].call(this,this.visibilityState())}}else{while(t--){this.genericCallbacks[t].call(this,arguments[0])}}}},isSupported:function(i){return this.cachedPrefix+this.props[2]in this.q},_getProp:function(i){return this.q[this.cachedPrefix+this.props[i]]},_execute:function(i){if(i){this._callbacks=i==1?this.visibleCallbacks:this.hiddenCallbacks;var t=this._callbacks.length;while(t--){this._callbacks[t]()}}},_visible:function(){window.visibly._execute(1);window.visibly.visibilitychange.call(window.visibly,"visible")},_hidden:function(){window.visibly._execute(2);window.visibly.visibilitychange.call(window.visibly,"hidden")},_nativeSwitch:function(){this[this._getProp(2)?"_hidden":"_visible"]()},_listen:function(){try{if(!this.isSupported()){if(this.q.addEventListener){window.addEventListener(this.m[0],this._visible,1);window.addEventListener(this.m[1],this._hidden,1)}else{if(this.q.attachEvent){this.q.attachEvent("onfocusin",this._visible);this.q.attachEvent("onfocusout",this._hidden)}}}else{this.q.addEventListener(this.cachedPrefix+this.props[1],function(){window.visibly._nativeSwitch.apply(window.visibly,arguments)},1)}}catch(i){}},init:function(){this.getPrefix();this._listen()}};this.visibly.init()})();

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

    function sendGAEvent(field, time) {

      if (universalGA) {
        ga('send', 'event', 'Screentime', 'Time on Screen', field, parseInt(time, 10), {'nonInteraction': true});
      }

      if (classicGA) {
        _gaq.push(['_trackEvent', 'Screentime', 'Time on Screen', field, parseInt(time, 10), true]);
      }

    }

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
          log[key] += 1;
          counter[key] += 1;
        }

      });

      console.log(log);
      reporter();
    }

    function reporter() {

      var report = {};

      $.each(counter, function(key, val) {
        if (val > 0 && val % options.reportInterval === 0) {
          counter[key] = 0;
          report[key] = val;
          sendGAEvent(key, val);
        }
      });

      if (!$.isEmptyObject(report)) {
        //console.log(report);
      }

    }

    function init() {

      $.each(options.fields, function(index, elem) {
        if ($(elem).length) {
          var field = new Field(elem);
          cache[field.selector] = field;
          counter[field.selector] = 0;
          log[field.selector] = 0;
        }
      });

      looker = setInterval(function() {
        checkViewport();
      }, 1000);

      visibly.onHidden(function(){
        clearInterval(looker);
        console.log('hidden!');
      });

      visibly.onVisible(function(){
        clearInterval(looker);

      looker = setInterval(function() {
        checkViewport();
      }, 1000);
        console.log('visible!');
      });


    }

    init();

  };

})(jQuery, window, document);