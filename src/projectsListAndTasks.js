const superagent = require('superagent');
 
superagent.get('http://127.0.0.1:8081/listProjectsAndTasks')
.end((err, res) => {
  if (err) { return console.log(err); }
  else
  {
    var projectsList = JSON.parse(res.text);
    
    for (projectIndex in projectsList) {
      var datasForProject = projectsList[projectIndex];
      
      var newProjectHTML = `<div class=\"card border-dark mb-3\" id="cardProject` + datasForProject.project.projectId + `">
                        <div class=\"card-header\"><h5>`;
      newProjectHTML += datasForProject.project.name;
      newProjectHTML += `</h5></div><div class="card-body"><ul class="list-group list-group-flush sortable">`

      for(taskIndex in datasForProject.tasks)
      {
        newProjectHTML += `<li class="list-group-item column" draggable="true" id="task_` + datasForProject.tasks[taskIndex].taskId + `" ><input type="checkbox" class="taskDoneCheckbox" id="checkbox_task_`+datasForProject.tasks[taskIndex].taskId+`" />&nbsp;` + datasForProject.tasks[taskIndex].name + `</li>`;
      }
      newProjectHTML += `<li class="list-group-item"><a href="#" class="addTasksLink"><img src="img/add_button.png" alt="add task" />&nbsp;Add tasks</a></li>
                    </ul>
                    </div>
                    <div class=\"card-footer bg-transparent\">
                      <p class=\"card-text\">
                        <small class=\"text-muted\">Last updated 3 mins ago</small>
                      </p>
                    </div>
                  </div>`;
      
      $("#projectsList").append(newProjectHTML);
    }

    var cols = document.querySelectorAll('.column');
    [].forEach.call(cols, addDnDHandlers);
  }  
});

var dragSrcEl = null;

function handleDragStart(e) {
  // Target (this) element is the source node.
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);

  this.classList.add('dragElem');
}
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }
  this.classList.add('over');

  e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

  return false;
}

function handleDragEnter(e) {
  // this / e.target is the current hover target.
}

function handleDragLeave(e) {
  this.classList.remove('over');  // this / e.target is previous target element.
}

function handleDrop(e) {
  // this/e.target is current target element.

  if (e.stopPropagation) {
    e.stopPropagation(); // Stops some browsers from redirecting.
  }

  // Don't do anything if dropping the same column we're dragging.
  if (dragSrcEl != this) {
    // Set the source column's HTML to the HTML of the column we dropped on.
    //alert(this.outerHTML);
    //dragSrcEl.innerHTML = this.innerHTML;
    //this.innerHTML = e.dataTransfer.getData('text/html');    
    this.parentNode.removeChild(dragSrcEl);
    var dropHTML = e.dataTransfer.getData('text/html');
    this.insertAdjacentHTML('beforebegin',dropHTML);
    var dropElem = this.previousSibling;
    addDnDHandlers(dropElem);

    var listTasks = $(dropElem).parent().children(".column");
    
    for(var taskIndex = 0; taskIndex < listTasks.length; taskIndex++)
    {      
      superagent.get('http://127.0.0.1:8081/changeTaskOrder/' + $(listTasks[taskIndex]).attr('id').replace('task_', '') + '/' + taskIndex)
      .end((err, res) => {
        if(err != null)
        {
          console.log(err);
        }
      });
    }
  }
  this.classList.remove('over');
  return false;
}

function handleDragEnd(e) {
  // this/e.target is the source node.
  this.classList.remove('over');

  /*[].forEach.call(cols, function (col) {
    col.classList.remove('over');
  });*/
}

function addDnDHandlers(elem) {
  elem.addEventListener('dragstart', handleDragStart, false);
  elem.addEventListener('dragenter', handleDragEnter, false)
  elem.addEventListener('dragover', handleDragOver, false);
  elem.addEventListener('dragleave', handleDragLeave, false);
  elem.addEventListener('drop', handleDrop, false);
  elem.addEventListener('dragend', handleDragEnd, false);
}

function AddTask()
{
  if($("#AddTaskName").val() != '')
  {
    var dataToInsert = { name:$("#AddTaskName").val(), project:$("#AddTaskButton").parent().parent().parent().parent().parent().attr('id').replace('cardProject',''),duration:"1"};

    superagent.post('http://127.0.0.1:8081/addTask')
              .type('form')
              .send(dataToInsert)
              .set('Accept', 'application/json')
              .end((err, res) => {
                if(err != null)
                  console.log(err);
                else
                {
                  // Add a line for this task:
                  $("#AddTaskButton").parent().parent().parent().prepend(`<li class="list-group-item">` + $("#AddTaskName").val() + `</li>`);
                  
                  // Remove the form:
                  $("#AddTaskButton").parent().remove();
                }
              });
  }  
}

$(document).on("click", ".taskDoneCheckbox" , function() {
  superagent.get('http://127.0.0.1:8081/validateTask/' + $(this).attr('id').replace('checkbox_task_', ''))
  .end((err, res) => {
    if(err != null)
    {
      console.log(err);
    }
    else
    {
      $(this).parent().remove();
    }
  });
});

$(document).on("click", "#AddTaskButton" , function() {
  AddTask();       
});

$(document).keypress(function (e) {
  if (e.which == 13 && $("#AddTaskName").val() != undefined) {
    AddTask();
  }
});


