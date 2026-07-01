// Tags the current commit with the version from deno.json.
// Triggers the Release workflow (.github/workflows/release.yml).

const { version } = JSON.parse(await Deno.readTextFile("deno.json"));
const tag = `v${version}`;

const run = (...args: string[]) =>
  new Deno.Command(args[0], { args: args.slice(1) }).spawn().status;

await run("git", "tag", tag);
await run("git", "push", "origin", tag);

console.log(`Pushed ${tag}.`);
