# Continuum
**by Unfire** · Private macOS research application; independent interactive web demonstration.

## Product positioning
Continuum aims to coordinate ongoing work across specialist engine groups, improve handoffs and maintain visible human decision points. The local macOS research workspace is a separate application, not exposed on this website.

**Site:** Designed as a functional zero-cost public demo, not a static sales-only landing page. Its browser simulation has actual working controls but fictional cases and deliberately no native-data access or live AI.

## Working in-browser features
- Create a synthetic task, choose one of three parallel specialist streams and set a human-review gate.
- Advance all available workstreams in parallel by one deterministic cycle.
- Pause/resume all streams or each individual stream.
- Review, approve or reject a fictional item, with review never implicitly bypassed.
- See stateful counts, filter work, read activity history, export the synthetic state to a JSON file, reset sample.
- All page data stays in memory and disappears on refresh. No login, tracking, analytics, cookies or backend calls.

## Real limitations
- Native Continuum v0.8.x and local engines are private software, not connected to the public website.
- The web workflow models conceptual patterns; it does not prove production autonomy, continuous cloud AI inference, commercial ROI, independent certification, customer deployment or signed release readiness.
- No real task changes, customer data, third-party AI credentials, or services are executed.
- No source code from the private macOS product is included.
- The publisher retains copyright over independently authored website elements; no new open-source licence is granted by this repository.

## Run and verify
Use a localhost static file server. In the repository:
- Start: python3 -m http.server 18778 --bind 127.0.0.1
- Browse: http://127.0.0.1:18778/
- Tests: node --test tests/*.test.mjs

Engine code lives in engine.mjs and uses a deterministic, pure reducer with an explicit allowlist. main.mjs applies state updates using DOM textContent and native form validation; the app uses zero dependencies.

## Competition and funding use
The product-first brand is **Continuum**, with a discreet **by Unfire** publisher credit. For programs whose terms permit privately owned source code, position Continuum as the proposed coordination/orchestration research product, with native-product evidence reviewed separately. For compulsory open-source contests, do not disclose the private macOS system; choose a different eligible demonstration (such as the distinct Cognizant Autonomy lab) unless the founder expressly authorizes a scoped release.

No funding application, award, contractual promise, public native app license, or fee is implied by this site.

## Contact
hello@unfire.technology, email preferred. Remote only. No fees.
