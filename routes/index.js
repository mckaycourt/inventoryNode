let express = require('express');
let mysql = require('mysql');
let router = express.Router();
let fs = require('fs');
let csv = require('fast-csv');

class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}

let filters = [];
/* GET home page. */
router.get('/employeesTable', function (req, res, next) {
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Mlhlt2200!',
        database: 'test'
    });

    let query = 'Select * FROM employee';
    if (req.query.sortby === 'employeeId') {
        query += ' Order BY employeeId';
    }
    else if (req.query.sortby === 'firstName') {
        query += ' ORDER BY firstName';
    }
    else if (req.query.sortby === 'lastName') {
        query += ' ORDER BY lastName';
    }
    else {
        query += ' Order BY employeeId';
    }

    let employees = {};

    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        // connected!
        for (let i in results) {
            employees[i] = {
                employeeId: results[i].employeeId,
                firstName: results[i].firstName,
                lastName: results[i].lastName,
                category: results[i].category,
                officeLocation: results[i].officeLocation,
                building: results[i].building,
                username: results[i].username,
                email: results[i].email,
                rotationGroup: results[i].rotationGroup,
                dateSwitched: results[i].dateSwitched,
                notes: results[i].notes,
                PictureURL: results[i].PictureURL
            };
        }
        connection.end();
        res.render('index', {title: 'Employees', employees: employees});
    });


});

router.get('/computerTable', function (req, res, next) {
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Mlhlt2200!',
        database: 'test'
    });

    let query = 'Select * FROM computer';
    if (req.query.remove) {
        filters.splice(req.query.remove);
    }
    if (req.query.where) {
        let check = true;
        for (let i = 0; i < filters.length; i++) {
            if (filters[i] === req.query.where) {
                check = false;
            }
        }
        if (check) {
            filters.push(req.query.where);
        }
    }
    if (filters.length > 0) {
        query += " WHERE ";
        for (let filter in filters) {
            query += filters[filter];
            query += ' and ';
            console.log(filter);
        }
        query = query.substr(0, query.length - 5);
    }

    if (req.query.sortby === 'ICN') {
        query += ' Order BY ICN';
    }
    else if (req.query.sortby === 'EmployeeID') {
        query += ' ORDER BY EmployeeID';
    }
    else if (req.query.sortby === 'Make') {
        query += ' ORDER BY Make';
    }
    else {
        query += ' Order BY ICN';
    }
    console.log(query);


    let computers = {};

    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        // connected!
        for (let i in results) {
            computers[i] = {
                ICN: results[i].ICN,
                EmployeeID: results[i].EmployeeID,
                Make: results[i].Make,
                Model: results[i].Model,
                SerialNumber: results[i].SerialNumber,
                ServiceTag: results[i].ServiceTag,
                ExpressServiceCode: results[i].ExpressServiceCode,
                Type: results[i].Type,
                HardwareID: results[i].HardwareID,
                DateAcquired: results[i].DateAcquired,
                Warranty: results[i].Warranty,
                HomeCheckout: results[i].HomeCheckout,
                Notes: results[i].Notes
            };
        }
        connection.end();
        res.render('computers', {title: 'Computers', computers: computers, filters: filters});
    });


});

router.get('/employees', function (req, res, next) {
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Mlhlt2200!',
        database: 'test'
    });

    let employees = {};

    connection.query('Select * FROM employee ORDER BY employeeId', function (error, results, fields) {
        if (error) throw error;
        // connected!
        for (let i in results) {
            employees[i] = {
                employeeId: results[i].employeeId,
                firstName: results[i].firstName,
                lastName: results[i].lastName,
                category: results[i].category,
                officeLocation: results[i].officeLocation,
                building: results[i].building,
                username: results[i].username,
                email: results[i].email,
                rotationGroup: results[i].rotationGroup,
                dateSwitched: results[i].dateSwitched,
                notes: results[i].notes,
                PictureURL: results[i].PictureURL
            };
        }
        connection.end();
        res.render('employees', {title: 'Employees', employees: employees});
    });


});

