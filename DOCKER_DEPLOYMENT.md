# Guide de Déploiement Docker - Projet Vermeg

## Architecture Dockerisée

Ce projet utilise Docker Compose pour orchestrer une architecture microservices complète avec :

- **MongoDB** : Base de données NoSQL (Port 27017)
- **Eureka** : Service Discovery (Port 8761)
- **Gateway** : API Gateway (Port 9091)
- **GestionUser** : Service Utilisateurs (Port 9092)
- **GestionProduit** : Service Produits (Port 9093)
- **Recommendation** : Service Recommandations (Port 9095)
- **Frontend** : Application Angular (Port 4200)

## Prérequis

1. **Docker** et **Docker Compose** installés
2. **Maven** pour compiler les services Spring Boot
3. **Node.js 18+** (pour le développement frontend uniquement)

## Étapes de Déploiement

### 1. Compiler les Services Spring Boot

**Windows (PowerShell) :**
```powershell
.\build-all.ps1
```

**Linux/macOS :**
```bash
chmod +x build-all.sh
./build-all.sh
```

**Manuel (si les scripts échouent) :**
```bash
cd Eureka && mvn clean package -DskipTests && cd ..
cd Gateway && mvn clean package -DskipTests && cd ..
cd GestionUser && mvn clean package -DskipTests && cd ..
cd GestionProduit && mvn clean package -DskipTests && cd ..
cd Recommendation && mvn clean package -DskipTests && cd ..
```

### 2. Démarrer l'Infrastructure Docker

```bash
docker-compose up --build
```

Pour démarrer en arrière-plan :
```bash
docker-compose up --build -d
```

### 3. Vérifier le Déploiement

**Services disponibles :**
- Frontend Angular : http://localhost:4200
- API Gateway : http://localhost:9091
- Eureka Dashboard : http://localhost:8761
- MongoDB : localhost:27017

**Commandes utiles :**
```bash
# Voir les logs de tous les services
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f gateway

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

## Configuration des Services

### Communication Inter-Services

Tous les services communiquent via les noms de conteneurs Docker :

- **Eureka** : `http://eureka:8761/eureka`
- **MongoDB** : `mongodb://mongodb:27017/{database}`
- **Frontend** : `http://frontend:80`

### Bases de Données

- **vermeg_db** : Utilisée par GestionUser et GestionProduit
- **recommendation_db** : Utilisée par le service Recommendation

### Ports Exposés

| Service | Port Hôte | Port Conteneur |
|---------|-----------|----------------|
| MongoDB | 27017 | 27017 |
| Eureka | 8761 | 8761 |
| Gateway | 9091 | 9091 |
| GestionUser | 9092 | 9092 |
| GestionProduit | 9093 | 9093 |
| Recommendation | 9095 | 9095 |
| Frontend | 4200 | 80 |

## Dépannage

### Problèmes Communs

1. **"Port already in use"**
   ```bash
   # Vérifier les ports utilisés
   netstat -tulpn | grep :8761
   
   # Arrêter les services conflicting
   docker-compose down
   ```

2. **"Connection refused to MongoDB"**
   ```bash
   # Vérifier le conteneur MongoDB
   docker-compose logs mongodb
   
   # Redémarrer MongoDB
   docker-compose restart mongodb
   ```

3. **"Service not registered in Eureka"**
   ```bash
   # Vérifier les logs Eureka
   docker-compose logs eureka
   
   # Attendre que Eureka soit complètement démarré
   docker-compose logs -f eureka
   ```

### Health Checks

L'application inclut des health checks pour :
- Eureka : Vérifie que le dashboard est accessible
- MongoDB : Vérifie que la base de données répond
- Services : Vérifient l'enregistrement auprès de Eureka

### Maintenance

**Mettre à jour les images :**
```bash
docker-compose pull
docker-compose up --build
```

**Nettoyer les ressources Docker :**
```bash
docker system prune -a
docker volume prune
```

## Développement

### Pour les développeurs

1. **Modification du code** : Après avoir modifié le code d'un service :
   ```bash
   # Rebuild uniquement le service modifié
   docker-compose up --build gestionuser
   ```

2. **Logs en temps réel** :
   ```bash
   # Suivre les logs d'un service
   docker-compose logs -f gateway
   ```

3. **Debug dans les conteneurs** :
   ```bash
   # Entrer dans un conteneur
   docker-compose exec gateway bash
   
   # Vérifier les variables d'environnement
   docker-compose exec gateway env
   ```

## Production

Pour un déploiement en production, considérez :

1. **Sécurité** : Utiliser des secrets Docker pour les mots de passe
2. **Scaling** : Utiliser `docker-compose --scale` pour les services
3. **Monitoring** : Ajouter Prometheus/Grafana
4. **Backup** : Configurer les backups MongoDB
5. **HTTPS** : Ajouter un reverse proxy avec SSL/TLS

## Support

En cas de problème :
1. Vérifier les logs avec `docker-compose logs`
2. Confirmer que tous les ports sont disponibles
3. S'assurer que les fichiers .jar existent dans les dossiers target/
4. Vérifier la connectivité réseau entre les conteneurs
