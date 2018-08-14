var express = require('express');
var app = express();
var cors = require('cors');
var fs = require("fs");
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({
    extended: true
  }));

const mysql = require( 'mysql' );
class Database {
    constructor(  ) {
        this.connection = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database : "todoplannerdb" 
        });
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {                
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
}

database = new Database();

app.use(cors());

app.get('/listProjects', function (req, res) {
    database.query('SELECT * FROM projects').then(rows => {
        return res.send({ error: false, data: rows, message: 'Todos list.' });
    }).catch(err => {
        console.log(err);
    });
})

app.get('/listProjectsAndTasks', function (req, res) {   
    var projectsAndTasks = []; 
    database.query('SELECT * FROM projects WHERE done = 0').then(rows => {
        for(result in rows)
        {
            var test = findTasks(rows[result]).then(tasksResult => { 
                projectsAndTasks.push(tasksResult);
            
                if(projectsAndTasks.length == rows.length)
                {
                return res.send(projectsAndTasks);
                }
            })
            .catch(err => {
                console.log(err);
            });
        }
    })
})

app.get('/validateTask/:taskId', function (req, res) {   
    database.query('UPDATE tasks SET finished = 1 WHERE taskId = ' + req.params.taskId).then(rows => {
        res.send({ error:false, data: req.params.taskId, message:'Task finished.'});
    })
    .catch(err => {
        console.log(err);
        res.send({ error:true, data: err, message:'No task validated, check errors'});
    });
})

app.get('/changeTaskOrder/:taskId/:order', function (req, res) {   
    database.query('UPDATE tasks SET pos = ' + req.params.order + ' WHERE taskId = ' + req.params.taskId).then(rows => {
        res.send({ error:false, data: req.params.taskId, message:'Task finished.'});
    })
    .catch(err => {
        console.log(err);
        res.send({ error:true, data: err, message:'No task validated, check errors'});
    });
})

// Add a new todo  
app.post('/addTask', function (req, res) {
    let task = req.body;

    if (!task) {
        return res.status(400).send({ error:true, message: 'Please provide task' });
    }

    var params = [task.name , task.project, task.duration];

    var result = database.query("INSERT INTO tasks (`name`, `project`, `duration`) VALUES (?, ?, ?)", params).then(rows => {
        return res.send({ error: false, data: rows, message: 'New task has been created successfully.' });
    })
    .catch(err => {
        if(err != null)
        {
            console.log(err);
            res.send({ error:true, data: err, message:'No task added, check errors'});
        }
    });
});

function findTasks(data)
{
    //return 'SELECT * FROM tasks WHERE project = ' + data.projectId;
    return database.query('SELECT * FROM tasks WHERE finished = 0 and project = ' + data.projectId + ' ORDER BY pos').then(rows => { return {project : data, tasks : rows}; });
    //console.log(data.name + " : " + rows.length);
    //return rows;
}

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("The todoPlanner server is now listening on http://%s:%s", host, port)

})