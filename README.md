# Contact Book Backend
Node.js + Express + SQLite REST API

## API Endpoints

| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| GET    | /health           | Health check             |
| GET    | /contacts         | List all contacts        |
| GET    | /contacts?search= | Search by name/email/phone |
| GET    | /contacts?page=&limit= | Paginated list      |
| GET    | /contacts/:id     | Get one contact          |
| POST   | /contacts         | Create contact           |
| PUT    | /contacts/:id     | Update contact           |
| DELETE | /contacts/:id     | Delete contact           |

## Request Body (POST / PUT)
```json
{
  "name": "Jane Doe",
  "phone": "+91-9876543210",
  "email": "jane@example.com",
  "address": "123 MG Road, Bengaluru",
  "notes": "Met at conference"
}
```

## EC2 Deployment (Same Instance - SQLite)

### 1. SSH into EC2
```bash
ssh -i my-key.pem ec2-user@<YOUR-EC2-IP>
```

### 2. Install Node.js
```bash
# Amazon Linux 2023
sudo dnf install nodejs -y

# Ubuntu 22.04
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install nodejs -y
```

### 3. Upload project files
```bash
# From your local machine
scp -i my-key.pem -r ./contact-book-backend ec2-user@<IP>:~/
```

### 4. Install dependencies & start
```bash
cd ~/contact-book-backend
npm install
cp .env.example .env
```

### 5. Run with PM2 (keeps app alive)
```bash
npm install -g pm2
pm2 start server.js --name contact-book
pm2 save
pm2 startup
```

### 6. Open port in AWS Security Group
- EC2 Console → Security Groups → Edit Inbound Rules
- Add: Custom TCP, Port 3000, Source: Anywhere (0.0.0.0/0)

### 7. Test
```bash
curl http://<YOUR-EC2-IP>:3000/health
curl -X POST http://<YOUR-EC2-IP>:3000/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","phone":"9876543210","email":"jane@example.com"}'
```

## Files
- server.js       — Express app entry point
- db.js           — SQLite connection + schema setup
- routes/contacts.js — All CRUD route handlers
- package.json    — Dependencies
- .env.example    — Environment variable template
- contacts.db     — Auto-created on first run (SQLite file)
