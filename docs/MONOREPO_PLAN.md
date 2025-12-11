# Monorepo Migration Plan (Turborepo)

## 🎯 Objective
Migrate the current multi-repo structure (`klyver-master`, `klyver-admin`, `klyver-store`) into a unified Monorepo using **Turborepo** + **pnpm workspaces**. This will improve code sharing, standardization, and build times.

## 🏗 Structure

```
/
├── apps/
│   ├── master/      (Next.js or Vite - formerly klyver-master)
│   ├── admin/       (Vite - formerly klyver-admin)
│   ├── store/       (Vite - formerly klyver-store)
│   └── docs/        (Docusaurus/Starlight)
├── packages/
│   ├── ui/          (Shared React Components - Buttons, Inputs, Layouts)
│   ├── ts-config/   (Shared strict TSConfigs)
│   ├── eslint-config/ (Shared linting rules)
│   ├── database/    (Supabase types, clients, and migrations)
│   └── utils/       (Shared helpers: formatters, validators, dates)
├── package.json     (Root workspace definition)
├── turbo.json       (Turborepo pipeline config)
└── pnpm-workspace.yaml
```

## 🚀 Migration Steps

1.  **Initialize Root:**
    ```bash
    npx create-turbo@latest farmamaster
    ```
2.  **Move Apps:**
    Copy existing projects into `apps/`.
3.  **Extract Shared UI:**
    Move `Button`, `Input`, `Modal` from `admin/src/components` to `packages/ui`.
    Update imports in apps to `@farmamaster/ui`.
4.  **Extract Types:**
    Move `types/supabase.ts` to `packages/database`.
    Share strictly typed Zod schemas in `packages/utils`.
5.  **Configure Pipeline:**
    Set up `turbo.json` to cache `build`, `test`, and `lint`.

## ⚡ Benefits
*   **Incremental Builds:** Only rebuild what changed.
*   **Shared Dependencies:** Single simple version of React, Supabase SDK, etc.
*   **Atomic Deployments:** Deploy all apps in sync via Vercel/Netlify.
*   **Type Safety:** Changes in the DB schema package immediately verify against all apps.
