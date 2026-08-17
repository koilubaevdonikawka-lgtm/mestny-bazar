# ADR-003: Geocoding Provider for BY_DISTANCE Delivery Pricing

**Status:** Accepted
**Date:** 2026-08-09
**Context:** Местный Базар (Everyday Eats Hub) — Delivery Management & Pricing, `delivery-future-roadmap.md` candidate #1

## Problem

`DeliveryTariff.pricingModel: BY_DISTANCE` and the underlying formula are implemented and covered by tests (Delivery Этап 2), but `distanceKm` is always `undefined` at runtime — there is no provider that turns a `Store` origin point and a customer's address into an actual distance. `delivery-future-roadmap.md` names this explicitly as ADR candidate #1 ("New external provider — Yes" under Principle 14) and blocks activating `BY_DISTANCE` until it is resolved. Подэтап 0 of this same plan closed the other half of the blocker (Store now exists as a manageable entity with optional `lat`/`lng`); this ADR closes the remaining one — which external service actually turns coordinates/addresses into a distance, and whether we may store the result.

Four candidates were evaluated: **Google Maps Geocoding API**, **Yandex Geocoder API**, **2GIS Geocoder API**, **OpenStreetMap/Nominatim**.

## Decision

Adopt **2GIS Geocoder API** as the `IGeocodingProvider` adapter's real backing service, behind the existing Provider + Stub + Factory pattern already used three times in this project (AI translation, AI image background removal, Finik payments) — `createGeocodingProvider(env)` returns a real `TwoGisGeocodingAdapter` when a `TWOGIS_API_KEY` is configured, else a safe, non-throwing `StubGeocodingProvider` (mirrors `StubAiProvider`/`StubPaymentProvider` exactly — `BY_DISTANCE` tariffs simply fail to resolve a distance and the pricing engine falls back the same way it already does today, no new failure mode).

### Comparison

| Criterion | Google Maps | Yandex Geocoder | **2GIS (chosen)** | OSM/Nominatim |
|---|---|---|---|---|
| Data quality for Bishkek/Kyrgyzstan specifically | Global-grade, not locally specialized | Strong (CIS-wide coverage, Kyrgyzstan included) | **Strongest** — dedicated local office, continuously updated, native Kyrgyz-language product | Community-maintained, historically patchier in Central Asia than in Western Europe/North America |
| Address database completeness (Bishkek) | Not independently confirmed | Confirmed CIS-wide, not Bishkek-specific in sources checked | **Confirmed**: 90,000+ listed organizations, 1,000,000+ buildings mapped, 6,200+ km of roads detailed for Kyrgyzstan | No Bishkek-specific completeness figure found |
| Coordinate accuracy | Generally high (global standard) | Generally high | **High**, validated by a large active local user base (~300,000 monthly Bishkek app users) | Depends entirely on volunteer contribution density in the area |
| API stability | Mature, industry-standard REST API | Mature REST API | Mature REST API, documented `docs.2gis.com` | Public instance explicitly has **no SLA**; a self-hosted instance is our own operational responsibility |
| Licensing — may we **store** the result? | Caching/storage of geocoding results is restricted by Google Maps Platform ToS (tied to display-on-a-Google-map obligations in the common case) | **Two license tiers**: standard forbids storing/caching returned data at all; only the extended (paid) license permits it | Commercial subscription; no caching prohibition found equivalent to Google's/Yandex's standard-tier restriction | ODbL (open data) — no proprietary storage restriction, but see rate-limit/SLA caveat above |
| Cost | $5 / 1,000 requests after a ~10,000/month free tier; volume discounts above 500,000/month | Prepaid annual/monthly license, tied to the JS API bundle; no per-request self-serve tier found | Request-based subscription via Platform Manager; free 1-month demo key (5 pages × 10 objects) available to prototype against before committing | Free (public instance) / infrastructure cost only (self-hosted) |
| Rate limits | 3,000 requests/minute | Not found in sources checked (license-gated, not self-serve) | Not published in sources checked (tariff-gated) | **Public instance: 1 request/second, hard cap** — explicitly stated as unsuitable for production commercial apps without self-hosting |
| Integration effort | Very well documented, mature SDKs, lowest integration friction of the four | Well documented, but bundled with the broader JS Maps API commercially, not a standalone geocoding-only product | Well documented (`docs.2gis.com/en/api/search/geocoder`), REST, standalone Geocoder endpoint | Simple REST API, but self-hosting means owning an import pipeline (OSM extract → PostgreSQL/PostGIS) and its maintenance |
| Fits existing Provider+Adapter+Factory pattern | Yes — one more REST adapter | Yes — one more REST adapter | **Yes** — one more REST adapter, same shape as the other three | Only if using a *third-party-hosted* Nominatim instance as a plain REST adapter; self-hosting introduces new infrastructure (a service to run/operate), which is a materially different kind of decision than "add an adapter" |
| Geopolitical/business risk | None identified | **Real, confirmed**: Yandex services and Yandex Pay specifically face sanctions-related restrictions and app-store delistings in a number of jurisdictions outside Russia — a live risk for a project that already ships via Capacitor to Apple/Google app stores, independent of Kyrgyzstan's own stance | None identified in sources checked | None (open project), but see production-suitability caveat |

