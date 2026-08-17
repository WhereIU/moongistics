export function getEntityTextureUrl(
  baseMetaUrl: string,
  relativePath: string,
): string {
  return new URL(
    relativePath,
    baseMetaUrl,
  ).href;
}