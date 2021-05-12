const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const exphbs = require('express-handlebars');

const mysql = require('mysql');

const fs = require('fs');
const path = require('path');

app.use(express.static(__dirname + "/public"));


app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));





//Handlebars setting

app.set("view engine", "hbs");

app.engine('hbs', exphbs({

  extname: 'hbs',

  defaultLayout: 'index',

  layoutsDir: __dirname + '/views/layouts',

  partialsDir: __dirname + '/views/partials',
}));





//Create connection

const conn = mysql.createConnection({

  host: 'localhost',

  user: 'root',

  password: 'root',

  database: 'isurvey',

  multipleStatements: true

});



//connect to database

conn.connect((err) => {

  if (err) throw err;

  console.log('Mysql Connected...');

});



//route for homepage

app.get('/', (req, res) => {



  res.render("main", {});

});



//////////////////////////////////////////////////////////////////////////////////////////////
//Surveys



//default route

app.get('/surveys', (req, res) => {

  let sql = "SELECT * FROM surveys";

  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.render('survey', {

      survey: results

    });

  });

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//route for insert data

app.post('/savesurvey', (req, res) => {

  let data = {
    surveyname: req.body.surveyname, surveydescription:

      req.body.surveydescription
  };

  let sql = "INSERT INTO surveys SET ?";

  let query = conn.query(sql, data, (err, results) => {

    if (err) throw err;

    res.redirect('/surveys');

  });

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//route for update data

app.post('/updatesurvey', (req, res) => {

  let sql = "UPDATE surveys SET surveyname='" + req.body.surveyname + "', surveydescription='" + req.body.surveydescription + "' WHERE surveyid=" + req.body.surveyid + "";
  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.redirect('/surveys');

  });

});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//route for delete data

app.post('/deletesurvey', (req, res) => {

  let sql = "DELETE FROM surveys WHERE surveyid=" + req.body.surveyid + "";

  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.redirect('/surveys');

  });

});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Questions



//default route

app.get('/questions', (req, res) => {

  let sql = "SELECT * FROM questions";

  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.render('question', {

      question: results

    });

  });

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//route for insert data
app.post('/savequestion', (req, res) => {

  let data = { questiondescription: req.body.questiondescription };

  let sql = "INSERT INTO questions SET ?";

  let query = conn.query(sql, data, (err, results) => {

    if (err) throw err;

    res.redirect('/questions');

  });

});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//route for update data
app.post('/updatequestion', (req, res) => {

  let sql = "UPDATE questions SET questiondescription='" + req.body.questiondescription + "' WHERE questionid=" + req.body.questionid + "";

  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.redirect('/questions');

  });

});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//route for delete data
app.post('/deletequestion', (req, res) => {

  let sql = "DELETE FROM questions WHERE questionid=" + req.body.questionid + "";

  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.redirect('/questions');

  });

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Reports

//default route

/*app.get('/reports', (req, res) => {

  let sql = "SELECT * FROM reports";

  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.render('report', {

      report: results

    });

  });

});
*/

app.get('/reports', (req, res) => {

  let sql = "SELECT DISTINCT surveys.surveyid, surveys.surveyname, surveys.surveydescription, (SELECT COUNT(DISTINCT surveyinstanceid) FROM surveyinstances WHERE surveyid = SI.surveyid) as responses  FROM surveyinstances SI inner join  surveys on SI.surveyid = surveys.surveyid;";

  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.render('report', {

      report: results

    });

  });

});


