# ⚡ Commandes Rapides - Fix HTTP 304 + Docker

## 🚀 Exécution Rapide (5 minutes)

### 1️⃣ Supprimer l'ancienne image

```powershell
docker image rm frontend:latest -f
```

### 2️⃣ Rebuild le frontend

```powershell
cd C:\Users\benab\OneDrive\Desktop\New folder\ProjetVermegAvril\ProjetVermegAvril\ProjtVermeg
docker-compose build frontend
```

**Sortie attendue**:
```
Building frontend
Step 1/8 : FROM node:18 AS build
...
Step 7/8 : COPY --from=build /app/dist/frontend/* /usr/share/nginx/html/
...
Successfully tagged frontend:latest
```

### 3️⃣ Redémarrer tous les services

```powershell
docker-compose down
docker-compose up -d
```

**Sortie attendue**:
```
Creating vermeg-network
Creating mongodb ... done
Creating keycloak ... done
...
Creating frontend ... done
```

### 4️⃣ Vérifier que frontend démarre

```powershell
docker logs frontend --tail 10
```

**Sortie attendue**:
```
frontend | nginx: master process started with pid 1
frontend | 2026/05/19 10:00:00 [notice] starting worker process
```

### 5️⃣ Tester HTTP 200

```powershell
curl -I http://localhost:4200/dashboard
```

**Sortie attendue** ✅:
```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: public, max-age=0, must-revalidate
```

**Réponse incorrecte** ❌:
```
HTTP/1.1 304 Not Modified
```

---

## 📋 Vérifications Détaillées

### Vérifier les fichiers dans le conteneur

```powershell
docker exec frontend ls -la /usr/share/nginx/html/ | head -20
```

**Attendu** ✅:
```
total 256
drwxr-xr-x    2 root root     4096 May 19 10:00 .
drwxr-xr-x    1 root root     4096 May 19 10:00 ..
-rw-r--r--    1 root root     1234 May 19 10:00 index.html
-rw-r--r--    1 root root    45678 May 19 10:00 main.js
drwxr-xr-x    2 root root     4096 May 19 10:00 assets
```

**Incorrect** ❌:
```
drwxr-xr-x    1 root root     4096 May 19 10:00 frontend/  ← MAUVAIS!
```

### Vérifier la configuration Nginx

```powershell
docker exec frontend nginx -t
```

**Attendu** ✅:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Voir les logs d'accès Nginx

```powershell
docker logs frontend --follow
```

Appuyez sur `Ctrl+C` pour arrêter.

---

## 🧪 Tests dans le Navigateur

### Test 1: Frontend accessible

```
URL: http://localhost:4200
Attendu: Redirigé vers Keycloak login
```

### Test 2: Vérifier HTTP 200 dans DevTools

```
Chrome:
1. Appuyez F12
2. Allez à l'onglet "Network"
3. Rafraîchissez (F5)
4. Vérifiez que "index.html" → 200 OK (pas 304)
```

### Test 3: Vider le cache si besoin

```
Chrome:
1. Appuyez Ctrl+Shift+Delete
2. "Cached images and files"
3. "Clear data"
4. Rafraîchissez F5
```

---

## 📊 Diagnostiques Complét

### Windows PowerShell

```powershell
.\test-docker-setup.ps1
```

### Linux/Mac

```bash
chmod +x test-docker-setup.sh
./test-docker-setup.sh
```

---

## 🔍 Troubleshooting Rapide

### HTTP 304 persistant

```powershell
# Vider le cache du navigateur
# Ctrl+Shift+Delete → "Cached images and files" → Clear

# Puis tester
curl -I --no-cache http://localhost:4200/dashboard
```

### Conteneur ne démarre pas

```powershell
# Voir les erreurs
docker logs frontend

# Reconstruire complètement
docker-compose down
docker image prune -f
docker-compose up -d frontend
```

### Fichiers manquants

```powershell
# Vérifier content du répertoire
docker exec frontend ls -la /usr/share/nginx/html/

# Si vide, problème dans Dockerfile
# Si contient "frontend/", c'est que l'ancienne image a été utilisée
# Solution: docker image rm frontend -f && docker-compose build frontend
```

### Tous les logs

```powershell
# Frontend
docker logs frontend

# Keycloak
docker logs keycloak

# Gateway
docker logs gateway

# MongoDB
docker logs mongodb
```

---

## 🎯 Checklist Final

```
☐ Dockerfile modifié → COPY --from=build /app/dist/frontend/* /usr/share/nginx/html/
☐ nginx.conf modifié → Cache-Control headers ajoutés
☐ Image rebuilt → docker-compose build frontend
☐ Conteneurs redémarrés → docker-compose down && docker-compose up -d
☐ Frontend accessible → http://localhost:4200 → HTTP 200
☐ Keycloak login fonctionne → Redirigé automatiquement
☐ DevTools → Network → 200 OK pour tous les fichiers
☐ Pas d'erreurs dans la console du navigateur
☐ Pas d'erreurs dans les logs Docker
```

---

## 📞 Support

Si vous avez encore des problèmes:

1. Consultez `DOCKER_KEYCLOAK_FIX.md` pour une explication détaillée
2. Consultez `STEP_BY_STEP_FIX.md` pour le guide étape par étape
3. Exécutez le script diagnostic `test-docker-setup.ps1`
4. Vérifiez les logs: `docker logs frontend`

---

**Status**: ✅ **PRÊT POUR TESTER**

Vous pouvez maintenant exécuter les commandes ci-dessus! 🚀

