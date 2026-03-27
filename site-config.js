export const productionSiteUrl = 'https://martinlepage26-bit.github.io';

function normalizeSiteUrl(url) {
  return new URL(url.trim()).toString().replace(/\/$/, '');
}

export function resolveSiteUrl(env = {}) {
  const configuredValue = [env.PUBLIC_SITE_URL, env.SITE_URL].find(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );

  return normalizeSiteUrl(configuredValue ?? productionSiteUrl);
}
