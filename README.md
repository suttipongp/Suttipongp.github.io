# Crypto Info

Local real-time crypto dashboard for Windows and GitHub Pages.

## Run

Double-click `start-crypto-info.ps1`, or open `crypto-info\index.html` directly.

The dashboard refreshes every 30 seconds and uses CoinGecko public market data.
Add coins by CoinGecko ID, such as `cardano`, `polkadot`, or `chainlink`.

## Deploy to GitHub Pages

This project is ready to publish as a static site under the `/crypto-info/` path on your GitHub Pages user site.

1. Create the repository `suttipongp/suttipongp.github.io` on GitHub.
2. Push this folder to the repository on the `main` branch.
3. In the repository settings, make sure **Pages** is set to **GitHub Actions** if prompted.

After the workflow finishes, the app will be available at:

`https://suttipongp.github.io/crypto-info/`
