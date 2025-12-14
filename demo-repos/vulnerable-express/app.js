// INTENTIONALLY VULNERABLE - FOR TESTING ONLY
// This app contains multiple security vulnerabilities for demonstration

const express = require('express')
const mysql = require('mysql')
const crypto = require('crypto')
const app = express()

app.use(express.json())

// VULNERABILITY 1: SQL Injection
app.post('/api/search', (req, res) => {
  const query = req.body.query
  
  // CRITICAL: Direct string concatenation in SQL
  const sql = `SELECT * FROM users WHERE username = '${query}'`
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})

// VULNERABILITY 2: Weak Password Hashing
app.post('/api/register', (req, res) => {
  const { username, password } = req.body
  
  // CRITICAL: MD5 is cryptographically broken
  const hashedPassword = crypto.createHash('md5').update(password).digest('hex')
  
  const sql = `INSERT INTO users (username, password) VALUES ('${username}', '${hashedPassword}')`
  db.query(sql, (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  })
})

// VULNERABILITY 3: Authentication Bypass
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  
  // CRITICAL: Hardcoded admin bypass
  if (username === 'admin' && password === 'admin123') {
    return res.json({ token: 'admin-token-12345' })
  }
  
  const hashedPassword = crypto.createHash('md5').update(password).digest('hex')
  const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${hashedPassword}'`
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    if (results.length > 0) {
      res.json({ token: 'user-token-' + Date.now() })
    } else {
      res.status(401).json({ error: 'Invalid credentials' })
    }
  })
})

// VULNERABILITY 4: XSS in User Profile
app.get('/api/profile/:username', (req, res) => {
  const username = req.params.username
  
  // CRITICAL: No sanitization before displaying user input
  const sql = `SELECT * FROM users WHERE username = '${username}'`
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    if (results.length > 0) {
      // XSS: Returning unsanitized user input
      res.send(`<h1>Profile for ${results[0].username}</h1><p>Bio: ${results[0].bio}</p>`)
    } else {
      res.status(404).send('User not found')
    }
  })
})

// VULNERABILITY 5: CORS Misconfiguration
app.use((req, res, next) => {
  // CRITICAL: Wildcard origin
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  next()
})

// VULNERABILITY 6: Information Disclosure
app.get('/api/debug', (req, res) => {
  // CRITICAL: Exposing sensitive configuration
  res.json({
    database: {
      host: 'localhost',
      user: 'root',
      password: 'super-secret-password',
      database: 'production_db'
    },
    apiKeys: {
      stripe: 'sk_live_51234567890',
      aws: 'AKIAIOSFODNN7EXAMPLE'
    }
  })
})

// VULNERABILITY 7: Path Traversal
app.get('/api/file', (req, res) => {
  const filename = req.query.name
  
  // CRITICAL: No path sanitization
  const filepath = './uploads/' + filename
  
  res.sendFile(filepath)
})

// VULNERABILITY 8: Insecure Direct Object Reference
app.get('/api/order/:id', (req, res) => {
  const orderId = req.params.id
  
  // CRITICAL: No authorization check
  const sql = `SELECT * FROM orders WHERE id = ${orderId}`
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results[0])
  })
})

// Database connection (also vulnerable)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // VULNERABILITY 9: Empty password
  database: 'test'
})

app.listen(3000, () => {
  console.log('Vulnerable app running on port 3000')
  console.log('WARNING: This app contains intentional vulnerabilities for testing')
})

module.exports = app
