        </main> <!-- Tag <main> ditutup di sini -->

        <footer class="footer">
            <p>&copy; <?= date('Y') ?> Idiomatch. All Rights Reserved.</p>
        </footer>
    </div> <!-- Penutup .container -->

    <!-- JavaScript untuk Toggle Menu Mobile -->
    <script>
        const navToggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('#main-nav-links');

        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    </script>
</body>
</html>
