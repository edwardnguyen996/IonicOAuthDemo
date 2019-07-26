export default {
  serverApiUrl: 'http://35.221.221.124:6080/',
  authConfig: {
    url: 'https://ecoid.comartek.com/auth',
    realm: 'ecoid',
    clientId: 'web_app',
    clientSecret: 'bc25000c-b7e6-4a66-93db-5fd14a4aa76c',
    responseMode: 'query',
    scope: 'openid address phone',
    webRedirect: window.location.href,
  },
};
