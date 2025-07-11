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

const SendEmail = require('./Controllers/SendEmail.js');
const SendCasErrorEmail = require('./Controllers/SendCasErrorMail.js');
const LoginUser = require('./Routes/Login.js');
const SignupUser = require('./Routes/Signup.js');
const extract = require('./Routes/extract-cas.js');
const forgotpassword = require('./Routes/Forgot-password.js');
const resetpassword = require('./Routes/Reset-password.js');
const get = require('./Routes/get-cas.js');
const upload = require('./Routes/upload.js');
const dashboard = require('./Routes/dashboard.js');
const logout = require('./Routes/Logout.js');

const USER_LOCAL_DATA_DIR = path.join(__dirname, 'user_data_files');
const TEMP_UPLOADS_DIR = path.join(__dirname, 'temp_uploads');

if (!fssync.existsSync(USER_LOCAL_DATA_DIR)) {
    fssync.mkdirSync(USER_LOCAL_DATA_DIR, { recursive: true });
}
if (!fssync.existsSync(TEMP_UPLOADS_DIR)) {
    fssync.mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });
}

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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
