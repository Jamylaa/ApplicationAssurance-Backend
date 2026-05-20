# 🔧 Docker + Keycloak - Fix HTTP 304 Issue

## 📋 Problème Identifié

### Le problème principal: Mésalignement des chemins Docker

**Avant (❌ ERREUR)**:
- `Dockerfile`: Copie les fichiers vers `/usr/share/nginx/html/frontend`
- `nginx.conf`: Cherche les fichiers dans `/usr/share/nginx/html`
- **Résultat**: Fichiers introuvables → HTTP 304 (Not Modified)

```
/usr/share/nginx/html/         ← nginx.conf cherche ici
└── frontend/                   ← fichiers sont en fait ici
    ├── index.html
    ├── dashboard.html
    └── assets/
```

**Après (✅ CORRIGÉ)**:
- `Dockerfile`: Copie les fichiers vers `/usr/share/nginx/html` (racine)
- `nginx.conf`: Cherche les fichiers dans `/usr/share/nginx/html`
- **Résultat**: Fichiers trouvés → HTTP 200 (OK)

```
/usr/share/nginx/html/         ← nginx.conf cherche ici ✅
├── index.html
├── dashboard.html
└── assets/
```

---

## ✅ Corrections Apportées

### 1. **Dockerfile** (`frontend/Dockerfile`)

**Avant**:
```dockerfile
COPY --from=build /app/dist /usr/share/nginx/html/frontend
```

**Après**:
```dockerfile
COPY --from=build /app/dist/frontend/* /usr/share/nginx/html/
```

**Explication**:
- `/app/dist/frontend/*` = contenu du dossier `dist/frontend` (généré par Angular build)
- `/*` = copier TOUS les fichiers du dossier
- `/usr/share/nginx/html/` = directement à la racine que Nginx sert

### 2. **nginx.conf** (`frontend/nginx.conf`)

**Améliorations majeures**:

✅ **Séparation des stratégies de cache**:
```nginx
# Fichiers HTML: Pas de cache (toujours frais)
location ~* \.html?$ {
    add_header Cache-Control "public, max-age=0, must-revalidate" always;
    add_header ETag "" always;
    add_header Pragma "no-cache" always;
    try_files $uri $uri/ /index.html;
}

# Fichiers avec hash (JS, CSS): Cache long (1 an)
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    expires 365d;
}
```

✅ **Headers de sécurité renforcés**:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

✅ **Logs accessibles**:
```nginx
access_log /var/log/nginx/access.log;
error_log /var/log/nginx/error.log warn;
```

---

## 🚀 Comment Tester

### Étape 1: Rebuild l'image Docker

```bash
# Aller au dossier projet
cd C:\Users\benab\OneDrive\Desktop\New folder\ProjetVermegAvril\ProjetVermegAvril\ProjtVermeg

# Supprimer l'ancienne image du frontend
docker image rm frontend -f

# Rebuild avec docker-compose
docker-compose build frontend

# Vérifier le build
docker image ls | findstr frontend
```

### Étape 2: Redémarrer le conteneur

```bash
# Arrêter tous les conteneurs
docker-compose down

# Redémarrer avec les nouvelles images
docker-compose up -d

# Vérifier que frontend est prêt
docker logs frontend --follow
```

**Sortie attendue**:
```
frontend | nginx: master process started with pid 1
frontend | 2026/05/19 10:00:00 [notice] 1#1: signal process started
```

### Étape 3: Tester dans le navigateur

**Avant (❌)**:
```
Chrome DevTools → Network
GET /dashboard → 304 Not Modified (0 bytes)
Console → Les fichiers CSS/JS ne se chargent pas
```

**Après (✅)**:
```
Chrome DevTools → Network
GET /dashboard → 200 OK (HTTP/1.1)
GET /assets/styles.css → 200 OK  
GET /main.js → 200 OK
Console → Aucune erreur de ressources
```

### Étape 4: Vérifier les logs Nginx

```bash
# Accéder au conteneur frontend
docker exec -it frontend sh

# Lire les logs d'accès
tail -20 /var/log/nginx/access.log

# Vérifier la configuration
nginx -T
```

