<?php
	include 'index.php';
    
    if ($_COOKIE['canuseadmin'] === 'wesh') {
        echo '<style>body { background-color: lightblue;}</style>';
    }
?>
<script type="text/javascript" src="src/admin.js"></script>