## Consequences

### Positive

- Store coordinates entered in Подэтап 0 gain a real path to a `distanceKm` value, unblocking `BY_DISTANCE` activation (Подэтап 3 of the sub-stage plan) with no further ADR needed for that step.
- Strongest, most concretely evidenced local data quality of the four options for the platform's actual, current, single-city market (Bishkek) — this is a local-delivery pricing feature, not a global product; the provider whose data is most trustworthy for Bishkek specifically dominates the decision.
- No confirmed licensing obstacle to doing the one thing this feature actually needs: geocode a `Store` address **once** and a customer address **once per calculated quote**, and (for the Store side) store the result permanently on the `stores` row — unlike Yandex's standard tier, which explicitly forbids retaining geocoded data at all.
- No new architecture: one more `IGeocodingProvider` port + one real adapter + one stub + one factory, exactly the shape already proven three times in this codebase (`createAiProvider`, `createAiImageProvider`, `createPaymentProvider`). `StubGeocodingProvider` guarantees the app never fails to boot or fails checkout if `TWOGIS_API_KEY` is absent — `BY_DISTANCE` tariffs simply don't resolve a distance yet, the same "safe, non-throwing, explicitly documented gap" pattern already used for Finik and Google AI in this project.
- Avoids taking on new infrastructure ownership (self-hosted Nominatim) or a live geopolitical/app-store-distribution risk (Yandex) for a feature whose entire purpose is a single, low-stakes REST call per quote.

### Negative

- Exact 2GIS pricing tiers/rate limits were not published in the sources checked for this ADR (only "request-based, see Tariffs/Platform Manager") — the real number must be confirmed directly with 2GIS (or via the free 1-month demo key) before Подэтап 2 commits to a production budget; this is a known gap, not a blocker for accepting the provider choice itself.
- 2GIS's core strength (CIS/Central-Asia-specific local detail) is also a concentration risk if the platform ever expands delivery outside 2GIS's coverage area — accepted as irrelevant to the platform's current, single-city (Bishkek) scope; a future multi-region expansion is free to revisit this ADR (Principle 14 — a new external market is exactly the kind of change that would warrant a new or superseding ADR, not silent reuse).
- Like every third-party geocoding provider, quota/billing lapses degrade to `StubGeocodingProvider` (no distance resolved) rather than a hard failure — acceptable given the same pattern is already accepted for AI/payments in this project, but worth remembering during on-call/ops setup for this feature specifically.

## Alternatives considered

### A. Google Maps Geocoding API

Rejected as primary choice: global-grade but not locally specialized for Bishkek, and its standard commercial terms tie caching/storage of geocoding results to Google Maps display obligations that don't fit "store one coordinate pair on a `stores` row forever." Highest integration ergonomics of the four, and the best-documented pricing — kept as a credible fallback if 2GIS's real (unpublished-in-research) pricing or rate limits turn out to be unworkable at Подэтап 2's cost-verification step.

### B. Yandex Geocoder API

Rejected: confirmed strong CIS/Kyrgyzstan coverage, but two concrete disqualifying findings — (1) the standard, cheaper license tier explicitly forbids storing/caching the geocoded result at all, which is incompatible with persisting `stores.lat`/`stores.lng`; the extended license that permits it is a materially different, unquantified commercial commitment; (2) Yandex services and Yandex Pay specifically are confirmed to face sanctions-related restrictions and app-store delistings in multiple jurisdictions outside Russia — a real, non-hypothetical risk given this project already ships to Apple/Google app stores via Capacitor, independent of whether Kyrgyzstan itself restricts Yandex.

### C. OpenStreetMap / Nominatim

