const express = require('express')
const { Readable } = require('stream');
const ejs = require('ejs');
const multer = require('multer');
const xlsx = require('xlsx')

const app = express()
const port = 3000;

const contentController = require('./controllers/contentController');
const fileHandlerController = require('./controllers/fileHandlerController')

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Please upload file.');
    }

    try {
        //filedata
        const projectName = req.body.projectName;
        const database = req.body.database
        const fileBuffer = req.file.buffer;

        // Parse the Excel file
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetList = workbook.SheetNames;

        if (sheetList.length > 0) {
            //folder creations
            fileHandlerController.createFolders(projectName);

            //project default fileCreations
            contentController.genRoutesCode(sheetList, projectName);
            contentController.genPackageJSONCode(projectName);
            contentController.genMiddlewareCode(projectName);
            contentController.genConfigCode(projectName);

            switch (database) {
                case 'MongoDB':
                    contentController.genDatabaseCodeMongoDB(projectName);
                    contentController.genServerCodeMongoDB(projectName);

                    break;
                case 'MYSQL':
                    contentController.genDatabaseCodeMYSQL(projectName);
                    contentController.genServerCodeMYSQL(projectName);

                    break;
            }

            for (const sheet of sheetList) {
                const content = workbook.Sheets[sheet];
                const jsonData = xlsx.utils.sheet_to_json(content, { header: 1 });

                const headers = jsonData[0];
                const data = jsonData.slice(1);
                const { keys, types } = data.reduce((acc, cur) => {
                    acc.keys.push(cur[0])
                    acc.types.push(cur[1])
                    return acc
                }, { keys: [], types: [] });
                contentController.genRouterCode(sheet, projectName);
                switch (database) {
                    case 'MongoDB':
                        contentController.genModelCodeMongoDB(sheet, jsonData, projectName);
                        contentController.genControllerCodeMongoDB(sheet, keys, projectName);
                        break;
                    case 'MYSQL':
                        contentController.genModelCodeMYSQL(sheet, jsonData, projectName);
                        contentController.genControllerCodeMYSQL(sheet, keys, projectName);
                        break;
                }
            }

        }
        res.render('index', { message: 'Project created successfully' });
        req.file.buffer = Buffer.from('');
    } catch (err) {
        console.log(err)
        res.status(500).send('Internal Server Error');
    }
});

app.get('/', (req, res) => {
    res.render('index', {message:null})
});


app.listen(port, () => {
    console.log(`server running on port ${port}`)
})