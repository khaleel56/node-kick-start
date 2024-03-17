const fileHandlerController = require('./fileHandlerController')

exports.genDatabaseCodeMYSQL = (projectName) => {
const database = `const Sequelize = require('sequelize');

const sequelize = new Sequelize('devc', 'root', 'Password@123', {
dialect: 'mysql',
host: 'localhost'
});

module.exports = sequelize;
  `
  fileHandlerController.fileCreator(`../${projectName}/utils/database.js`, database)
}

exports.genDatabaseCodeMongoDB = (projectName) => {
  const database = `const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/your_database', { useNewUrlParser: true, useUnifiedTopology: true });
`
  fileHandlerController.fileCreator(`../${projectName}/utils/database.js`, database)
}

exports.genServerCodeMYSQL = (projectName) => {
  const server = `\n    
const express = require('express');
const bodyParser = require('body-parser')
const sequelize = require('./utils/database');
const router = require('./router')

const app = express();
const port = 3000;

app.use(bodyParser.json())
app.use('/app', router)

sequelize
.sync()
.then(result => {
app.listen(port, () => {
  console.log('Server is running on port 3000'); 
});
})
.catch(err => {
console.log(err)
})`
fileHandlerController.fileCreator(`../${projectName}/server.js`, server)

}

exports.genServerCodeMongoDB = (projectName) => {
  const server = `\n    
const express = require('express');
const bodyParser = require('body-parser')
const router = require('./router')

const app = express();
const port = 3000;

app.use(bodyParser.json())
app.use('/app', router)

app.listen(port, () => {
  console.log('Server is running on port 3000'); 
});`
fileHandlerController.fileCreator(`../${projectName}/server.js`, server)

}

exports.genPackageJSONCode = (projectName ) =>{

  const packageJson = `{
    "name": "${projectName}",
    "version": "1.0.0",
    "description": "",
    "main": "server.js",
    "scripts": {
      "start": "nodemon app.js"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "dependencies": {
      "express": "^4.18.2",
      "jsonwebtoken":"^8.5.1",
      "dotenv": "^8.2.0",
      "mongoose": "^6.0.4",
      "mysql2": "^3.7.0",  
      "sequelize": "^6.36.0"
    },
    "devDependencies": {
      "nodemon": "^3.0.2"
    }
  }  
  `

  fileHandlerController.fileCreator(`../${projectName}/package.json`, packageJson)

}

exports.genRoutesCode = (fileList, projectName) => {
  let fileLines="", routeLines="";

  for(const fileName of fileList) {
    fileLines = fileLines+`const ${fileName}Route = require("./routes/${fileName}");\n`
    routeLines = routeLines+`router.use('/${fileName}',  ${fileName}Route);\n`
      }
  const router = `const express = require('express');
const router = express();

${fileLines}
${routeLines}
module.exports = router;
  `    
  fileHandlerController.fileCreator(`../${projectName}/router.js`, router)

}


exports.genModelCodeMYSQL = (fileName, jsonData, projectName) => {
  let schemaLines=[];
  jsonData.forEach(data => {
    schemaLines.push(`${data[0]}: {
    type: DataTypes.${data[1]?.toUpperCase()}
  },`
    );
  })
    const model = `const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const _model = sequelize.define('${fileName}', {
  ${schemaLines.join('\n  ')} 
});

module.exports = _model; 
  `
    fileHandlerController.fileCreator(`../${projectName}/models/${fileName}Model.js`, model)
}

exports.genModelCodeMongoDB = (fileName, jsonData, projectName) => {
  let schemaLines=[];
  jsonData.forEach(data => {
    schemaLines.push(`${data[0]}: {
    type: ${data[1]}
  },`
    );
  })
  const model = `const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const collectionSchema = new Schema({
  ${schemaLines.join('\n\t\t   ')}
});

const ${fileName} = mongoose.model('${fileName}', collectionSchema);
module.exports = ${fileName};`
fileHandlerController.fileCreator(`../${projectName}/models/${fileName}Model.js`, model)
}


exports.genRouterCode = (fileName, projectName) => {
    const router = `const express = require('express');
const router = express();

const ${fileName}Controller = require("../controllers/${fileName}Controller")

router.post('/create', ${fileName}Controller.create );
router.delete('/delete', ${fileName}Controller.delete );
router.post('/update', ${fileName}Controller.update );
router.get('/get', ${fileName}Controller.get )

module.exports = router;
`
     fileHandlerController.fileCreator(`../${projectName}/routes/${fileName}.js`, router)
}

