export function getZapsignConfig() {
  const modoProduccion = process.env.ZAPSIGN_MODE === 'production';

  const url = modoProduccion
    ? 'https://api.zapsign.com.br/api/v1/docs/'
    : 'https://sandbox.api.zapsign.com.br/api/v1/docs/';

  const token = modoProduccion
    ? process.env.ZAPSIGN_API_TOKEN_PRODUCTION
    : process.env.ZAPSIGN_API_TOKEN_SANDBOX;

  return { url, token, sandbox: !modoProduccion };
}