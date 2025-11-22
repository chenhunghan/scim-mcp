type Headers = import("http").IncomingHttpHeaders;

export function getScimBaseUrl(headers: Headers): string {
  let baseUrl = "";

  if (process.env.SCIM_API_BASE_URL) {
    baseUrl = process.env.SCIM_API_BASE_URL;
  }
  const baseUrlFromHeader = headers["x-scim-base-url"] || headers["X-SCIM-BASE-URL"];
  if (typeof baseUrlFromHeader === "string") {
    baseUrl = baseUrlFromHeader.trim();
  }
  
  return baseUrl;
}
