export async function scimRequest(
  endpoint: string,
  method: RequestInit["method"] = "GET",
  body?: any
) {
  const baseUrl = process.env.SCIM_SERVER_BASE;
  const authToken = process.env.SCIM_AUTH_TOKEN;

  if (!baseUrl) {
    throw new Error("SCIM_SERVER_BASE environment variable is not set");
  }

  if (!authToken) {
    throw new Error("SCIM_AUTH_TOKEN environment variable is not set");
  }

  const url = new URL(endpoint, baseUrl).toString();

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/scim+json",
      Accept: "application/scim+json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `SCIM request failed: ${response.status} ${
        response.statusText
      }\n${JSON.stringify(errorData, null, 2)}`
    );
  }

  return response.json();
}