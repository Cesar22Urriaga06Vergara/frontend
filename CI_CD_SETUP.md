# CI/CD Setup — Hotel SENA 2026 Frontend

## 📋 Overview

This frontend project uses GitHub Actions for continuous integration. The CI/CD pipeline runs on all pushes to `main` and `develop` branches, as well as on pull requests.

---

## 🚀 Pipeline Stages

### 1. **Lint & Build** (`lint-and-build`)
- Checks out the code
- Sets up Node.js 20 with npm caching
- Installs dependencies via `npm ci`
- Runs ESLint to check code quality (continues on error for visibility)
- Builds the Nuxt 3 application for production
- **Outputs**: Build artifacts stored in `/.output/` directory

### 2. **Type Checking** (`type-checking`)
- Checks out the code
- Sets up Node.js 20
- Installs dependencies
- Runs TypeScript compiler in strict mode without emitting files
- Validates all `.ts` and `.vue` files for type safety

### 3. **Security Scan** (`security-scan`)
- Audits npm dependencies for vulnerabilities
- Checks for moderate and high severity issues
- Continues on error to provide visibility

### 4. **Notifications** (`notifications`)
- Summary of pipeline results
- Succeeds if all previous jobs succeeded
- Provides clear success/failure messages

---

## 📊 Artifacts

The pipeline generates and stores the following artifacts for 5 days:

### Frontend Artifacts:
- **`frontend-dist`**: Compiled Nuxt 3 application in `/.output/` directory
  - Includes Server assets (`/.output/server/`)
  - Includes Public assets (`/.output/public/`)
  - Ready for deployment to Node.js server or static hosting

### Retention Policy:
- All artifacts are retained for **5 days** by default
- Can be customized in GitHub Actions settings

---

## 🔐 Security Features

### Dependency Auditing:
- **Audit Level**: `moderate` (reports on moderate and high severity vulnerabilities)
- **Continue on Error**: Enabled to provide visibility
- **Scope**: All npm dependencies in `package.json`

### Type Safety:
- **TypeScript Strict Mode**: Enabled (`--noEmit` flag)
- **Multiple File Types**: Validates `.ts` and `.vue` files
- **Type Checking**: Catches errors before runtime

---

## 🔄 Workflow Triggers

The CI/CD pipeline is triggered automatically on:

1. **Push Events**
   - To `main` branch
   - To `develop` branch

2. **Pull Request Events**
   - Against `main` branch
   - Against `develop` branch

### Manual Triggering:
To manually run the workflow, use GitHub's Actions UI:
1. Go to **Actions** tab in your repository
2. Select **CI — Frontend**
3. Click **Run workflow**
4. Select the branch you want to run it on

---

## 📝 Log & Monitoring

### Viewing Logs:
1. Navigate to **Actions** tab in GitHub
2. Click on the workflow run
3. Expand job names to see detailed logs

### Job Dependencies:
- All jobs run in parallel for faster CI pipelines
- Final notifications job waits for all testing jobs to complete

---

## 🛠️ Local Development

### Running the Same Checks Locally:

```bash
# Install dependencies
npm install

# Lint (ESLint)
npm run lint

# Type check
npx tsc --noEmit

# Build production
npm run build

# Preview production build
npm run preview

# Development server
npm run dev

# Audit dependencies
npm audit
```

---

## 📦 Environment Variables

### Build-time Configuration:
- `NUXT_PUBLIC_API_BASE`: Set to `http://localhost:3001` during CI pipeline
- Can be overridden per environment

### Client-side Environment Variables:
```javascript
// In nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
    },
  },
})
```

### GitHub Secrets:
If deploying to production, add secrets in:
**Repository Settings → Secrets and variables → Actions**

Example secrets for deployment:
- `DEPLOY_KEY`: SSH/API key for deployment
- `VERCEL_TOKEN`: If deploying to Vercel
- `API_SECRET`: Backend secret for API calls
- `ANALYTICS_ID`: Google Analytics or similar

---

## 🏗️ Build Output

### Directory Structure After Build:
```
.output/
├── server/          # Server-side entry point
│   └── chunks/      # Server bundle chunks
├── public/          # Static assets
│   ├── _nuxt/       # Nuxt client bundle
│   ├── favicon.ico  # Favicon
│   └── ...          # Other static files
└── nitro.json       # Nitro server configuration
```

### Deployment Considerations:
- **Target**: `API` or `SERVER` depending on deployment strategy
- **Node.js Version**: 20.x or higher recommended
- **Memory Requirements**: Minimum 512MB for running
- **PORT**: Configurable via environment, defaults to 3000

---

## 🚢 Future Enhancements

Consider adding these stages for production readiness:

1. **E2E/Integration Tests**
   ```yaml
   - Playwright or Cypress tests
   - Component testing
   - Visual regression testing
   ```

2. **Lighthouse Audits**
   ```yaml
   - Performance scoring
   - Accessibility checks
   - SEO validation
   ```

3. **Docker Build**
   ```yaml
   - Build Docker image
   - Push to registry
   ```

4. **Deployment Stage**
   ```yaml
   - Deploy to Vercel/Netlify
   - Deploy to custom server
   - Deploy to cloud provider
   ```

5. **Preview Deployments**
   ```yaml
   - Deploy to preview URL for PRs
   - Comment PR with preview link
   ```

---

## 📚 References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nuxt 3 Deployment](https://nuxt.com/docs/getting-started/deployment)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [ESLint Configuration](https://eslint.org/)
- [Node.js Setup Action](https://github.com/actions/setup-node)

---

## ❓ FAQ

### Q: Where do I find the build output?
A: The build output is in the `/.output/` directory after running `npm run build`.

### Q: What Node.js version is used in CI?
A: Node.js 20 (LTS). Check the `NODE_VERSION` environment variable.

### Q: How do I deploy the built application?
A: The `/.output/` directory contains a production-ready Nuxt application. Deploy the contents to your hosting provider.

### Q: Can I use different API URLs for different environments?
A: Yes, use the `NUXT_PUBLIC_API_BASE` environment variable. Set it per-environment in GitHub Actions or during build.

### Q: What if TypeScript check fails?
A: Run `npx tsc --noEmit` locally to see specific type errors. Fix them before committing.

---

## 🎯 Best Practices

1. ✅ Always run `npm run lint` before committing
2. ✅ Fix type errors with `npx tsc --noEmit`
3. ✅ Keep dependencies up to date (`npm update`)
4. ✅ Use meaningful Git commit messages
5. ✅ Test locally in development mode before pushing
6. ✅ Review pipeline logs for any warnings
7. ✅ Follow Vue 3 and TypeScript best practices
8. ✅ Write reusable components with proper TypeScript types

---

## 🔧 Troubleshooting

### Build Fails - ESLint Issues
```bash
npm run lint -- --fix
```

### Build Fails - Type Errors
```bash
npx tsc --noEmit
# Fix type errors in your code
```

### Build Fails - Missing Dependencies
```bash
npm install
npm audit fix
```

### Type Check Fails in CI but Works Locally
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm ci
npx tsc --noEmit
```

---

**Last Updated**: 2025
**Maintained By**: Development Team
