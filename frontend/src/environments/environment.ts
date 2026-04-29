export const environment = {
  production: false,
  // Appels directs aux microservices (sans Gateway)
  apiUser: 'http://localhost:9092/api',
  apiProduit: 'http://localhost:9093/api/produits',
  apiSouscription: 'http://localhost:9094/api/souscriptions',
  apiRecommendation: 'http://localhost:9095/api/recommendations',
  aiService: 'http://localhost:5000/api'
};
