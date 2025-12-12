# Pizza & Bread Dough Calculator

A React + TypeScript + Vite web app for calculating pizza and bread dough ingredients with presets for famous styles, adjustable hydration, yeast type, and oven temperature.

**Repository:** https://github.com/Scallywer/pizza-calc

## Features

- Multiple pizza style presets (Neapolitan, New York, Detroit, Sicilian, Roman, Focaccia, Sourdough, Grandma)
- Adjustable hydration, yeast type, and fermentation parameters
- Automatic yeast scaling based on target rise time and temperature
- Size by total dough weight or pizza diameter
- Oven temperature capping and bake time estimation
- Settings persisted in browser localStorage

## Development

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```

## Docker Deployment

### Quick Start (Local Build)

```bash
docker-compose up -d
```

### Production (Pull from Registry)

**Note:** After the first GitHub Actions run, your image will be at `ghcr.io/scallywer/pizza-calc:latest`

**Option 1: Make package public (easiest)**
- Go to https://github.com/Scallywer/pizza-calc/packages
- Click on the package → Package settings → Change visibility to Public
- No authentication needed

**Option 2: Use private package (requires auth)**
Create a Personal Access Token (PAT) with `read:packages` permission:
```bash
docker login ghcr.io -u Scallywer
# Enter your PAT when prompted
```

Then use the production compose file:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

The app will be available on port 8080 (or whatever port you configure).

### HAProxy Configuration

Add this to your HAProxy config to route traffic to the container:

```haproxy
frontend web_frontend
    bind *:80
    bind *:443 ssl crt /path/to/cert.pem
    
    # Pizza calculator
    acl is_pizza path_beg /pizza
    use_backend pizza_backend if is_pizza

backend pizza_backend
    server pizza-dough-calc localhost:8080 check
    # Or if using Docker network:
    # server pizza-dough-calc pizza-dough-calc:80 check
```

Or if you want a subdomain:

```haproxy
frontend web_frontend
    bind *:80
    bind *:443 ssl crt /path/to/cert.pem
    
    acl is_pizza hdr(host) -i pizza.yourdomain.com
    use_backend pizza_backend if is_pizza

backend pizza_backend
    server pizza-dough-calc localhost:8080 check
```

### Updating

**Manual Update:**
```bash
docker-compose down
docker-compose pull
docker-compose up -d
```

**Automatic Updates (Recommended for Homelab):**

Option 1: Use Watchtower (Auto-updates all containers)
```bash
# Install watchtower once
docker run -d \
  --name watchtower \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --interval 3600 \
  pizza-dough-calc
```

Option 2: GitHub Actions + Webhook (Update on commit)
- The GitHub Actions workflow automatically builds and pushes to `ghcr.io`
- Set up a webhook receiver on your homelab to pull and restart on new images
- Or use a scheduled cron job to check for updates

Option 3: Update script (included in repo)
```bash
# Linux/Mac
chmod +x update.sh
./update.sh

# Windows PowerShell
.\update.ps1
```

Set up a cron job (Linux) or Task Scheduler (Windows) to run automatically:
```bash
# Linux cron example (check every hour)
0 * * * * /path/to/pizza-calc/update.sh >> /var/log/pizza-calc-update.log 2>&1
```

---

## Original Template Info

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
