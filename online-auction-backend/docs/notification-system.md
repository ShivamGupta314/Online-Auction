# Notification System Documentation

The Online Auction platform includes a comprehensive notification system to keep users informed about important events and actions. This system enhances user engagement and provides timely updates about auction activities.

## Features

### Automated Notifications

The system automatically generates and sends email notifications for the following events:

1. **New Bid Notifications**
   - Triggered when a new bid is placed on a product
   - Sent to the seller of the product
   - Contains information about the bid amount and bidder

2. **Outbid Notifications**
   - Triggered when a user's bid is surpassed by another bid
   - Sent to the previously highest bidder
   - Encourages the user to place a new bid

3. **Auction Won Notifications**
   - Triggered when an auction ends and a winner is determined
   - Sent to the winning bidder
   - Contains details about the product and payment instructions

4. **Auction Ended Notifications**
   - Triggered when an auction ends
   - Sent to the seller
   - Contains information about the outcome (sold or unsold)

### Manual Notifications

Administrators and sellers can also send manual notifications:

1. **User-Specific Notifications**
   - Administrators can send notifications to specific users
   - Useful for account-related information or customer support

2. **Role-Based Broadcasts**
   - Administrators can send broadcast messages to all users with a specific role (ADMIN, SELLER, BIDDER)
   - Useful for announcements or platform updates

3. **Product Bidder Notifications**
   - Sellers can send notifications to all users who have bid on their products
   - Administrators can also send these notifications for any product
   - Useful for product updates or auction changes

## Technical Implementation

### Email Service

The system uses Nodemailer for sending emails:

- **Production Mode**: Connects to a configured SMTP server
- **Development Mode**: Automatically creates an Ethereal email account for testing

Configuration via environment variables:
```
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@your-domain.com
```

### Scheduled Jobs

The notification system includes scheduled tasks using node-cron:

1. **Process Ended Auctions**
   - Runs every 5 minutes
   - Identifies auctions that have recently ended
   - Sends appropriate notifications to winners and sellers
   - Marks auctions as processed

2. **Send Auction Ending Reminders**
   - Runs daily at 9 AM
   - Identifies auctions ending within the next 24 hours
   - Reserved for future implementation of bidder reminders

## API Endpoints

### User Notifications

```
POST /api/notifications/user
```

**Request Body:**
```json
{
  "userId": 123,
  "subject": "Important Account Update",
  "message": "Your account has been upgraded to premium status."
}
```

**Authorization:** Admin only

### Role Broadcasts

```
POST /api/notifications/broadcast
```

**Request Body:**
```json
{
  "role": "BIDDER",
  "subject": "New Feature Announcement",
  "message": "We've added a new watchlist feature to help you track favorite auctions."
}
```

**Authorization:** Admin only

### Product Bidder Notifications

```
POST /api/notifications/product-bidders
```

**Request Body:**
```json
{
  "productId": 456,
  "subject": "Product Information Update",
  "message": "We've added new photos and details about the item you bid on."
}
```

**Authorization:** Admin or the product's seller

## Email Templates

The system includes professionally designed email templates for all notification types:

- Responsive design that works on desktop and mobile
- Branded appearance with appropriate colors
- Clear call-to-action buttons
- Plain text alternatives for email clients that don't support HTML

## Testing

The notification system includes comprehensive unit tests:

- Mocked email sending to avoid actual emails during testing
- Tests for all notification types and endpoints
- Tests for authorization and validation

## Extending the System

To add a new notification type:

1. Create a new template function in `src/utils/emailService.js`
2. Add a notification service function in `src/services/notification.service.js`
3. Trigger the notification at the appropriate point in the application
4. Add appropriate tests

## Best Practices

- Always use asynchronous sending to avoid blocking the main application
- Include clear subject lines and concise messages
- Provide direct links to relevant pages in the application
- Respect user preferences and privacy
- Monitor delivery rates and optimize as needed 