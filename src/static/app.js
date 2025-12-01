document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const participantsList = document.getElementById("participants-list");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and previous options
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const participantsHtml =
          details.participants && details.participants.length
            ? `<ul class="participants-list">${details.participants
                .map((p) => `<li>${p}</li>`)
                .join("")}</ul>`
            : `<p class="info">No participants yet</p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h5>Participants</h5>
            ${participantsHtml}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Function to fetch participants
  async function fetchParticipants() {
    try {
      const response = await fetch("/participants");
      const participants = await response.json();

      participantsList.innerHTML = ""; // Clear existing participants

      participants.forEach((participant) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
          ${participant.name}
          <button class="delete-button" data-id="${participant.id}">❌</button>
        `;
        participantsList.appendChild(listItem);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-button").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const participantId = event.target.getAttribute("data-id");

          try {
            const deleteResponse = await fetch(`/participants/${participantId}`, {
              method: "DELETE",
            });

            if (deleteResponse.ok) {
              fetchParticipants(); // Refresh the list
            } else {
              console.error("Failed to delete participant");
            }
          } catch (error) {
            console.error("Error deleting participant:", error);
          }
        });
      });
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  }

  // Initialize app
  fetchActivities();
  fetchParticipants();
});
