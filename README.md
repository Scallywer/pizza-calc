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

### Quick Start

```bash
docker-compose up -d
```

The app will be available on port 8080 (or whatever port you configure in `docker-compose.yml`).

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

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
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
