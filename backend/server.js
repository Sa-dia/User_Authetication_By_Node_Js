const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const csv = require('csv-parser');
const stream = require('stream');
const xml2js = require('xml2js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: 'application/xml' }));
app.use(fileUpload());

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root", // Replace with your MySQL username
    password: "", // Replace with your MySQL password
    database: "testdb"
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        throw err;
    }
    console.log('Connected to MySQL database');

    // Create tables if they do not exist
    createSuperUserTable();
    createCsvDataTable();
    // createXmlDataTable();
    createXmlDataRoomTable();
    createXmlDataTeacherTable();
    createXmlDataStudentTable();
});

// Function to create Super User table if it does not exist
const createSuperUserTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS super_user (
            su_id VARCHAR(50) NOT NULL,
            password VARCHAR(700) NOT NULL,
            PRIMARY KEY (su_id)
        )
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error creating super_user table:', err);
            throw err;
        }
        console.log('Super User table created or already exists');
    });
};

// Function to create CSV data table if it does not exist
const createCsvDataTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS csv_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            column1 VARCHAR(255),
            column2 VARCHAR(255),
            column3 VARCHAR(255)
        )
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error creating csv_data table:', err);
            throw err;
        }
        console.log('CSV data table created or already exists');
    });
};
// Function to create XML data table  if it does not exist
const createXmlDataTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS csv_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            column1 VARCHAR(255),
            column2 VARCHAR(255),
            column3 VARCHAR(255)
        )
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error creating csv_data table:', err);
            throw err;
        }
        console.log('CSV data table created or already exists');
    });
};

// Function to create XML data table for rooms if it does not exist
const createXmlDataRoomTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS xml_Room_data (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            Room_No VARCHAR(255),
            Room_Type VARCHAR(255),
            Room_Capacity INT
        )
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error creating xml_Room_data table:', err);
            throw err;
        }
        console.log('XML data Room table created or already exists');
    });
};
const createXmlDataTeacherTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS xml_teacher_data (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            Teacher_Name VARCHAR(255),
            Designation VARCHAR(255),
            Department VARCHAR(255)
        )
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error creating xml_teacher_data table:', err);
            throw err;
        }
        console.log('XML data teacher table created or already exists');
    });
};
const createXmlDataStudentTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS xml_student_data (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            Stu_Name VARCHAR(255),
            Stu_Roll VARCHAR(255),
            Stu_Email VARCHAR(255),
            Stu_Dept VARCHAR(255)
        )
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error creating xml_student_data table:', err);
            throw err;
        }
        console.log('XML data student table created or already exists');
    });
};

// Register Super User
app.post('/register', async (req, res) => {
    const { su_id, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO super_user (su_id, password) VALUES (?, ?)';
    db.query(sql, [su_id, hashedPassword], (err, result) => {
        if (err) {
            console.error('Error registering user:', err);
            res.status(500).send('Error registering user');
        } else {
            res.status(201).send('User registered successfully');
        }
    });
});

// Login Super User
app.post('/login', async (req, res) => {
    const { su_id, password } = req.body;
    try {
        const sql = 'SELECT * FROM super_user WHERE su_id = ?';
        db.query(sql, [su_id], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Server error');
            }

            if (results.length === 0) {
                console.error('User not found:', su_id);
                return res.status(400).send('Invalid email or password');
            }

            const user = results[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                console.error('Invalid password for user:', su_id);
                return res.status(400).send('Invalid email or password');
            }

            const token = jwt.sign({ su_id: user.su_id }, 'your_jwt_secret_key', { expiresIn: '1h' });
            res.json({ token });
        });
    } catch (error) {
        console.error('Error logging in:', error.message);
        res.status(500).send('Server error');
    }
});

// Verify Token Middleware
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

// Endpoint to handle CSV file upload and database insertion
app.post('/upload-csv', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const csvFile = req.files.csvFile;

    // Create a read stream from the uploaded file
    const csvStream = new stream.PassThrough();
    csvStream.end(csvFile.data);

    const results = [];

    csvStream.pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // First, clear the existing data from the table
                await clearTable('csv_data');

                // Insert new data from CSV
                for (const row of results) {
                    await insertRowIntoDatabase('csv_data', row);
                }
                res.status(200).send('CSV data imported successfully.');
            } catch (error) {
                console.error('Error importing CSV data:', error);
                res.status(500).send('Error importing CSV data.');
            }
        });
});

