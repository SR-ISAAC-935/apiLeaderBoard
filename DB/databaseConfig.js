const { json } = require('express');
const mssql = require('mssql');
const sql = require('mssql');
require('dotenv').config();

const config={
  server: process.env.SERVER_NAME,
  database: process.env.DATABASE,
    user: process.env.USER,
  password: process.env.PASSWORD,
  options: {
    encrypt:true,
    trustServerCertificate: true
  }
}
/*
const config = {
  server: "localhost\\MYINSTANCE",
  database: "scoreboard",
  user: "isha",
  password: "1234567",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};
*/
let sqlPool;

async function connectSQLServer() {
    if (!sqlPool) {
        try {
            sqlPool = await mssql.connect(config);
            console.log('Connected to SQL Server');
        } catch (error) {
            console.error('Error al conectar con la base de datos:', error);
            throw error;
        }
    }
    return sqlPool;
}

module.exports = {
    mssql,
    connectSQLServer
};