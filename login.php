<?php
// 1. Mulai session
session_start();

// 2. Jika sudah login, redirect ke halaman admin
if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    header("location: admin.php");
    exit;
}

// 3. Sertakan file koneksi database
include 'includes/db.php';

$username = $password = "";
$error_message = "";

// 4. Proses data form saat form disubmit
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Cek apakah username kosong
    if (empty(trim($_POST["username"]))) {
        $error_message = "Silakan masukkan username.";
    } else {
        $username = trim($_POST["username"]);
    }

    // Cek apakah password kosong
    if (empty(trim($_POST["password"]))) {
        $error_message = "Silakan masukkan password Anda.";
    } else {
        $password = trim($_POST["password"]);
    }

    // Validasi kredensial
    if (empty($error_message)) {
        $sql = "SELECT id, username, password FROM users WHERE username = ?";
        
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param("s", $param_username);
            $param_username = $username;
            
            if ($stmt->execute()) {
                $stmt->store_result();
                
                // Cek jika username ada, lalu verifikasi password
                if ($stmt->num_rows == 1) {
                    $stmt->bind_result($id, $username, $hashed_password);
                    if ($stmt->fetch()) {
                        if (password_verify($password, $hashed_password)) {
                            // Password benar, mulai session baru
                            session_start();
                            
                            // Simpan data di session
                            $_SESSION["loggedin"] = true;
                            $_SESSION["id"] = $id;
                            $_SESSION["username"] = $username;                            
                            
                            // Redirect ke halaman admin
                            header("location: admin.php");
                        } else {
                            // Password tidak valid
                            $error_message = "Username atau password yang Anda masukkan tidak valid.";
                        }
                    }
                } else {
                    // Username tidak ditemukan
                    $error_message = "Username atau password yang Anda masukkan tidak valid.";
                }
            } else {
                echo "Oops! Terjadi kesalahan. Silakan coba lagi nanti.";
            }

            $stmt->close();
        }
    }
    
    $conn->close();
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Admin - Idiomatch</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #4A90E2;
            --background-color: #f4f7f6;
            --text-color: #333;
            --card-bg-color: #ffffff;
            --shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            --border-radius: 12px;
            --error-color: #E94E77;
        }
        body {
            font-family: 'Poppins', sans-serif;
            background-color: var(--background-color);
            color: var(--text-color);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        .login-container {
            width: 100%;
            max-width: 400px;
            padding: 20px;
        }
        .login-card {
            background-color: var(--card-bg-color);
            padding: 40px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            text-align: center;
        }
        .login-card h1 {
            color: var(--primary-color);
            margin-top: 0;
            margin-bottom: 10px;
        }
        .login-card p {
            margin-bottom: 30px;
            color: #777;
        }
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }
        .form-control {
            width: 100%;
            padding: 12px 15px;
            font-size: 1rem;
            border: 2px solid #ddd;
            border-radius: 8px;
            box-sizing: border-box;
            transition: border-color 0.3s ease;
        }
        .form-control:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        .btn {
            width: 100%;
            padding: 12px 25px;
            border-radius: 8px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            background-color: var(--primary-color);
            color: white;
            font-size: 1rem;
        }
        .btn:hover {
            opacity: 0.9;
        }
        .error-message {
            color: var(--error-color);
            background-color: #fdd;
            border: 1px solid var(--error-color);
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <h1>Admin Login</h1>
            <p>Silakan masuk untuk mengelola idiom.</p>

            <?php 
            if(!empty($error_message)){
                echo '<div class="error-message">' . $error_message . '</div>';
            }        
            ?>

            <form action="login.php" method="post">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" name="username" id="username" class="form-control" value="<?= htmlspecialchars($username); ?>">
                </div>    
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" name="password" id="password" class="form-control">
                </div>
                <div class="form-group">
                    <button type="submit" class="btn">Login</button>
                </div>
            </form>
        </div>
    </div>
</body>
</html>