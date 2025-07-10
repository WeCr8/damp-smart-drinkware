/**
 * DAMP Smart Drinkware - Lighthouse Configuration
 * Professional web performance and accessibility auditing
 */

module.exports = {
  extends: 'lighthouse:default',
  settings: {
    // Simulated mobile device
    formFactor: 'mobile',
    throttling: {
      rttMs: 40,
      throughputKbps: 10 * 1024,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    },
    screenEmulation: {
      mobile: true,
      width: 360,
      height: 640,
      deviceScaleFactor: 2,
      disabled: false
    },
    emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 7.0; M 