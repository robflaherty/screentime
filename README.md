screentime
==========

Screentime is a small tool that helps you start thinking of your website traffic in terms of time instead of pageviews. You can define areas of the page, called "Fields", and then Screentime will keep track of how much time each Field is on screen for. You can also use it to track smaller elements, like ad units.

**Screentime only handles the client side work**. You'll need to provide your own backend to post the data to. It does provide an option for posting to Google Analytics but there are some caveats (see below).

## A more detailed explanation
It's not that complicated. You specify some DOM elements that you want to track and then every second Screentime checks the viewport to see which ones are in view. It tracks the viewable seconds for each element/field and then issues a report every 10 seconds (you can adjust the interval). The report is passed to a callback function that you can use to post the data to your server.

If the user switches tabs, the timer stops (using Addy Osmani's [Page Visibility polyfill](https://github.com/addyosmani/visibly.js)). The timer doesn't require that the user be active, just that the screen elements are visible.

## Usage
jQuery is required. Pass in selectors for each **unique element** you want to track, including a name for each. The callback option receives the data in the form of an object.

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