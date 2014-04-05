Screentime
==========

Screentime is a small tool that helps you start thinking of your website traffic in terms of time instead of hits (Pageviews, visits, etc). You can define areas of the page, called Fields, and then Screentime will keep track of how much time each Field is on screen for. You can also use it to track smaller elements, like ad units.

Screentime only handles the client side work. You'll need to provide your own backend to post the data to. I've included an example that shows how to this with [Keen IO](https://keen.io/) using only a few lines of code. There's also a built-in option for posting to Google Analytics but there are some caveats (see below).

## How it works
You specify some DOM elements that you want to track and then every second Screentime checks the viewport to see which ones are in view. It tracks the viewable seconds for each element/field and then issues a report every 10 seconds (you can adjust the interval). The report is passed to a callback function that you can use to post the data to your server.

If the user switches tabs, the timer stops (using Addy Osmani's [Page Visibility polyfill](https://github.com/addyosmani/visibly.js)). The timer doesn't require that the user be active, just that the screen elements are visible.

## Usage
jQuery is required. Pass in selectors for each **unique element** you want to track, including a name for each. The callback option receives an object containing the data.

```javascript
$.screentime({
  fields: [
    { selector: '#top',
      name: 'Top'
    },
    { selector: '#middle',
      name: 'Middle'
    },
    { selector: '#bottom',
      name: 'Bottom'
    }
  ],
  callback: function(data) {
    console.log(data);
    // Example { Top: 5, Middle: 3 }
  }
});
```

## Options
#### `fields` array (required)
An array of object listing the DOM elements you want to track. Each object should specify a `selector` property and a `name` property.

#### `reportInterval` number
The interval, in seconds, used to issue a report. The default is 10 seconds.

#### `percentOnScreen` string
This determines what percentage of the field must be on screen for it to be considered in view. The default is `50%`. One exception to this rule: if a field occupies the majority of the viewport it will be considered in view regardless of its viewable percentage.

#### `googleAnalytics` boolean
Setting this to true (default is false) will send a Google Analytics event for each field (if the field has data to report) when the report is issued.

#### `callback` function
The callback function that receives the screentime data.

## Posting the data
The built-in Google Analytics option is an easy way to quickly start collecting screentime data, but it's not exactly scalable. For each field that has data to report, a separate GA Event has to be sent. If you're only tracking 2 or 3 fields, this is probably fine. But anything more than that and you might start hitting the [GA collection limit](https://developers.google.com/analytics/devguides/collection/gajs/limits-quotas).

For scalabla data collection you'll want to provide your own backend or use a service like Keen IO. In the examples folder there's a demo showing how easy it is to use Keen for this. It's as simple as this:

```javascript
...
callback: function(data) {
  Keen.addEvent("screentime", data);        
}
...
```


