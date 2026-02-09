# jeffreyepsteins.org

Static investigative website.

## Project files
- `index.html`
- `styles.css`
- `script.js`
- `CNAME`
- `staticwebapp.config.json` (Azure Static Web Apps)

## Deploy Option 1: GitHub Pages
1. Push to `main`.
2. Open repository `Settings -> Pages`.
3. Source: `Deploy from a branch`.
4. Branch: `main`, folder: `/ (root)`.
5. Save and wait for deployment.

## Deploy Option 2: Azure Static Web Apps
1. Create a Static Web App in Azure.
2. Connect it to this GitHub repository and branch `main`.
3. Add repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN`.
4. Push to `main`; workflow in `.github/workflows/azure-static-web-apps.yml` deploys automatically.
