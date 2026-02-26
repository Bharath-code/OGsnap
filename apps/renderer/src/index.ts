import Fastify from "fastify";
import cors from "@fastify/cors";
import { BrowserPool } from "./pool";
import { buildRenderHandler } from "./handler";

const app = Fastify({ logger: true });
const pool = new BrowserPool(2);
const render = buildRenderHandler(pool);

await app.register(cors, {
  origin: true,
});

app.get("/health", async () => ({ ok: true }));

app.post("/render", async (request, reply) => {
  const expectedToken = process.env.RENDERER_INTERNAL_TOKEN;
  if (expectedToken) {
    const authorization = request.headers.authorization;
    if (authorization !== `Bearer ${expectedToken}`) {
      return reply.status(401).send({ error: "Unauthorized renderer request" });
    }
  }

  try {
    const result = await render(request.body);
    return reply.status(200).send(result);
  } catch (error) {
    request.log.error({ error }, "renderer failed");
    return reply.status(500).send({ error: "Render failed" });
  }
});

const port = Number(process.env.PORT ?? 4001);
await app.listen({ port, host: "0.0.0.0" });

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await pool.closeAll();
    await app.close();
    process.exit(0);
  });
}
