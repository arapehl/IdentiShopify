var lastTabId = 0;

function getCurrentTabUrl(callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;

    if (typeof url === 'string') {
      callback(url);
    }
  });
}

function getMeta(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'json';
  xhr.onload = function () {
    if (xhr.response !== null) {
      callback(xhr.response);
    }
  };
  xhr.send();
}

function createCountryImage(country) {
  var src = "images/flags/" + country.toLowerCase() + ".png";
  var title = countryData[country];
  var alt = countryData[country];

  if (country === "*") {
    src = "images/flags/world.png";
    title = "Everywhere";
    alt = "Everywhere";
  }

  return "<img src='" + src + "' title='" + title + "' alt='" + alt + "' class='country'>";
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    url = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[0];
    url += "/meta.json";
    getMeta(url, function (resp) {
      document.querySelector('#currency').textContent = resp.currency;
      document.querySelector('#country').innerHTML = createCountryImage(resp.country);

      if (resp.ships_to_countries[0] === '*') {
        document.querySelector('#ships_to_countries').innerHTML += createCountryImage('*');
      } else {
        resp.ships_to_countries.forEach(function (country) {
          document.querySelector('#ships_to_countries').innerHTML += createCountryImage(country);
        })
      }
    });
  });
});

function showIcon(tabId) {
  lastTabId = tabId;
  getCurrentTabUrl(function (url) {
    chrome.cookies.get({url: url, name: "_shopify_s"}, function (cookie) {
      if (cookie) {
        chrome.pageAction.show(lastTabId);
      }
    });
  });
}

chrome.tabs.onSelectionChanged.addListener(showIcon);
chrome.tabs.onUpdated.addListener(showIcon);
