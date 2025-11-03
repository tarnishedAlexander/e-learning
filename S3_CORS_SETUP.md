# Configuración CORS para S3 WebM Videos

Si los videos WebM no se reproducen en el navegador, podría ser un problema de CORS en S3.

## Configurar CORS en AWS S3

1. Ve a AWS S3 Console
2. Selecciona el bucket `thetarnisheds3`
3. Ve a **Permissions** → **CORS**
4. Haz clic en **Edit** y reemplaza con esta configuración:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": [
            "GET",
            "HEAD",
            "PUT",
            "POST",
            "DELETE"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-server-side-encryption",
            "x-amz-request-id"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

5. Haz clic en **Save changes**

## Verificar que CORS funciona

Desde el navegador, abre la consola de desarrollador (F12) y prueba:

```javascript
fetch('https://thetarnisheds3.s3.us-east-2.amazonaws.com/videos/1762183745674-recording-1762183740595.webm', {
  method: 'HEAD'
})
.then(r => console.log('CORS OK:', r.status))
.catch(e => console.error('CORS Error:', e))
```

Si ves `CORS OK: 200`, entonces CORS está configurado correctamente.

## Si aún no funciona

Prueba en la consola del navegador:
```javascript
// Obtener la URL del video
const videoUrl = 'https://thetarnisheds3.s3.us-east-2.amazonaws.com/videos/1762183745674-recording-1762183740595.webm'

// Intentar cargar en un video tag
const video = document.createElement('video')
video.src = videoUrl
video.controls = true
video.style.width = '100%'
document.body.appendChild(video)
```

Si aparece en la página pero no se reproduce, el problema es CORS.
Si aparece pero no se ve nada, el problema es que el archivo no existe o está corrupto.
