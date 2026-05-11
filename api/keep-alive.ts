export const config = {
  runtime: "edge",
};

export default async function handler() {
  try {
    const response = await fetch("https://mobitrendz.onrender.com/health");
    const data = await response.text();

    return new Response(`Backend pinged successfully: ${data}`, {
      status: 200,
    });
  } catch (error) {
    return new Response(`Failed to ping backend: ${error}`, {
      status: 500,
    });
  }
}
