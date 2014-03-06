/*!
 * @preserve
 * Screentime.js | v0.1
 * Copyright (c) 2014 Rob Flaherty (@robflaherty)
 * Licensed under the MIT and GPL licenses.
 */
(function ( $, window, document, undefined ) {

  var defaults = {
    fields: ['#top', '#middle', '#bottom']
  };

  $.screentime = function(options) {
    options = $.extend({}, defaults, options);

    var looker = {};
    var counter = {};
    var reporter = {};
    var session;
    var cache = {};

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

function Viewport() {
  var $window = $(window);

  this.top = $window.scrollTop();    
  this.height = $window.height();
  this.bottom = this.top + this.height;
  this.width = $window.width();
}

function Session() {
  var id, startdate;
  if (!$.cookie('_onscreen_a')) {
    id = random() + '';
    starttime = +new Date;
    $.cookie('_onscreen_a', id);
    $.cookie('_onscreen_b', starttime);

  } else {
    id = $.cookie('_onscreen_a');
    starttime = $.cookie('_onscreen_b');
  }

  this.site = location.host;
  this.id = id;
  this.starttime = starttime;
}

function Page() {
  this.path = location.pathname;
}

function Ad(selector) {
  $elem = this.$elem = $(selector);
  this.selector = selector;
  this.id = $elem.data('tally-id');

  this.viewable = null;
  this.previous = 0;
  this.timer = 0;
  this.top = $elem.offset().top;
  this.height = $elem.height();
  this.bottom = this.top + this.height;
  this.width = $elem.width();
}

function adViewable(viewport, ad) {
  var cond1 = (ad.top >= viewport.top && ad.top < viewport.bottom);
  var cond2 = (ad.bottom > viewport.top && ad.bottom <= viewport.bottom);
  var cond3 = (ad.height > viewport.height && ad.top <= viewport.top && ad.bottom >= viewport.bottom);

  if ( cond1 || cond2 || cond3 ) {
    return ad
  }
}


function checkViewport() {

  var viewport = new Viewport();
  var now = new Date;
  var capsule = {
    id:   session.id,
    site: session.site,
    page: page.path,
    starttime: session.starttime,
    ads: []
  };


  $.each(cache, function(key, val) {

    if (!adViewable(viewport, val)) {

      val.previous = 0;
    
    } else {

      if (!val.previous) val.previous = now;
      val.timer += now - val.previous;

      capsule.ads.push({
        time: val.timer,
        id: key
      });

      val.previous = now;
    }


  });

  return capsule;

}

function prepareReport(data) {
  return { 
    id: data.id,
    campaigns: [
      { site: '',
        startdate: '',
        enddate: '',
        total: '',
        sessions: [
        ]
      }
    ],

    total: '',

  }

}

function sendReport() {
  var report = checkViewport();
  
  socket.emit('onscreen', report);

  /*
  $.each(report.ads, function(key, val) {
    socket.emit('onscreen', val);
  });
  */
}

function init() {
  
  session = new Session();
  page = new Page();

  $.each(ads, function(index, elem) {
    if ($(elem).length) {
      var ad = new Ad(elem);
      cache[ad.id] = ad;
    }


  });

  // Check viewport on pageload
  var report = checkViewport();

  $(window).on('scroll', throttle(function(){
    
    sendReport();

  }, 500));

}

init();

setInterval(function() {
  sendReport();
}, 1000);


  };

  

})( jQuery, window, document );