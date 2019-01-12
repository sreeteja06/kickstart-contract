const fs = require('fs-extra');
const solc = require('solc');
const path = require('path');

const buildPath = path.resolve(__dirname,'build');
fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname,'contracts','campaign.sol');

const source = fs.readFileSync(campaignPath,'utf8');

const input = {
    language: "Solidity",
    sources:{
        "kickstart":{
            content: source
        }
    },
    settings:{
        outputSelection: {
            "*": {
                "*": [ "*" ]
            }
        }
    }
};

let output = JSON.stringify(JSON.parse(solc.compile(JSON.stringify(input))),null,2);

fs.ensureDir(buildPath);

output = JSON.parse(output);

for( let contract in output.contracts["kickstart"] ){
    fs.outputJSONSync(
        path.resolve(buildPath, contract+'.json'),
        output.contracts["kickstart"][contract]
    );
}

// console.log(output.contracts["kickstart"]["Campaign"]["abi"]);
// fs.writeFile('temp.json', output, (err)=>{
    //     if(err){
        //         return console.log("error saving file" + err);
        //     }
        //     console.log("file saved");
        // });