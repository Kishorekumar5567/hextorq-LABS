// Extracted production styled-jsx rules for Harry Clinton luxury menswear deployment
// Injected into the live preview proxy to guarantee pixel-perfect styling even before hydration
export const HARRY_CLINTON_STYLES = `
/* Top Announcement Bar Ticker Buttons */
.ticker-nav-btn.jsx-bceef4e269f1976e {
  z-index: 10;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 28px;
  margin: 0;
  padding: 5px 10px;
  transition: color .2s, background-color .2s, transform .2s;
  display: flex;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #fff !important;
  opacity: 1 !important;
  visibility: visible !important;
  box-shadow: none !important;
  background: #ffffff1f !important;
  border: none !important;
  border-radius: 50% !important;
  outline: none !important;
}
.ticker-nav-btn.jsx-bceef4e269f1976e:hover {
  color: #c6a15b !important;
  background: #c6a15b2e !important;
}
.ticker-prev.jsx-bceef4e269f1976e { left: 10px; }
.ticker-next.jsx-bceef4e269f1976e { right: 10px; }

/* Hamburger and Mega Navigation Menu */
.hamburger.jsx-72df613f4552a0f3 {
  cursor: pointer;
  z-index: 1000;
  background: 0 0;
  border: 0;
  outline: none;
  width: 25px;
  height: 25px;
  padding: 0;
  position: relative;
}
.hamburger.jsx-72df613f4552a0f3 span.jsx-72df613f4552a0f3 {
  background-color: #000;
  border-radius: 1px;
  width: 100%;
  height: 3px;
  transition: all .4s ease-in-out;
  position: absolute;
  left: 0;
}
.hamburger.jsx-72df613f4552a0f3 span.jsx-72df613f4552a0f3:first-child { top: 0; left: 0; }
.hamburger.jsx-72df613f4552a0f3 span.jsx-72df613f4552a0f3:nth-child(2) { width: 60%; top: 50%; left: 20%; transform: translateY(-50%); }
.hamburger.jsx-72df613f4552a0f3 span.jsx-72df613f4552a0f3:nth-child(3) { bottom: 0; left: auto; right: 0; }
.hamburger.active.jsx-72df613f4552a0f3 span.jsx-72df613f4552a0f3 { background-color: #c6a15b; }
.hamburger.active.jsx-72df613f4552a0f3 span.jsx-72df613f4552a0f3:first-child { width: 3px; height: 100%; top: 0; left: 0; }
.hamburger.active.jsx-72df613f4552a0f3 span.jsx-72df613f4552a0f3:nth-child(2) { width: 100%; height: 3px; top: 50%; left: 0; transform: translateY(-50%); }
.hamburger.active.jsx-72df613f4552a0f3 span.jsx-72df613f4552a0f3:nth-child(3) { width: 3px; height: 100%; inset: 0 0 0 auto; }

.topmenu,
.topmenu.jsx-72df613f4552a0f3 {
  z-index: 70 !important;
  opacity: 1 !important;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background: #fff !important;
  height: 0px !important;
  transition: height .4s ease-in-out;
  position: absolute !important;
  top: 100% !important;
  left: 0 !important;
  right: 0 !important;
  overflow: hidden !important;
  transform: none !important;
  box-shadow: 0 4px 12px #0000001a !important;
}
.topmenu.show,
.topmenu.show.jsx-72df613f4552a0f3 {
  height: min(340px, calc(100vh - 80px)) !important;
  overflow-y: auto !important;
}
.Hdropdown.jsx-72df613f4552a0f3 {
  grid-template-columns: 1fr 1fr 1fr 2.3fr;
  gap: 20px;
  margin-left: 30px;
  padding: 25px 60px;
  display: grid;
}
.Hdropdown.jsx-72df613f4552a0f3 strong.jsx-72df613f4552a0f3 {
  font-family: var(--font-mainlux), "MAINLUX", sans-serif;
  letter-spacing: normal;
  color: #111;
  text-transform: uppercase;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 700;
  display: block;
}
.Hdropdown.jsx-72df613f4552a0f3 ul.jsx-72df613f4552a0f3 {
  margin: 0;
  padding: 0;
  list-style: none;
}
.Hdropdown.jsx-72df613f4552a0f3 li.jsx-72df613f4552a0f3 {
  margin-bottom: 10px;
}
.Hdropdown.jsx-72df613f4552a0f3 button.jsx-72df613f4552a0f3 {
  font-family: var(--font-mainlux), "MAINLUX", sans-serif;
  color: #111;
  text-align: left;
  cursor: pointer;
  text-underline-offset: 3px;
  background: 0 0;
  border: none;
  padding: 0;
  font-size: 16px;
  text-decoration: none;
  transition: text-decoration-color .2s;
  display: inline-block;
}
.Hdropdown.jsx-72df613f4552a0f3 button.jsx-72df613f4552a0f3:hover {
  color: #1a1a1a;
  text-decoration: underline;
}
.Hdropdown-image-box.jsx-72df613f4552a0f3 {
  color: #fff;
  background: #101010;
  align-items: flex-end;
  width: 100%;
  height: 290px;
  display: flex;
  position: relative;
  bottom: 20px;
  left: 70px;
  overflow: hidden;
}
.Hdropdown-image.jsx-72df613f4552a0f3 {
  object-fit: cover;
  opacity: .75;
  width: 100%;
  height: 100%;
  transition: transform .6s cubic-bezier(.16,1,.3,1), opacity .4s;
  position: absolute;
  inset: 0;
}
.Hdropdown-image-box.jsx-72df613f4552a0f3:hover .Hdropdown-image.jsx-72df613f4552a0f3 {
  opacity: .9;
  transform: scale(1.06);
}
.Hdropdown-overlay.jsx-72df613f4552a0f3 {
  z-index: 2;
  text-align: center;
  padding: 12px;
  position: absolute;
  bottom: 15px;
  left: 15px;
  right: 15px;
}
.Hdropdown-overlay.jsx-72df613f4552a0f3 h4.jsx-72df613f4552a0f3 {
  font-family: var(--font-mainlux), "MAINLUX", sans-serif;
  color: #fff;
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}
.Hdropdown-overlay.jsx-72df613f4552a0f3 button.jsx-72df613f4552a0f3 {
  font-family: var(--font-mainlux), "MAINLUX", sans-serif;
  letter-spacing: normal;
  text-transform: none;
  color: #111;
  cursor: pointer;
  background: #fff;
  border: none;
  margin: 0;
  padding: 7px 16px;
  font-size: 14px;
  font-weight: 700;
  transition: background-color .2s;
}

/* Header Icons and Logo */
.fs-4.jsx-c1a35403b09e0279 { font-size: 1.4rem; }
.header-logo.jsx-c1a35403b09e0279 {
  object-fit: contain;
  width: auto;
  height: 40px;
  margin: 0;
  padding: 0;
  display: block;
}
.hicon.jsx-c1a35403b09e0279 {
  cursor: pointer;
  flex: none;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  margin: 0;
  padding: 0;
  display: flex;
}
.hicon.jsx-c1a35403b09e0279 svg.jsx-c1a35403b09e0279 {
  flex: none;
  width: 25px;
  height: 25px;
  display: block;
}
.c-home.jsx-c1a35403b09e0279 {
  flex: none;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  margin: 0;
  padding: 0;
  display: flex;
  position: relative;
}
.c-icon.jsx-c1a35403b09e0279 {
  box-sizing: border-box;
  cursor: pointer;
  background: 0 0;
  border: 3px solid #000;
  border-right-color: #0000;
  width: 25px;
  height: 25px;
  margin: 0;
  padding: 0;
  transition: transform .3s, border-color .4s ease-in-out;
  display: block;
  position: relative;
  border-radius: 50% !important;
}
.c-icon.jsx-c1a35403b09e0279:hover { transform: rotate(1turn); }

/* Luxury Hero Carousel Slider */
.slider-container,
.slider-container.jsx-b46bd62176148f33 {
  background-color: #000;
  width: 100%;
  height: 87vh;
  position: relative;
  overflow: hidden;
}
.slide,
.slide.jsx-b46bd62176148f33 {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity .6s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide:first-child {
  opacity: 1;
}
.slide-media,
.slide-media.jsx-b46bd62176148f33 {
  object-fit: cover;
  object-position: top;
  width: 100%;
  height: 90vh;
  display: block;
}
.custom-arrow,
.custom-arrow.jsx-b46bd62176148f33 {
  z-index: 10;
  color: #fff;
  cursor: pointer;
  opacity: .85;
  background: 0 0;
  border: none;
  justify-content: center;
  align-items: center;
  padding: 8px;
  transition: opacity .2s, transform .2s;
  display: flex;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.custom-arrow:hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}
.custom-prev { left: 15px; }
.custom-next { right: 15px; }
.slider-dots,
.slider-dots.jsx-b46bd62176148f33 {
  z-index: 10;
  gap: 8px;
  display: flex;
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translate(-50%);
}
.slider-dot,
.slider-dot.jsx-b46bd62176148f33 {
  aspect-ratio: 1;
  appearance: none;
  cursor: pointer;
  background-color: #ffffff73;
  border: none;
  width: 8px;
  min-width: 8px;
  height: 8px;
  min-height: 8px;
  padding: 0;
  transition: all .3s;
  display: block;
  border-radius: 50% !important;
}
.slider-dot.active {
  background-color: #fff;
  transform: scale(1.25);
}
.video-controls,
.video-controls.jsx-b46bd62176148f33 {
  z-index: 10;
  gap: 8px;
  display: flex;
  position: absolute;
  bottom: 16px;
  right: 20px;
}
.video-btn,
.video-btn.jsx-b46bd62176148f33 {
  color: #fff;
  cursor: pointer;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  background: #10101099;
  border: 1px solid #ffffff4d;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  transition: all .2s;
  display: flex;
}

/* Appointment Modal Backdrop */
.appointment-modal-backdrop.jsx-60268cc7edcc33c0 {
  z-index: 1055;
  perspective: 1200px;
  background: #080707db;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  display: none;
  position: fixed;
  inset: 0;
  overflow-y: auto;
}

/* Hide breadcrumbs on preview home page */
nav[aria-label*="breadcrumb"],
ol[class*="breadcrumb"],
.breadcrumb,
.breadcrumb-item,
[class*="breadcrumb"],
nav:has(.bi-house-door-fill) {
  display: none !important;
}

/* Ensure luxury full-width desktop layout */
.slider-container {
  min-height: 580px !important;
  height: 87vh !important;
}
`;
