# Modifications Frontend - API Client

## 📋 Vue d'ensemble

L'API client a été restructurée avec un seul contrôleur unifié. Voici les modifications nécessaires côté frontend.

## 🔗 Endpoints API

### Base URL
```
http://localhost:8080/api/clients
```

### Endpoints disponibles

| Méthode | Endpoint | Description | Corps de la requête |
|---------|----------|-------------|-------------------|
| GET | `/api/clients` | Récupérer tous les clients | - |
| GET | `/api/clients/{idUser}` | Récupérer un client par ID | - |
| POST | `/api/clients` | Créer un nouveau client | ClientDTO |
| PUT | `/api/clients/{idUser}` | Mettre à jour un client | ClientDTO |
| DELETE | `/api/clients/{idUser}` | Supprimer un client | - |
| GET | `/api/clients/search?query={text}` | Rechercher des clients | - |
| POST | `/api/clients/validate-username` | Valider un username | Form data |
| POST | `/api/clients/validate-email` | Valider un email | Form data |

## 🔄 Modifications à apporter

### 1. **Mise à jour des URLs des appels API**
#### ❌ Anciens endpoints (à supprimer)
```javascript
// Anciens contrôleurs à ne plus utiliser
/api/clients-v2/*  // ClientControllerFinal (supprimé)
/api/clients/*     // ClientControllerImproved (supprimé)
```