router.get('/card', function (req, res, next) {

    let employeeId = req.query.employeeId;
    let employeeRows = {};
    let computerRows = {};
    let monitorRows = {};
    let printerRows = {};
    let peripheralRows = {};
    let employees;

    let database = new Database({
        host: 'localhost',
        user: 'root',
        password: 'Mlhlt2200!',
        database: 'test'
    });

    database.query('SELECT * FROM employee WHERE employeeId = ' + employeeId)
        .then(rows => {
            employeeRows = rows;
            return database.query('SELECT * FROM computer WHERE EmployeeId = ' + employeeId);
        })
        .then(rows => {
            computerRows = rows;
            return database.query('SELECT * FROM monitor WHERE EmployeeId = ' + employeeId)
        })
        .then(rows => {
            monitorRows = rows;
            return database.query('SELECT * FROM printer WHERE EmployeeId = ' + employeeId)
        })
        .then(rows => {
            printerRows = rows;
            return database.query('SELECT * FROM peripheral WHERE EmployeeId = ' + employeeId)
        })
        .then(rows => {
            peripheralRows = rows;
            return database.close();
        })
        .then(() => {
            // do something with someRows and otherRows
            res.render('card', {
                employee: employeeRows[0],
                computers: computerRows,
                monitors: monitorRows,
                printers: printerRows,
                peripherals: peripheralRows
            })
        })
        .catch(err => {
            console.log(err);
        });


    // res.render('card')
});

router.get('/getModelOptions', function (req, res, next){
    let Make = req.query.make;
    let database = new Database({
        host: 'localhost',
        user: 'root',
        password: 'Mlhlt2200!',
        database: 'test'
    });

    let modelOptions = {};

    database.query('SELECT DISTINCT Model FROM Computer WHERE Make = ? ORDER BY Model', [Make])
        .then(rows => {
            modelOptions = rows;
            modelOptions[modelOptions.length] = {Model: 'Add a New Option'};

            database.close();
        })
        .then(() => {
            res.render('getModelOptions', {modelOptions});
        })
        .catch(err => {
            console.log(err);
        })
});

router.get('/item', function (req, res, next) {

    let ICN = 10540;
    let categories = {};
    let computer = {};

    let database = new Database({
        host: 'localhost',
        user: 'root',
        password: 'Mlhlt2200!',
        database: 'test'
    });
    database.query('SHOW COLUMNS FROM computer')
        .then(rows => {
            categories = rows;
            console.log(categories[0].Field);
            return database.query('SELECT * FROM computer WHERE ICN = ' + ICN);
        })
        .then(rows => {
            computer = rows;
            console.log(computer[0]);
            return database.close();
        })
        .then(() => {
            res.render('item', {title: 'Welcome', categories: categories, computer: computer[0]})
        })
        .catch(err => {
            console.log(err);
        });
});

router.get('/computer', function (req, res, next) {
    let ICN = req.query.ICN;
    let EmployeeID = req.query.EmployeeID;
    let makeOptions = {};
    let modelOptions = {};
    let employees = {};
    let typeOptions = {};
    let computer = {};
    let employee = {};
    let hardware = {};
    let processorTypeOptions = {};

    let database = new Database({
        host: 'localhost',
        user: 'root',
        password: 'Mlhlt2200!',
        database: 'test'
    });

    database.query('SELECT DISTINCT Make FROM computer')
        .then(rows => {
            makeOptions = rows;
            return database.query('Select * FROM employee ORDER BY lastName');
        })
        .then(rows => {
            employees = rows;
            return database.query('Select FirstName, LastName FROM employee WHERE EmployeeID = ' + EmployeeID)
        })
        .then(rows => {
            employee = rows[0];
            return database.query('Select DISTINCT Type FROM computer');
        })
        .then(rows => {
            typeOptions = rows;
            return database.query('SELECT * FROM computer WHERE ICN = ' + ICN);
        })
        .then(rows => {
            computer = rows[0];
            return database.query('SELECT DISTINCT Model FROM computer');
        })
        .then(rows => {
            modelOptions = rows;
            return database.query('SELECT * FROM Hardware WHERE HardwareID = ' + computer.HardwareID);
        })
        .then(rows => {
            hardware = rows[0];
            return database.query('SELECT DISTINCT ProcessorType FROM hardware ORDER BY ProcessorType')
        })
        .then(rows => {
            processorTypeOptions = rows;
            return database.close();
        })
        .then(() => {
            res.render('form', {title: 'Welcome', makeOptions, modelOptions, employees, computer, typeOptions, hardware, employee, processorTypeOptions})
        })
        .catch(err => {
            console.log(err);
        });
});

