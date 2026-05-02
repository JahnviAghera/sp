# MERN Stack AWS Architecture Diagrams

## 1. System Architecture Diagram

```mermaid
flowchart LR
    U[Client Browser] -->|HTTPS Requests| CF[CloudFront]
    CF -->|Serve Static Assets| S3[S3 Bucket\nReact Frontend]
    U -->|API Calls| API[Node.js + Express API\nEC2]

    CF -->|Optional cache miss for SPA| S3
    S3 -->|JS/CSS/HTML| U

    API -->|Read/Write| MDB[(MongoDB Atlas)]
    MDB -->|Query Result| API

    API -->|JSON Response| U
    API -->|Auth / CRUD / Business Logic| API

    subgraph AWS[Amazon Web Services]
        CF
        S3
        API
    end

    subgraph Data[Data Layer]
        MDB
    end
```

This diagram shows the end-to-end request path from the browser to the React frontend and backend API. It also highlights how the EC2-hosted API communicates with MongoDB Atlas for persistence.

## 2. Deployment Architecture Diagram

```mermaid
flowchart TB
    U[Users / Browsers]

    subgraph AWS[AWS Cloud]
        CF[CloudFront Distribution]
        S3[S3 Bucket\nStatic React Build]
        EC2[EC2 Instance\nNode.js + Express]
        SG[Security Group / VPC Rules]
    end

    MDB[(MongoDB Atlas\nExternal Managed DB)]

    U -->|HTTPS| CF
    CF -->|Static Assets| S3
    CF -->|API Proxy / Origin Route| EC2
    U -->|API Requests via CloudFront or Direct API URL| EC2

    EC2 --> SG
    EC2 -->|Outbound HTTPS| MDB

    subgraph Optional[Optional CI/CD]
        GH[GitHub Repository]
        GA[GitHub Actions]
        GH --> GA
        GA -->|Build Frontend| S3
        GA -->|Deploy Backend| EC2
    end
```

This deployment view clarifies hosting responsibilities across AWS services. It emphasizes static hosting on S3, content delivery via CloudFront, backend execution on EC2, and external database connectivity to MongoDB Atlas.

## 3. Data Flow Diagram - Level 0

```mermaid
flowchart LR
    U[User]
    SYS((MERN Application))
    DB[(MongoDB Atlas)]

    U -->|Login, CRUD, API Requests| SYS
    SYS -->|Auth Results, Data, Status| U
    SYS -->|Read / Write| DB
    DB -->|Stored Records| SYS
```

This Level 0 DFD gives the highest-level view of how a user interacts with the system. It shows the application as a single process that exchanges data with the user and the database.

## 3. Data Flow Diagram - Level 1

```mermaid
flowchart TB
    U[User]

    P1((Authentication))
    P2((CRUD Operations))
    P3((API Processing))
    P4((Data Persistence))

    DB[(MongoDB Atlas)]

    U -->|Register / Login| P1
    P1 -->|Token / Session Result| U
    P1 -->|User Lookup / Create User| P4

    U -->|Create / Read / Update / Delete| P2
    P2 -->|Validate Request| P3
    P3 -->|Business Rules| P4

    P4 -->|Query / Save / Update| DB
    DB -->|Documents / Query Result| P4
    P4 -->|Response Payload| P3
    P3 -->|API Response| P2
    P2 -->|Success / Error| U
```

This Level 1 DFD breaks the system into core processes: authentication, CRUD handling, API processing, and persistence. It is useful for academic evaluation because it shows functional decomposition and data movement clearly.

## 4. User Flowchart

```mermaid
flowchart TD
    A([Start]) --> B[Open App]
    B --> C{Existing Account?}

    C -->|No| D[Register]
    D --> E[Submit Registration]
    E --> F{Valid?}
    F -->|No| D
    F -->|Yes| G[Login]

    C -->|Yes| G[Login]
    G --> H{Authentication Success?}
    H -->|No| G
    H -->|Yes| I[Open Dashboard]

    I --> J[View / Search / Filter Data]
    J --> K{User Action}
    K -->|Create| L[Create Record]
    K -->|Read| M[View Record]
    K -->|Update| N[Edit Record]
    K -->|Delete| O[Remove Record]

    L --> P[Save Changes]
    M --> I
    N --> P
    O --> P

    P --> Q[Refresh Dashboard]
    Q --> R[Logout]
    R --> S([End])
```

