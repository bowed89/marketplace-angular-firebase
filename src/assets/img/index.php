<?php 

if(isset($_GET["key"]) && $_GET["key"] == "AIzaSyCtsiPNMzYbiniOxpWpCDtbbcfW20CzPrY"){

	header('Access-Control-Allow-Origin: *');
	header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
	header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
	header('content-type: application/json; charset=utf-8');


	if(isset($_FILES['file']["tmp_name"]) && !empty($_FILES['file']["tmp_name"])){ 

		// Configuramos la ruta del directorio donde se guardará la img
		// Los nombres de las carpetas y la ruta vienen de account-prfile.component.ts
		$directory = $_POST["path"].'/'.$_POST["folder"];

		// Preguntamos primero sino existe el directorio para crearlo y dar permiso con 0755
		if(!file_exists($directory)) {

			mkdir($directory, 0755);

		}
		// si existe la carpeta eliminamos los archivos que existen dentro de ella
		// entramos al directorio y con foreach recorremos todos los archivos para eliminarlo con unlike
		$files = glob($directory."/*");

		foreach ($files as $file) {
			
			unlink($file);

		}

		// Capturamos el ancho y alto original de la img
		list($width, $height) = getimagesize($_FILES['file']["tmp_name"]);
		
		$newWidth = $_POST["width"];
		$newHeight = $_POST["height"];

		// De acuerdo al tipo de img aplicamos las funciones por defecto, JPGE 
		if($_FILES["file"]["type"] == "image/jpeg"){

			//definimos el nombre del archivo
			$name = mt_rand(100, 9999).'.jpg';
			
			//definimos el destino dnde se quiere guardar el archivo
			$folderPath = $directory.'/'.$name;
			
			// Crear una copia de la img
			$start = imagecreatefromjpeg($_FILES['file']['tmp_name']);

			// Instrucciones para aplicar a la img definitiva
			$end = imagecreatetruecolor($newWidth, $newHeight);

			imagecopyresized($end, $start, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

			imagejpeg($end, $folderPath);

		}

		// De acuerdo al tipo de img aplicamos las funciones por defecto,  PNG
		if($_FILES["file"]["type"] == "image/png"){

			//definimos el nombre del archivo
			$name = mt_rand(100, 9999).'.png';
			
			//definimos el destino dnde se quiere guardar el archivo
			$folderPath = $directory.'/'.$name;
			
			// Crear una copia de la img
			$start = imagecreatefrompng($_FILES['file']['tmp_name']);

			// Instrucciones para aplicar a la img definitiva
			$end = imagecreatetruecolor($newWidth, $newHeight);

			// Archivos png pueden ser transparentes y cn esas funciones se resuelve
			imagealphablending($end, FALSE);

			imagesavealpha($end, TRUE);

			imagecopyresampled($end, $start, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

			imagepng($end, $folderPath);

		}




		$json = array(

			 'status' => 200,
			 'result' => $name
		);

		echo json_encode($json, true);

		return;

	}

}
