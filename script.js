let formation = "4+1";
let players = [];

function selectFormation(f) {
  formation = f;
  document.querySelectorAll(".formation-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");
}

function addPlayer() {
  const name = document.getElementById("playerName").value.trim();
  const skill = document.getElementById("playerSkill").value;
  const isGk = document.getElementById("isGoalkeeper").checked;

  if (!name) {
    alert("Unesi ime igrača!");
    return;
  }

  players.push({ name, skill, isGk, id: Date.now() });
  document.getElementById("playerName").value = "";
  document.getElementById("isGoalkeeper").checked = false;
  renderPlayers();
}

function removePlayer(id) {
  players = players.filter((p) => p.id !== id);
  renderPlayers();
}

function renderPlayers() {
  const list = document.getElementById("playersList");
  if (players.length === 0) {
    list.innerHTML = "";
    return;
  }

  list.innerHTML = players
    .map(
      (p) => `
                <div class="player-item">
                    <div class="player-info">
                        <span class="player-name">${p.name}</span>
                        <span class="skill-badge skill-${
                          p.skill
                        }">${p.skill.toUpperCase()}</span>
                        ${
                          p.isGk
                            ? '<span class="goalkeeper-badge">GOLMAN</span>'
                            : ""
                        }
                    </div>
                    <button class="remove-btn" onclick="removePlayer(${
                      p.id
                    })">Ukloni</button>
                </div>
            `
    )
    .join("");
}

function balanceTeams() {
  const playersPerTeam = formation === "4+1" ? 5 : 6;
  const totalNeeded = playersPerTeam * 2;

  document.getElementById("errorMsg").innerHTML = "";
  document.getElementById("teamsContainer").innerHTML = "";

  if (players.length < totalNeeded) {
    document.getElementById(
      "errorMsg"
    ).innerHTML = `<div class="error-msg">Potrebno je ${totalNeeded} igrača za ${formation} formaciju. Trenutno ima ${players.length}.</div>`;
    return;
  }

  const goalkeepers = players.filter((p) => p.isGk);
  const fieldPlayers = players.filter((p) => !p.isGk);

  if (goalkeepers.length > 2) {
    document.getElementById(
      "errorMsg"
    ).innerHTML = `<div class="error-msg">Previše golmana! Maksimalno 2 golmana.</div>`;
    return;
  }

  const skillValue = { low: 1, medium: 2, high: 3 };

  // Sortiraj igrače po skillu (od najvećeg ka najmanjem)
  fieldPlayers.sort((a, b) => skillValue[b.skill] - skillValue[a.skill]);

  const team1 = [];
  const team2 = [];
  let team1Score = 0;
  let team2Score = 0;

  // Rasporedi golmane
  if (goalkeepers.length === 2) {
    team1.push(goalkeepers[0]);
    team2.push(goalkeepers[1]);
  }

  // Snake draft metoda - najbolji igrač u tim1, sledeća 2 u tim2, sledeća 2 u tim1, itd.
  const neededFieldPlayers = totalNeeded - goalkeepers.length;
  const availableFieldPlayers = fieldPlayers.slice(0, neededFieldPlayers);

  let pickForTeam1 = true;
  let consecutivePicks = 0;
  const maxConsecutive = 2;

  for (const player of availableFieldPlayers) {
    if (pickForTeam1 && team1.length < playersPerTeam) {
      team1.push(player);
      team1Score += skillValue[player.skill];
      consecutivePicks++;

      if (consecutivePicks >= maxConsecutive) {
        pickForTeam1 = false;
        consecutivePicks = 0;
      }
    } else if (!pickForTeam1 && team2.length < playersPerTeam) {
      team2.push(player);
      team2Score += skillValue[player.skill];
      consecutivePicks++;

      if (consecutivePicks >= maxConsecutive) {
        pickForTeam1 = true;
        consecutivePicks = 0;
      }
    } else if (team1.length < playersPerTeam) {
      team1.push(player);
      team1Score += skillValue[player.skill];
    } else {
      team2.push(player);
      team2Score += skillValue[player.skill];
    }
  }

  // Ako ima 1 golman, dodaj ga u slabiju ili random ekipu
  if (goalkeepers.length === 1) {
    if (team1Score < team2Score) {
      team1.push(goalkeepers[0]);
    } else if (team2Score < team1Score) {
      team2.push(goalkeepers[0]);
    } else {
      // Random ako je isti score
      if (Math.random() < 0.5) {
        team1.push(goalkeepers[0]);
      } else {
        team2.push(goalkeepers[0]);
      }
    }
  }

  renderTeams(team1, team2);
}

function renderTeams(team1, team2) {
  const container = document.getElementById("teamsContainer");

  const renderTeam = (team, className, teamName) => {
    return `
                    <div class="team ${className}">
                        <div class="team-header">${teamName}</div>
                        ${team
                          .map(
                            (p) => `
                            <div class="team-player">
                                <div class="player-info">
                                    <span class="player-name">${p.name}</span>
                                    <span class="skill-badge skill-${
                                      p.skill
                                    }">${p.skill.toUpperCase()}</span>
                                    ${
                                      p.isGk
                                        ? '<span class="goalkeeper-badge">GK</span>'
                                        : ""
                                    }
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `;
  };

  container.innerHTML =
    renderTeam(team1, "team1", "Tim 1") + renderTeam(team2, "team2", "Tim 2");
}
