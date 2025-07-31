const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fssync = require('fs');

dotenv.config();

const app = express();

// ✅ CORS OPTIONS
const corsOptions = {
  origin: ["http://localhost:5173", "https://your-production-site.com"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Create necessary folders
const USER_LOCAL_DATA_DIR = path.join(__dirname, 'user_data_files');
const TEMP_UPLOADS_DIR = path.join(__dirname, 'temp_uploads');

[USER_LOCAL_DATA_DIR, TEMP_UPLOADS_DIR].forEach(dir => {
  if (!fssync.existsSync(dir)) fssync.mkdirSync(dir, { recursive: true });
});

// ✅ Controllers and Route Handlers
const SendEmail = require('./Controllers/SendEmail.js');
const SendCasErrorEmail = require('./Controllers/SendCasErrorMail.js');

// ✅ Route Modules
const LoginUser = require('./Routes/Login.js');
const SignupUser = require('./Routes/Signup.js');
const ExtractCAS = require('./Routes/extract-cas.js');
const ForgotPassword = require('./Routes/Forgot-password.js');
const ResetPassword = require('./Routes/Reset-password.js'); // router
const GetCAS = require('./Routes/get-cas.js');
const Upload = require('./Routes/upload.js');
const Dashboard = require('./Routes/dashboard.js');
const Logout = require('./Routes/Logout.js');
const OAuthRoutes = require('./Routes/oauth.js');
const CalculateTaxRoute = require('./Routes/calculateTax.js');

// ✅ Register Routers
app.use('/', OAuthRoutes);
app.use('/api', CalculateTaxRoute);
app.use('/reset-password', ResetPassword); // ✅ adjusted correctly

// ✅ Individual controller routes
app.post("/send-cas-error-mail", SendCasErrorEmail);
app.post("/sendemail", SendEmail);
app.post('/extract-cas', ExtractCAS);
app.get('/get-cas', GetCAS);
app.post('/upload', Upload);
app.get('/dashboard', Dashboard);
app.post('/logout', Logout);
app.post("/login", LoginUser);
app.post("/signup", SignupUser);
app.post('/forgot-password', ForgotPassword);

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("🚀 Moneyantra backend is running!");
});

// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server is listening on port ${PORT}`);
});