app.get('/reportsurveydetails/:surveyid', (req, res) => {


  //let sql = "select  questions.questiondescription,  surveyinstances.answer,   surveyinstances.surveyid,    surveys.surveyname,    surveys.surveydescription,    users.userfullname    from  surveyinstances    inner join    users on surveyinstances.userid = users.userid    inner join  surveys on surveyinstances.surveyid = surveys.surveyid  inner join  questions on  surveyinstances.questionid = questions.questionid  where surveyinstances.surveyid = " + req.params.surveyid + "";
 // let sql1 = "select  surveys.surveyid,    surveys.surveyname,    surveys.surveydescription from  surveys where surveys.surveyid = " + req.params.surveyid + "";
 //let sql = "select  DISTINCT questions.questiondescription,  surveyinstances.answer  from  surveyinstances  inner join questions on  surveyinstances.questionid = questions.questionid  where surveyinstances.surveyid = " + req.params.surveyid + "";
  let sql = "select  surveys.surveyid,    surveys.surveyname,    surveys.surveydescription from  surveys where surveys.surveyid = ?;select  DISTINCT questions.questiondescription from  surveyinstances  inner join questions on  surveyinstances.questionid = questions.questionid  where surveyinstances.surveyid = ?";
 // let sql = "select  surveys.surveyid,    surveys.surveyname,    surveys.surveydescription from  surveys where surveys.surveyid = ?;select  DISTINCT questions.questiondescription, questions.questionid from  surveyinstances  inner join questions on  surveyinstances.questionid = questions.questionid  where surveyinstances.surveyid = ? order by questions.questionid";
  
  
  //let query = conn.query(sql, (err, results) => {
  let query = conn.query(sql, [req.params.surveyid, req.params.surveyid ], (err, results, fields) => {
 
    if (err) throw err;

    res.render('reportsurveydetails', {

      surveydetails: results[0],
      questiondetails: results[1]

    });

  });

});




app.get('/reportsurveyinstances/:surveyid', (req, res) => {


  let sql = "select DISTINCT surveyinstances.surveyinstanceid,  surveyinstances.surveyid,  surveys.surveyname,  surveys.surveydescription,  users.userfullname  from  surveyinstances  inner join  users on surveyinstances.userid = users.userid  inner join  surveys on surveyinstances.surveyid = surveys.surveyid where surveyinstances.surveyid = " + req.params.surveyid + "";
  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.render('reportsurveyinstances', {

      surveyinstances: results

    });

  });

});

app.get('/reportsurveyinstancequestions/:surveyinstanceid', (req, res) => {


  let sql = "select surveyinstances.surveyinstanceid, surveyinstances.questionid,  questions.questiondescription  from  surveyinstances  inner join  questions on surveyinstances.questionid = questions.questionid where surveyinstances.surveyinstanceid = " + "'" + req.params.surveyinstanceid + "'" +  "";
  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.render('reportsurveyinstancequestions', {

      surveyinstancequestions: results

    });

  });

});

app.get('/reportsurveyinstanceanswers/:questionid/:surveyinstanceid', (req, res) => {


  let sql = "select  surveyinstances.answer,  questions.questiondescription  from  surveyinstances  inner join  questions on surveyinstances.questionid = questions.questionid where surveyinstances.surveyinstanceid = " + "'" + req.params.surveyinstanceid + "'" + " and surveyinstances.questionid = " + req.params.questionid  +  "";
  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.render('reportsurveyinstanceanswers', {

      reportsurveyinstanceanswers: results

    });

  });

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Users

//default route

app.get('/users', (req, res) => {

  let sql = "SELECT * FROM users";

  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.render('user', {

      user: results

    });

  });

});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//route for insert data

app.post('/saveuser', (req, res) => {

  let data = { username: req.body.username, userfullname: req.body.userfullname, userpasscode: req.body.userpasscode, usermobile: req.body.usermobile };

  let sql = "INSERT INTO users SET ?";

  let query = conn.query(sql, data, (err, results) => {

    if (err) throw err;

    res.redirect('/users');

  });

});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//route for update data

app.post('/updateuser', (req, res) => {

  let sql = "UPDATE users SET username='" + req.body.username + "', userpasscode='" + req.body.userpasscode + "', usermobile='" + req.body.usermobile + "',userfullname='" + req.body.userfullname + "' WHERE userid=" + req.body.userid + "";


  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.redirect('/users');

  });

});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//route for delete data

app.post('/deleteuser', (req, res) => {

  let sql = "DELETE FROM users WHERE userid=" + req.body.userid + "";

  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.redirect('/users');

  });

});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Survey Questions

