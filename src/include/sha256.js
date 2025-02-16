export default async function sha256(buffer) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
  return hash;
}
