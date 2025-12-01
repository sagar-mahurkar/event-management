## Backend Folder Structure (Express + TypeORM + PostgreSQL)

```shell
backend/
│
├── src/
│   ├── config/
│   │   ├── app.ts                # Express server config
│   │   ├── data-source.ts
│   │   ├── database.ts           # TypeORM DataSource config
│   │   ├── mail-transporter.ts
│   │   └── redis.ts              # Optional Redis client
│   │
│   ├── controllers/
│   │   ├── AdminController.ts
│   │   ├── AuthController.ts
│   │   ├── BookingController.ts
│   │   ├── EventController.ts
│   │   ├── ReportController.ts
│   │   ├── ReviewController.ts
│   │   ├── TicketController.ts
│   │   └── UserController.ts
│   │
│   ├── entities/
│   │   ├── Booking.ts
│   │   ├── Event.ts
│   │   ├── Report.ts
│   │   ├── Review.ts
│   │   ├── TicketType.ts
│   │   ├── User.ts
│   │   └── Waitlist.ts 
│   │
│   ├── html-templates/
│   │   └── otp.html
│   │
│   ├── middleware/
│   │   ├── authMiddleware.ts      # JWT verification
│   │   ├── errorHandler.ts
│   │   ├── roleMiddleware.ts      # role-based access control
│   │   └── uploadMiddleware.ts    # Multer for images/videos
│   │
│   ├── routes/
│   │   ├── admin.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── event.routes.ts
│   │   ├── report.routes.ts
│   │   ├── review.routes.ts
│   │   └── ticket.routes.ts
│   │
│   ├── seed/
│   │   └── seedAdmin.ts           # Create default admin on startup
│   │
│   ├── services/
│   │   ├── AuthService.ts
│   │   ├── BookingService.ts
│   │   ├── EventService.ts
│   │   ├── ReportService.ts
│   │   ├── ReviewService.ts
│   │   ├── TicketService.ts
│   │   └── UserService.ts
│   │
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── enums.ts
│   │   ├── jwt.ts                 # JWT helpers
│   │   ├── logger.ts
│   │   ├── repositories.ts
│   │   ├── response-generator.ts
│   │   └── validators.ts
│   │
│   └── index.ts                   # Entry point
│ 
├── package-lock.json
├── package.json
├── tsconfig.json
└── README.md

```

## Clear separation:

- Controllers → Receive HTTP requests, validates input, calls service, returns response

- Services → Business logic, DB operations, hashing, mailing, token creation

- Entities → Database tables

- Routes → API endpoints

- Middleware → Auth, validation


## Entities & Relationships

### 1. User
```
User
---------
id (PK)
name
email (unique)
password
role (enum: admin, organizer, attendee)
isApproved (boolean, applicable for organizers)
createdAt
updatedAt
```

#### Relationships:

- User (Organizer) 1 → many Event

- User (Attendee) 1 → many Booking

- User (Attendee) 1 → many Review

- User 1 → many Reports (optional)

### 2. Event
```
Event
---------
id (PK)
title
description
dateTime
bannerImage
teaserVideo
location
category
capacity
createdBy (FK → User.id)
createdAt
updatedAt
```

#### Relationships:

- Event many → 1 User (Organizer)

- Event 1 → many TicketType

- Event 1 → many Booking

- Event 1 → many Review

- Event 1 → many Report (optional)

- Event 1 → many Waitlist (optional)

### 3. TicketType
```
TicketType
---------
id (PK)
eventId (FK → Event.id)
name (VIP, Regular, Early Bird etc.)
price
limit
dynamicPricingRules (JSON)  // optional
createdAt
updatedAt
```

#### Relationships:

- TicketType many → 1 Event

- TicketType 1 → many Booking

### 4. Booking
```
Booking
---------
id (PK)
userId (FK → User.id)
eventId (FK → Event.id)
ticketTypeId (FK → TicketType.id)
quantity
totalPrice
status (booked, cancelled)
createdAt
```

#### Relationships:

- Booking many → 1 User

- Booking many → 1 Event

- Booking many → 1 TicketType


### 5. Review
```
Review
---------
id (PK)
userId (FK → User.id)
eventId (FK → Event.id)
rating
reviewText
media (JSON array – optional)
createdAt
```

#### Relationships:

- Review many → 1 User

- Review many → 1 Event

### 6. Report (For Admin features)
```
Report
---------
id (PK)
eventId (FK → Event.id)
reportedBy (FK → User.id)
reason
status (pending, resolved)
createdAt
```

#### Relationships:

- Report many → 1 Event

- Report many → 1 User


### 7. Waitlist
```
Waitlist
---------
id (PK)
eventId (FK → Event.id)
userId (FK → User.id)
position
status (waiting, promoted)
createdAt
```

#### Relationships:

- Waitlist many → 1 Event

- Waitlist many → 1 User
