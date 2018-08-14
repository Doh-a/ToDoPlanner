const superagent = require('superagent');
 
superagent.get('http://127.0.0.1:8081/listProjectsAndTasks')
.end((err, res) => {
  if (err) { return console.log(err); }
  else
  {
    var projectsList = JSON.parse(res.text);
    
    for (key in projectsList.data) {
      
      var newProjectHTML = `<div class=\"card border-dark mb-3\">
      <div class=\"card-header\"><h5>`;
      newProjectHTML += projectsList.data[key].name;
      newProjectHTML += `</h5></div><div class=\"card-body\"><ul class=\"list-group list-group-flush\">
                        <li class=\"list-group-item\">Cras justo odio</li>
                        <li class=\"list-group-item\">Dapibus ac facilisis in</li>
                        <li class=\"list-group-item\">Vestibulum at eros</li>
                      </ul>
                    </div>
                    <div class=\"card-footer bg-transparent\">
                      <p class=\"card-text\">
                        <small class=\"text-muted\">Last updated 3 mins ago</small>
                      </p>
                    </div>
                  </div>`;
      
      $("#projectsList").append(newProjectHTML);
      

      console.log(projectsList.data[key].name);
    }
  }  
});