// Function to clear the table before inserting new data
const clearTable = (tableName) => {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM ${tableName}`;
        db.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// Function to insert a single row into MySQL database
const insertRowIntoDatabase = (tableName, data) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO ${tableName} (column1, column2, column3) VALUES (?, ?, ?)`;
        db.query(query, [data.column1, data.column2, data.column3], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// Endpoint to handle XML data upload and database insertion
app.post('/upload-xml', (req, res) => {
    const xmlData = req.body;
    console.log('Received XML Data:', xmlData); // Log incoming data for debugging

    xml2js.parseString(xmlData, async (err, result) => {
        if (err) {
            console.error('Error parsing XML:', err);
            return res.status(400).send('Invalid XML data');
        }

        const rows = result.root.row;

        try {
            await clearTable('xml_data');
            for (const row of rows) {
                if (row.column1 && row.column1[0] && row.column2 && row.column2[0] && row.column3 && row.column3[0]) { // Add validation here
                    await insertXmlRowIntoDatabase(row);
                } else {
                    console.warn('Skipping incomplete row:', row);
                }
            }
            res.status(200).send('XML data imported successfully.');
        } catch (error) {
            console.error('Error importing XML data:', error);
            res.status(500).send('Error importing XML data.');
        }
    });
});

// Endpoint to handle room XML data upload and database insertion
app.post('/room_xml', (req, res) => {
    const xmlData = req.body;
    console.log('Received XML Data:', xmlData); // Log incoming data for debugging

    xml2js.parseString(xmlData, async (err, result) => {
        if (err) {
            console.error('Error parsing XML:', err);
            return res.status(400).send('Invalid XML data');
        }

        const rows = result.root.row;
        try {
            await clearTable('xml_Room_data');
            for (const row of rows) {
                var Id=row.Id && row.Id[0];
                const roomNo = row.Room_No && row.Room_No[0];
                const roomType = row.Room_type && row.Room_type[0];
                const roomCapacity = row.Room_Capacity && row.Room_Capacity[0];

                if (roomNo && roomType && roomCapacity) {
                    await insertXmlRoomIntoDatabase(row);
                } else {
                    console.warn('Skipping incomplete row:', row);
                }
            }
            res.status(200).send('XML data imported successfully.');
        } catch (error) {
            console.error('Error importing XML data:', error);
            res.status(500).send('Error importing XML data.');
        }
    });
});
app.post('/teacher_xml', (req, res) => {
    const xmlData = req.body;
    console.log('Received XML Data:', xmlData); // Log incoming data for debugging

    xml2js.parseString(xmlData, async (err, result) => {
        if (err) {
            console.error('Error parsing XML:', err);
            return res.status(400).send('Invalid XML data');
        }

        const rows = result.root.row;
        try {
            await clearTable('xml_teacher_data');
            for (const row of rows) {
                var Id=row.Id && row.Id[0];
                const Teacher_Name = row.Teacher_Name && row.Teacher_Name[0];
                const Designation = row.Designation && row.Designation[0];
                const  Department = row.Department && row.Department[0];

                if (Teacher_Name &&  Designation && Department) {
                    await insertXmlTeacherIntoDatabase(row);
                } else {
                    console.warn('Skipping incomplete row:', row);
                }
            }
            res.status(200).send('XML data imported successfully.');
        } catch (error) {
            console.error('Error importing XML data:', error);
            res.status(500).send('Error importing XML data.');
        }
    });
});
app.post('/student_xml', (req, res) => {
    const xmlData = req.body;
    console.log('Received XML Data:', xmlData); // Log incoming data for debugging

    xml2js.parseString(xmlData, async (err, result) => {
        if (err) {
            console.error('Error parsing XML:', err);
            return res.status(400).send('Invalid XML data');
        }

        const rows = result.root.row;
        try {
            await clearTable('xml_student_data');
            for (const row of rows) {
                var Id=row.Id && row.Id[0];
                const Stu_Name = row.Stu_Name && row.Stu_Name[0];
                const Stu_Roll = row.Stu_Roll && row.Stu_Roll[0];
                const Stu_Email= row.Stu_Email && row.Stu_Email[0];
                const Stu_Dept=row.Stu_Dept && row.Stu_Dept[0];

                if (Stu_Name &&  Stu_Roll && Stu_Email && Stu_Dept) {
                    await insertXmlStudentIntoDatabase(row);
                } else {
                    console.warn('Skipping incomplete row:', row);
                }
            }
            res.status(200).send('XML data imported successfully.');
        } catch (error) {
            console.error('Error importing XML data:', error);
            res.status(500).send('Error importing XML data.');
        }
    });
});

// Function to insert a single row into the xml_data table
const insertXmlRowIntoDatabase = (row) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO xml_data (column1, column2, column3) VALUES (?, ?, ?)`;
        db.query(query, [row.column1[0], row.column2[0], row.column3[0]], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// Function to insert room data into the xml_data table
const insertXmlRoomIntoDatabase = (row) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO xml_Room_data (Id,Room_No, Room_Type, Room_Capacity) VALUES (?,?, ?, ?)';
        db.query(query, [row.Id[0],row.Room_No[0], row.Room_type[0], row.Room_Capacity[0]], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};
const insertXmlTeacherIntoDatabase = (row) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO xml_teacher_data (Id,Teacher_Name, Designation, Department) VALUES (?,?, ?, ?)';
        db.query(query, [row.Id[0],row.Teacher_Name[0], row.Designation[0], row.Department[0]], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};
const insertXmlStudentIntoDatabase = (row) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO xml_student_data (Id,Stu_Name,Stu_Roll,Stu_Email,Stu_Dept) VALUES (?,?, ?, ?,?)';
        db.query(query, [row.Id[0],row.Stu_Name[0], row.Stu_Roll[0], row.Stu_Email[0],row.Stu_Dept[0]], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

const startServer = (port) => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`Port ${port} is in use, trying another port...`);
            startServer(port + 1);
        } else {
            throw err;
        }
    });
};

startServer(PORT);
