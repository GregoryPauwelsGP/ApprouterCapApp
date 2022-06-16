const cds = require('@sap/cds');

const express = require('express');  
const fs = require('fs');
const app = express();
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

cds.on('bootstrap', app => {
    var swaggerDocument = require("./metadata.openapi.json")
    
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    app.use(cors())
});

cds.once('bootstrap', app => {
    fs.readFile("srv/nameOpenApiSpec.txt", 'utf8', (err, swaggerJsonFile) => {
        if (err) {
            console.log("File read failed:", err)
            return
        }
        var swaggerDocument = require("./"+swaggerJsonFile)
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
         
    })
});
/*
cds.on('served', app => {
    fs.readFile("srv/nameOpenApiSpec.txt", 'utf8', (err, swaggerJsonFile) => {
        if (err) {
            console.log("File read failed:", err)
            return
        }
        var swaggerDocument = require("./"+swaggerJsonFile)
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
         
    })
})*/

module.exports = cds.server;