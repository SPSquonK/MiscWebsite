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
    if ($string === false) die("No " . $path . " file.");
    
    $json = json_decode($string, true);
    if ($json === null) die("Categories file is not a valid json");

    return $json;
}

// https://stackoverflow.com/a/834355
function startsWith( $haystack, $needle ) {
    $length = strlen( $needle );
    return substr( $haystack, 0, $length ) === $needle;
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
		if($fichier != '.' && $fichier != '..' && !startsWith($fichier, 'index')) {
			$tableau[] = $fichier;
		}
	}
}

?>
<html>
    <head>
        <style>
            label {
                width: 7em;
                display: inline-block;
            }

            input {
                width: 20em;
            }

            td { text-align: center; }
        </style>
    </head>
    <body>
        <table id="missing_table">
            <tr>
                <th>Missing pictures</th>
            </tr>
        </table>

        <textarea id="output" cols="80" rows="20"></textarea>

        <script id="line" type="x-tmpl-mustache">
                <td>
                    <p><strong><a href="{{ link }}">{{ title }}</a></strong>
                    {{#categories}}
                        <br>
                        <label for="{{image_id}}_{{id}}">{{name}}</label>
                        <input type="text" name="{{image_id}}_{{id}}" id="input_{{image_id}}_{{id}}" oninput="refreshTextArea()" />
                    {{/categories}}
                    </p>
                </td>                
        </script>
        <script src="https://unpkg.com/mustache@latest"></script>
        <script type="text/javascript">
            const existingFiles = <?php echo json_encode($tableau); ?>;
            const knownFiles    = <?php echo json_encode($known_files) ?>;
            const knownImages   = new Set(knownFiles.images.map(image => image.titre));
            const missingFiles  = existingFiles.filter(file => !knownImages.has(file));
            
            const categories = ["titre", ...knownFiles.colonnes.map(c => c.balise)];
            const enumeratedCategories = [...categories.entries()]
                .map(t => { return { "id": t[0], "name": t[1] }; })
                .filter(t => t.name !== 'date');

            console.error(missingFiles);
            console.error(categories);

            document.addEventListener("DOMContentLoaded", function() {
                const template = document.getElementById('line').innerHTML;
                const table = document.querySelector('#missing_table');

                for (const [i, missingFile] of missingFiles.entries()) {
                    let render = Mustache.render(
                        template,
                        {
                            title: missingFile,
                            link: "<?php echo $the_category['prefixe']; ?>" + missingFile,
                            image_id: i,
                            categories: enumeratedCategories
                        }
                    );
                    
                    let tr = document.createElement("tr");
                    tr.innerHTML = render;
                    table.appendChild(tr);
                }
            });

            function refreshTextArea() {
                let content = [];

                for (const [imageId, missingFile] of missingFiles.entries()) {
                    let thisImage = {};

                    let hasDate = false;

                    for (const [categoryId, categoryName] of categories.entries()) {
                        if (categoryName === 'date') {
                            hasDate = true;
                            continue;
                        }

                        const inputId = `input_${imageId}_${categoryId}`;
                        const input = document.getElementById(inputId);
                        if (input.value !== "") {
                            thisImage[categoryName] = input.value;
                        }
                    }

                    if (Object.keys(thisImage).length !== 0) {
                        if (hasDate) {
                            thisImage['date'] = new Date().toISOString().slice(0, 10);
                        }

                        content.push(thisImage);
                    }
                }

                let output = document.getElementById("output");
                output.value = JSON.stringify(content, null, 2);
            }

            // TODO: dead links
        </script>
    </body>
</html>

