let whitelist = [
  "/bot6146611157:",
  "/bot6252988543:",
  "/bot7735511425",
  "/bot5602443709",
  "/bot8116246221",
];
const tg_host = "api.telegram.org";

function validate(path, env) {
  // 在CF环境变量中增加 bots 参数，格式为 bot_token1,bot_token2 
  if (env && env.bots) {
    whitelist = env.bots.split(",").map((i) => "/bot" + i);
  }

  for (var i = 0; i < whitelist.length; i++) {
    if (path.startsWith(whitelist[i])) return true;
  }
  return false;
}

export default {
  async fetch(request, env) {
    const u = new URL(request.url);
    u.host = tg_host;
    if (!validate(u.pathname, env))
      return new Response("Unauthorized", {
        status: 403,
      });
    const req = new Request(u, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    return await fetch(req);
  },
};