Rejected for the public instance: the OSMF's own usage policy caps it at 1 request/second and explicitly states it is not meant for production commercial applications — this alone rules it out as a direct dependency for live checkout-time pricing. Self-hosting a Nominatim instance was also rejected for this ADR's scope: it does not fit the "one more adapter" shape — it means owning and operating a new piece of geodata infrastructure (OSM extract import, PostGIS, ongoing data refresh), which is a different, larger architectural commitment than adding a Provider behind an existing pattern, and Central Asian OSM community coverage density was not confirmed to match 2GIS's dedicated local investment. Not rejected forever — a legitimate candidate to revisit if 2GIS's real commercial terms (Negative, above) turn out to be prohibitive.

## Implementation notes

Not part of this ADR (Подэтап 1 is documentation-only per the sub-stage plan) — reserved for Подэтап 2:

- `server/ports/geocoding.port.ts` — `IGeocodingProvider { geocode(address: string): Promise<{ lat: number; lng: number } | null> }` (exact shape to be finalized in code, not here).
- `server/adapters/geocoding/two-gis-geocoding.adapter.ts` + `server/adapters/geocoding/stub-geocoding.adapter.ts`.
- `server/adapters/geocoding/geocoding-provider.factory.ts` — `createGeocodingProvider(env)`, gated on `TWOGIS_API_KEY`, mirroring `createAiProvider`/`createPaymentProvider` exactly.
- `TWOGIS_API_KEY` added to `server/config/env.ts` (optional, same convention as `GOOGLE_AI_API_KEY`/Finik keys) and `.env.example`.
- Caching of geocoded results (coordinates → distance) — not part of this ADR's scope; a caching strategy for repeated customer-address geocoding (as distinct from the one-time Store geocode) is a Подэтап 2/3 implementation decision, not an architectural one, and does not itself require a new ADR unless it introduces a new storage mechanism beyond the existing `translation_cache`-style pattern already used once in this project.
- No API key is configured by this ADR — confirming a real 2GIS account/key and its actual current tariff remains a Подэтап 2 prerequisite.

## References

- [ADR-001](../../adr/ADR-001-ports-and-adapters.md)
- [ADR-002](./ADR-002-complete-shopify-catalog-migration.md)
- [docs/delivery/delivery-future-roadmap.md](../../delivery/delivery-future-roadmap.md) — candidate #1, origin of this ADR
- [docs/delivery/delivery-pricing.md](../../delivery/delivery-pricing.md) — `pricingModel: BY_DISTANCE`, `pricePerKm`
- [docs/delivery/delivery-zones.md](../../delivery/delivery-zones.md) — `Store.coordinates`
- [docs/principles/14-architecture-decision-record.md](../../principles/14-architecture-decision-record.md)
- [docs/principles/09-replaceable-adapters.md](../../principles/09-replaceable-adapters.md) — Provider + Stub + Factory precedent (`createAiProvider`, `createPaymentProvider`)

### Sources consulted for the comparison table

- [2GIS Geocoder API overview](https://docs.2gis.com/en/api/search/geocoder/overview)
- [2GIS API — free trial period](https://dev.2gis.com/api)
- ["The whole country is on one map" — 2GIS Kyrgyzstan coverage, Akchabar](https://www.akchabar.kg/en/news/vsya-strana-na-odnoj-karte-v-2gis-poyavilas-detalnaya-karta-vsego-kirgizstana-tpfiboihcdclmqqr)
- [2GIS available in Kyrgyz, Akchabar](https://www.akchabar.kg/en/news/2gis-stal-dostupen-na-kirgizskom-yazike-nierxqkvydeirxiu)
- [Yandex Maps API — Fees](https://yandex.com/dev/tariffs/doc/en/mapkit/prices/)
- [Yandex Maps API — Terms of Use](https://yandex.com/dev/tariffs/doc/en/mapkit/terms/index)
- [Yandex services added to sanctions candidate list, RBC-Ukraine](https://newsukraine.rbc.ua/news/yandex-services-added-to-list-of-candidates-1696498540.html)
- [Yandex Pay delisted from App Store in multiple countries, Komersant](https://komersant.ua/en/obmezhennia-prodovzhuiutsia-rsiyska-prohrama-yandeks-pey-perestala-vidobrazhatysia-v-appstore/)
- [Google Geocoding API — Usage and Billing](https://developers.google.com/maps/documentation/geocoding/usage-and-billing)
- [Nominatim Usage Policy, OSM Foundation](https://operations.osmfoundation.org/policies/nominatim/)
