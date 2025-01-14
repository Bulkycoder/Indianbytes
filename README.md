# Indian Bytes - Food Delivery Website

A modern food delivery website for Indian Bytes restaurant with user and admin panels.

## Features

### User Panel
- Browse food items by category
- Search functionality
- Real-time order status
- Order tracking
- User profile management
- Beautiful UI with red gradient theme

### Admin Panel
- Real-time order notifications
- Order management
- Food item management
- User management
- Search functionality

## Setup Instructions

1. Database Setup:
   - Create a MySQL database named `indian_bytes`
   - Import the `database.sql` file to create the required tables

2. Configuration:
   - Update database credentials in `config.php`
   ```php
   $host = 'localhost';
   $dbname = 'indian_bytes';
   $username = 'your_username';
   $password = 'your_password';
   ```

3. File Structure:
   ```
   indian_bytes/
   ├── api/
   │   ├── food.php
   │   └── orders.php
   ├── uploads/
   ├── admin.html
   ├── admin-styles.css
   ├── Admin.js
   ├── app.js
   ├── config.php
   ├── database.sql
   ├── index.html
   └── styles.css
   ```

4. Hosting on InfinityFree:
   - Create an account on InfinityFree
   - Create a new hosting account
   - Upload all files to the `htdocs` or `public_html` directory
   - Update the database credentials in `config.php` with the provided MySQL details

5. File Permissions:
   - Set the `uploads` directory permissions to 755
   - Ensure PHP has write permissions to the `uploads` directory

## Technologies Used
- HTML5, CSS3, JavaScript
- PHP 7.4+
- MySQL
- Modern UI with CSS Grid and Flexbox
- CSS Animations and Transitions

## Security Features
- SQL Injection prevention using PDO
- XSS protection
- Secure file upload handling
- Input validation and sanitization

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes
- The website uses a responsive design that works on all devices
- Real-time order notifications for admin
- Secure order processing
- Easy to customize theme and layout

## License
MIT License - Feel free to use this for your restaurant!
