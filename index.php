<?php
// 1. Sertakan file koneksi database
include 'includes/db.php';

// Inisialisasi variabel judul halaman
$page_title = 'Idiomatch - Cari Idiom';

// 2. Sertakan file header
include 'includes/header.php';

// 3. Inisialisasi variabel
$results = [];
$keyword = '';
$search_performed = false;
$popular_idioms = [];

// 4. Logika Utama: Cek apakah pencarian dilakukan atau tidak
if (isset($_GET['keyword']) && !empty(trim($_GET['keyword']))) {
    // --- JALUR PENCARIAN ---
    $search_performed = true;
    $keyword = trim($_GET['keyword']);
    $search_term = "%" . $keyword . "%";
    
    $sql = "SELECT * FROM idioms WHERE idiom LIKE ? OR meaning_id LIKE ? OR example_sentence LIKE ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $search_term, $search_term, $search_term);
    $stmt->execute();
    $result_set = $stmt->get_result();
    
    if ($result_set->num_rows > 0) {
        while ($row = $result_set->fetch_assoc()) {
            $results[] = $row;
        }
    }
    $stmt->close();

} else {
    // --- JALUR HALAMAN UTAMA (TIDAK ADA PENCARIAN) ---
    // Ambil 3 idiom secara acak untuk ditampilkan
    $sql_popular = "SELECT idiom, meaning_id FROM idioms ORDER BY RAND() LIMIT 3";
    $result_popular = $conn->query($sql_popular);

    if ($result_popular && $result_popular->num_rows > 0) {
        while ($row = $result_popular->fetch_assoc()) {
            $popular_idioms[] = $row;
        }
    }
}

// 5. Tutup koneksi database setelah semua query selesai
$conn->close();
?>

<section class="search-section">
    <!-- Form pencarian, value diisi dengan keyword terakhir untuk user experience -->
    <form action="index.php" method="GET" class="search-form">
        <input type="text" name="keyword" placeholder="Ketik kata kunci (misal: leg, bullet)..." class="search-input" value="<?= htmlspecialchars($keyword) ?>" required>
        <button type="submit" class="search-button">Cari</button>
    </form>
</section>

<section class="results-section">
    <?php if ($search_performed): ?>
        <?php if (!empty($results)): ?>
            <!-- Tampilan jika ada hasil pencarian -->
            <h2 class="results-title">Ditemukan <?= count($results) ?> idiom untuk "<?= htmlspecialchars($keyword) ?>"</h2>
            <?php foreach ($results as $row): ?>
                <div class="idiom-card">
                    <h3 class="idiom-title"><?= htmlspecialchars($row['idiom']) ?></h3>
                    <div class="idiom-content">
                        <p><strong>Artinya:</strong> <?= htmlspecialchars($row['meaning_id']) ?></p>
                        
                        <h4>Contoh Kalimat:</h4>
                        <blockquote class="example-quote">
                            <p>"<?= htmlspecialchars($row['example_sentence']) ?>"</p>
                            <footer>- Terjemahan: <em><?= htmlspecialchars($row['sentence_translation']) ?></em></footer>
                        </blockquote>

                        <h4>Contoh Percakapan:</h4>
                        <div class="conversation">
                            <pre><?= htmlspecialchars($row['example_conversation']) ?></pre>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <!-- Tampilan jika tidak ada hasil pencarian -->
            <div class="placeholder no-results">
                <h2>Tidak ada hasil</h2>
                <p>Maaf, tidak ada idiom yang cocok dengan kata kunci "<?= htmlspecialchars($keyword) ?>". Coba kata kunci lain.</p>
            </div>
        <?php endif; ?>
    <?php else: ?>
        <!-- Tampilan awal SEBELUM pencarian (Konten Baru) -->
        <div class="intro-section">
            <h2>Contoh Idiom Populer</h2>
            <div class="popular-idioms-grid">
                <?php if (!empty($popular_idioms)): ?>
                    <?php foreach ($popular_idioms as $p_idiom): ?>
                        <div class="popular-item">
                            <h3 class="popular-idiom-title"><?= htmlspecialchars($p_idiom['idiom']) ?></h3>
                            <p class="popular-idiom-meaning"><?= htmlspecialchars($p_idiom['meaning_id']) ?></p>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="placeholder">
                        <p>Tidak ada contoh idiom untuk ditampilkan. Silakan tambahkan beberapa di halaman admin.</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    <?php endif; ?>
</section>

<?php
// 6. Sertakan file footer
include 'includes/footer.php';
?>
