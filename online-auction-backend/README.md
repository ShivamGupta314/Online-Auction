Auction Backend Progress Summary
===============================

✅ Completed Features:

🔐 Authentication:
- JWT Auth (Login/Register)
- Role-based access: SELLER, BIDDER

📦 Product Management:
- POST /api/products (SELLER only)
- GET /api/products (public)
- GET /api/products/:id/detail (includes highestBid, latestBidder, isExpired, timeLeftFormatted)

📂 Categories:
- Seeded category table
- Linked to products via categoryId

💸 Bidding System:
- POST /api/bids (BIDDER only)
- Validations: price > previous, within time window
- GET /api/bids/product/:id (paginated & sorted)
- GET /api/bids/product/:id/highest
- GET /api/bids/product/:id/summary (seller only)
- GET /api/bids/product/:id/highlight-bid (public)

🕒 Timer Logic:
- isExpired: true/false
- timeLeft: raw ms
- timeLeftFormatted: "X minutes Y seconds"

👤 Packages:
- Packages seeded
- POST /api/users/:id/packages (assign)
- GET /api/users/:id/packages (view)

----------------------------
📝 To-Do List (next steps):

⬜ Prevent self-bidding (seller cannot bid)
⬜ GET /api/bids/mine (bidder’s own bids)
⬜ Lock bidding after product.endTime
⬜ Filter products (search, category)
⬜ Mock email on new bid (notify seller)
⬜ Admin dashboard or stats (optional)
⬜ Validation via Zod or Joi (optional)
⬜ Add unit/integration tests
⬜ Rate limiting / logging for security

Reminder: You are using:
- PostgreSQL
- Prisma ORM
- Node.js (ESM)
- Express

