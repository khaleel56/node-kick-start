const fs = require('fs')
const path = require('path');

const rootPath = path.resolve('/');


exports.createFolders = (projectName) => {
  // { recursive: true }, 
  let folderPath = `../${projectName}`

  fs.mkdirSync(folderPath,)
  fs.mkdirSync(`${folderPath}/models`)
  fs.mkdirSync(`${folderPath}/controllers`)
  fs.mkdirSync(`${folderPath}/utils`)
  fs.mkdirSync(`${folderPath}/routes`)
  fs.mkdirSync(`${folderPath}/middleware`)
  console.log("new directory created successfully")
}

exports.fileCreator = (filePath, content) => {
  try {
    const path = `${filePath}`
    fs.writeFile(path, content, (err) => {
      if (err)
        console.log('error in file creation', err)
    });
  } catch (err) {
    console.log(err)
  }
}