router.get('/newComputer', function(req, res, next) {
    let ICN = 0;
    let EmployeeID = parseInt(req.query.EmployeeID);
    let employee = {};
    let employees = {};
    let makeOptions = {};
    let modelOptions = {0:{Model: "Please choose a Make"}};
    let typeOptions = {};
    let processorTypeOptions = {};
    let processorSpeedOptions = {};
    let memoryOptions = {};
    let hardDriveOptions = {};
    let graphicsCardOptions = {};

    let database = new Database({
        host: 'localhost',
        user: 'root',
        password: 'Mlhlt2200!',
        database: 'test'
    });
    database.query('SELECT * FROM computer ORDER BY ICN DESC LIMIT 1')
        .then(rows => {
            ICN = rows[0].ICN + 1;
            return database.query('Select FirstName, LastName FROM employee WHERE EmployeeID = ' + EmployeeID);
        })
        .then(rows => {
            employee = rows[0];
            return database.query('SELECT DISTINCT Make FROM computer');
        })
        .then(rows => {
            makeOptions = rows;
            makeOptions[makeOptions.length] = {Make: 'None'};
            makeOptions[makeOptions.length] = {Make: 'Add a New Option'};
            // return database.query('SELECT DISTINCT Model FROM computer');
        })
        .then(rows => {
            // modelOptions = rows;
           return database.query('Select DISTINCT Type FROM computer');
        })
        .then(rows => {
            typeOptions = rows;
            typeOptions[typeOptions.length] = {Type: 'None'};
            return database.query('Select * FROM employee ORDER BY lastName');
        })
        .then(rows => {
            employees = rows;
            return database.query('SELECT DISTINCT ProcessorType FROM hardware ORDER BY ProcessorType')
        })
        .then(rows => {
            processorTypeOptions = rows;
            return database.query('SELECT DISTINCT ProcessorSpeed FROM hardware ORDER BY ProcessorSpeed')

        })
        .then(rows => {
            processorSpeedOptions = rows;
            return database.query('SELECT DISTINCT Memory FROM hardware ORDER BY Memory')

        })
        .then(rows => {
            memoryOptions = rows;
            return database.query('SELECT DISTINCT HardDrive FROM hardware ORDER BY HardDrive')

        })
        .then(rows => {
            hardDriveOptions = rows;
            return database.query('SELECT DISTINCT VCName FROM hardware ORDER BY VCName')

        })
        .then(rows => {
            graphicsCardOptions = rows;
            return database.close();
        })
        .then(() => {
            res.render('newComputer', {
                title: 'Welcome',
                makeOptions,
                modelOptions,
                typeOptions,
                employee,
                employees,
                ICN,
                EmployeeID,
                processorTypeOptions,
                processorSpeedOptions,
                memoryOptions,
                hardDriveOptions,
                graphicsCardOptions
            })
        })
});

router.get('/download/rotation', function (req, res, next) {
    let rotation = req.query.rotation;
    let Rows = {};

    let database = new Database({
        host: 'localhost',
        user: 'root',
        password: 'Mlhlt2200!',
        database: 'test'
    });
    database.query('SELECT employeeId, firstName, lastName, category, officeLocation, building, username, dateSwitched, notes FROM employee WHERE rotationGroup = ' + rotation + ' ORDER BY employeeId;')
        .then(rows => {
            Rows = rows;
            return database.close();
        })
        .then(() => {
            let csvStream = csv.createWriteStream({headers: true}),
                writableStream = fs.createWriteStream("Rotation " + rotation + ".csv");

            writableStream.on("finish", function(){
                console.log("DONE!");
                let file = __dirname + '/../Rotation ' + rotation + '.csv';
                res.download(file);
            });

            csvStream.pipe(writableStream);
            for(let i = 0; i < Rows.length; i++){
                csvStream.write(Rows[i]);
            }
            csvStream.end();
        })




});

router.post('/form', function (req, res, next) {
    let database = new Database({
        host: 'localhost',
        user: 'root',
        password: 'Mlhlt2200!',
        database: 'test'
    });
    database.query("UPDATE computer Set ICN = ?, EmployeeID = ?, Make = ?, Model = ?, SerialNumber = ?, ServiceTag = ?, ExpressServiceCode = ?, Type = ?, HardwareID = ?, DateAcquired = ?, Warranty = ?, HomeCheckout = ?, Notes = ? WHERE ICN = ?",
        [req.body.icn, req.body.employeeId, req.body.make, req.body.model, req.body.serialNumber, req.body.serviceTag, req.body.expressServiceCode, req.body.type, req.body.hardwareID, req.body.dateAcquired, req.body.warranty, req.body.homeCheckout, req.body.notes, req.body.icn])
        .then( rows => {
            return database.close();
        })
        .then(() => {
                res.redirect('/employees');
        })
        .catch(err => {
           console.log(err);
        });
    // res.render('home', {title: 'Welcome', name: 'McKay'})
});

router.get('/', function (req, res, next) {
    res.render('home', {title: 'Welcome', name: 'McKay'})
});

router.get('/test', function (req, res, next) {
    res.render('test', {title: 'Welcome', name: 'McKay'})
});

module.exports = router;
