document.addEventListener("DOMContentLoaded", function() {
  // Variable to store the interval ID
  let refreshInterval;

  // Function to fetch schedule data and update the page
  function updateSchedule() {
    const today = new Date();
    const day = today.getDay(); // Get the day of the week (0 for Sunday)

    let scheduleFile = 'schedule-sat.json';
    switch (day) {
      case 6: // Saturday
        scheduleFile = 'schedule-sat.json';
        break;
      case 0: // Sunday
        scheduleFile = 'schedule-sun.json';
        break;
    }

    fetch(scheduleFile)
      .then(response => response.json())
      .then(data => {
        var scheduleHTML = generateSchedule(data);
        document.getElementById('schedule').innerHTML = scheduleHTML;
      })
      .catch(error => console.error('Error fetching schedule:', error));
  }


  // Call updateSchedule function initially
  updateSchedule();

  // Function to generate schedule HTML
  function generateSchedule(data) {
    var scheduleHTML = '';

    // Check if JSON data is empty
    if (!data || !data.stages || data.stages.length === 0) {
        scheduleHTML = '<p>No schedule available</p>';
        return scheduleHTML;
    }

    data.stages.forEach(stage => {
        // scheduleHTML += '<h2>' + stage.name + '</h2>';
        scheduleHTML += '<h2 id="' + stage.name + '">' + stage.name + '</h2>'; //Anchors aanmaken
        scheduleHTML += '<ul>';

        var currentTime = new Date(); // Current time
        var allArtistsFinished = true; // Flag to check if all artists finished

        stage.entries.forEach(entry => {
            // Dynamically construct startTime and endTime based on the current date
            var startDateString = new Date().toISOString().split('T')[0];
            var startTime = new Date(startDateString + 'T' + entry.start_time + ':00');
            var endTime = new Date(startDateString + 'T' + entry.end_time + ':00');
            var currentTimeClass = '';
            var timeHTML = '';

            // Check if the entry is upcoming, current, or already played
            if (currentTime < startTime) {
                currentTimeClass = 'upcoming';
                timeHTML = '<span class="time">' + entry.start_time + ' - ' + entry.end_time + '</span>';
                allArtistsFinished = false; // There are upcoming artists
            } else if (currentTime >= startTime && currentTime <= endTime) {
                currentTimeClass = 'current';
                var remainingTime = Math.max(0, (endTime - currentTime) / 1000); // Remaining time in seconds
                var minutes = Math.floor(remainingTime / 60);
                var seconds = Math.floor(remainingTime % 60);
                if (minutes > 0) {
                    timeHTML = '<span class="countdown">' + minutes + 'm ' + seconds + 's</span>';
                } else {
                    timeHTML = '<span class="countdown">' + seconds + 's</span>';
                }
                allArtistsFinished = false; // There is a current artist
            } else if (currentTime > endTime) {
                // Skip adding the artist if the current time is after the end time
                return;
            } else {
                currentTimeClass = '';
                timeHTML = '';
            }

            // Check if there's no artist entry
            if (!entry.artist) {
                entry.artist = 'No artist scheduled';
                currentTimeClass = 'no-artist'; // Adding a specific class for styling purposes
            }

            scheduleHTML += '<li class="' + currentTimeClass + '">';
            scheduleHTML += timeHTML + ' | ' + entry.artist;
            scheduleHTML += '</li>';
        });

        // If all artists have finished, display a message
        if (allArtistsFinished) {
            scheduleHTML += '<li class="no-artist">All artists have finished</li>';
        }

        scheduleHTML += '</ul>';
    });

    return scheduleHTML;
  }

  // Function to start or stop the interval based on page visibility
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      // If tab is visible, start the interval
      refreshInterval = setInterval(updateSchedule, 1000); // 60000 milliseconds = 1 minute
    } else {
      // If tab is hidden, clear the interval
      clearInterval(refreshInterval);
    }
  }

  // Add event listener for visibility change
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Start the interval initially
  refreshInterval = setInterval(updateSchedule, 1000); // 60000 milliseconds = 1 minute
});
