<?php
// Pengaturan Database
$db_host = 'localhost'; // atau sesuaikan dengan host Anda
$db_user = 'root';      // atau sesuaikan dengan username database Anda
$db_pass = '';          // atau sesuaikan dengan password database Anda
$db_name = 'idiomatch_db'; // atau sesuaikan dengan nama database Anda

// Membuat Koneksi
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Cek Koneksi
if ($conn->connect_error) {
    die("Koneksi ke database gagal: " . $conn->connect_error);
}

// Mengatur karakter set ke utf8mb4 untuk mendukung berbagai karakter
$conn->set_charset("utf8mb4");
?>
