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

// 2. Cek apakah ada ID di URL dan merupakan angka yang valid
if (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $id = $_GET['id'];

    // 3. Siapkan query SQL DELETE menggunakan prepared statement
    $sql = "DELETE FROM idioms WHERE id = ?";
    $stmt = $conn->prepare($sql);

    // Periksa apakah statement berhasil disiapkan
    if ($stmt) {
        // 4. Bind parameter ID ke statement
        $stmt->bind_param("i", $id);

        // 5. Eksekusi query
        if ($stmt->execute()) {
            // Jika berhasil, redirect ke halaman admin dengan status sukses
            header("Location: admin.php?status=success_delete");
            exit();
        } else {
            // Jika gagal, redirect dengan status error
            header("Location: admin.php?status=error_delete");
            exit();
        }

        // 6. Tutup statement
        $stmt->close();
    } else {
        // Gagal mempersiapkan statement
        header("Location: admin.php?status=error_prepare");
        exit();
    }

} else {
    // Jika tidak ada ID atau ID tidak valid, langsung redirect ke halaman admin
    header("Location: admin.php");
    exit();
}

// 7. Tutup koneksi database
$conn->close();
?>
