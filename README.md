# Digest Monorepo
The entire collection of apps for building the Meal planning solution for Africa.

## What's inside?
This Turborepo includes the following packages/apps:

### Apps and Packages
- `admin`: a [Vite](https://vitejs.dev/) app for powering Backoffice management
- `backend`: another [Nitro](https://nextjs.org/) app for backend development
- `@repo/ui`: a stub React component library shared by both `admin` and future frontend apps
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo
- `@repo/shared`: Shared utilities used throughout the monorepo
- `@repo/apis`: API code and query utilities used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Prettier](https://prettier.io) for code formatting
- [Biome](https://biomejs.dev) - Formatting, Linting and Code quality
- [Ofetch](https://unjs.io/ofetch) - Data fetching
- [Zod](https://zod.dev) - Type safe and Data Validation
- [Effect](https://effect.website) - Code confidence


### Develop
To develop all apps and packages, run the following command:

```bash
pnpm dev
```


### Build

To build all apps and packages, run the following command:

```bash
pnpm build
```
