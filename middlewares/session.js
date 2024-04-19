// session.js

const session = require('express-session');

// Tạo một hàm middleware để cấu hình session
function configureSessionMiddleware() {
  return session({
    secret: 'BuiQuocQuan2002', // Thay 'secret' bằng một chuỗi bí mật
    resave: false,
    saveUninitialized: true
  });
}

module.exports = configureSessionMiddleware;
