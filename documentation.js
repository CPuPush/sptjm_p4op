/**
 * ! Database
 * setup
 * * npx sequelize-cli init
 * => create database setup folder-> migrations, models, and configuration
 * 
 * * npx sequelize-cli db:create
 * => db connection create db in postgres database
 * 
 * * buat database
 * => npx sequelize-cli model:generate --name User --attributes username:string,email:string,password:string,role:string
 * 
 * * migrate tabel struktur
 * => npx sequelize-cli db:migrate
 * 
 * * undo migrate
 * => npx sequelize-cli db:migrate:undo:all
 * berguna untuk jika buat perubahan di struktur database.
 * 
 * 
 */