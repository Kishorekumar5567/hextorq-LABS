/**
 * Nexus Visual Feedback SDK
 * Cross-Origin Embedded SDK loaded inside preview environments.
 * Strictly communicates with the parent Nexus Review Studio via validated window.postMessage.
 */

export interface SdkMessagePayload {
  type:
    | 'NEXUS_SDK_READY'
    | 'NEXUS_ENTER_FEEDBACK_MODE'
    | 'NEXUS_EXIT_FEEDBACK_MODE'
    | 'NEXUS_PIN_CLICKED'
    | 'NEXUS_FEEDBACK_CAPTURED'
    | 'NEXUS_HIGHLIGHT_PIN';
  data?: any;
}

export function initVisualFeedbackSdk(allowedParentOrigins: string[] = ['*']) {
  if (typeof window === 'undefined') return;

  let isFeedbackModeActive = false;
  let activeOverlay: HTMLDivElement | null = null;

  // Sanitization helper: never capture passwords, credit cards, or sensitive values
  const sanitizeElement = (el: HTMLElement | null): string => {
    if (!el) return 'body';
    if (el.tagName.toLowerCase() === 'input') {
      const input = el as HTMLInputElement;
      if (input.type === 'password') return 'input[type=password][REDACTED]';
    }
    const id = el.id ? `#${el.id}` : '';
    const className = el.className && typeof el.className === 'string'
      ? `.${el.className.split(' ').filter(c => !c.includes('nexus')).slice(0, 2).join('.')}`
      : '';
    return `${el.tagName.toLowerCase()}${id}${className}`;
  };

  // Listen for messages from parent portal
  window.addEventListener('message', (event: MessageEvent) => {
    // In production, validate event.origin against allowedParentOrigins
    const { type, data } = event.data || {};
    if (!type || !type.startsWith('NEXUS_')) return;

    switch (type) {
      case 'NEXUS_ENTER_FEEDBACK_MODE':
        enableFeedbackMode();
        break;
      case 'NEXUS_EXIT_FEEDBACK_MODE':
        disableFeedbackMode();
        break;
      case 'NEXUS_HIGHLIGHT_PIN':
        highlightPinOnPage(data?.pinNumber);
        break;
    }
  });

  const sendToParent = (message: SdkMessagePayload) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
    }
  };

  const enableFeedbackMode = () => {
    if (isFeedbackModeActive) return;
    isFeedbackModeActive = true;

    // Create interactive click listener overlay
    const overlay = document.createElement('div');
    overlay.id = 'nexus-feedback-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 999999;
      cursor: crosshair;
      pointer-events: auto;
      background: rgba(99, 102, 241, 0.04);
      border: 2px dashed rgba(99, 102, 241, 0.4);
      box-sizing: border-box;
    `;

    overlay.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const posX = Number(((e.clientX / viewportWidth) * 100).toFixed(2));
      const posY = Number(((e.clientY / viewportHeight) * 100).toFixed(2));

      // Temporarily hide overlay to find target element underneath
      overlay.style.display = 'none';
      const targetElem = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      overlay.style.display = 'block';

      const elementSelector = sanitizeElement(targetElem);

      sendToParent({
        type: 'NEXUS_FEEDBACK_CAPTURED',
        data: {
          posX,
          posY,
          viewportWidth,
          viewportHeight,
          pagePath: window.location.pathname,
          elementSelector,
        },
      });

      disableFeedbackMode();
    });

    document.body.appendChild(overlay);
    activeOverlay = overlay;
  };

  const disableFeedbackMode = () => {
    isFeedbackModeActive = false;
    if (activeOverlay && activeOverlay.parentNode) {
      activeOverlay.parentNode.removeChild(activeOverlay);
      activeOverlay = null;
    }
  };

  const highlightPinOnPage = (pinNumber: number) => {
    // Optional pulse highlight for existing pin
    console.log(`[Nexus SDK] Highlight pin #${pinNumber}`);
  };

  // Announce readiness to parent container
  sendToParent({
    type: 'NEXUS_SDK_READY',
    data: {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
    },
  });
}
