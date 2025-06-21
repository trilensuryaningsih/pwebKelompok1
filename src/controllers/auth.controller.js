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

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    
    if (user.role === "admin") {
      res.redirect("/admin"); // Redirect to admin home
    } else if (user.role === "pj") {
      res.redirect("/pj"); // Redirect to pj home
    } else if (user.role === "user") {
      res.redirect("/user/home"); // Redirect to user dashboard
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const logout = (req, res) => {
  try {
    // res.status(200).json({ message: "Logout berhasil" });
    req.session.destroy(() => {
      res.redirect("/user");
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
};
