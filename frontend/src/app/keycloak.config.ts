import { KeycloakService } from 'keycloak-angular';

export function initializeKeycloak(
  keycloak: KeycloakService
) {

  return () =>

    keycloak.init({

      config: {
        url: 'http://localhost:9090',
        realm: 'vermeg-realm',
        clientId: 'frontend-client'
      },

      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false
      }
    });
}