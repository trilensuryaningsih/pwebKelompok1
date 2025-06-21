const bcrypt = require("bcrypt");
const { User } = require("../models");
//include dotenv
require("dotenv").config();

const register = async (req, res) => {
  try {
    // const { nama, password, email, no_hp, confirmPassword } = req.body;
    const nama = req.body.nama;
    const password = req.body.password;
    const email = req.body.email;
    const no_hp = req.body.no_hp;
    const confirmPassword = req.body.confirmPassword;
    
    
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords tidak sama" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    try {
      const user = await User.create({
        name: nama,
        password: hashedPassword,
        phone_number: no_hp,
        email,
        role: "user", 
      });//

      // Redirect ke halaman home setelah registrasi berhasil
      res.redirect("/auth/login");
    } catch (error) {
      res.render("auth/register", { errorMessage: error.message });
    }
  } catch (error) { 
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "Username atau Password salah" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Username atau Password salah" });
    }

    // Regenerate session for security
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).json({ message: 'Session error' });
      }

      // Set session data
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone_number: user.phone_number,
        loginTime: new Date()
      };

      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session save error' });
        }

        // Redirect based on role
        if (user.role === "admin") {
          res.redirect("/admin"); // Redirect to admin home
        } else if (user.role === "pj") {
          res.redirect("/pj"); // Redirect to pj home
        } else if (user.role === "user") {
          res.redirect("/user/orders"); // Redirect to user home
        }
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const logout = (req, res) => {
  try {
    // Destroy session completely
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: 'Logout error' });
      }
      
      // Clear session cookie
      res.clearCookie('sessionId');
      res.redirect("/user");
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Middleware to check session validity
const checkSession = (req, res, next) => {
  if (req.session && req.session.user) {
    // Check if session is not too old (optional additional check)
    const sessionAge = Date.now() - new Date(req.session.user.loginTime).getTime();
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (sessionAge > maxSessionAge) {
      // Session is too old, destroy it
      req.session.destroy(() => {
        res.clearCookie('sessionId');
        return res.redirect('/auth/login');
      });
    } else {
      // Update login time to extend session
      req.session.user.loginTime = new Date();
      next();
    }
  } else {
    next();
  }
};

module.exports = {
  register,
  login,
  logout,
  checkSession
};
