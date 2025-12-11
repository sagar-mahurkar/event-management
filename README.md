# Event Management System

## Overview
A full‑stack platform enabling organizers to create and manage events, attendees to book tickets and leave reviews, and admins to supervise reports and system operations.

## Features
- Role-based login (Attendee, Organizer, Admin)
- Event creation, editing, ticketing
- Ticket types (price, limit, allocation)
- Booking & cancellation
- Reviews + Ratings
- Reporting system with admin resolution
- Organizer dashboard
- Attendee dashboard with editable profile
- JWT authentication
- Cloudinary media upload support

## Technology Stack
- Frontend: React, Vite  
- Backend: Node.js, Express, TypeScript  
- Database: PostgreSQL + TypeORM  
- Auth: JWT  
- Storage: Cloudinary  

## Folder Structure
```
/backend  
    /src  
        /config
        /controllers
        /entities
        /errors
        /html-templates
        /middleware  
        /routes  
        /seed
        /services  
        /types  
        /utils  
/frontend  
    /src  
        /pages  
        /components    
        /context  
        /utils
```

## Installation

### Backend Setup
```
cd backend  
npm install  
npm run dev  
```

### Frontend Setup
```
cd frontend  
npm install  
npm run dev  
```

