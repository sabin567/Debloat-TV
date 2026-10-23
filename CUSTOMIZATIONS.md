# Sydney / Kathmandu TV home

Custom Samsung Tizen version of [Free My TV](https://github.com/simbasjungles/free-my-tv), configured for a 2025 UA43U8500FWXXY running Tizen 9.

## Included customisations

- YouTube, Prime Video, Netflix and Alexa as the default shelf when installed. Home Settings retains the shelf editor for additions, removals and ordering.
- Correct recognition of `org.tizen.primevideo`, without treating similarly named helper apps as Prime Video.
- Explicit Sydney and Kathmandu clocks, including Sydney daylight saving and Kathmandu's 45-minute timezone offset.
- Sydney weather in Celsius, with a weather-responsive screensaver, current conditions, high/low temperatures and both clocks.
- Public closing-price cards for DHHF, NDQ, HACK, VGS and VTS, with independent visibility toggles and five-session price changes. No brokerage accounts, quantities, balances or portfolio credentials are included.
- Cryptocurrency prices disabled. Movies and Shows navigation removed; recommendation requests are disabled on Home.
- TV-local boot/wake startup helper, with one-second checks and delay, and an opt-out in Home Settings. Firmware-dependent; tested by the owner on this TV.

## Build

Requires Python 3. Copy `config.example.properties` to `config.properties` and adjust settings if desired. The sample contains no API credentials; the removed recommendation feature does not need TMDB.

```text
python tizen/build.py
python tizen/build.py --preview
```

The build creates `FreeMyTV-tizen.wgt`. It must be signed with the existing Samsung author certificate before installing as an update. The startup service requires a suitable Samsung partner certificate.

Signing certificates, passwords, local configuration and installer credentials are deliberately outside this repository. Keep the existing signing certificate backup separately; generating a different author certificate prevents an in-place update. No compiled package is committed.

## Data and deployment notes

Weather uses Open-Meteo. ETF history uses Yahoo Finance; prices are completed daily closes, not real-time quotes. Five-session changes exclude distributions. Cached values are dated and labelled when refresh fails. The bundled initial ETF snapshot is public historical data from 23 October 2026; it is not portfolio valuation data.

The startup helper queries only the TV's loopback power-state endpoint and launches Free My TV. It does not provide remote commands or a listening server.

The third-party TizenBrew installer used during setup disables TLS validation for certificate requests. It is not bundled in this repository. Prefer a signing/deployment workflow with certificate validation enabled.

## Manual checks after deployment

1. Open Prime Video and other shelf apps; edit and reorder the shelf.
2. Toggle each ETF card and check the dated closing price.
3. Leave the app idle for five minutes; check weather and both screensaver clocks.
4. Test standby wake and full boot; verify the startup setting can disable the helper.

Local syntax/build checks and focused shelf, clock, price-calculation and startup tests were run during development. Browser preview verifies layout; the TV remains the authority for firmware-specific behaviour.
