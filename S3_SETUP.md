# Configurar S3 para videos públicos

Para que los videos funcionen correctamente, necesitas configurar el bucket S3 para permitir acceso público:

## Opción 1: Hacer el bucket público (Recomendado para desarrollo)

1. Ve a AWS Console → S3
2. Selecciona el bucket `thetarnisheds3`
3. Ve a la pestaña "Permissions" (Permisos)
4. Busca "Block public access (bucket settings)"
5. Haz clic en "Edit"
6. Desactiva todas las opciones:
   - ☐ Block all public access
   - ☐ Block public access to ACLs
   - ☐ Block public access to bucket policies
   - ☐ Block public object ACLs
   - ☐ Block public object access through any public object ACLs
7. Haz clic en "Save"

8. Luego ve a "Bucket Policy" y reemplaza con esto:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::thetarnisheds3/videos/*"
        }
    ]
}
```

## Opción 2: Usar URLs Firmadas (Más seguro para producción)

Si prefieres no hacer el bucket público, asegúrate de que tus credenciales AWS tengan estos permisos en la policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::thetarnisheds3/videos/*"
        }
    ]
}
```

Y luego usa el endpoint que genera URLs firmadas.

## Probando después de configurar

Una vez configurado, prueba accediendo a:
- `https://thetarnisheds3.s3.us-east-2.amazonaws.com/videos/` (debería listar objetos o mostrar XML sin error de acceso)
- Cuando cargues un video, debería funcionar automáticamente
