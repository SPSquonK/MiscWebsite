<?php

/**
 * Array.find but in JS
 * Source: https://www.reddit.com/r/PHPhelp/comments/7987wv/is_there_a_php_equivalent_of_javascripts_arrayfind/dp14skm?utm_source=share&utm_medium=web2x&context=3
 */
function array_find(callable $callback, array $array) {
    foreach ($array as $key => $value) {
        if ($callback($value, $key, $array)) {
            return $value;
        }
    }
    return null;
}

function fetch_json_file(string $path) {
    $string = file_get_contents($path);
    if ($string === false) die("No " + $path + " file.");
    
    $json = json_decode($string, true);
    if ($json === null) die("Categories file is not a valid json");

    return $json;
}

$picked_category = "";
if (isset($_GET['category'])) {
    $picked_category = $_GET['category'];
}

$json = fetch_json_file("xml/categories.json");

$the_category = null;

if ($picked_category === "") {
    $the_category = $json['categories'][0];
} else {
    $the_category = array_find(function($value) {
        global $picked_category;
        return $value['id'] === $picked_category;
    }, $json['categories']);

    if ($the_category === null) {
        die($picked_category . " is not a category that exists.");
    }
}

$known_files = fetch_json_file("xml/" . $the_category['fichier']);

$tableau = array();
if ($dossier = opendir($the_category['prefixe'])) {
	while(false !== ($fichier = readdir($dossier))) {
		if($fichier != '.' && $fichier != '..' && !str_starts_with($fichier, 'index')) {
			$tableau[] = $fichier;
		}
	}
}

?>
<html>
    <script type="text/javascript">
        const existingFiles = <?php echo json_encode($tableau); ?>;
        const knownFiles    = <?php echo json_encode($known_files) ?>;
        const knownImages   = new Set(knownFiles.images.map(image => image.titre));
        const missingFiles  = existingFiles.filter(file => !knownImages.has(file));
        
        const categories = ["titre", ...knownFiles.colonnes.map(c => c.balise)];

        console.error(missingFiles);
        console.error(categories);

        // TODO: the UI
        // TODO: dead links
    </script>
    <body>
        <table>
            <tr>
                <th>Missing pictures</th>
            </tr>
        </table>

        <textarea></textarea>
    </body>
</html>