This flowchart tracks the user journey from registration and login through dashboard usage and CRUD actions. It demonstrates how the UI supports a complete session lifecycle.

## 5. Backend Flowchart

```mermaid
flowchart TD
    A[Incoming HTTP Request] --> B[Route Handler]
    B --> C[Controller]
    C --> D[Service Layer]
    D --> E[Model / Schema]
    E --> F[MongoDB Database]

    F --> G[Query Result]
    G --> E
    E --> D
    D --> C
    C --> H[Format Response]
    H --> I[Send JSON Response]

    C --> J{Validation / Error?}
    D --> J
    E --> J
    J -->|Yes| K[Error Handler]
    K --> I
```

This backend flowchart shows the request lifecycle from routing to database access and back to the client. It highlights separation of concerns through route, controller, service, model, and response layers.

## 6. Database Schema Diagram

```mermaid
erDiagram
    USER ||--o{ ROOM : creates
    USER ||--o{ SESSION : participates
    USER ||--o{ MESSAGE : sends
    USER ||--o{ NOTIFICATION : receives
    ROOM ||--o{ SESSION : contains
    ROOM ||--o{ MESSAGE : contains
    ROOM ||--o{ TRANSCRIPT : generates
    ROOM ||--o{ SCHEDULE : scheduled_for
    SESSION ||--o{ ANALYTICS : produces
    SESSION ||--o{ TRANSCRIPT : records

    USER {
        string _id PK
        string name
        string email
        string passwordHash
        string role
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    ROOM {
        string _id PK
        string name
        string description
        string createdBy FK
        string status
        datetime createdAt
        datetime updatedAt
    }

    SESSION {
        string _id PK
        string roomId FK
        string userId FK
        datetime startedAt
        datetime endedAt
        string status
    }

    MESSAGE {
        string _id PK
        string roomId FK
        string senderId FK
        string content
        datetime sentAt
    }

    NOTIFICATION {
        string _id PK
        string userId FK
        string type
        string message
        boolean read
        datetime createdAt
    }

    TRANSCRIPT {
        string _id PK
        string roomId FK
        string sessionId FK
        string text
        datetime createdAt
    }

    ANALYTICS {
        string _id PK
        string sessionId FK
        number duration
        number messageCount
        number participantsCount
        datetime createdAt
    }

    SCHEDULE {
        string _id PK
        string roomId FK
        string title
        datetime startTime
        datetime endTime
        string createdBy FK
    }
```

This ER diagram outlines the main collections and relationships in the MongoDB schema. It shows how users, rooms, sessions, messages, transcripts, analytics, notifications, and schedules connect through references.

## 7. MVC Architecture Diagram

```mermaid
flowchart LR
    subgraph V[View]
        FE[React Frontend]
        UI[UI Components]
    end

    subgraph C[Controller]
        RC[Express Routes]
        CTRL[Controllers]
    end

    subgraph M[Model]
        MOD[MongoDB Models / Schemas]
        DB[(MongoDB Atlas)]
    end

    FE -->|User Interaction| RC
    RC --> CTRL
    CTRL -->|Business Request| MOD
    MOD --> DB
    DB --> MOD
    MOD --> CTRL
    CTRL -->|JSON Data| FE

    FE --> UI
```

This MVC diagram separates presentation, request handling, and persistence. It makes the architecture easy to evaluate because the frontend, controllers, and database models are visually isolated.

## 8. CI/CD Pipeline Diagram

```mermaid
flowchart LR
    A[Developer Pushes Code] --> B[GitHub Repository]
    B --> C[GitHub Actions Trigger]
    C --> D[Install Dependencies]
    D --> E[Build Frontend]
    E --> F[Run Tests]
    F --> G{Tests Passed?}

    G -->|No| H[Fail Pipeline]
    G -->|Yes| I[Deploy Frontend to S3]
    I --> J[Invalidate CloudFront Cache]
    J --> K[Deploy Backend to EC2]
    K --> L[Post-Deploy Verification]
    L --> M[Pipeline Complete]
```

This CI/CD flow shows a standard GitHub Actions pipeline from code push to deployment. It demonstrates automated build, test, deployment, and cache invalidation for a production AWS release.
