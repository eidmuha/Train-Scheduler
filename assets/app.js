var trainname = '';
var destination = '';
var firstTrainTime = '';
var trainFrequency = 0;

// get the database reference
var database = firebase.database();

$().ready(function () {
  var trainDetail = firebase.database().ref('trains/');
  trainDetail.on("child_added", function (snapshot) {
    updateTable(snapshot.val().trainname, snapshot.val().destination, snapshot.val().firstTrainTime, snapshot.val().trainFrequency);
  });

  // adding from the form
  $("#submitBtn").on("click", function () {
    trainname = $("#inputTrainName").val().trim()
    destination = $("#inputDest").val().trim()
    firstTrainTime = $("#inputTranTime").val().trim();
    trainFrequency = $("#inputFrequency").val().trim();

    // function that write the data to the table
    writeTrainData(trainname, destination, firstTrainTime, trainFrequency);
  });


  // write to the database
  function writeTrainData(trainname, destination, firstTrainTime, trainFrequency) {

    firebase.database().ref('trains/').push({
      trainname: trainname,
      destination: destination,
      firstTrainTime: firstTrainTime,
      trainFrequency: trainFrequency
    });
  }

  // retrieving table data in realtime
  function updateTable(trainname, destination, firstTrainTime, trainFrequency) {


    // First Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConverted = moment(firstTrainTime, "HH:mm").subtract(1, "years");

    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

    // Time apart (remainder)
    var tRemainder = diffTime % trainFrequency;

    // Minute Until Train
    var tMinutesTillTrain = trainFrequency - tRemainder;

    // Next Train
    var nextTrain = moment().add(tMinutesTillTrain, "minutes");

    // change the format of the time
    var nextArival = moment(nextTrain).format('hh:mm')

    // Create the new row
    var newRow = $("<tr>").append(
      $("<td>").text(trainname),
      $("<td>").text(destination),
      // $("<td>").text(firstTrainTime),
      $("<td>").text(trainFrequency),
      $("<td>").text(nextArival),
      $("<td>").text(tMinutesTillTrain)

    );

    // Append the new row to the table
    $("#train-table > tbody").append(newRow);

  }

})