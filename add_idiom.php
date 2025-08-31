<?php
// Mulai session
session_start();
 
// Cek jika pengguna belum login, maka redirect ke halaman login
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: login.php");
    exit;
}
?>

<?php
// 1. Sertakan file koneksi database
include 'includes/db.php';

$message = ''; // Variabel untuk menyimpan pesan notifikasi

// 2. Cek apakah form telah disubmit menggunakan metode POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // 3. Ambil dan bersihkan data dari form
    $idiom = trim($_POST['idiom']);
    $meaning_id = trim($_POST['meaning_id']);
    $example_sentence = trim($_POST['example_sentence']);
    $sentence_translation = trim($_POST['sentence_translation']);
    $example_conversation = trim($_POST['example_conversation']);

    // 4. Validasi sederhana: pastikan semua field terisi
    if (!empty($idiom) && !empty($meaning_id) && !empty($example_sentence) && !empty($sentence_translation) && !empty($example_conversation)) {
        
        // 5. Siapkan query SQL dengan prepared statement untuk keamanan
        $sql = "INSERT INTO idioms (idiom, meaning_id, example_sentence, sentence_translation, example_conversation) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        
        // 6. Bind parameter ke statement
        $stmt->bind_param("sssss", $idiom, $meaning_id, $example_sentence, $sentence_translation, $example_conversation);
        
        // 7. Eksekusi query dan cek hasilnya
        if ($stmt->execute()) {
            // Jika berhasil, redirect kembali ke halaman admin
            header("Location: admin.php?status=success_add");
            exit(); // Pastikan tidak ada kode lain yang dieksekusi setelah redirect
        } else {
            $message = '<div class="message error">Gagal menyimpan data: ' . $stmt->error . '</div>';
        }
        
        // 8. Tutup statement
        $stmt->close();

    } else {
        $message = '<div class="message error">Semua kolom wajib diisi.</div>';
    }
}

// 9. Tutup koneksi database
$conn->close();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tambah Idiom Baru - Admin Idiomatch</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- CSS disematkan langsung di dalam file -->
    <style>
        /* Reset & Basic Styles */
        :root {
            --primary-color: #4A90E2;
            --secondary-color: #50E3C2;
            --danger-color: #E94E77;
            --success-color: #50E3C2;
            --error-color: #E94E77;
            --background-color: #f4f7f6;
            --text-color: #333;
            --card-bg-color: #ffffff;
            --shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            --border-radius: 12px;
        }

        body {
            font-family: 'Poppins', sans-serif;
            margin: 0;
            background-color: var(--background-color);
            color: var(--text-color);
            line-height: 1.6;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        /* Navigation */
        .main-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            margin-bottom: 20px;
        }

        .logo {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--primary-color);
            text-decoration: none;
        }

        .nav-links a {
            margin-left: 25px;
            text-decoration: none;
            color: #555;
            font-weight: 500;
        }

        /* Admin Form Styles */
        .form-container {
            background-color: var(--card-bg-color);
            padding: 30px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
        }

        .form-container h2 {
            margin-top: 0;
            margin-bottom: 25px;
            text-align: center;
            font-size: 2rem;
        }

        .form-group {
            margin-bottom: 20px;
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
            box-sizing: border-box; /* Penting agar padding tidak menambah lebar */
            transition: border-color 0.3s ease;
        }
        
        .form-control:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        
        textarea.form-control {
            min-height: 120px;
            resize: vertical;
        }

        .form-actions {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
            gap: 15px;
        }
        
        .btn {
            padding: 12px 25px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background-color: var(--primary-color);
            color: white;
        }
        .btn-primary:hover {
            background-color: #3a7ac8;
        }

        .btn-secondary {
            background-color: #ccc;
            color: #333;
        }
        .btn-secondary:hover {
            background-color: #bbb;
        }

        /* Message Styles */
        .message {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .message.error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .message.success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        /* Footer */
        .footer {
            text-align: center;
            margin-top: 50px;
            padding: 20px;
            color: #888;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .form-container {
                padding: 20px;
            }
            .form-container h2 {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>

    <div class="container">
        <nav class="main-nav">
            <a href="index.php" class="logo">Idiomatch</a>
            <div class="nav-links">
                <a href="index.php">Cari</a>
                <a href="admin.php">Admin</a>
            </div>
        </nav>

        <main>
            <div class="form-container">
                <h2>Tambah Idiom Baru</h2>
                
                <!-- Tampilkan pesan notifikasi jika ada -->
                <?= $message ?>

                <form action="add_idiom.php" method="POST">
                    <div class="form-group">
                        <label for="idiom">Idiom</label>
                        <input type="text" id="idiom" name="idiom" class="form-control" placeholder="Contoh: Break a leg" required>
                    </div>

                    <div class="form-group">
                        <label for="meaning_id">Artinya (Bahasa Indonesia)</label>
                        <input type="text" id="meaning_id" name="meaning_id" class="form-control" placeholder="Contoh: Semoga berhasil" required>
                    </div>

                    <div class="form-group">
                        <label for="example_sentence">Contoh Kalimat (Bahasa Inggris)</label>
                        <textarea id="example_sentence" name="example_sentence" class="form-control" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="sentence_translation">Terjemahan Contoh Kalimat</label>
                        <textarea id="sentence_translation" name="sentence_translation" class="form-control" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="example_conversation">Contoh Percakapan</label>
                        <textarea id="example_conversation" name="example_conversation" class="form-control" placeholder="A: I'm nervous.&#10;B: Break a leg!" required></textarea>
                    </div>

                    <div class="form-actions">
                        <a href="admin.php" class="btn btn-secondary">Batal</a>
                        <button type="submit" class="btn btn-primary">Simpan Idiom</button>
                    </div>
                </form>
            </div>
        </main>

        <footer class="footer">
            <p>&copy; <?= date('Y') ?> Idiomatch. All Rights Reserved.</p>
        </footer>
    </div>

</body>
</html>
