# SpeakSpace — System Design & Technical Documentation

> SpeakSpace is a real-time, AI-assisted communication training platform that enables users to participate in structured group discussions, receive live AI-based evaluation, and review detailed post-session analytics.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Schema](#6-database-schema)
7. [REST API Reference](#7-rest-api-reference)
8. [Real-Time Socket Event Flow](#8-real-time-socket-event-flow)
9. [WebRTC Audio Pipeline](#9-webrtc-audio-pipeline)
10. [AI Integration Pipeline](#10-ai-integration-pipeline)
11. [Deployment and Infrastructure](#11-deployment-and-infrastructure)
12. [CI/CD Pipeline](#12-cicd-pipeline)
13. [End-to-End User Journey](#13-end-to-end-user-journey)
14. [Key Design Decisions](#14-key-design-decisions)

---

## 1. System Overview

SpeakSpace addresses the lack of accessible, real-time group discussion (GD) practice environments by combining low-latency peer-to-peer audio communication, on-device speech transcription, AI-driven feedback, and persistent analytics into a single integrated platform.

### Functional Capabilities

- Real-time voice-based discussion rooms using WebRTC peer-to-peer connections
- Continuous speech transcription using the browser-native Web Speech API
- Live AI evaluation of fluency, confidence, and sentiment via Google Gemini
- Automated post-session participant scorecards with PDF export
- Leaderboard and historical analytics for longitudinal performance tracking
- Moderation controls including mute, kick, and speaking queue management
- Secure password recovery flow with one-time reset tokens

---

## 2. Technology Stack

The system follows a full JavaScript architecture with clearly separated responsibilities across the client, server, and AI service layers.

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React 18, Vite, TailwindCSS | High-performance SPA with fast build times |
| State Management | Zustand | Lightweight global state with localStorage persistence |
| Backend | Node.js, Express.js | Event-driven, scalable API server |
| Real-Time Layer | Socket.IO | Bi-directional event communication |
| Database | MongoDB, Mongoose | Flexible schema for session and analytics data |
| AI Engine | Google Gemini API (`gemini-flash-latest`) | Low-latency inference for real-time speech analysis |
| Audio Transport | WebRTC | Peer-to-peer streaming, avoids server-side media load |
| Transcription | Web Speech API | On-device speech-to-text, no external service needed |
| Authentication | JWT, bcryptjs, Passport.js | Stateless, scalable auth with optional Google OAuth |
| Infrastructure | AWS EC2, Docker, Docker Compose, Nginx | Containerized deployment with reverse proxy and SSL |
| CI/CD | GitHub Actions | Automated build, test, and zero-touch deployment |
| Security | Helmet, express-mongo-sanitize, express-rate-limit | Defense against injection, abuse, and header attacks |

---

## 3. High-Level Architecture

The system is structured into three primary layers: a client layer that handles UI and audio, a server layer that coordinates signaling and API requests, and external services for AI inference and database storage.

A key architectural principle is that audio streams are transmitted directly between clients using WebRTC. The backend only relays signaling messages (offer, answer, ICE candidates) to establish the peer connection. This eliminates server-side media processing, significantly reducing bandwidth and infrastructure cost.

```mermaid
graph TB
    User["User (Browser)"]

    subgraph Client["Frontend — React SPA (Vite)"]
        UI["UI Pages and Components"]
        Store["Zustand Auth Store"]
        SocketHook["useSocket Hook"]
        WebRTCHook["useWebRTC Hook"]
        SpeechAPI["Web Speech API"]
        APIService["axios REST calls"]
    end

    subgraph Server["Backend — Node.js / Express"]
        REST["Express REST API"]
        SocketIO["Socket.IO Server"]
        subgraph Handlers["Socket Handlers"]
            RoomH["roomHandler.js"]
            DiscussH["discussionHandler.js"]
            WebRTCH["webrtcHandler.js"]
        end
        AIService["aiService.js"]
        AuthCtrl["authController.js"]
        RoomsCtrl["roomsController.js"]
    end

    MongoDB[("MongoDB")]
    Gemini["Google Gemini API"]
    Nginx["Nginx (Reverse Proxy + SSL)"]
    STUN["Google STUN Server"]

    User --> Nginx
    Nginx --> REST
    Nginx --> SocketIO
    Nginx --> UI

    UI --> Store
    UI --> SocketHook --> SocketIO
    UI --> WebRTCHook --> STUN
    UI --> SpeechAPI
    SpeechAPI --> SocketHook
    UI --> APIService --> REST

    REST --> AuthCtrl & RoomsCtrl
    SocketIO --> RoomH & DiscussH & WebRTCH
    RoomH & DiscussH --> AIService --> Gemini
    AuthCtrl & RoomsCtrl & RoomH --> MongoDB
```

---

## 4. Frontend Architecture

The frontend is a Single Page Application built with React and Vite. It is divided into public routes accessible without authentication, and protected routes that require a valid JWT stored in localStorage.

### 4.1 Page and Routing Structure

All protected pages are wrapped inside an `AppLayout` component that enforces authentication via the `ProtectedRoute` wrapper and provides the shared navigation shell.

```mermaid
graph LR
    App["App.jsx (Router)"]

    App --> Landing["/ — LandingPage"]
    App --> Login["/login — LoginPage"]
    App --> Register["/register — RegisterPage"]
    App --> AppLayout["AppLayout (Protected Shell)"]

    AppLayout --> Dashboard["/dashboard"]
    AppLayout --> Room["/room/:code"]
    AppLayout --> CreateRoom["/rooms/new"]
    AppLayout --> Profile["/profile"]
    AppLayout --> EditProfile["/profile/edit"]
    AppLayout --> Analytics["/analytics"]
    AppLayout --> Leaderboard["/leaderboard"]
    AppLayout --> Report["/report/:code"]
    AppLayout --> Admin["/admin — admin only"]
```

### 4.2 State Management

Global state is managed via Zustand and persisted to `localStorage` so that users remain authenticated across page refreshes. Transient room-level state (mute status, captions, speaking queue, AI feedback) is maintained in local React state within the `Room` component.

```mermaid
graph TD
    useAuthStore["useAuthStore — Zustand\n(persisted to localStorage)"]

    useAuthStore -->|"user, token, isAuthenticated"| Protected["All Protected Pages"]
    useAuthStore -->|"login, register, logout"| Auth["LoginPage / RegisterPage"]
    useAuthStore -->|"fetchProfile"| Profiles["Profile / EditProfilePage"]

    Room -->|"Local state"| LocalState["isMuted, captions, feedback, queue"]

    subgraph Hooks["Custom Hooks"]
        useSocket["useSocket — Socket.IO connection"]
        useWebRTC["useWebRTC — peers, localStream, permissionStatus"]
    end

    Room --> useSocket
    Room --> useWebRTC
```

### 4.3 Room Component Data Flow

When a user opens a room, the frontend establishes a socket connection, requests microphone access, and starts continuous speech recognition. Each finalized speech segment is emitted to the backend, which triggers AI analysis and returns feedback in real time.

The speech recognition session is restarted automatically with a 100ms delay if the browser stops it unexpectedly — a common behavior in Chrome during natural speech pauses.

```mermaid
sequenceDiagram
    participant U as User
    participant SR as Web Speech API
    participant RC as Room.jsx
    participant S as Socket.IO Server

    U->>RC: Opens /room/:code
    RC->>S: emit join_room
    S-->>RC: user_joined (topic, queue, directory)

    RC->>SR: recognition.start (continuous mode)
    U->>SR: Speaks
    SR-->>RC: onresult — interim transcript
    RC->>RC: Display captions locally
    SR-->>RC: onresult — isFinal = true
    RC->>S: emit speaking_turn (transcript)
    S-->>RC: ai_feedback (fluency, confidence, summary)
    RC->>RC: Display feedback in sidebar

    Note over SR,RC: If recognition ends unexpectedly,\nrestart after 100ms delay
```

---

## 5. Backend Architecture

The backend is organized into distinct modules. Each concern — routing, business logic, real-time events, AI processing — is handled by a dedicated file. This separation makes the codebase maintainable and testable independently.

### 5.1 Module Structure

```mermaid
graph TD
    Entry["src/index.js — Express + HTTP Server"]

    Entry --> Middleware["Middleware\nHelmet, CORS, JSON limit, mongoSanitize, rateLimit"]
    Entry --> Routes["Route Files"]
    Entry --> SocketServer["Socket.IO Server (socket.js)"]

    subgraph Routes
        AuthR["/api/auth"]
        RoomsR["/api/rooms"]
        AnalyticsR["/api/analytics"]
        ScheduleR["/api/schedules"]
        AdminR["/api/admin"]
    end

    SocketServer --> RoomHandler["roomHandler.js"]
    SocketServer --> DiscussionHandler["discussionHandler.js"]
    SocketServer --> WebRTCHandler["webrtcHandler.js"]

    RoomHandler --> AIService["aiService.js (Gemini)"]
    RoomHandler --> MongoDB

    AuthR --> AuthController["authController.js"]
    RoomsR --> RoomsController["roomsController.js"]

    AuthController --> MongoDB[("MongoDB")]
    RoomsController --> MongoDB
    RoomsController --> AIService
```

### 5.2 Authentication Flow

Registration and login are handled via REST endpoints. Passwords are hashed using bcrypt with a cost factor of 12. On successful authentication, a JWT is issued with a 7-day expiry. All protected routes validate this token using the `requireAuth` middleware before processing the request.

```mermaid
sequenceDiagram
    participant C as Client
    participant A as authController
    participant DB as MongoDB
    participant JWT as JWT Library

    C->>A: POST /api/auth/register
    A->>DB: Check for duplicate email
    DB-->>A: Not found
    A->>A: bcrypt.hash(password, 12)
    A->>DB: User.create
    DB-->>A: User document
    A->>JWT: jwt.sign (7d expiry)
    JWT-->>A: Signed token
    A-->>C: token + user object

    C->>A: GET /api/auth/profile (Bearer token)
    A->>A: requireAuth — jwt.verify
    A->>DB: User.findById.select(-password)
    DB-->>A: User
    A-->>C: User profile
```

---

## 6. Database Schema

MongoDB is used for all persistence. The schema is designed to separate concerns: users, rooms, sessions, transcripts, and analytics are independent collections linked by ObjectId references.

Transcripts are ephemeral — they carry a TTL index of 24 hours. Once the AI-generated session review is cached in the `Session.review` field, the raw transcript data is no longer needed and is automatically purged.

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String name
        String email UK
        String password
        String bio
        String avatarUrl
        String role
        String geminiApiKey
        Date createdAt
    }

    ROOM {
        ObjectId _id PK
        String title
        String code UK
        Boolean isPrivate
        Number maxParticipants
        ObjectId moderator FK
        Boolean aiModerator
        Date createdAt
    }

    SESSION {
        ObjectId _id PK
        ObjectId room FK
        Date startedAt
        Date endedAt
        Mixed review
        Mixed analytics
    }

    TRANSCRIPT {
        ObjectId _id PK
        ObjectId session FK
        ObjectId user FK
        String userName
        String text
        Mixed feedback
        Date createdAt
    }

    ANALYTICS {
        ObjectId _id PK
        ObjectId user FK
        ObjectId session FK
        Number fluencyScore
        Number confidenceScore
        Number speakingTime
        Date createdAt
    }

    USER ||--o{ ROOM : "moderates"
    USER }o--o{ ROOM : "participates in"
    ROOM ||--o{ SESSION : "has"
    SESSION ||--o{ TRANSCRIPT : "contains"
    SESSION ||--o{ ANALYTICS : "generates"
    USER ||--o{ TRANSCRIPT : "authored by"
```

---

## 7. REST API Reference

All protected endpoints require a `Bearer` JWT in the `Authorization` header. Admin-only endpoints additionally verify the `role` field on the decoded token.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | None | Register a new user |
| POST | /api/auth/login | None | Authenticate and receive JWT |
| GET | /api/auth/profile | JWT | Retrieve own profile |
| PUT | /api/auth/profile | JWT | Update name, bio, skills, avatar, API key |
| PUT | /api/auth/password | JWT | Change password (requires current password) |
| POST | /api/auth/test-key | JWT | Validate a Gemini API key |
| POST | /api/auth/forgot-password | None | Request a password reset link |
| POST | /api/auth/reset-password | None | Reset password using a valid token |
| GET | /api/auth/google | None | Initiate Google OAuth flow |
| POST | /api/rooms/create | JWT | Create a new discussion room |
| GET | /api/rooms | JWT | List all public rooms |
| GET | /api/rooms/:code | JWT | Get details for a specific room |
| GET | /api/rooms/:code/review | JWT | Retrieve or generate post-session AI report |
| GET | /api/analytics/user | JWT | Get performance analytics for the current user |
| GET | /api/analytics/room/:id | JWT | Get analytics for a specific room |
| GET | /api/schedules | JWT | List scheduled sessions |
| GET | /api/admin/users | Admin | List all registered users |

---

## 8. Real-Time Socket Event Flow

Socket.IO is used for all real-time communication between the client and server. The server maintains the authoritative state for each active room (queue, active speaker, session ID) and broadcasts updates to all participants when state changes occur.

### 8.1 Events Reference

| Direction | Event | Payload | Description |
|---|---|---|---|
| Client to Server | join_room | roomCode, user | User joins a room |
| Server to All | user_joined | user, socketId, directory, topic, queue | Broadcast new participant and full room state |
| Client to Server | leave_room | roomCode, user | User leaves |
| Server to All | user_left | socketId | Broadcast departure |
| Client to Server | speaking_turn | roomCode, transcript, userId | Finalized speech sent for AI processing |
| Server to Others | speaking_turn | userId, userName, transcript | Broadcast captions to all other participants |
| Server to Speaker | ai_feedback | userId, feedback | Return AI evaluation to the speaker |
| Client to Server | raise_hand | roomCode, userId, userName | Add user to speaking queue |
| Server to All | queue_updated | queue array | Updated speaking queue |
| Client to Server | next_speaker | roomCode | Moderator advances the queue |
| Server to All | speaking_turn_start | userId, userName | Announce the new active speaker |
| Client to Server | kick_user | roomCode, targetSocketId | Moderator removes a participant |
| Server to Target | force_kick | none | Redirects the target to the dashboard |
| Client to Server | end_session | roomCode | Moderator finalizes session and triggers AI report |
| Server to All | session_ended | sessionId | Broadcast session completion and redirect to report |
| Client to Server | toggle_mute | roomCode, isMuted | User broadcasts their mute state to everyone |
| Server to All | mute_state_changed | socketId, isMuted | Syncs mute status across all participant cards |

### 8.2 Room Lifecycle State Machine

A room transitions through states from creation to report generation. When the first user joins, a session document is created in MongoDB and Gemini generates a discussion topic. The room remains active while participants are present. After all users leave or the timer expires, the session ends and a review can be requested.

```mermaid
stateDiagram-v2
    [*] --> Idle : Room Created
    Idle --> Active : First user joins (Session created, topic generated)
    Active --> Speaking : next_speaker or raise_hand
    Speaking --> Active : Speaker finishes
    Active --> Active : Other users join or leave
    Active --> Ended : All users leave or timer expires
    Ended --> Reporting : GET /rooms/:code/review called
    Reporting --> [*] : Report rendered and PDF exported
```

---

## 9. WebRTC Audio Pipeline

WebRTC enables peer-to-peer audio transmission without routing media through the server. The Socket.IO server acts purely as a signaling relay for the initial connection setup. Once the connection is established, audio flows directly between clients.

### Connection Establishment Process

1. User A joins the room and emits `join_room`
2. When User B joins, the server broadcasts the room directory to all participants
3. User B discovers User A's socket ID and initiates a peer connection
4. User B creates an SDP offer and emits it via Socket.IO to User A
5. User A responds with an SDP answer
6. ICE candidates are exchanged until a valid network path is found
7. Audio streams begin flowing directly between peers
8. **Identity-Based Stabilization**: Peers are tracked by User ID to ensure that if a connection flickers, "ghost" sessions are automatically cleaned up and a fresh handshake is established.
9. **Manual Fail-safe**: A "Fix Audio" mechanism allows users to manually re-trigger the handshake if browser autoplay policies or network shifts cause silence.

```mermaid
sequenceDiagram
    participant A as User A
    participant S as Socket.IO Server
    participant B as User B
    participant STUN as STUN Server

    A->>S: join_room
    S->>B: user_joined with directory

    B->>STUN: Request ICE candidates
    B->>B: createOffer
    B->>S: webrtc_offer to A
    S->>A: webrtc_offer from B

    A->>A: setRemoteDescription
    A->>A: createAnswer
    A->>S: webrtc_answer to B
    S->>B: webrtc_answer from A

    B->>B: setRemoteDescription

    loop ICE Exchange
        A->>S: webrtc_ice to B
        S->>B: webrtc_ice from A
        B->>B: addIceCandidate
    end

    Note over A,B: Peer-to-peer audio stream established
    A-->>B: Audio via RTCPeerConnection
    B-->>A: Audio via RTCPeerConnection
```

---

## 10. AI Integration Pipeline

AI processing is handled by `aiService.js`, which wraps the Google Gemini API. The service supports per-user API keys, allowing the moderator's stored key to be used preferentially, with a platform-level fallback key when no personal key is configured.

### 10.1 Real-Time Speech Analysis

Each time a user finishes a sentence (when `isFinal = true` in the SpeechRecognition result), the transcript is emitted to the backend. The backend retrieves the speaker's Gemini API key from MongoDB, calls Gemini for analysis, emits the result back to the speaker, and saves the transcript for the session report.

```mermaid
flowchart LR
    Browser["Web Speech API\n(isFinal transcript)"]
    --> Socket["socket.emit speaking_turn"]
    --> Handler["roomHandler.js\nonSpeakingTurn"]
    --> DB[("MongoDB\nFetch geminiApiKey")]
    Handler --> AI["aiService.js\nanalyzeSpeech"]
    AI --> Gemini["Gemini API\nJSON mode"]
    Gemini --> AI
    AI --> Handler
    Handler --> Transcript[("MongoDB\nSave Transcript")]
    Handler --> Browser2["socket.emit ai_feedback\nto speaker"]
```

### 10.2 Post-Session Report Generation

When a user navigates to `/report/:code`, the frontend calls `GET /api/rooms/:code/review`. The backend looks up the latest session, retrieves all transcripts, and sends them to Gemini for a structured analysis. The result is cached in `session.review` so that subsequent requests do not trigger redundant AI calls.

```mermaid
flowchart TD
    Request["GET /api/rooms/:code/review"]
    --> FindSession["Session.findOne for room"]
    --> FindTranscripts["Transcript.find for session"]
    --> CheckCache{{"review cached and valid?"}}

    CheckCache -->|"Yes"| Return["Return cached review"]
    CheckCache -->|"No"| Generate

    subgraph Generate["Generate New Review"]
        Build["Assemble transcript as script"]
        --> Call["aiService.generateSessionReview\nGemini Flash JSON mode"]
        --> Parse["Parse JSON response"]
        --> Save["Cache in session.review"]
    end

    Save --> Return
    Return --> Frontend["Render scorecards and PDF export"]
```

### 10.3 Gemini Response Structure

The session review response from Gemini follows a strict JSON schema:

- `sessionSummary` — A 2 to 3 sentence narrative summary of the discussion
- `overallVibe` — A single word or phrase describing the session tone
- `participants` — An array where each entry contains:
  - `name` — Participant name as identified from transcripts
  - `overallScore` — Integer score from 0 to 100
  - `strengths` — Array of observed communication strengths
  - `areasForImprovement` — Array of suggested improvement areas
  - `feedback` — One personalized coaching sentence

---

## 11. Deployment and Infrastructure

### 11.1 Docker Compose Services

The application is deployed as a multi-container Docker Compose stack on a single AWS EC2 instance. All services communicate over an internal Docker network named `speakspace-network`.

| Service | Image | Role |
|---|---|---|
| mongodb | mongo:6.0 | Persistent database with named volume |
| backend | Custom (./Dockerfile) | Node.js API and Socket.IO, 2 replicas |
| frontend | Custom (./frontend/Dockerfile) | Nginx serving React SPA and proxying API |
| certbot | certbot/certbot | Automatic TLS certificate renewal every 12 hours |
| monitoring | amir20/dozzle | Docker log viewer on port 8080 |

```mermaid
graph TB
    Internet["Internet (port 80 / 443)"] --> Nginx["Nginx\nSSL Termination\nReverse Proxy"]

    subgraph Compose["Docker Compose — speakspace-network"]
        Nginx
        B1["Backend Replica 1\nNode.js port 4000"]
        B2["Backend Replica 2\nNode.js port 4000"]
        DB["MongoDB\nPersistent Volume"]
        CB["Certbot\nTLS Renewal"]
        DZ["Dozzle\nLog Viewer port 8080"]
    end

    EC2["AWS EC2 Instance"]

    Nginx -->|"least_conn"| B1 & B2
    B1 & B2 --> DB
    CB --> Nginx
    Compose --> EC2
```

### 11.2 Nginx Routing Configuration

Nginx handles all inbound traffic and routes requests based on path prefix.

| Path | Destination | Purpose |
|---|---|---|
| /.well-known/acme-challenge/ | Certbot webroot | TLS certificate issuance |
| http://* | https:// redirect | Force encrypted connections |
| /api/* | Backend upstream | REST API proxy |
| /socket.io/* | Backend upstream | WebSocket upgrade proxy |
| /* | /usr/share/nginx/html | React SPA with SPA fallback to index.html |

---

## 12. CI/CD Pipeline

SpeakSpace uses GitHub Actions for automated continuous integration and deployment. Every push to any branch triggers the build and test job. The deployment job runs only when changes are pushed to the `main` branch.

### 12.1 Branch Strategy

| Branch | Trigger | Jobs Run |
|---|---|---|
| dev | Push or PR | build-and-test only |
| main | Push (merged PR or hotfix) | build-and-test then deploy |
| PR to main | Pull Request open | build-and-test as a merge gate |

### 12.2 Pipeline Overview

```mermaid
flowchart TD
    Push["Developer pushes to GitHub"] --> GH["GitHub Actions triggered"]

    GH --> Job1

    subgraph Job1["Job: build-and-test — ubuntu-latest"]
        S1["Checkout repository"]
        --> S2["Set up Node.js 20"]
        --> S3["Install backend dependencies"]
        --> S4["Run Jest tests\n(Supertest + mongodb-memory-server)"]
        --> S5["Install frontend dependencies"]
        --> S6["Vite production build"]
    end

    Job1 -->|"Passed"| Check{{"Branch is main?"}}
    Job1 -->|"Failed"| Fail["Pipeline stops — no deploy"]
    Check -->|"No"| Done["CI complete — no deploy"]
    Check -->|"Yes"| Job2

    subgraph Job2["Job: deploy — SSH to EC2"]
        D1["SSH into EC2 via appleboy/ssh-action"]
        --> D2["git pull origin main"]
        --> D3["docker compose down\ndocker system prune"]
        --> D4["docker compose up --build -d"]
        --> D5{{"TLS certificate exists?"}}
        D5 -->|"No"| D6["certbot certonly — webroot challenge\nLet's Encrypt issues certificate"]
        D5 -->|"Yes"| D7
        D6 --> D7["Write production nginx.conf\nHTTPS redirect and proxy rules"]
        --> D8["docker compose up -d frontend\nRestart Nginx with TLS config"]
        --> D9["df -h — log disk usage"]
    end

    Job2 --> Live["Application live at https://3.88.239.189.nip.io"]
```

### 12.3 Deploy Process on EC2 (Step-by-Step)

When the deploy job runs, it SSHs into the EC2 instance and executes the following sequence:

1. The latest code is pulled from the `main` branch
2. All running containers are stopped and old images are removed to ensure a clean build
3. Docker Compose rebuilds all images and starts all five services
4. If a TLS certificate does not yet exist, Certbot performs the ACME webroot challenge with Let's Encrypt
5. A production-ready `nginx.conf` is written with HTTPS enforcement and upstream proxy rules
6. The frontend (Nginx) container is restarted to apply the new configuration

### 12.4 Required GitHub Secrets

| Secret Name | Used In | Purpose |
|---|---|---|
| EC2_HOST | deploy job | IP or hostname of the EC2 instance |
| EC2_SSH_KEY | deploy job | Private SSH key (PEM) for the ubuntu user |
| VITE_API_URL | build-and-test | API base URL injected at frontend build time |

### 12.5 Automated Test Suite

Tests run against an in-memory MongoDB instance provided by `mongodb-memory-server`, which means no real database connection is required in CI.

| Component | Role |
|---|---|
| Jest | Test runner and assertion library |
| Supertest | HTTP request simulation against Express app |
| mongodb-memory-server | In-process MongoDB for isolated test runs |

---

## 13. End-to-End User Journey

The following describes the complete lifecycle of a user from registration through session completion.

**Step 1 — Registration**: The user creates an account using email and password. A JWT is issued and stored in localStorage for subsequent authenticated requests. **Password Recovery**: Users can securely reset their credentials via an email-based token flow if they lose access.

**Step 2 — Room Creation**: The user navigates to the dashboard and creates a discussion room. Gemini generates a relevant discussion topic automatically based on the room seed.

**Step 3 — Session**: Participants join via the room code or invite link. WebRTC establishes direct audio connections between peers. As each participant speaks, transcripts are sent to the backend and AI feedback is returned within seconds.

**Step 4 — Moderation**: The room moderator can manage the speaking queue, advance to the next speaker, and mute or remove participants if needed.

**Step 5 — Report**: After leaving, the user navigates to the session report page. Gemini aggregates all transcripts and produces participant-level scorecards. The report can be exported as a PDF.

**Step 6 — Growth**: Performance scores contribute to the leaderboard and analytics dashboard, enabling users to track improvement over time.

```mermaid
journey
    title SpeakSpace User Journey
    section Account Setup
        Register with email and password: 4: User
        JWT issued and stored: 5: System
    section Session Setup
        Create or join a room: 5: User
        Gemini generates discussion topic: 5: AI
        Invite link copied and shared: 5: User
    section Live Session
        Microphone access granted: 4: User
        WebRTC audio connected: 5: System
        User speaks — transcript captured: 5: User
        AI feedback received in real time: 5: AI
        Moderator manages queue: 4: Moderator
    section Post-Session
        Navigate to session report: 5: User
        Gemini generates scorecards: 5: AI
        Export report as PDF: 4: User
    section Progress Tracking
        View analytics dashboard: 5: User
        Check leaderboard ranking: 5: User
```

---

## 14. Key Design Decisions

### WebRTC for Audio Transport
Audio is transmitted peer-to-peer using WebRTC rather than being routed through the server. This design eliminates server-side media processing, reducing bandwidth requirements and improving scalability without additional infrastructure cost.

### On-Device Transcription
The browser's native Web Speech API is used for speech-to-text conversion. This avoids the cost and latency of external transcription services. Only the finalized text is sent to the server; raw audio never leaves the client.

### User-Level API Key Strategy
Each user can configure a personal Google Gemini API key in their profile settings. The system prioritizes the moderator's key when processing a session, and falls back to the platform-level `GEMINI_API_KEY` environment variable. This distributes API usage and allows advanced users to use higher-quota keys.

### Ephemeral Transcript Storage
Transcript documents are stored with a MongoDB TTL index of 24 hours and are automatically deleted after expiry. Once the session review is generated and cached in the `Session.review` field, the raw transcripts are redundant. This minimizes storage consumption and aligns with data minimization principles.

### Cached Session Reviews
The AI-generated session review is stored directly on the `Session` document after the first generation. Subsequent requests for the same report are served from the database without calling Gemini again. The cache is invalidated only if the stored review is missing or contains an error response.

### Single-Region Deployment Trade-off
The current deployment runs all services on a single AWS EC2 instance. While Docker Compose provides two backend replicas, both run on the same physical host, which introduces a single point of failure. For production-grade scaling, this should be migrated to a multi-node setup using AWS ECS, EKS, or multiple EC2 instances behind an Application Load Balancer with a managed MongoDB Atlas cluster.