**Sortie attendue**:
```
172.19.0.1 - - [19/May/2026:10:00:00 +0000] "GET /dashboard HTTP/1.1" 200 1234 "-"
172.19.0.1 - - [19/May/2026:10:00:01 +0000] "GET /assets/styles.css HTTP/1.1" 200 5678 "-"
172.19.0.1 - - [19/May/2026:10:00:02 +0000] "GET /main.js HTTP/1.1" 200 45678 "-"
```

### Étape 5: Tester Keycloak + Frontend

URL: `http://localhost:4200`

**Attendu**:
1. ✅ Redirigé automatiquement vers Keycloak (`http://localhost:9090/auth/realms/...`)
2. ✅ Écran de login Keycloak s'affiche
3. ✅ Après login, redirigé vers `/dashboard`
4. ✅ Dashboard s'affiche (200 OK, pas 304)

---

## 🐳 Structure Docker (pour référence)

```
Frontend Container:
├── /usr/share/nginx/html/          ← root nginx
│   ├── index.html                  ← Angular SPA entry point
│   ├── main.js, polyfills.js, etc.
│   ├── assets/                     ← images, resources
│   ├── styles.css
│   └── ...
├── /etc/nginx/nginx.conf           ← Notre configuration personnalisée
└── /var/log/nginx/                 ← Logs
    ├── access.log
    └── error.log

Backend Services:
├── gateway (9091)
├── gestionproduit (9093)
├── gestionuser (9092)
├── eureka (8761)
├── recommendation (9095)
└── keycloak (9090)

MongoDB:
└── 27017
```

---

## 🔍 Troubleshooting

### Problème: Toujours HTTP 304

**Solution 1**: Vider le cache du navigateur
```
Chrome → DevTools → Cmd+Shift+Delete (Settings) → 
Clear browsing data → Cached images and files
```

**Solution 2**: Hard refresh
```
Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
```

**Solution 3**: Vérifier le contenu du conteneur
```bash
docker exec frontend ls -la /usr/share/nginx/html/
```

Doit montrer:
```
drwxr-xr-x   index.html
drwxr-xr-x   main.js
drwxr-xr-x   assets/
drwxr-xr-x   ...
```

Si vide ou contient `/frontend/`, c'est que le Dockerfile n'a pas été appliqué correctement.

### Problème: Keycloak login ne fonctionne pas

**Vérifier la configuration**:
```bash
# Accéder au conteneur keycloak
docker exec -it keycloak bash

# Vérifier que le realm existe
curl -s http://localhost:8080/realms/assurance-realm

# Attendu: JSON response de la config du realm
```

**Si 404**: Le realm n'existe pas. Créer manuellement via Keycloak Admin Console:
```
http://localhost:9090/auth/admin
Login: admin / admin
Créer realm: assurance-realm
Créer client: frontend-client
```

### Problème: "Gateway connection refused"

**Vérifier les services backend**:
```bash
# Vérifier que tous les services sont prêts
docker-compose ps

# Attendu: STATUS "Up (healthy)" pour tous

# Si down, vérifier les logs
docker logs gateway
docker logs gestionproduit
```

---

## 📊 Résumé des fichiers modifiés

| Fichier | Changement | Impact |
|---------|-----------|--------|
| `frontend/Dockerfile` | `dist` → `dist/frontend/*` | Fichiers copiés au bon endroit |
| `frontend/nginx.conf` | Cache strategy + security headers | HTTP 200 au lieu de 304 |

---

## ✨ Points clés à retenir

1. **Les chemins Docker doivent être alignés** entre `COPY` et `root` nginx
2. **Le cache HTML doit être `max-age=0`** pour forcer le refresh
3. **Les assets avec hash peuvent avoir cache long** (1 an)
4. **Les logs nginx aident à diagnostiquer** les problèmes
5. **`docker-compose down && docker-compose up`** nécessite un rebuild de l'image

---

## 🎯 Prochaines étapes

1. Appliquer les corrections aux fichiers
2. Rebuild et tester localement
3. Observer les logs Nginx
4. Vérifier la page dashboard s'affiche correctement (HTTP 200)
5. Tester le login Keycloak
6. Tester les appels API vers le gateway

Bonne chance! 🚀