exports.genControllerCodeMYSQL = (fileName, keys, projectName) => {

    const controller = `const ${fileName}Model = require('../models/${fileName}Model');
// Create
exports.create = async (req, res) =>{
  try {
    const { ${keys} }= req.body;
    const newRecord = await ${fileName}Model.create(
      { ${keys} });
    res.json({ message: 'Record created successfully', data: newRecord });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err });
  }
}

// Read
exports.get = async (req, res) => {
  try {
      const { id } = req.query;
      const record = await ${ fileName }Model.findOne({ id: id });
      if (record) {
          res.json(record);
      } else {
          res.status(404).json({ message: 'Record not found' });
      }
  } catch (err) {
      res.status(500).json({ message: 'Internal Server Error', error: err });
  }
}


// Update
exports.update = async (req, res) => {
  try {
    const { ${keys}, id } = req.body;
    const updatedRecord = await ${fileName}Model.update(
        { id: id },
        { 
          where: { ${keys} },
          returning: true,
        });
    if (updatedRecord) {
      res.json({ message: 'Record updated successfully', data: updatedRecord });
    } else {
      res.status(404).json({ message: 'Record not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err });
  }
}

// Delete
exports.delete = async (req, res) => {
  try {
      const { id } = req.query;
      const deletedRecord = await ${ fileName }Model.destroy({ where: { id: id } });
      if (deletedRecord) {
          res.json({ message: 'Record deleted successfully', data: deletedRecord });
      } else {
          res.status(404).json({ message: 'Record not found' });
      }
  } catch (err) {
      res.status(500).json({ message: 'Internal Server Error', error: err });
  }
}
    `
    fileHandlerController.fileCreator(`../${projectName}/controllers/${fileName}Controller.js`, controller)

}

exports.genControllerCodeMongoDB = (fileName, keys, projectName) => {

  const controller = `const ${fileName}Model = require('../models/${fileName}Model');
// Create
exports.create = async (req, res) =>{
try {
  const { ${keys} }= req.body;
  const newRecord = await ${fileName}Model.create(
    { ${keys} });
  res.json({ message: 'Record created successfully', data: newRecord });
} catch (err) {
  res.status(500).json({ message: 'Internal Server Error', error: err });
}
}

// Read
exports.get = async (req, res) => {
try {
    const { id } = req.query;
    const record = await ${ fileName }Model.findOne({ _id: id });
    if (record) {
        res.json(record);
    } else {
        res.status(404).json({ message: 'Record not found' });
    }
} catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err  });
}
}


// Update
exports.update = async (req, res) => {
try {
  const { ${keys}, id } = req.body;
  const updatedRecord = await ${fileName}Model.updateOne(
      { _id: id },
      { 
        $set: { ${keys} },
        returning: true,
      });
  if (updatedRecord) {
    res.json({ message: 'Record updated successfully', data: updatedRecord });
  } else {
    res.status(404).json({ message: 'Record not found' });
  }
} catch (err) {
  res.status(500).json({ message: 'Internal Server Error', error: err });
}
}

// Delete
exports.delete = async (req, res) => {
try {
    const { id } = req.query;
    const deletedRecord = await ${ fileName }Model.deleteOne({ _id: id});
    if (deletedRecord) {
        res.json({ message: 'Record deleted successfully', data: deletedRecord });
    } else {
        res.status(404).json({ message: 'Record not found' });
    }
} catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err  });
}
}
  `
  fileHandlerController.fileCreator(`../${projectName}/controllers/${fileName}Controller.js`, controller)

}


exports.genMiddlewareCode = (projectName) => {
  const auth =`const JWT = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const TOKEN_PRIVATE_KEY = process.env.TOKEN_PRIVATE_KEY;
const TOKEN_EXPIRATION_TIME = +process.env.TOKEN_EXPIRATION_TIME;

const authorization = catchAsync(async (req, res, next) => {

  let decodedToken;
  try {
    let token = req.get('Authorization');
    if (token) {
      token = token.replace(/^Bearer\s+/, "");
      req.body.previousToken = token;
    }

    decodedToken = JWT.verify(token, TOKEN_PRIVATE_KEY);

  } catch (err) {
    throw new AppError('Unauthorized', 401);
  }


  const refreshToken = JWT.sign(
    {
      userId: String(decodedToken.userId),
      sessionId: String(decodedToken.sessionId)
    },
    TOKEN_PRIVATE_KEY,
    {
      expiresIn: TOKEN_EXPIRATION_TIME,
    }
  );
  req.body.token = refreshToken;
next();
});

module.exports = authorization;
  `
  fileHandlerController.fileCreator(`../${projectName}/middleware/auth.js`, auth)

}

exports.genConfigCode = (projectName) =>{

  const config=`TOKEN_PRIVATE_KEY=jwtSecretKey
  TOKEN_EXPIRATION_TIME=900
  `
  fileHandlerController.fileCreator(`../${projectName}/config.env`, config)

}