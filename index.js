// patch navigator for old safari, legacy edge, and ie 11
if (!navigator.requestMediaKeySystemAccess) {
  var isTypeSupported = window.MSMediaKeys && window.MSMediaKeys.isTypeSupported ||
    window.WebKitMediaKeys && window.WebKitMediaKeys.isTypeSupported;

  if (!isTypeSupported) {
    isTypeSupported = function() {
      return false;
    };
  }
  navigator.requestMediaKeySystemAccess = function(drmType, confs) {
    var thenCallback;
    var catchCallback;

    window.setTimeout(function() {
      var failure = confs.some(function(conf) {
        var allCapabilities = [];

        if (conf.audioCapabilities) {
          allCapabilities = allCapabilities.concat(conf.audioCapabilities);
        }

        if (conf.videoCapabilities) {
          allCapabilities = allCapabilities.concat(conf.videoCapabilities);
        }

        return allCapabilities.some(function(audio) {
          return !isTypeSupported(drmType, audio.contentType);
        });

      });

      if (failure) {
        catchCallback();
      } else {
        thenCallback();
      }
    });

    return {
      then: function(fn) {
        thenCallback = fn;
        return this;
      },
      catch: function(fn) {
        catchCallback = fn;
        return this;
      }
    };

  };
}

// borrowed heavily from https://www.radiantmediaplayer.com/blog/detecting-eme-cdm-browser.html
var checkConfig = function(config) {
  [{
    keySystem: 'com.widevine.alpha',
    el: widevine,
    name: 'widevine'
  }, {
    keySystem: 'com.microsoft.playready',
    el: playready,
    name: 'playready'
  }, {
    keySystem: 'org.w3.clearkey',
    el: clearkey,
    name: 'clearkey'
  }, {
    keySystem: 'com.apple.fps',
    el: fairplay,
    name: 'fairplay'
  }].forEach(function(obj) {
    if (obj.keySystem === 'com.apple.fps') {
      config[0].initDataTypes = ['sinf'];
    }
    var doCatch = function(e) {
      obj.el.innerText = 'no';
      obj.el.parentElement.className = 'no';
      console.log('no ' + obj.name + ' support');
      console.log(e);
    };

    try {
      navigator.
        requestMediaKeySystemAccess(obj.keySystem, config).
        then(function(mediaKeySystemAccess) {
          obj.el.innerText = 'yes';
          obj.el.parentElement.className = 'yes';
          console.log(obj.name + ' support ok');
        }).catch(doCatch);
    } catch (e) {
      doCatch(e);
    }
  });
};
