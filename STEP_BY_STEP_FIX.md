# 📋 Guide Étape par Étape - Fix HTTP 304 + Build Docker

## 🎯 Objective
Corriger l'erreur HTTP 304 lors du déploiement Docker avec Keycloak et forcer le rebuild de l'image frontend.

---

## ✅ Étape 1: Vérifier les modifications appliquées

### Vérification du Dockerfile

```bash
cd C:\Users\benab\OneDrive\Desktop\New folder\ProjetVermegAvril\ProjetVermegAvril\ProjtVermeg\frontend
cat Dockerfile
```

✅ Vérifiez que **ligne 22** contient:
```dockerfile
COPY --from=build /app/dist/frontend/* /usr/share/nginx/html/
```

**PAS CECI** ❌:
```dockerfile
COPY --from=build /app/dist /usr/share/nginx/html/frontend
```

---

### Vérification de nginx.conf

```bash
cat nginx.conf
```

✅ Vérifiez que le contenu inclut:
- Location pour `\.html?$` avec `Cache-Control: max-age=0`
- Location pour `\.(js|css|etc)$ ` avec `Cache-Control: max-age=31536000`
- Headers de sécurité (`X-Frame-Options`, `X-Content-Type-Options`, etc.)

---

## 🔄 Étape 2: Build l'image frontend

### Option A: Rebuild avec docker-compose (RECOMMANDÉ)

```bash
# Aller au répertoire racine du projet
cd C:\Users\benab\OneDrive\Desktop\New folder\ProjetVermegAvril\ProjetVermegAvril\ProjtVermeg

# Supprimer l'ancienne image pour forcer le rebuild
docker image rm frontend:latest -f

# Rebuild uniquement le frontend
docker-compose build frontend

# Attendu: voir les étapes du build:
# Step 1/8 : FROM node:18 AS build
# Step 2/8 : WORKDIR /app
# ...
# Step 7/8 : COPY --from=build /app/dist/frontend/* /usr/share/nginx/html/
# Step 8/8 : EXPOSE 80
# => => naming to docker.io/library/frontend:latest
```

### Option B: Build manuel (si problème avec docker-compose)

```bash
# Aller au dossier frontend
cd frontend

# Build de l'image
docker build -t frontend:latest .

# Attendu: sortie similaire à Option A
```

---

## 🚀 Étape 3: Arrêter les conteneurs existants

```bash
# Aller au répertoire racine
cd C:\Users\benab\OneDrive\Desktop\New folder\ProjetVermegAvril\ProjetVermegAvril\ProjtVermeg

# Arrêter et supprimer tous les conteneurs
docker-compose down

# Attendu:
# Stopping frontend ... done
# Stopping gateway ... done
# Stopping gestionuser ... done
# ... etc ...
# Removing networks vermeg-network
```

---

## 🔄 Étape 4: Redémarrer tous les services

```bash
# Redémarrer avec les nouvelles images
docker-compose up -d

# Attendu: tous les services démarrent
# Creating vermeg-network
# Creating mongodb ... done
# Creating keycloak ... done
# Creating eureka ... done
# Creating gateway ... done
# Creating gestionuser ... done
# Creating gestionproduit ... done
# Creating recommendation ... done
# Creating frontend ... done
```

---

## 🔍 Étape 5: Vérifier le démarrage du frontend

### Méthode 1: Vérifier les logs

```bash
# Afficher les logs du frontend
docker logs frontend --follow

# Attendu:
# frontend | nginx: [warn] could not build the "server_names_hash"...
# frontend | nginx: master process started with pid 1
# frontend | 2026/05/19 10:00:00 [notice] 1#1: signal process started
```

Appuyez sur `Ctrl+C` pour quitter.

### Méthode 2: Vérifier le fichier dans le conteneur

```bash
# Liste le contenu du répertoire nginx
docker exec frontend ls -la /usr/share/nginx/html/

# Attendu: voir les fichiers du build Angular
# drwxr-xr-x   app/ (ou les fichiers compilés)
# -rw-r--r--   index.html
# -rw-r--r--   main.js
# drwxr-xr-x   assets/
# ... etc ...
```

### Méthode 3: Vérifier HTTP 200

```bash
# Tester la réponse HTTP
curl -I http://localhost:4200/dashboard

# Attendu:
# HTTP/1.1 200 OK
# Content-Type: text/html; charset=utf-8
# Cache-Control: public, max-age=0, must-revalidate
# ... etc ...
```

❌ Si vous voir `HTTP/1.1 304 Not Modified`, c'est qu'une modification n'a pas été appliquée. Retournez à l'étape 1.

---

## 🧪 Étape 6: Tester dans le navigateur

### Test 1: Page d'accueil

1. Ouvrez: `http://localhost:4200`
2. ✅ Vous devriez être **redirigé automatiquement** vers Keycloak
3. Attendez que la page de login s'affiche

