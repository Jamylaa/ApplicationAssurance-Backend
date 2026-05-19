#  Intelligent Insurance Configuration Platform

A microservices-based platform for intelligent insurance product configuration and recommendation, integrating **Keycloak authentication**, **Spring Boot microservices**, **Angular 18 frontend**, and an **AI-powered chatbot (LLM-based)**.

---

##  Project Overview

This project is an intelligent platform that allows users to:

-  Browse and manage insurance products
-  Interact with an AI chatbot (LLM) for product configuration
-  Receive intelligent recommendations
-  Authenticate securely using Keycloak
-  Access a modern Angular 18 frontend

The system is built using a **microservices architecture** to ensure scalability, modularity, and maintainability.

---

##  System Architecture

The platform is composed of the following components:

-  API Gateway (Spring Cloud Gateway)
-  Keycloak (Authentication & Authorization)
-  User Management Service
-  Product Management Service
-  Recommendation Service
-  AI Chatbot (LLM-based integration)
-  Eureka Service Discovery
-  MongoDB Database
-  Angular 18 Frontend

---

##  Key Features

###  Authentication & Security
- Centralized authentication with **Keycloak**
- Role-based access control (ADMIN / USER)
- JWT-based security for all microservices

###  Product Management
- Create, update, delete insurance products
- Manage product structure and attributes

###  AI Chatbot (LLM)
- Intelligent assistant for insurance configuration
- Natural language interaction
- Helps users choose suitable insurance options

###  Recommendation System
- Suggests relevant insurance products
- Based on user data and configuration context

###  Frontend (Angular 18)
- Modern SPA architecture
- Keycloak integration
- Secure routing with guards
- Responsive UI

---

##  Removed Services (Architecture Simplification)

The following services were removed to simplify the system:

-  `gestionSouscription` service
- ❌ `ai-service` (replaced by direct LLM integration in chatbot)

---

##  Tech Stack

### Backend
- Java 17+
- Spring Boot 3
- Spring Cloud Gateway
- Spring Security (OAuth2 Resource Server)
- MongoDB
- Eureka Server
- Keycloak

### Frontend
- Angular 18
- Keycloak Angular
- TypeScript
- RxJS
- Nginx (production)

### DevOps
- Docker
- Docker Compose

---

##  Running the Project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/insurance-platform.git
cd insurance-platform
