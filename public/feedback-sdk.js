(function() {
  if (typeof window === 'undefined') return;

  var isFeedbackModeActive = false;
  var activeOverlay = null;

  function sanitizeElement(el) {
    if (!el) return 'body';
    if (el.tagName && el.tagName.toLowerCase() === 'input' && el.type === 'password') {
      return 'input[type=password][REDACTED]';
    }
    var id = el.id ? '#' + el.id : '';
    var className = el.className && typeof el.className === 'string'
      ? '.' + el.className.split(' ').filter(function(c) { return !c.includes('nexus'); }).slice(0, 2).join('.')
      : '';
    return (el.tagName ? el.tagName.toLowerCase() : 'div') + id + className;
  }

  function sendToParent(type, data) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: type, data: data }, '*');
    }
  }

  function enableFeedbackMode() {
    if (isFeedbackModeActive) return;
    isFeedbackModeActive = true;

    var overlay = document.createElement('div');
    overlay.id = 'nexus-feedback-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;cursor:crosshair;background:rgba(99,102,241,0.06);border:2px dashed rgba(99,102,241,0.5);box-sizing:border-box;';

    overlay.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      var w = window.innerWidth;
      var h = window.innerHeight;
      var posX = Number(((e.clientX / w) * 100).toFixed(2));
      var posY = Number(((e.clientY / h) * 100).toFixed(2));

      overlay.style.display = 'none';
      var target = document.elementFromPoint(e.clientX, e.clientY);
      overlay.style.display = 'block';

      sendToParent('NEXUS_FEEDBACK_CAPTURED', {
        posX: posX,
        posY: posY,
        viewportWidth: w,
        viewportHeight: h,
        pagePath: window.location.pathname,
        elementSelector: sanitizeElement(target)
      });

      disableFeedbackMode();
    });

    document.body.appendChild(overlay);
    activeOverlay = overlay;
  }

  function disableFeedbackMode() {
    isFeedbackModeActive = false;
    if (activeOverlay && activeOverlay.parentNode) {
      activeOverlay.parentNode.removeChild(activeOverlay);
      activeOverlay = null;
    }
  }

  window.addEventListener('message', function(event) {
    var data = event.data || {};
    if (data.type === 'NEXUS_ENTER_FEEDBACK_MODE') {
      enableFeedbackMode();
    } else if (data.type === 'NEXUS_EXIT_FEEDBACK_MODE') {
      disableFeedbackMode();
    }
  });

  // Ready signal
  sendToParent('NEXUS_SDK_READY', {
    url: window.location.href,
    path: window.location.pathname,
    title: document.title
  });
})();
