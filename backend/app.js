const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fssync = require('fs');

dotenv.config();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SendEmail = require('./controllers/SendEmail.js');
const SendCasErrorEmail = require('./controllers/SendCasErrorMail.js');
const LoginUser = require('./routes/Login.js');
const SignupUser = require('./routes/Signup.js');
const extract = require('./routes/extract-cas.js');
const forgotpassword = require('./routes/Forgot-password.js');
const resetpassword = require('./routes/Reset-password.js');
const get = require('./routes/get-cas.js');
const upload = require('./routes/upload.js');
const dashboard = require('./routes/dashboard.js');
const logout = require('./routes/Logout.js');
const oauthRoutes = require('./routes/oauth.js');
const userPortfolioRoute = require('./routes/userPortfolio.js'); 


const USER_LOCAL_DATA_DIR = path.join(__dirname, 'user_data_files');
const TEMP_UPLOADS_DIR = path.join(__dirname, 'temp_uploads');

if (!fssync.existsSync(USER_LOCAL_DATA_DIR)) {
    fssync.mkdirSync(USER_LOCAL_DATA_DIR, { recursive: true });
}
if (!fssync.existsSync(TEMP_UPLOADS_DIR)) {
    fssync.mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });
}

app.use('/', oauthRoutes);
app.use('/api', userPortfolioRoute);

app.post("/send-cas-error-mail", SendCasErrorEmail);
app.post("/sendemail", SendEmail);
app.post('/extract-cas', extract);
app.get('/get-cas', get);
app.post('/upload', upload);
app.get('/dashboard', dashboard);
app.post('/logout', logout);
app.post("/login", LoginUser);
app.post("/signup", SignupUser);
app.post('/forgot-password', forgotpassword);
app.post('/reset-password/:name/:token', resetpassword);

app.get("/", (req, res) => {
    res.send("🚀 Moneyantra backend is running!");
});

try {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is listening on port ${PORT}`);
  });
} catch (err) {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
}


