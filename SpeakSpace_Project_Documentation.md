# SpeakSpace — Full Project Documentation

> **SpeakSpace** is a real-time, AI-powered group discussion and communication coaching platform. Users join rooms, speak via WebRTC audio, receive live AI feedback from Gemini, and get a comprehensive end-of-session performance report.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Schema (MongoDB)](#6-database-schema-mongodb)
7. [REST API Reference](#7-rest-api-reference)
8. [Real-Time Socket Event Flow](#8-real-time-socket-event-flow)
9. [WebRTC Audio Pipeline](#9-webrtc-audio-pipeline)
10. [AI Integration Pipeline](#10-ai-integration-pipeline)
11. [Deployment & Infrastructure](#11-deployment--infrastructure)
12. [CI/CD Pipeline](#12-cicd-pipeline)
13. [End-to-End User Journey](#13-end-to-end-user-journey)

---

## 1. System Overview

SpeakSpace solves the problem of practicing Group Discussion (GD) skills in isolation. It provides:

- 🎤 **Real-time audio rooms** via WebRTC peer-to-peer connections
- 🤖 **Live AI coaching** — every spoken sentence is analyzed by Google Gemini for fluency, confidence and sentiment
- 📊 **Post-session reports** — full AI-generated participant scorecards exported as PDF
- 🏆 **Leaderboard & Analytics** — track improvement over time
- 🛡️ **Moderator tools** — mute/kick participants, manage speaking queue

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS, Zustand, Socket.IO Client, lucide-react |
| **Backend** | Node.js, Express.js, Socket.IO Server |
| **Database** | MongoDB via Mongoose ODM |
| **AI** | Google Gemini API (`@google/generative-ai`) — `gemini-flash-latest` model |
| **Auth** | JWT (jsonwebtoken), bcryptjs, Passport.js (Google OAuth) |
| **Real-time Audio** | WebRTC (browser-native), `getUserMedia` API |
| **Transcription** | Web Speech API (`SpeechRecognition`) — browser-native, continuous |
| **Infrastructure** | AWS EC2, Docker, Docker Compose, Nginx (reverse proxy + SSL) |
| **SSL** | Let's Encrypt via Certbot |
| **Monitoring** | Dozzle (Docker log viewer) |
| **CI/CD** | GitHub Actions |
| **Security** | Helmet, express-mongo-sanitize, express-rate-limit |

---

## 3. High-Level Architecture

```mermaid
graph TB
    User["👤 User (Browser)"]

    subgraph Client["Frontend — React SPA (Vite)"]
        UI["UI Pages & Components"]
        ZustandStore["Zustand Auth Store"]
        SocketHook["useSocket Hook"]
        WebRTCHook["useWebRTC Hook"]
        SpeechAPI["Web Speech API"]
        API_Service["axios /api calls"]
    end

    subgraph Server["Backend — Node.js / Express"]
        REST["Express REST API"]
        SocketIO["Socket.IO Server"]
        subgraph Handlers["Socket Handlers"]
            RoomH["roomHandler.js"]
            DiscussH["discussionHandler.js"]
            WebRTCH["webrtcHandler.js"]
        end
        AIService["aiService.js (Gemini)"]
        AuthCtrl["authController.js"]
        RoomsCtrl["roomsController.js"]
    end

    MongoDB[("MongoDB Atlas / Local")]
    Gemini["☁️ Google Gemini API"]
    Nginx["Nginx (Reverse Proxy + SSL)"]
    STUN["Google STUN Server"]

    User -->|"HTTPS"| Nginx
    Nginx -->|"/api/*"| REST
    Nginx -->|"/socket.io/*"| SocketIO
    Nginx -->|"Static Files"| UI

    UI --> ZustandStore
    UI --> SocketHook --> SocketIO
    UI --> WebRTCHook --> STUN
    UI --> SpeechAPI
    SpeechAPI -->|"Transcript text"| SocketHook
    UI --> API_Service --> REST

    REST --> AuthCtrl & RoomsCtrl
    SocketIO --> RoomH & DiscussH & WebRTCH
    RoomH & DiscussH --> AIService --> Gemini
    AuthCtrl & RoomsCtrl & RoomH --> MongoDB
```

---

## 4. Frontend Architecture

### 4.1 Page & Routing Structure

```mermaid
graph LR
    App["App.jsx (Router)"]

    App --> Landing["/  LandingPage"]
    App --> Login["/login  LoginPage"]
    App --> Register["/register  RegisterPage"]

    App --> AppLayout["AppLayout (Protected Shell)"]

    AppLayout --> Dashboard["/dashboard  Dashboard"]
    AppLayout --> Room["/room/:code  Room"]
    AppLayout --> CreateRoom["/rooms/new  CreateRoomPage"]
    AppLayout --> Profile["/profile  Profile (view-only)"]
    AppLayout --> EditProfile["/profile/edit  EditProfilePage"]
    AppLayout --> Analytics["/analytics  AnalyticsPage"]
    AppLayout --> Leaderboard["/leaderboard  Leaderboard"]
    AppLayout --> Report["/report/:code  SessionReport"]
    AppLayout --> Admin["/admin  AdminPanel (admin only)"]
```

### 4.2 Frontend State Management

```mermaid
graph TD
    useAuthStore["Zustand: useAuthStore\n(persisted via localStorage)"]

    useAuthStore -->|"user, token, isAuthenticated"| AllPages["All Protected Pages"]
    useAuthStore -->|"login(), register(), logout()"| LoginPage & RegisterPage
    useAuthStore -->|"fetchProfile()"| Profile & EditProfilePage

    Room -->|"local state"| isMuted & messages & captions & feedback & queue

    subgraph "Custom Hooks"
        useSocket["useSocket(code, user)\n→ Socket.IO connection"]
        useWebRTC["useWebRTC(socket, roomCode)\n→ peers, localStream, permissionStatus"]
    end

    Room --> useSocket
    Room --> useWebRTC
```

### 4.3 Room Component Data Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant SR as SpeechRecognition API
    participant RC as Room.jsx
    participant S as Socket.IO

    U->>RC: Opens /room/:code
    RC->>S: emit('join_room', {roomCode, user})
    S-->>RC: on('user_joined', {topic, queue, directory...})

    RC->>SR: recognition.start() [continuous=true]
    U->>SR: Speaks aloud
    SR-->>RC: onresult (interim transcript)
    RC->>RC: setCaptions({name, text}) — local preview
    SR-->>RC: onresult (isFinal=true)
    RC->>S: emit('speaking_turn', {roomCode, transcript, userId})
    S-->>RC: on('ai_feedback', {feedback}) — fluency/confidence scores
    RC->>RC: setFeedback(feedback) — shows in sidebar

    Note over SR,RC: If recognition.onend fires,<br/>restart after 100ms delay
```

---

## 5. Backend Architecture

### 5.1 Backend Module Structure

```mermaid
graph TD
    Entry["src/index.js\n(Express + HTTP Server)"]

    Entry --> Middleware["Middleware Stack\n• helmet (security headers)\n• cors (all origins)\n• express-json (10kb limit)\n• mongoSanitize\n• rateLimit (200 req/15min)"]

    Entry --> Routes
    subgraph Routes
        AuthR["/api/auth → auth.js"]
        RoomsR["/api/rooms → rooms.js"]
        AnalyticsR["/api/analytics → analytics.js"]
        ScheduleR["/api/schedules → schedules.js"]
        AdminR["/api/admin → admin.js"]
    end

    Entry --> SocketServer["Socket.IO Server\n(socket.js)"]

    SocketServer --> RoomHandler["roomHandler.js\n(join, leave, queue, speaking turn)"]
    SocketServer --> DiscussionHandler["discussionHandler.js"]
    SocketServer --> WebRTCHandler["webrtcHandler.js\n(offer, answer, ICE relay)"]

    RoomHandler --> AIService["aiService.js\n(Gemini Flash)"]
    RoomHandler --> MongoDB

    AuthR --> AuthController["authController.js"]
    RoomsR --> RoomsController["roomsController.js"]

    AuthController --> MongoDB[("MongoDB")]
    RoomsController --> MongoDB
    RoomsController --> AIService
```

### 5.2 Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as authController.js
    participant DB as MongoDB
    participant JWT as JWT Library

    C->>A: POST /api/auth/register {name, email, password}
    A->>DB: User.findOne({email}) — check duplicate
    DB-->>A: null (unique)
    A->>A: bcrypt.hash(password, 12)
    A->>DB: User.create({name, email, hashedPassword})
    DB-->>A: User document
    A->>JWT: jwt.sign({id, email, role}, SECRET, 7d)
    JWT-->>A: token
    A-->>C: {token, user}

    C->>A: GET /api/auth/profile (Bearer token)
    A->>A: requireAuth middleware → jwt.verify(token)
    A->>DB: User.findById(req.user.id).select('-password')
    DB-->>A: User
    A-->>C: {user}
```

---

## 6. Database Schema (MongoDB)

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String name
        String email UK
        String password
        String bio
        String[] skills
        String avatarUrl
        String role
        Number stats_totalSpeakingTime
        Number stats_sessionsParticipated
        String geminiApiKey
        Date createdAt
    }

    ROOM {
        ObjectId _id PK
        String title
        String code UK
        Boolean isPrivate
        Number maxParticipants
        ObjectId[] participants FK
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
        Array participantsSummary
    }

    TRANSCRIPT {
        ObjectId _id PK
        ObjectId session FK
        String roomCode
        ObjectId user FK
        String userName
        String text
        Mixed feedback
        Date createdAt
    }

    ANALYTICS {
        ObjectId _id PK
        ObjectId user FK
        ObjectId room FK
        ObjectId session FK
        Number speakingTime
        Number wordsPerMinute
        Number fluencyScore
        Number confidenceScore
        Date createdAt
    }

    USER ||--o{ ROOM : "moderates"
    USER }o--o{ ROOM : "participates"
    ROOM ||--o{ SESSION : "has"
    SESSION ||--o{ TRANSCRIPT : "contains"
    SESSION ||--o{ ANALYTICS : "generates"
    USER ||--o{ TRANSCRIPT : "speaks"
    USER ||--o{ ANALYTICS : "tracked in"
```

---

## 7. REST API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT |
| `GET` | `/api/auth/profile` | ✅ JWT | Get own profile |
| `PUT` | `/api/auth/profile` | ✅ JWT | Update name, bio, skills, avatar, geminiApiKey |
| `PUT` | `/api/auth/password` | ✅ JWT | Change password (verifies current first) |
| `POST` | `/api/auth/test-key` | ✅ JWT | Test a Gemini API key validity |
| `GET` | `/api/auth/google` | ❌ | Initiate Google OAuth |
| `POST` | `/api/rooms/create` | ✅ JWT | Create a new room |
| `GET` | `/api/rooms` | ✅ JWT | List all public rooms |
| `GET` | `/api/rooms/:code` | ✅ JWT | Get single room details |
| `GET` | `/api/rooms/:code/review` | ✅ JWT | Generate/fetch post-session AI review |
| `GET` | `/api/analytics/user` | ✅ JWT | Get user analytics |
| `GET` | `/api/analytics/room/:id` | ✅ JWT | Get room analytics |
| `GET` | `/api/schedules` | ✅ JWT | List schedules |
| `GET` | `/api/admin/users` | ✅ Admin | List all users |

---

## 8. Real-Time Socket Event Flow

### 8.1 Events Reference

| Direction | Event | Payload | Description |
|---|---|---|---|
| Client → Server | `join_room` | `{roomCode, user}` | User joins a room |
| Server → All | `user_joined` | `{user, socketId, directory, topic, queue, ...}` | Broadcast new joiner + full room state |
| Client → Server | `leave_room` | `{roomCode, user}` | User leaves |
| Server → All | `user_left` | `{socketId}` | Broadcast departure |
| Client → Server | `speaking_turn` | `{roomCode, transcript, userId}` | Finalized speech chunk |
| Server → Others | `speaking_turn` | `{userId, userName, transcript}` | Broadcast captions |
| Server → Speaker | `ai_feedback` | `{userId, feedback}` | Fluency/confidence scores |
| Client → Server | `raise_hand` | `{roomCode, userId, userName}` | Add to queue |
| Server → All | `queue_updated` | `[queue]` | Updated speaking queue |
| Client → Server | `next_speaker` | `{roomCode}` | Moderator advances queue |
| Server → All | `speaking_turn_start` | `{userId, userName}` | New active speaker |
| Client → Server | `mute_user` | `{roomCode, targetSocketId}` | Moderator mutes peer |
| Server → Target | `force_mute` | — | Silences target client |
| Client → Server | `kick_user` | `{roomCode, targetSocketId}` | Moderator kicks peer |
| Server → Target | `force_kick` | — | Redirects target to dashboard |

### 8.2 Room Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle : Room Created
    Idle --> Active : First user joins\n(Session created in DB, AI generates topic)
    Active --> Speaking : next_speaker / raise_hand
    Speaking --> Active : Speaker finishes
    Active --> Active : Users join/leave
    Active --> Ended : All users leave / timer expires
    Ended --> Reporting : GET /rooms/:code/review
    Reporting --> [*] : Report shown, PDF exported
```

---

## 9. WebRTC Audio Pipeline

```mermaid
sequenceDiagram
    participant A as User A (Initiator)
    participant S as Socket.IO Server
    participant B as User B (Joiner)
    participant STUN as Google STUN

    Note over A,B: Both users are in same socket room

    A->>S: join_room
    S->>B: user_joined (directory with A's socketId)

    B->>STUN: Get ICE candidates (public IP discovery)
    B->>B: createPeerConnection(A.socketId, isInitiator=true)
    B->>B: getUserMedia({audio:true}) → localStream
    B->>B: pc.createOffer()
    B->>S: webrtc_offer {offer, toSocketId: A}
    S->>A: webrtc_offer {from: B, offer}

    A->>A: createPeerConnection(B.socketId, isInitiator=false)
    A->>A: pc.setRemoteDescription(offer)
    A->>A: pc.createAnswer()
    A->>S: webrtc_answer {answer, toSocketId: B}
    S->>B: webrtc_answer {from: A, answer}

    B->>B: pc.setRemoteDescription(answer)

    loop ICE Candidate Exchange
        A->>S: webrtc_ice {candidate, toSocketId: B}
        S->>B: webrtc_ice {from: A, candidate}
        B->>B: pc.addIceCandidate(candidate)
    end

    Note over A,B: ✅ Peer-to-peer audio stream established
    B-->>A: Audio stream (pc.ontrack)
    A-->>B: Audio stream (pc.ontrack)
```

---

## 10. AI Integration Pipeline

### 10.1 Real-Time Speech Analysis (per utterance)

```mermaid
flowchart LR
    Browser["Browser\nSpeechRecognition API"]
    -->|"isFinal transcript"| SocketEmit["socket.emit\n'speaking_turn'"]
    --> RoomHandler["roomHandler.js\nonSpeakingTurn()"]
    --> |"Fetch user geminiApiKey\nfrom MongoDB"| UserDB[("MongoDB\nUser.geminiApiKey")]
    RoomHandler --> AIService["aiService.js\nanalyzeSpeech()"]
    AIService --> Gemini["Google Gemini API\ngemini-flash-latest\nJSON mode"]
    Gemini -->|"{ summary, fluency, confidence }"| AIService
    AIService --> |"Emit ai_feedback to speaker"| RoomHandler
    RoomHandler --> |"Save to Transcript collection"| TranscriptDB[("MongoDB\nTranscript")]
    RoomHandler -->|"socket.emit 'ai_feedback'"| Browser
```

### 10.2 Post-Session Report Generation

```mermaid
flowchart TD
    UserLeaves["User navigates to /report/:code"]
    --> FrontendFetch["SessionReport.jsx\nGET /api/rooms/:code/review"]
    --> RoomsCtrl["roomsController.js\ngetRoomReview()"]
    --> FindSession["Session.findOne({room._id})"]
    --> FindTranscripts["Transcript.find({session._id})"]

    FindTranscripts --> CheckCache{{"Is review\nalready cached\nand valid?"}}

    CheckCache -->|"Yes"| ReturnCache["Return cached review\n(no Gemini call)"]
    CheckCache -->|"No / Error"| CallGemini

    subgraph CallGemini["Generate New Review"]
        direction LR
        BuildScript["Build transcript script\n[Name]: text..."]
        --> GeminiCall["aiService.generateSessionReview()\nGemini Flash (JSON mode)"]
        --> ParseJSON["Parse + validate JSON\nsessionSummary, overallVibe, participants[]"]
        --> StoreInDB["session.review = result\nsession.save()"]
    end

    StoreInDB --> ReturnReview["Return review to frontend"]
    ReturnCache --> ReturnReview
    ReturnReview --> RenderReport["SessionReport.jsx renders\nParticipant cards, scores, PDF export"]
```

### 10.3 Gemini Response Schema

```mermaid
graph LR
    GeminiOutput["Gemini Response (JSON)"]

    GeminiOutput --> sessionSummary["sessionSummary: string\n2-3 sentence discussion overview"]
    GeminiOutput --> overallVibe["overallVibe: string\nOne-word tone descriptor"]
    GeminiOutput --> participants["participants: array"]

    participants --> p1["{ name: string\n  overallScore: 0-100\n  strengths: string[]\n  areasForImprovement: string[]\n  feedback: string }"]
```

---

## 11. Deployment & Infrastructure

### 11.1 Docker Compose Services

```mermaid
graph TB
    Internet["🌐 Internet"] -->|":80 / :443"| Nginx

    subgraph Docker["Docker Compose — speakspace-network"]
        Nginx["Nginx (frontend container)\n• Serves React SPA static files\n• Reverse proxies /api/* → backend\n• Reverse proxies /socket.io/* → backend\n• SSL termination via Let's Encrypt"]

        Backend1["backend (replica 1)\nNode.js :4000\nExpress + Socket.IO"]
        Backend2["backend (replica 2)\nNode.js :4000\nload balanced"]

        MongoDB["mongodb\nMongo 6.0\nPersistent volume: mongodb_data"]
        Certbot["certbot\nAuto-renews SSL every 12h"]
        Dozzle["monitoring (Dozzle)\n:8080 — Docker log viewer"]
    end

    AWSEC2["AWS EC2 Instance\n(Ubuntu, t2.micro / t3.small)"]

    Nginx -->|"least_conn load balance"| Backend1 & Backend2
    Backend1 & Backend2 --> MongoDB
    Certbot -->|"Renews certs"| Nginx

    Docker --> AWSEC2
```

### 11.2 Nginx Routing Rules

| Path | Proxied To | Notes |
|---|---|---|
| `/.well-known/acme-challenge/` | Certbot webroot | Let's Encrypt challenge |
| `http://*` | `https://` redirect | Force HTTPS |
| `/api/*` | `http://speakspace_backend` | REST API upstream |
| `/socket.io/*` | `http://speakspace_backend` | WebSocket upgrade |
| `/*` | `/usr/share/nginx/html` | React SPA + `try_files /index.html` |

---

## 12. CI/CD Pipeline

```mermaid
flowchart TD
    Push["git push to\n`main` or `dev`"] --> GH["GitHub Actions Trigger"]

    GH --> Job1

    subgraph Job1["Job: build-and-test (ubuntu-latest)"]
        Checkout["actions/checkout@v4"]
        --> NodeSetup["actions/setup-node@v4 (Node 20.x)"]
        --> InstallDeps["npm install --legacy-peer-deps"]
        --> RunTests["npm test\n(Jest + supertest + mongodb-memory-server)"]
        --> BuildFrontend["cd frontend && npm run build\n(Vite production build)"]
    end

    Job1 --> IsProd{{"Is branch == main?"}}
    IsProd -->|No| Done["✅ Done (dev branch)"]
    IsProd -->|Yes| Job2

    subgraph Job2["Job: deploy (SSH to EC2)"]
        SSH["appleboy/ssh-action"]
        --> GitPull["git pull origin main"]
        --> DockerDown["docker compose down\ndocker system prune -af"]
        --> DockerUp["docker compose up --build -d"]
        --> SSLCheck{{"SSL cert exists?"}}
        SSLCheck -->|No| RequestSSL["certbot certonly\n(Let's Encrypt webroot challenge)"]
        SSLCheck -->|Yes| WriteNginx
        RequestSSL --> WriteNginx
        WriteNginx["Write production nginx.conf\n(HTTP→HTTPS redirect + SSL config)"]
        --> RestartFrontend["docker compose up -d frontend"]
    end

    Job2 --> Live["🚀 Live at https://3.88.239.189.nip.io"]
```

---

## 13. End-to-End User Journey

```mermaid
journey
    title SpeakSpace — Complete User Journey
    section Registration
        Visit landing page: 5: User
        Register with email/password: 4: User
        JWT stored in localStorage: 5: System
    section Create a Room
        Navigate to Dashboard: 5: User
        Click Create Room: 5: User
        Set title + privacy: 4: User
        Gemini generates discussion topic: 5: AI
        Room code shared via invite link: 5: System
    section Live Session
        Join room, mic permission granted: 4: User
        WebRTC peers connect (audio): 5: System
        User speaks, SpeechRecognition captures: 5: User, System
        Captions show for all participants: 5: System
        Gemini analyzes speech in real-time: 5: AI
        Fluency / confidence scores appear: 5: User
        Moderator manages queue / mutes: 4: Moderator
    section Post-Session
        User navigates to /report/:code: 5: User
        Gemini generates full session report: 5: AI
        View participant scorecards: 5: User
        Export report as PDF: 4: User
    section Profile & Growth
        Update profile / bio / skills: 5: User
        Set personal Gemini API key: 5: User
        Check analytics dashboard: 5: User
        Climb leaderboard: 5: User
```

---

## Key Design Decisions

> [!NOTE]
> **WebRTC vs Server-side Audio**: Audio is transmitted peer-to-peer via WebRTC, not routed through the server. This massively reduces server bandwidth. The Socket.IO server only relays the signaling messages (offer/answer/ICE) to set up the P2P connection.

> [!NOTE]
> **SpeechRecognition for Transcripts**: The browser's built-in `Web Speech API` (Chrome-based) is used for transcription instead of a paid transcription service. It runs entirely on-device and sends only final text to the server.

> [!TIP]
> **Gemini Key Hierarchy**: Each user can optionally save their own Gemini API key in their profile. When a session uses AI features, it first checks the moderator's personal key, then falls back to the platform's environment variable key (`GEMINI_API_KEY`).

> [!IMPORTANT]
> **Transcript Auto-Deletion**: Transcript documents have a MongoDB TTL index of **24 hours** (`expires: 86400`). Once the session review is generated and cached in the `Session.review` field, the raw transcripts are no longer needed and are automatically cleaned up.

> [!WARNING]
> **Single Region Deployment**: Currently deployed to a single AWS EC2 instance. While Docker Compose runs 2 backend replicas, both are on the same physical machine. For production scale, move to ECS/EKS or add multiple EC2s with a load balancer.
