# BaseCamp React UI v21

Local demo UI based on the v19 visual shell and updated to the latest BaseCamp architecture blueprint.

## Run locally

```bash
npm install
npm run dev
```

If your environment blocks the local vite binary, use:

```bash
npx vite
```

## Demo notes

- Login page keeps the original v19 look and branding assets.
- Choose Employee or Employer login.
- For Employer login, select a role such as Admin, Recruiter, HR, or Super Admin.
- Navigation and page actions change by role.
- Marketing queue has no top-level create button.
- New submissions are created inside the Marketing detail page.
- Client/Vendor creation is available from the registry page and inside Marketing submissions.
- Multi-filter search is enabled on Employee and Clients & Vendors pages.
- API wiring is still placeholder-only.
