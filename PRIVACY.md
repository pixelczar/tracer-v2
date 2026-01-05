# Privacy Policy for Tracer Extension

**Last Updated:** January 2026

## Overview

Tracer is a browser extension that helps design engineers analyze websites by extracting colors, typography, and technology stack information. This privacy policy explains how Tracer handles data.

## Data Collection

Tracer collects **website content** from pages you visit, including:

- **Visual Design Data**: Colors, typography, and font information displayed on web pages
- **Technology Stack Information**: JavaScript frameworks, libraries, and tools detected on websites
- **Page Metadata**: URLs, favicons, and Open Graph images
- **Element Screenshots**: When using the element inspection feature, screenshots of selected page elements

## How Data is Used

All data collected by Tracer is processed **entirely locally** in your browser. The extension:

- Analyzes the current page's design and technology stack
- Displays results in the extension's side panel
- Temporarily stores HTTP response headers in browser session storage (automatically cleared when tabs are closed)

## Data Storage and Transmission

**Tracer does NOT:**

- Transmit any data to external servers
- Store data permanently on your device
- Share data with third parties
- Track your browsing history
- Collect personally identifiable information
- Collect authentication credentials
- Collect financial or payment information
- Collect location data
- Collect health information
- Collect personal communications

All analysis happens locally in your browser. The only data stored is temporary session data (HTTP headers) that is automatically deleted when you close browser tabs.

## Permissions

Tracer requires the following permissions to function:

- **sidePanel**: To display the analysis interface
- **activeTab**: To analyze the currently active tab
- **scripting**: To detect JavaScript frameworks in the page context
- **storage**: To temporarily store HTTP headers for tech detection
- **tabs**: To capture screenshots of inspected elements
- **webRequest**: To capture HTTP response headers for technology detection
- **Host permissions (<all_urls>)**: To analyze any website you visit

These permissions are only used when you explicitly open the extension. Content scripts remain inactive until you activate the extension.

## Your Rights

Since Tracer processes all data locally and does not transmit or store data externally, there is no external data to access, modify, or delete. All processing occurs in your browser's memory and is cleared when you close tabs.

## Changes to This Policy

We may update this privacy policy from time to time. The "Last Updated" date at the top of this policy indicates when changes were last made.

## Contact

If you have questions about this privacy policy, please contact us through the extension's support channels.

---

**Summary**: Tracer analyzes website content locally in your browser. No data is transmitted, stored permanently, or shared with third parties. All processing happens on your device.

