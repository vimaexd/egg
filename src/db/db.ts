const { Sequelize } = require('sequelize');
import dbConfig from "../../config/db.json"

const db = new Sequelize("egg", dbConfig.username, dbConfig.password, {
    host: dbConfig.server,
    port: dbConfig.port,
    // logging: false,
    maxConcurrentQueries: 100,
    dialect: 'postgres',
    pool: { maxConnections: 5, maxIdleTime: 30},
    language: 'en',
    transactionType: 'IMMEDIATE'
})

db
.authenticate()
.then(() => {
    console.log("DB Connected!")
})
.catch((err: Error) => {
    console.error(`[Database] Error connecting! - ${err}`)
})


export default db;