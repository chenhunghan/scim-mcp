

type Headers = import("http").IncomingHttpHeaders;

export function getScimToken(headers: Headers): string {
  let token = "";

  if (process.env.SCIM_API_TOKEN) {
    token = process.env.SCIM_API_TOKEN;
  }
  const tokenFromHeader = headers["x-scim-api-key"] || headers["X-SCIM-API-KEY"];
  if (typeof tokenFromHeader === "string") {
    token = tokenFromHeader.trim();
  }
  
  return token;
}