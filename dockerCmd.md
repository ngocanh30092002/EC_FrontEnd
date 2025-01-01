docker run -d name: tạo mới containers
docker ps: liet ke cac container dang chay
docker ps -a: Liet ke lich su chay container 
docker stop id: dung container
docker start id: chay container
docker run name:version: pull image and start container
docker run p6000:6379 redis: Lien ket cong 6000 trong may tinh voi cong 6379 trong container
docker images: kiểm tra images
docker images --quiet: lấy ra id images
docker rmi: xoá images
docker rm --force: xoá container đang chạy
docker logs (id): log ra những sự kiện chạy tại container đó
docker run 
-d: Detach
-e: environemt variable
--name: tên container name
-p: map port (cổng 1435 máy local sẽ chuyển đến 1433 trên máy ảo ở docker)
-f force
a88d2a496e6b33ed5c9f4bd662175e000a2992910e3aead29452740871032bc0 - container id
docker run ^
-e "ACCEPT_EULA=Y" ^
-e "MSSQL_SA_PASSWORD=Nna.30092002" ^
-p 1435:1433 ^
--name sql-server-container ^
-v "F:/Apps/SQLServer/MSSQL16.MSSQLSERVER/MSSQL/DATA/EnglishCenter.mdf":"var/opt/mssql"
-d mcr.microsoft.com/mssql/server 

docker run ^
  -e "ACCEPT_EULA=Y" ^
  -e "MSSQL_SA_PASSWORD=Nna.30092002" ^
  -p 1435:1433 ^
  --name sql-server-container ^
  -v sqlserver_data:/var/opt/mssql ^
  -d mcr.microsoft.com/mssql/server

docker exec -it 108e99c2b2fe /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P Nna.30092002 -C -D "Encrypt=True;TrustServerCertificate=True"
docker exec -it 108e99c2b2fe /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P Nna.30092002


Volume: là cơ chế chia sẻ dữ liệu cho phép chia sẻ với các container và host, có thể độc lập với container và khi container bị xoá sẽ không xoá Volume
Cách hoạt động là sẽ ánh xạ với một thư mục ở trên host của mình

docker cp EnglishCenterDb.bak sql-server-container:/var/opt/mssql/backup/EnglishCenterDb.bak

