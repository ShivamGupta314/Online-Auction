import express from 'express';

const app = express();

app.use(express.json());

app.get('/api/admin/dashboard', (req, res) => {
  res.status(200).json({
    counts: { users: 10, products: 25 },
    usersByRole: [{ role: 'ADMIN', count: 2 }],
    products: [{ status: 'ACTIVE', count: 15 }],
    bids: [{ day: '2023-05-01', count: 12 }],
    topCategories: [{ name: 'Electronics', count: 8 }]
  });
});

app.get('/api/admin/users', (req, res) => {
  res.status(200).json([
    { id: 1, username: 'admin1', role: 'ADMIN' }
  ]);
});

app.put('/api/admin/users/:id/role', (req, res) => {
  const userId = parseInt(req.params.id);
  const { role } = req.body;
  
  res.status(200).json({
    id: userId,
    role: role
  });
});

app.get('/api/admin/products/problematic', (req, res) => {
  res.status(200).json([
    { id: 1, name: 'Expired Product' }
  ]);
});

// Allow non-admin to test authorization
app.get('/api/admin/*', (req, res) => {
  const authHeader = req.headers.authorization || '';
  
  if (authHeader.includes('nonAdmin')) {
    return res.status(403).json({ message: 'Forbidden: Insufficient role' });
  }
  
  res.status(200).json({ message: 'OK' });
});

export default app; 