# Lib Snipe Label

Library for interacting with generating special labels for snipeit.

## Development

1. change deno import
2. enable host.docker.internal
3. run the server

Run `deno -A ./server.ts` to serve the files to pickup in your docker container.

```json
// deno.json
{
  "imports": {
    "snipe-label": "https://raw.githubusercontent.com/thomsongeer/lib-snipe-label/master/mod.ts"
    // OR when developing
    "snipe-label": "http://host.docker.internal:3030/mod.ts"
  }
}
```

Enable `host.docker.internal` in your compose file.

```yaml
services:
  my_service:
    extra_hosts:
      - 'host.docker.internal:host-gateway'
```

Ensure your dockerfile has a github key.
For example in your `.env` set `GITHUB_TOKEN=github_pat_abcd1234`.

```dockerfile
ENV DENO_AUTH_TOKENS="${GITHUB_TOKEN}@raw.githubusercontent.com"
```
