# @ogsnap/svelte

SvelteKit integration SDK for OGSnap.

## Usage

Create a SvelteKit API route under `src/routes/api/og/+server.ts`:

```typescript
import { OGEndpoint } from "@ogsnap/svelte";

export const { GET } = OGEndpoint({
  apiKey: process.env.OGSNAP_API_KEY!,
});
```
