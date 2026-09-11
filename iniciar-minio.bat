@echo off
set MINIO_ROOT_USER=minioadmin
set MINIO_ROOT_PASSWORD=minioadmin
C:\HC\minio.exe server C:\HC\minio-data --console-address :9001
pause
