<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $page_title ?? 'Idiomatch - Temukan Idiom Bahasa Inggris' ?></title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
</head>
<body>

    <div class="container">
        <nav class="main-nav">
            <a href="index.php" class="logo">Idiomatch</a>
            
            <!-- Tombol Hamburger (Hanya muncul di mobile) -->
            <button class="nav-toggle" aria-label="buka navigasi">
                <span class="hamburger"></span>
            </button>
            
            <!-- Tautan Navigasi -->
            <div class="nav-links" id="main-nav-links">
                <a href="index.php">Cari</a>
                <a href="admin.php">Admin</a>
            </div>
        </nav>

        <header class="header">
            <h1>Temukan Idiom Bahasa Inggris</h1>
            <p class="tagline">Cari dan pahami idiom dengan contoh kalimat dan percakapan.</p>
        </header>

        <main> <!-- Tag <main> dibuka di sini -->
