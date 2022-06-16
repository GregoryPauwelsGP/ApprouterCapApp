const cds = require("@sap/cds");

const fs = require('fs');
const { spawnSync } = require("child_process");
const minimist = require("minimist");


class CatalogService extends cds.ApplicationService {
 init() {
   const { Books } = cds.entities("my.bookshop");

   let argv = minimist(process.argv.slice(2), {
    string: ["o", "openapi-version", "t", "target", "scheme", "host", "basePath"],
    boolean: [
      "d",
      "diagram",
      "h",
      "help",
      "p",
      "pretty",
      "r",
      "references",
      "u",
      "used-schemas-only",
      "verbose",
    ],
    alias: {
      d: "diagram",
      h: "help",
      o: "openapi-version",
      p: "pretty",
      r: "references",
      t: "target",
      u: "used-schemas-only",
      v: "odata-version",
    },
    default: {
      basePath: "/service-root",
      diagram: false,
      host: "localhost",
      "odata-version": "4.0",
      "openapi-version": "3.0.0",
      pretty: false,
      references: false,
      scheme: "http",
      verbose: false,
    },
    unknown: (arg) => {
      if (arg.substring(0, 1) == "-") {
        console.error(`Unknown option: ${arg}`);
        unknown = true;
        return false;
      }
    },
  });

  this.after ('READ',`Books`, (each)=>{  
    
        let currentDate = new Date();
        let sourceMetadata = 'srv/metadata'+ currentDate.getDate() + currentDate.getHours() + currentDate.getMinutes()+ currentDate.getSeconds() +".xml"

        transform(sourceMetadata)
        deleteFiles("/home/user/projects/CapServiceWithUI/srv/data")
        console.log("deleted files")

    })


   //Load all metadata
   this.on("sendMetadata", async (req) => {
        let sourceMetadata = '/home/vcap/app/srv/data/metadata.xml'

       fs.writeFileSync(sourceMetadata, req.data.metadata, function(err){
        if (err) {
          console.error(err)
          return
        }
        console.log("written to file metadata.xml")
      });

      transform(sourceMetadata)
      return JSON.stringify({ status : "succes"})

   });

   function xalanVersionCheck(source, target) {
    return spawnSync("node", [
      "node_modules/xslt3/xslt3",
      "-s:"+source,
      "-xsl:srv/OData-Version.xsl",
      "-o:"+target,
    ]);
  }

   function xalanV2V4(source, target) {
    return spawnSync("node", [
      "node_modules/xslt3/xslt3",
      "-s:"+source,
      "-xsl:srv/V2-to-V4-CSDL.xsl",
      "-o:"+target,
    ]);
  }

  function xalanV4(source, target) {
    return spawnSync("node", [
      "node_modules/xslt3/xslt3",
      "-s:"+source,
      "-xsl:srv/V4-CSDL-to-OpenAPI.xsl",
      "-o:"+target,
    ]);
  }

   function transform(source) {
    let metadataXmlContent = fs.readFileSync(source, 'utf8');
    //correct

    //creatie unieke naam CheckVersion
    let currentDate = new Date();
    let targetVersionFile = source.substring(0, source.lastIndexOf("."))+ currentDate.getDate() + currentDate.getHours()+ currentDate.getMinutes()+currentDate.getSeconds()+currentDate.getMilliseconds()  + ".txt";
    console.log("targetVersionFile"+targetVersionFile)
    let resultVersion = xalanVersionCheck(source, targetVersionFile);
    console.log(resultVersion);

    let version = fs.readFileSync(targetVersionFile);
    console.log("OData version: "+version)

    //creatie unieke naam target V2V4
    let targetV2V4 = targetVersionFile.substring(0, targetVersionFile.lastIndexOf("."))+ ".tmp";
    console.log("targetV2V4"+targetV2V4)

    if(version == "2.0"){
        console.log("OData V2 to V4 is activated")
        const resultV2V4 = xalanV2V4(source ,targetV2V4);
        console.log(resultV2V4)
    }

    let path = "/home/vcap/app/srv"
    let targetV4FileName =  targetV2V4.substring(targetV2V4.lastIndexOf('/'), targetV2V4.lastIndexOf(".")-5)+ ".openapi.json";
    let targetV4 = path + targetV4FileName

    targetV4FileName = targetV4FileName.substring(1)
    fs.writeFileSync(path + "nameOpenApiSpec.txt", targetV4FileName);
    console.log("targetV4"+targetV4)
    console.log("targetV4FileName: "+targetV4FileName)

    const result4 = xalanV4(targetV2V4, targetV4);
    console.log(result4) 

    fs.readFile(targetV4, 'utf8', (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err)
            return
        }
        console.log('File data:', jsonString) 
    })   

  }

  function deleteFiles(dirname){
    return spawnSync("rm", [
        "-d",
        dirname
      ]);
  } 
  
 
   return super.init();
 }
}

module.exports = { CatalogService };