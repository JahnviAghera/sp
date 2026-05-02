# SpeakSpace System Architecture Diagrams

Below are the architecture diagrams and flowcharts for the SpeakSpace MERN stack application, specifically tailored to your current AWS Dockerized deployment and WebRTC/AI capabilities.

## 1. System Architecture Diagram

This diagram shows the high-level interaction between the client, the Nginx reverse proxy, the frontend/backend services, and external integrations (MongoDB and Gemini AI).

```mermaid
graph TD
    Client[Client Browser / Device]
    
    subgraph SpeakSpace Platform
        Nginx[Nginx Reverse Proxy]
        React[React Frontend]
        Node[Node.js + Express Backend]
        Socket[Socket.io Real-time Server]
        AI[Gemini AI Service]
    end
    
    DB[(MongoDB Atlas)]

    Client <-->|HTTPS / WSS| Nginx
    Nginx -->|Static File Serving| React
    Nginx <-->|API Routing| Node
    Nginx <-->|WebSocket Proxy| Socket
    Node <-->|Mongoose Connection| DB
    Node <-->|API Calls| AI
```
* **Explanation:** The client connects securely via Nginx, which routes static file requests to the React build and API/WebSocket requests to the Node.js backend. The backend manages database operations and requests AI analysis from Google Gemini.*

---

## 2. Deployment Architecture (AWS)

Visualizes the actual hosting infrastructure on AWS, utilizing a single EC2 instance running multiple Docker containers for seamless scaling and SSL management.

```mermaid
graph TD
    User((User))
    
    subgraph AWS Cloud
        subgraph EC2 Instance
            Docker[Docker Engine]
            subgraph Container 1
                Frontend[Vite React App]
            end
            subgraph Container 2 & 3
                Backend[Node Backend Replicas]
            end
            Certbot[Certbot SSL Auto-Renew]
            Nginx[Nginx Proxy - Port 80/443]
        end
    end
    
    MongoDB[(MongoDB Atlas Cloud)]
    GoogleAI[Google Gemini API]

    User <-->|HTTPS/WSS| Nginx
    Nginx <--> Frontend
    Nginx <--> Backend
    Backend <--> MongoDB
    Backend <--> GoogleAI
    Certbot -->|Provides Certificates| Nginx
```
* **Explanation:** The entire stack is containerized on an AWS EC2 instance. Nginx handles load-balancing between backend replicas and encrypts traffic using certificates generated dynamically by the Certbot container.*

---

## 3. Data Flow Diagram (DFD)

### Level 0 (Context Diagram)
```mermaid
graph LR
    User[User]
    System((SpeakSpace System))
    DB[(MongoDB)]
    AI[Gemini AI]

    User -- "Audio / Actions" --> System
    System -- "UI / Captions / Feedback" --> User
    System -- "CRUD Data" --> DB
    DB -- "Query Results" --> System
    System -- "Speech Transcripts" --> AI
    AI -- "Analytical Insights" --> System
```

### Level 1 (Process Diagram)
```mermaid
graph TD
    User[User]
    subgraph Processes
        Auth(1.0 Auth Process)
        Room(2.0 Room Management)
        RTC(3.0 Real-time Comms)
        Anal(4.0 AI Analysis)
    end
    DB[(Database)]

    User -->|Credentials| Auth
    Auth -->|Token| User
    Auth <-->|User Data| DB
    
    User -->|Create/Join| Room
    Room <-->|Session Data| DB
    
    User <-->|Media/Chat/Events| RTC
    RTC -->|Transcripts| Anal
    Anal -->|Feedback| User
    Anal -->|Review Data| DB
```
* **Explanation:** Data flows from the user into authentication, room creation, and real-time WebRTC connections. Speech is transcribed and sent to the AI process, which stores reports in the database and returns insights to the user.*

---

## 4. User Flowchart

The step-by-step journey a user takes when interacting with the SpeakSpace application.

