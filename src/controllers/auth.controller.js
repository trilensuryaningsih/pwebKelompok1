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
      });

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
    console.log('=== LOGIN PROCESS STARTED ===');
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    
    // Validasi input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.render('auth/login', { 
        errorMessage: 'Email dan password harus diisi.' 
      });
    }
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found:', email);
      // Jika user tidak ditemukan, render kembali halaman login dengan pesan error
      return res.render('auth/login', { 
        errorMessage: 'Email atau password yang Anda masukkan salah.' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      // Jika password tidak cocok, render kembali halaman login dengan pesan error
      return res.render('auth/login', { 
        errorMessage: 'Email atau password yang Anda masukkan salah.' 
      });
    }

    console.log('✅ Login successful for user:', email, 'Role:', user.role);
    
    // Jika berhasil, simpan data user ke session
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name // Menyimpan nama user untuk ditampilkan
    };
    
    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.render('auth/login', { 
          errorMessage: 'Terjadi kesalahan saat login. Silakan coba lagi.' 
        });
      }
      
      console.log('Session saved successfully. Session ID:', req.sessionID);
      
      // Redirect berdasarkan peran (role) user
      if (user.role === "admin") {
        res.redirect("/admin");
      } else if (user.role === "pj") {
        res.redirect("/pj");
      } else {
        res.redirect("/user/home");
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', { 
      errorMessage: 'Terjadi kesalahan pada server. Silakan coba lagi.' 
    });
  }
};

const logout = (req, res) => {
  try {
    const session = req.session;
    if (!session || !session.user) {
      // Jika tidak ada session atau user, tidak ada yang perlu di-logout
      return res.redirect('/auth/login?status=already_logged_out');
    }

    console.log('=== LOGOUT PROCESS STARTED ===');
    console.log('User to be logged out:', session.user.email);

    // Hancurkan session
    session.destroy((err) => {
      // Selalu bersihkan cookie di sisi klien
      res.clearCookie('connect.sid', { path: '/' }); 
      
      if (err) {
        console.error('Error destroying session:', err);
        // Redirect dengan status gagal jika ada error
        return res.redirect('/auth/login?status=logout_failed');
      }
      
      console.log('✅ Session destroyed successfully.');
      
      // Redirect dengan status sukses
      res.redirect('/auth/login?status=logged_out');
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Jika terjadi error tak terduga, bersihkan cookie dan redirect
    res.clearCookie('connect.sid', { path: '/' });
    res.redirect('/auth/login?status=logout_failed');
  }
};

module.exports = {
  register,
  login,
  logout,
};
