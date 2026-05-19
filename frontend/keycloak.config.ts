// Local type to avoid depending on external 'keycloak-angular' types
interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
  [key: string]: any;
}

const keycloakConfig: KeycloakConfig = {
  url: 'http://localhost:9090',
  realm: 'assurance-realm',
  clientId: 'frontend-client'
};

export default keycloakConfig;