```mermaid
graph TD
    Start([Start]) --> Login{Authenticated?}
    Login -- No --> SignIn[Google / Email Login] --> Dash
    Login -- Yes --> Dash[Dashboard]
    Dash --> Action{Choose Action}
    Action -- Create --> Create[Create New Room] --> Room
    Action -- Join --> Join[Enter Room Code] --> Room
    Action -- View --> Report[View Past Reports]
    Room --> Grant[Grant Mic Permission]
    Grant --> Talk[Participate & Speak]
    Talk --> Insights[Receive Real-time Insights]
    Talk --> Leave[Leave Room]
    Leave --> Report
    Report --> End([End Session])
```
* **Explanation:** Users authenticate and navigate to the dashboard where they can create/join rooms or view past performance. Inside a room, they grant hardware permissions, speak, receive feedback, and eventually view a comprehensive report upon leaving.*

---

## 5. Backend Flowchart

The lifecycle of an HTTP API request as it travels through the Express backend architecture.

```mermaid
graph TD
    Req([HTTP Request]) --> Router[Express Router]
    Router --> Auth[Auth Middleware]
    Auth -- Valid Token --> Controller[Controller Method]
    Auth -- Invalid Token --> 401([401 Unauthorized Response])
    Controller --> Service[Business Logic / AI Service]
    Service --> Model[Mongoose Model]
    Model <--> DB[(MongoDB)]
    Model --> Service
    Service --> Controller
    Controller --> Res([JSON Response])
```
* **Explanation:** Incoming requests are routed and authenticated via middleware. Valid requests pass to controllers, which utilize services and models to interact with the database before returning a JSON response.*

---

## 6. Database Schema Diagram (ERD)

The core MongoDB collections and how they reference one another via ObjectIds.

```mermaid
erDiagram
    USER {
        ObjectId _id
        String name
        String email
        String password
        String googleId
    }
    ROOM {
        ObjectId _id
        String code
        String title
        Boolean isPrivate
        ObjectId moderator
    }
    SESSION {
        ObjectId _id
        ObjectId room
        Date startedAt
        Mixed review
    }
    TRANSCRIPT {
        ObjectId _id
        ObjectId session
        ObjectId userId
        String text
    }

    USER ||--o{ ROOM : moderates
    ROOM ||--o{ SESSION : hosts
    SESSION ||--o{ TRANSCRIPT : contains
    USER ||--o{ TRANSCRIPT : speaks
```
* **Explanation:** A User can moderate multiple Rooms. A Room hosts multiple temporal Sessions. A Session contains multiple Transcripts, which are linked to the specific User who spoke the text.*

---

## 7. MVC Architecture Diagram

How the separation of concerns is managed between the frontend and backend.

```mermaid
graph TD
    subgraph Client Browser
        View[View - React Components]
    end
    
    subgraph Node.js Backend
        Controller[Controller - Route Handlers]
        Model[Model - Mongoose Schema]
    end
    
    DB[(MongoDB)]

    View -- "HTTP API Calls" --> Controller
    Controller -- "Business Logic & Queries" --> Model
    Model <--> DB
    Model -- "Data Result" --> Controller
    Controller -- "JSON Payload" --> View
```
* **Explanation:** The React frontend acts as the View layer. It makes API calls to the Express Controllers, which act as the middleman to read/write data using Mongoose Models.*

---

## 8. CI/CD Pipeline Diagram (GitHub Actions)

The automated deployment pipeline triggered via GitHub Actions.

```mermaid
graph LR
    Dev((Developer)) -->|Push Code| GH[GitHub Repository]
    GH -->|Trigger Workflow| GA[GitHub Actions]
    
    subgraph CI Pipeline
        Build[Install Dependencies]
        Test[Run Backend Tests]
        Pack[Build Vite Frontend]
    end
    
    GA --> Build --> Test --> Pack
    Pack -->|SSH Deploy Action| EC2[AWS EC2 Server]
    
    subgraph CD Execution
        Pull[Git Pull main]
        Down[Docker Compose Down]
        Up[Docker Compose Up --build]
        Cert[Certbot SSL Provision]
    end
    
    EC2 --> Pull --> Down --> Up --> Cert
```
* **Explanation:** Pushing code triggers a GitHub Action that tests the backend and builds the frontend. It then SSHs into the EC2 instance, pulls the latest code, rebuilds the Docker containers, and ensures SSL certificates are valid.*