app.get('/surveyquestions/:surveyid', (req, res) => {


  let sql = "select questions.questionid, questions.questiondescription, surveys.surveyname, surveys.surveyid from surveys inner join  questions   inner join  surveyquestions on surveys.surveyid = surveyquestions.surveyid and questions.questionid = surveyquestions.questionid where surveyquestions.surveyid = " + req.params.surveyid + "";
  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.render('surveyquestions', {

      question: results

    });

  });

});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/unassignedsurveyquestions/:surveyid', (req, res) => {

  let sql = "select questions.questionid, questions.questiondescription,  surveys.surveyname, surveys.surveyid from surveys inner join  questions   left join  surveyquestions on surveys.surveyid = surveyquestions.surveyid and questions.questionid = surveyquestions.questionid where surveyquestions.questionid IS NULL and surveys.surveyid = " + req.params.surveyid + "";
  let query = conn.query(sql, (err, results) => {

    if (err) throw err;

    res.render('unassignedsurveyquestions', {

      question: results

    });

  });

});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //route for unassign questions
  app.post('/unassignquestion', (req, res) => {


    let sql = "DELETE FROM surveyquestions WHERE questionid = " + req.body.questionid + " AND surveyid =" + req.body.surveyid + "";

    let query = conn.query(sql, (err, results) => {

      if (err) throw err;

      res.redirect('/surveyquestions/' + req.body.surveyid);

      //res.render('/surveyquestions/' +req.body.surveyid ,{

      //question: results

      });

    });

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //route for insert data

    app.post('/assignquestion', (req, res) => {

      let data = {
        questionid: req.body.questionid, surveyid: req.body.surveyid
      };


      let sql = "INSERT INTO surveyquestions SET ?";

      let query = conn.query(sql, data, (err, results) => {

        if (err) throw err;

        res.redirect('/unassignedsurveyquestions/' + req.body.surveyid);

      });

    });

  

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // User Surveys

      app.get('/usersurveys/:userid', (req, res) => {

        let sql = "select users.userid,   users.userfullname,   surveys.surveyname,   surveys.surveyid   from surveys inner join  users   inner join  usersurveys on surveys.surveyid = usersurveys.surveyid   and users.userid = usersurveys.userid where usersurveys.userid = " + req.params.userid + "";
        let query = conn.query(sql, (err, results) => {

          if (err) throw err;

          res.render('usersurveys', {

            survey: results

          });

        });

      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        app.get('/unassignedusersurveys/:userid', (req, res) => {

        //  let sql = "select "  + req.params.userid + " userid, surveys.surveyname, surveys.surveyid from surveys left join usersurveys ON surveys.surveyid = usersurveys.surveyid where usersurveys.surveyid IS NULL";
          let sql = "select "  + req.params.userid + " userid, surveys.surveyname, surveys.surveyid from surveys  where surveyid not in (select surveyid from usersurveys where userid = " + req.params.userid + ");"
         
          let query = conn.query(sql, (err, results) => {

            if (err) throw err;

            res.render('unassignedusersurveys', {

              survey: results

            });

          });

        });

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        app.post('/assignsurvey', (req, res) => {

            let data = {
              surveyid: req.body.surveyid, userid: req.body.userid
            };


            let sql = "INSERT INTO usersurveys SET ?";

            let query = conn.query(sql, data, (err, results) => {

              if (err) throw err;

              res.redirect('/unassignedusersurveys/' + req.body.userid );

            });

          });

       ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        app.post('/unassignsurvey', (req, res) => {

          let sql = "DELETE FROM usersurveys WHERE surveyid = " + req.body.surveyid + " AND userid =" + req.body.userid + "";

          let query = conn.query(sql, (err, results) => {

            if (err) throw err;

            res.redirect('usersurveys/' + req.body.userid);

            //res.render('/surveyquestions/' +req.body.surveyid ,{

            //question: results

            //});

          });

        });

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // //route for assign questions
        // app.post('/assignquestion', (req, res) => {


        //  let data = { questionid: req.body.questionid, surveyid: req.body.surveyid };

        //   let sql = "INSERT INTO surveyquestions SET ?";


        //   let query = conn.query(sql, data, (err, results) => {


        //     if (err) throw err;

        //     res.redirect('/unassignedsurveyquestions/' + req.body.surveyid);

        //     //res.render('/surveyquestions/' +req.body.surveyid ,{

        //     //question: results

        //     //});

        //   });

        // });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

















        const port = 8900;

        app.listen(port);

        console.log(`Listening to server: http://localhost:${port}`);