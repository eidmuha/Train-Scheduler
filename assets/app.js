var trainname = "";
var destination = "";
var firstTrainTime = "";
var trainFrequency = 0;

// get the database reference
var database = firebase.database();

// delete button, deletes the whole row from UI and Firebase
$(document).on("click", ".delBtn", function() {
  var recordID = $(this).attr("data-delete");

  database.ref("trains/" + recordID).remove();
  $(this)
    .parent()
    .parent()
    .remove();
});

// delete button, deletes the whole row from UI and Firebase
$(document).on("click", ".editBtn", function(event) {
  event.preventDefault();

  var tbl_row = $(this).closest("tr");
  var row_id = tbl_row.attr("row_id");

  tbl_row.find(".safeBtn").show();
  tbl_row.find(".cancelBtn").show();
  tbl_row.find(".delBtn").hide();
  tbl_row.find(".editBtn").hide();

  tbl_row
    .find(".row_data")
    .attr("contenteditable", "true")
    .attr("edit_type", "button")
    .addClass("bg-warning")
    .css("padding", "3px");

  tbl_row.find(".row_data").each(function(index, val) {
    //this will help in case user decided to click on cancel button
    $(this).attr("original_entry", $(this).html());
  });
});

$(document).on("click", ".cancelBtn", function(event) {
  event.preventDefault();

  var tbl_row = $(this).closest("tr");

  var row_id = tbl_row.attr("row_id");

  //hide save and cacel buttons
  tbl_row.find(".safeBtn").hide();
  tbl_row.find(".cancelBtn").hide();
  tbl_row.find(".delBtn").show();
  tbl_row.find(".editBtn").show();

  //make the whole row editable
  tbl_row
    .find(".row_data")
    .attr("edit_type", "click")
    .removeClass("bg-warning")
    .css("padding", "");

  tbl_row.find(".row_data").each(function(index, val) {
    $(this).html($(this).attr("original_entry"));
  });
});

//--->save whole row entery > start
$(document).on("click", ".safeBtn", function(event) {
  event.preventDefault();
  var tbl_row = $(this).closest("tr");

  // var row_id = tbl_row.attr('row_id');
  var data_edit = $(this).attr("data-edit");

  tbl_row.find(".safeBtn").hide();
  tbl_row.find(".cancelBtn").hide();
  tbl_row.find(".delBtn").show();
  tbl_row.find(".editBtn").show();

  //make the whole row editable
  tbl_row
    .find(".row_data")
    .attr("edit_type", "click")
    .removeClass("bg-warning")
    .css("padding", "");

  //--->get row data > start
  var newValues = [];
  tbl_row.find(".row_data").each(function(index, val) {
    var col_name = $(this).attr("col_name");
    var col_val = $(this).html();
    newValues[col_name] = col_val;
  });
  console.log("here: " + data_edit);
  updateFirebase(newValues, data_edit);
});

function updateFirebase(newValues, data_edit) {
  const fb = firebase.database().ref();

  var data = {
    trainname: newValues.name,
    destination: newValues.dest,
    trainFrequency: newValues.tfreq,
    firstTrainTime: newValues.arival
  };

  // update database
  fb.child("trains/" + data_edit).update(data);
}

$().ready(function() {
  var trainDetail = firebase.database().ref("trains/");
  trainDetail.on("child_added", function(snapshot) {
    updateTable(
      snapshot.val().trainname,
      snapshot.val().destination,
      snapshot.val().firstTrainTime,
      snapshot.val().trainFrequency,
      snapshot.ref.key
    );
  });

  // adding from the form
  $("#submitBtn").on("click", function(e) {
    e.preventDefault();
    trainname = $("#inputTrainName")
      .val()
      .trim();
    destination = $("#inputDest")
      .val()
      .trim();
    firstTrainTime = $("#inputTranTime")
      .val()
      .trim();
    trainFrequency = $("#inputFrequency")
      .val()
      .trim();

    // function that write the data to the table

    if (
      trainname != "" &&
      destination != "" &&
      firstTrainTime != "" &&
      trainFrequency != ""
    ) {
      writeTrainData(trainname, destination, firstTrainTime, trainFrequency);
      $("#inputTrainName").val("");
      $("#inputDest").val("");
      $("#inputTranTime").val("");
      $("#inputFrequency").val("");
    }
  });

  // write to the database
  function writeTrainData(
    trainname,
    destination,
    firstTrainTime,
    trainFrequency
  ) {
    firebase
      .database()
      .ref("trains/")
      .push({
        trainname: trainname,
        destination: destination,
        firstTrainTime: firstTrainTime,
        trainFrequency: trainFrequency
      });
  }

  // retrieving table data in realtime
  function updateTable(
    trainname,
    destination,
    firstTrainTime,
    trainFrequency,
    key
  ) {
    // First Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConverted = moment(firstTrainTime, "HH:mm").subtract(
      1,
      "years"
    );

    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

    // Time apart (remainder)
    var tRemainder = diffTime % trainFrequency;

    // Minute Until Train
    var tMinutesTillTrain = trainFrequency - tRemainder;

    // Next Train
    var nextTrain = moment().add(tMinutesTillTrain, "minutes");

    // change the format of the time
    var nextArival = moment(nextTrain).format("hh:mm");

    // create update and delete button
    var edit = '<button class="editBtn" ><i class="fa fa-edit"></i></button>';
    var del =
      '<button class="delBtn" data-delete = ' +
      key +
      '><i class="fa fa-trash-o"></i></button>';
    var safe =
      '<button class="safeBtn" data-edit = ' + key + ">&#10004;</button>";
    var canCel =
      '<button class="cancelBtn"><i class="fa fa-close"></i></button>';

    // Create the new row
    var newRow = $("<tr>").append(
      $("<td>").html(
        "<div class='row_data' edit_type='click' col_name='name'>" +
          trainname +
          "</div>"
      ),
      $("<td>").html(
        "<div class='row_data' edit_type='click' col_name='dest'>" +
          destination +
          "</div>"
      ),
      // $("<td>").text(firstTrainTime),
      $("<td>").html(
        "<div class='row_data' edit_type='click' col_name='tfreq'>" +
          trainFrequency +
          "</div>"
      ),
      $("<td>").html(
        "<div class='row_data' edit_type='click' col_name='arival'>" +
          nextArival +
          "</div>"
      ),
      $("<td>").html(
        "<div class='row_data' edit_type='click' col_name='nextTrain'>" +
          tMinutesTillTrain +
          "</div>"
      ),
      $("<td>").html(edit + " " + del),
      $("<td>").html(safe + " " + canCel)
    );

    // Append the new row to the table
    $("#train-table > tbody").append(newRow);
    $(".safeBtn").hide();
    $(".cancelBtn").hide();
  }
});
