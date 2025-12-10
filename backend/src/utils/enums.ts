enum UserRole {
    ADMIN = 'admin',
    ORGANIZER = 'organizer',
    ATTENDEE = 'attendee',
}

enum UserStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
    SUSPENDED = 'suspended',
    BANNED = 'banned'
}

enum OrganizerRequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

enum TicketCategory {
    VIP = 'vip',
    REGULAR = 'regular',
    STUDENT = 'student',
}

enum ReportStatus {
    PENDING = 'pending',
    RESOLVED = 'resolved',
    DISMISSED = 'dismissed',
}

enum BookingStatus {
    BOOKED = 'booked',
    CANCELLED = 'cancelled',
}

enum WaitingStatus {
    WAITING = 'waiting',
    PROMOTED = 'promoted'
}

export { UserRole, UserStatus, OrganizerRequestStatus, TicketCategory, ReportStatus, BookingStatus, WaitingStatus };