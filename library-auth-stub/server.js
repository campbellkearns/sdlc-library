const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// The Library UI's dev server is the only browser page allowed to call this.
app.use(cors({ origin: ['http://localhost:4200'] }));

// The signing secret. When the Library service starts checking tokens, it needs this
// exact string. In a real system it would come from a secrets manager, never the code.
const SECRET = process.env.JWT_SECRET || 'library-shared-secret-key-32-bytes-minimum';

// A stub, not a user store: two hard-coded users, plain-text passwords.
// Week 6 replaces it with a real auth service that answers the same way.
const USERS = {
  rosa: { password: 'librarian123', roles: ['LIBRARIAN'] },
  sam: { password: 'reader123', roles: ['READER'] },
};

// The same contract as Week 6's NestJS auth service:
// POST /auth/login with { username, password } answers { accessToken, refreshToken }.
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = USERS[username];
  if (!user || user.password !== password) {
    return res.status(401).json({
      statusCode: 401,
      message: 'invalid username or password',
      error: 'Unauthorized',
    });
  }
  const accessToken = jwt.sign(
    { sub: username, roles: user.roles },
    SECRET,
    { algorithm: 'HS256', expiresIn: '1h' },
  );
  // Not used this week. Returned because the real service returns one too.
  const refreshToken = crypto.randomBytes(32).toString('hex');
  res.json({ accessToken, refreshToken });
});

app.get('/health', (req, res) => res.json({ status: 'up' }));

// Port 3000, the same as the Week 6 auth service, so the swap needs no change in the UI.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`library-auth-stub listening on http://localhost:${PORT}`);
  console.log(`Try: curl -s -X POST http://localhost:${PORT}/auth/login -H "Content-Type: application/json" -d '{"username":"rosa","password":"librarian123"}'`);
});
