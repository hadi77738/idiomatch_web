<?php
// 1. Mulai session dan amankan halaman
session_start();
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    header("location: login.php");
    exit;
}

// 2. Sertakan koneksi database
include 'includes/db.php';

// Inisialisasi variabel
$page_title = 'Admin - Kelola Idiom';
$notification = '';

// 3. Cek notifikasi dari URL (setelah add, edit, delete)
if (isset($_GET['status'])) {
    switch ($_GET['status']) {
        case 'success_add':
            $notification = '<div class="notification success">Idiom baru berhasil ditambahkan.</div>';
            break;
        case 'success_edit':
            $notification = '<div class="notification success">Idiom berhasil diperbarui.</div>';
            break;
        case 'success_delete':
            $notification = '<div class="notification success">Idiom berhasil dihapus.</div>';
            break;
        case 'error_delete':
            $notification = '<div class="notification error">Gagal menghapus idiom.</div>';
            break;
        case 'not_found':
            $notification = '<div class="notification error">Idiom tidak ditemukan.</div>';
            break;
    }
}


// 4. Ambil semua data idiom dari database
$idioms = [];
$sql = "SELECT id, idiom, meaning_id FROM idioms ORDER BY idiom ASC";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $idioms[] = $row;
    }
}

$conn->close();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($page_title) ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- CSS Internal -->
    <style>
        :root {
            --primary-color: #4A90E2;
            --secondary-color: #50E3C2;
            --danger-color: #E94E77;
            --success-color: #28a745;
            --background-color: #f4f7f6;
            --text-color: #333;
            --card-bg-color: #ffffff;
            --shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            --border-radius: 12px;
        }
        body {
            font-family: 'Poppins', sans-serif;
            margin: 0;
            background-color: var(--background-color);
            color: var(--text-color);
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }
        /* Header & Nav */
        .main-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
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
            transition: color 0.3s ease;
        }
        .nav-links a:hover, .nav-links a.logout {
            color: var(--danger-color);
        }
        /* Admin Header */
        .admin-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 15px;
        }
        .admin-header h2 {
            margin: 0;
            font-size: 2rem;
        }
        .btn {
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .btn-primary {
            background-color: var(--primary-color);
            color: white;
        }
        .btn-primary:hover {
            background-color: #3a7ac8;
        }
        /* Search Filter */
        .filter-container {
            margin-bottom: 30px;
        }
        .search-input {
            width: 100%;
            padding: 15px 20px;
            font-size: 1rem;
            border: 2px solid #ddd;
            border-radius: var(--border-radius);
            box-sizing: border-box;
            transition: all 0.3s ease;
        }
        .search-input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.2);
        }
        /* Notification */
        .notification {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
            text-align: center;
            opacity: 0;
            transform: translateY(-20px);
            animation: fadeIn 0.5s ease forwards;
        }
        .notification.success {
            background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;
        }
        .notification.error {
            background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;
        }
        @keyframes fadeIn {
            to { opacity: 1; transform: translateY(0); }
        }
        /* Idiom Card Grid */
        .idiom-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
        }
        .idiom-card {
            background-color: var(--card-bg-color);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            padding: 20px;
            display: flex;
            flex-direction: column;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .idiom-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .idiom-card-content {
            flex-grow: 1;
        }
        .idiom-card h3 {
            font-size: 1.3rem;
            color: var(--primary-color);
            margin-top: 0;
            margin-bottom: 8px;
        }
        .idiom-card p {
            font-size: 0.95rem;
            color: #666;
            margin: 0;
            line-height: 1.5;
        }
        .idiom-card-actions {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        .btn-action {
            padding: 6px 12px;
            font-size: 0.9rem;
        }
        .btn-secondary { background-color: #eee; color: #333; }
        .btn-secondary:hover { background-color: #ddd; }
        .btn-danger { background-color: var(--danger-color); color: white; }
        .btn-danger:hover { background-color: #d23a61; }
        .no-results {
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px;
            background-color: var(--card-bg-color);
            border-radius: var(--border-radius);
        }
    </style>
</head>
<body>
    <div class="container">
        <nav class="main-nav">
            <a href="index.php" class="logo">Idiomatch</a>
            <div class="nav-links">
                <a href="index.php">Cari</a>
                <a href="logout.php" class="logout">Logout</a>
            </div>
        </nav>

        <main>
            <div class="admin-header">
                <h2>Manajemen Idiom</h2>
                <a href="add_idiom.php" class="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>
                    <span>Tambah Idiom</span>
                </a>
            </div>

            <!-- Menampilkan Notifikasi -->
            <?= $notification ?>

            <div class="filter-container">
                <input type="text" id="searchInput" class="search-input" placeholder="Cari idiom atau artinya...">
            </div>

            <div class="idiom-grid" id="idiomGrid">
                <?php if (!empty($idioms)): ?>
                    <?php foreach ($idioms as $idiom): ?>
                        <div class="idiom-card" data-search-text="<?= strtolower(htmlspecialchars($idiom['idiom'] . ' ' . $idiom['meaning_id'])) ?>">
                            <div class="idiom-card-content">
                                <h3><?= htmlspecialchars($idiom['idiom']) ?></h3>
                                <p><?= htmlspecialchars($idiom['meaning_id']) ?></p>
                            </div>
                            <div class="idiom-card-actions">
                                <a href="edit_idiom.php?id=<?= $idiom['id'] ?>" class="btn btn-secondary btn-action">Edit</a>
                                <a href="delete_idiom.php?id=<?= $idiom['id'] ?>" class="btn btn-danger btn-action" onclick="return confirm('Anda yakin ingin menghapus idiom ini?');">Hapus</a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <p class="no-results">Belum ada data idiom. Silakan tambahkan.</p>
                <?php endif; ?>
                <div id="noResultsMessage" class="no-results" style="display: none;">
                    <p>Tidak ada idiom yang cocok dengan pencarian Anda.</p>
                </div>
            </div>
        </main>
    </div>

    <!-- JavaScript Internal -->
    <script>
        // Hapus notifikasi setelah beberapa detik
        const notification = document.querySelector('.notification');
        if (notification) {
            setTimeout(() => {
                notification.style.transition = 'opacity 0.5s ease';
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 500);
            }, 4000); // Hilang setelah 4 detik
        }

        // Logika Live Search
        const searchInput = document.getElementById('searchInput');
        const idiomGrid = document.getElementById('idiomGrid');
        const idiomCards = idiomGrid.querySelectorAll('.idiom-card');
        const noResultsMessage = document.getElementById('noResultsMessage');

        searchInput.addEventListener('keyup', function() {
            const searchTerm = searchInput.value.toLowerCase();
            let visibleCards = 0;

            idiomCards.forEach(card => {
                const cardText = card.getAttribute('data-search-text');
                if (cardText.includes(searchTerm)) {
                    card.style.display = 'flex';
                    visibleCards++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Tampilkan pesan jika tidak ada hasil
            if (visibleCards === 0) {
                noResultsMessage.style.display = 'block';
            } else {
                noResultsMessage.style.display = 'none';
            }
        });
    </script>
</body>
</html>
