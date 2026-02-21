# MySQL Database Connection Guide

This guide will help you connect your Hostel Management System to a real MySQL database.

## Current Configuration

Your application is already configured for MySQL in [`application.yml`](../backend/app/src/main/resources/application.yml):

```yaml
datasource:
  url: jdbc:mysql://localhost:3306/hostel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
  username: ${DB_USERNAME:root}
  password: ${DB_PASSWORD:}
  driver-class-name: com.mysql.cj.jdbc.Driver
```

The MySQL connector dependency is already in [`pom.xml`](../backend/app/pom.xml).

---

## Step 1: Verify MySQL Installation and Check/Reset Password

### Option A: Try connecting with empty password (common default)

Open Command Prompt or PowerShell and run:

```cmd
mysql -u root
```

If this works, your root password is empty. Skip to Step 2.

### Option B: Try with password prompt

```cmd
mysql -u root -p
```

Enter any password you might have set.

### Option C: Reset the root password if you forgot it

1. **Stop MySQL service:**
   ```cmd
   net stop MySQL
   ```
   Or check Services app (Win+R, type `services.msc`) to find the exact service name (could be MySQL, MySQL80, etc.)

2. **Start MySQL in skip-grant-tables mode:**
   ```cmd
   mysqld --console --skip-grant-tables --shared-memory
   ```

3. **Open a new terminal and connect:**
   ```cmd
   mysql -u root
   ```

4. **Reset the password:**
   ```sql
   FLUSH PRIVILEGES;
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
   FLUSH PRIVILEGES;
   EXIT;
   ```

5. **Stop the skip-grant-tables MySQL (Ctrl+C) and start the service normally:**
   ```cmd
   net start MySQL
   ```

---

## Step 2: Create the Database

Once you can connect to MySQL, create the database:

```sql
CREATE DATABASE hostel_db;
```

Verify it was created:

```sql
SHOW DATABASES;
```

You should see `hostel_db` in the list.

---

## Step 3: Configure Application Credentials

### Option A: Edit application.yml directly

Edit [`backend/app/src/main/resources/application.yml`](../backend/app/src/main/resources/application.yml):

```yaml
datasource:
  url: jdbc:mysql://localhost:3306/hostel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
  username: root
  password: your_actual_password
```

### Option B: Use environment variables (recommended for security)

Set environment variables before running the app:

**Command Prompt:**
```cmd
set DB_USERNAME=root
set DB_PASSWORD=your_actual_password
```

**PowerShell:**
```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_actual_password"
```

---

## Step 4: Run the Application

Navigate to the backend directory and run:

```cmd
cd backend\app
mvnw.cmd spring-boot:run
```

### What happens on first run:

1. **Flyway migrations** will automatically create all tables
2. Check the console for: `Successfully applied 2 migrations`
3. The seed data from [`V2__seed.sql`](../backend/app/src/main/resources/db/migration/V2__seed.sql) will be inserted

---

## Troubleshooting

### Connection refused
- Make sure MySQL is running: `net start MySQL`
- Check MySQL is on port 3306: `mysql -u root -p -e "SHOW VARIABLES LIKE 'port';"`

### Access denied for user
- Double-check your username and password
- Try: `mysql -u root -p` to verify credentials work

### Unknown database 'hostel_db'
- Run: `CREATE DATABASE hostel_db;`

### Flyway validation failed
- Tables might already exist. Either drop the database and recreate, or use `spring.flyway.clean-disabled: false`

---

## Quick Reference

| Task | Command |
|------|---------|
| Connect to MySQL | `mysql -u root -p` |
| Create database | `CREATE DATABASE hostel_db;` |
| Show databases | `SHOW DATABASES;` |
| Use database | `USE hostel_db;` |
| Show tables | `SHOW TABLES;` |
| Start MySQL service | `net start MySQL` |
| Stop MySQL service | `net stop MySQL` |

---

## Next Steps

After completing these steps, your application will be connected to MySQL. The Flyway migrations will handle creating all the necessary tables automatically.
