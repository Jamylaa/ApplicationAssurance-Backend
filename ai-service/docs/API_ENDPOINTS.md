# Backend API Endpoints for Chatbots
## Recommendation Chatbot Service
### Base URL
``` http://localhost:5000/api ```
### Endpoints
#### Start Recommendation Conversation
```http
POST /recommendation-chat/start
Content-Type: application/json
{
  "client_id": "optional-client-id"
}
Response:
{
  "response": "Bonjour ! Je suis votre assistant d'assurance santé...",
  "next_field": "age",
  "progress": 0,
  "is_complete": false,
  "collected_data": {}
}
```
#### Send Message to Recommendation Chatbot
```http
POST /recommendation-chat
Content-Type: application/json
{
  "message": "30 ans",
  "conversation_history": [
    {"role": "assistant", "content": "Quel est votre âge ?"},
    {"role": "user", "content": "30 ans"}
  ],
  "client_id": "optional-client-id"
}
Response:
{
  "response": "Quel est votre sexe ? (Homme / Femme)",
  "next_field": "sexe", 
  "progress": 10,
  "is_complete": false,
  "collected_data": {"age": 30}
}
```
## Admin Chatbot Service
### Base URL
```
http://localhost:5000/api
```
### Endpoints
#### Start Admin Conversation
```http
POST /admin-chat/start
Content-Type: application/json
{
}
Response:
{
  "response": "Bonjour Administrateur. Je suis votre assistant de création...",
  "next_field": "admin_intent",
  "progress": 0,
  "is_complete": false,
  "collected_data": {}
}
```
#### Send Message to Admin Chatbot
```http
POST /admin-chat
Content-Type: application/json
{
  "message": "Garantie",
  "conversation_history": [
    {"role": "assistant", "content": "Que souhaitez-vous créer ?"},
    {"role": "user", "content": "Garantie"}
  ],
  "mode": "creation"
}
Response:
{
  "response": "Quel nom souhaitez-vous donner à cette garantie ?",
  "next_field": "nom_garantie",
  "progress": 10,
  "is_complete": false,
  "collected_data": {"admin_intent": "Garantie"}
}
```
## Error Responses
All endpoints return error responses in this format:
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```
HTTP Status Codes:
- 200: Success
- 400: Bad Request
- 500: Internal Server Error