#### ✅ Nouveaux endpoints (à utiliser)
```javascript
// Nouveau contrôleur unifié
GET    /api/clients
POST   /api/clients
PUT    /api/clients/{id}
DELETE /api/clients/{id}
GET    /api/clients/search?query=
POST   /api/clients/validate-username
POST   /api/clients/validate-email
```
### 2. **Format des données Client**
#### ✅ ClientDTO (pour création/mise à jour)
```json
{
  "userName": "jean-marc",
  "email": "jean.marc@example.com", 
  "password": "password123",
  "phone": 55123456,
  "age": 35,
  "sexe": "M",
  "profession": "Ingénieur",
  "situationFamiliale": "Marié",
  "maladieChronique": false,
  "diabetique": false,
  "tension": false,
  "nombreBeneficiaires": 3
}
```
#### ✅ ClientResponseDTO (pour les réponses)
```json
{
  "idUser": "507f1f77bcf86cd799439011",
  "userName": "jean-marc",
  "email": "jean.marc@example.com",
  "phone": 55123456,
  "age": 35,
  "sexe": "M", 
  "profession": "Ingénieur",
  "situationFamiliale": "Marié",
  "maladieChronique": false,
  "diabetique": false,
  "tension": false,
  "nombreBeneficiaires": 3,
  "role": "CLIENT",
  "actif": true
}
```
### 3. **Exemples d'implémentation**
#### 📝 Service Angular/React
```javascript
// clientService.js
class ClientService {
  baseURL = 'http://localhost:8080/api/clients';

  // Récupérer tous les clients
  async getAllClients() {
    const response = await fetch(`${this.baseURL}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des clients');
    return await response.json();
  }

  // Récupérer un client par ID
  async getClientById(id) {
    const response = await fetch(`${this.baseURL}/${id}`);
    if (!response.ok) throw new Error('Client non trouvé');
    return await response.json();
  }

  // Créer un client
  async createClient(clientData) {
    const response = await fetch(`${this.baseURL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    
    return await response.json();
  }

  // Mettre à jour un client
  async updateClient(id, clientData) {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    
    return await response.json();
  }

  // Supprimer un client
  async deleteClient(id) {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Erreur lors de la suppression');
  }

  // Rechercher des clients
  async searchClients(query) {
    const response = await fetch(`${this.baseURL}/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Erreur lors de la recherche');
    return await response.json();
  }

  // Valider un username
  async validateUsername(username) {
    const formData = new FormData();
    formData.append('username', username);
    
    const response = await fetch(`${this.baseURL}/validate-username`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error('Erreur de validation');
    return await response.json();
  }

  // Valider un email
  async validateEmail(email) {
    const formData = new FormData();
    formData.append('email', email);
    
    const response = await fetch(`${this.baseURL}/validate-email`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error('Erreur de validation');
    return await response.json();
  }
}
```

#### 📝 Composant React (Exemple)

```jsx
// ClientForm.jsx
import React, { useState } from 'react';
import ClientService from './services/clientService';

function ClientForm({ client, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    userName: client?.userName || '',
    email: client?.email || '',
    password: '',
    phone: client?.phone || '',
    age: client?.age || '',
    sexe: client?.sexe || 'M',
    profession: client?.profession || '',
    situationFamiliale: client?.situationFamiliale || '',
    maladieChronique: client?.maladieChronique || false,
    diabetique: client?.diabetique || false,
    tension: client?.tension || false,
    nombreBeneficiaires: client?.nombreBeneficiaires || 1
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const clientService = new ClientService();
      
      if (client?.idUser) {
        // Mise à jour
        await clientService.updateClient(client.idUser, formData);
      } else {
        // Création
        await clientService.createClient(formData);
      }
      
      onSave();
    } catch (error) {
      setErrors({ general: error.message });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors.general && <div className="error">{errors.general}</div>}
      
      <input
        name="userName"
        value={formData.userName}
        onChange={handleChange}
        placeholder="Username"
        required
      />
      
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      
      {!client?.idUser && (
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Mot de passe"
          required
        />
      )}
      
      <input
        name="phone"
        type="number"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Téléphone"
        required
      />
      
      <input
        name="age"
        type="number"
        value={formData.age}
        onChange={handleChange}
        placeholder="Âge"
      />
      
      <select name="sexe" value={formData.sexe} onChange={handleChange}>
        <option value="M">Masculin</option>
        <option value="F">Féminin</option>
      </select>
      
      <input
        name="profession"
        value={formData.profession}
        onChange={handleChange}
        placeholder="Profession"
      />
      
      <input
        name="situationFamiliale"
        value={formData.situationFamiliale}
        onChange={handleChange}
        placeholder="Situation familiale"
      />
      
      <label>
        <input
          type="checkbox"
          name="maladieChronique"
          checked={formData.maladieChronique}
          onChange={handleChange}
        />
        Maladie chronique
      </label>
      
      <label>
        <input
          type="checkbox"
          name="diabetique"
          checked={formData.diabetique}
          onChange={handleChange}
        />
        Diabétique
      </label>
      
      <label>
        <input
          type="checkbox"
          name="tension"
          checked={formData.tension}
          onChange={handleChange}
        />
        Tension
      </label>
      
      <input
        name="nombreBeneficiaires"
        type="number"
        value={formData.nombreBeneficiaires}
        onChange={handleChange}
        placeholder="Nombre de bénéficiaires"
        min="1"
      />
      
      <button type="submit">
        {client?.idUser ? 'Mettre à jour' : 'Créer'}
      </button>
      
      <button type="button" onClick={onCancel}>
        Annuler
      </button>
    </form>
  );
}
```

### 4. **Gestion des erreurs**

#### ✅ Codes d'erreur à gérer
- **400 Bad Request**: Données invalides (validation)
- **404 Not Found**: Client non trouvé
- **409 Conflict**: Email/username déjà utilisé
- **500 Internal Server Error**: Erreur serveur

#### 📝 Gestion des erreurs (Exemple)
```javascript
try {
  const result = await clientService.createClient(clientData);
  // Succès
} catch (error) {
  if (error.message.includes('déjà utilisé')) {
    // Gérer le conflit
    setError('Cet email ou username est déjà utilisé');
  } else if (error.message.includes('invalide')) {
    // Gérer les erreurs de validation
    setError('Données invalides');
  } else {
    // Autres erreurs
    setError('Erreur serveur');
  }
}
```

### 5. **Validation en temps réel**

```javascript
// Validation du username en temps réel
const validateUsername = async (username) => {
  try {
    const result = await clientService.validateUsername(username);
    return result.isValid;
  } catch (error) {
    return false;
  }
};

// Validation de l'email en temps réel
const validateEmail = async (email) => {
  try {
    const result = await clientService.validateEmail(email);
    return result.isValid;
  } catch (error) {
    return false;
  }
};
```

## 🚀 Points clés à retenir

1. **Un seul endpoint** pour toutes les opérations CRUD
2. **Pas de mot de passe** dans les réponses API
3. **Validation robuste** côté backend
4. **Gestion des erreurs** explicite
5. **Format JSON** standardisé
6. **Recherche textuelle** disponible
7. **Validation en temps réel** possible

## ⚠️ Attention

- Le mot de passe n'est **jamais** retourné dans les réponses
- Tous les champs sont **validés** côté backend
- Les emails et usernames doivent être **uniques**
- Le format des dates est **standardisé**
- Les erreurs sont **clairement documentées**