### Test 2: Vérifier les ressources

1. Appuyez sur `F12` (DevTools)
2. Allez à l'onglet **Network**
3. Rechargez la page (`F5`)
4. Observez les requêtes:

✅ **Correct**:
```
GET /index.html                    → 200 OK
GET /main.js                       → 200 OK
GET /polyfills.js                  → 200 OK
GET /assets/styles.css             → 200 OK
GET /assets/images/logo.png        → 200 OK
```

❌ **INCORRECT** (Si vous voir 304):
```
GET /index.html                    → 304 Not Modified
GET /main.js                       → 304 Not Modified
```

### Test 3: Nettoyer le cache si besoin

Si vous voir 304 même après rebuild:

```
Dans Chrome:
1. Appuyez: Ctrl+Shift+Delete
2. Sélectionnez: "Cached images and files"
3. Cliquez: "Clear data"
4. Rafraîchissez: F5
```

---

## 🔐 Étape 7: Tester Keycloak

### Test 1: Admin Console

1. Ouvrez: `http://localhost:9090/auth/admin`
2. Login avec: `admin` / `admin`
3. Vérifiez que le realm `assurance-realm` existe
4. Vérifiez que le client `frontend-client` existe

### Test 2: Login Frontend

1. Allez à `http://localhost:4200`
2. Si redirigé vers Keycloak → ✅ Intégration fonctionne
3. Connectez-vous avec un compte valide
4. Devrait rediriger vers `/dashboard`

---

## 📊 Étape 8: Lancer le script de diagnostic

### Windows PowerShell:

```bash
# Naviguer vers le répertoire
cd C:\Users\benab\OneDrive\Desktop\New folder\ProjetVermegAvril\ProjetVermegAvril\ProjtVermeg

# Exécuter le script
.\test-docker-setup.ps1
```

### Linux/Mac (bash):

```bash
# Rendre le script exécutable
chmod +x test-docker-setup.sh

# Exécuter
./test-docker-setup.sh
```

### Résultat attendu:

```
✅ DIAGNOSTIC COMPLET - Tout semble fonctionner!
🌐 Accès utilisateur:
   Frontend: http://localhost:4200
   Keycloak Admin: http://localhost:9090/auth/admin
   Gateway: http://localhost:9091
```

---

## 🚨 Troubleshooting

### Problème: "Image frontend not found"

**Solution**:
```bash
docker-compose build frontend
docker image ls | findstr frontend
```

### Problème: "Conteneur frontend pas en cours d'exécution"

**Solution**:
```bash
# Vérifier les logs d'erreur
docker logs frontend

# Si erreur Nginx:
docker exec frontend nginx -t
```

### Problème: Toujours HTTP 304

**Solution 1**: Vider le cache du navigateur
```
Chrome → Ctrl+Shift+Delete
```

**Solution 2**: Problème dans nginx.conf?
```bash
docker exec frontend cat /etc/nginx/nginx.conf | findstr "Cache-Control"
```

**Solution 3**: Problème dans les fichiers copiés?
```bash
docker exec frontend ls -la /usr/share/nginx/html/
# Devrait afficher les fichiers compilés, PAS un dossier "frontend"
```

### Problème: Keycloak "404 Not Found"

**Solution**:
```bash
# Vérifier que Keycloak démarre correctement
docker logs keycloak --tail 20

# Si Keycloak a besoin d'être configuré:
# Accédez à http://localhost:9090/auth/admin
# Créez le realm "assurance-realm" manuellement
# Créez le client "frontend-client"
```

### Problème: "Connection refused" sur port 4200

**Solution**:
```bash
# Vérifier que le conteneur écoute vraiment
docker port frontend
# Attendu: 80/tcp -> 0.0.0.0:4200

# Sinon, redémarrer
docker restart frontend
```

---

## 📈 Vérification finale

Checklist avant de considérer comme "TERMINÉ":

- [ ] ✅ Dockerfile contient `COPY --from=build /app/dist/frontend/* /usr/share/nginx/html/`
- [ ] ✅ nginx.conf contient les stratégies de cache pour HTML et assets
- [ ] ✅ Docker image rebuilt (`docker image rm frontend:latest -f` puis rebuild)
- [ ] ✅ Conteneur frontend redémarré (`docker-compose up -d frontend`)
- [ ] ✅ HTTP 200 OK pour `/dashboard` (pas 304)
- [ ] ✅ Keycloak login fonctionne
- [ ] ✅ Dashboard s'affiche après login
- [ ] ✅ Pas d'erreurs dans DevTools → Console
- [ ] ✅ Les fichiers JS, CSS se chargent correctement
- [ ] ✅ Script diagnostic retourne succès

---

## 🎉 Succès!

Une fois tous les tests passés, votre système Docker + Keycloak + Frontend est **correctement configuré** et prêt pour la production! 🚀

