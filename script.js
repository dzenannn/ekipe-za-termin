const FORMATIONS = {
  FIVE: "4+1",
  SIX: "5+1",
};

const SKILL_VALUES = {
  low: 1,
  medium: 2,
  high: 3,
};

const MAX_GOALKEEPERS = 2;

let formation = FORMATIONS.FIVE;
let players = [];

function selectFormation(f) {
  if (!Object.values(FORMATIONS).includes(f)) {
    throw new Error("Invalid formation");
  }
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

  if (!validatePlayerInput(name)) {
    return;
  }

  if (formation === FORMATIONS.FIVE && players.length === 10) return;

  players.push({ name, skill, isGk, id: Date.now() });
  resetPlayerForm();
  renderPlayers();
}

function validatePlayerInput(name) {
  if (!name) {
    alert("Unesi ime igrača!");
    return false;
  }
  return true;
}

function resetPlayerForm() {
  document.getElementById("playerName").value = "";
  document.getElementById("isGoalkeeper").checked = false;
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
    .map((player) => createPlayerListItem(player))
    .join("");
}

function createPlayerListItem(player) {
  return `
    <div class="player-item">
      <div class="player-info">
        <span class="player-name">${player.name}</span>
        <span class="skill-badge skill-${
          player.skill
        }">${player.skill.toUpperCase()}</span>
        ${player.isGk ? '<span class="goalkeeper-badge">GOLMAN</span>' : ""}
      </div>
      <button class="remove-btn" onclick="removePlayer(${
        player.id
      })">Ukloni</button>
    </div>
  `;
}

function balanceTeams() {
  const playersPerTeam = formation === FORMATIONS.FIVE ? 5 : 6;
  const totalNeeded = playersPerTeam * 2;

  clearMessages();

  if (!validateTeamRequirements(totalNeeded)) {
    return;
  }

  const { goalkeepers, fieldPlayers } = separatePlayers();

  if (!validateGoalkeepers(goalkeepers)) {
    return;
  }

  const sortedFieldPlayers = sortPlayersBySkill(fieldPlayers);
  const { team1, team2 } = distributePlayersToTeams(
    sortedFieldPlayers,
    goalkeepers,
    playersPerTeam
  );

  renderTeams(team1, team2);
}

function clearMessages() {
  document.getElementById("errorMsg").innerHTML = "";
  document.getElementById("teamsContainer").innerHTML = "";
}

function validateTeamRequirements(totalNeeded) {
  if (players.length < totalNeeded) {
    showError(
      `Potrebno je ${totalNeeded} igrača za ${formation} formaciju. Trenutno ima ${players.length}.`
    );
    return false;
  }
  return true;
}

function validateGoalkeepers(goalkeepers) {
  if (goalkeepers.length > MAX_GOALKEEPERS) {
    showError(`Previše golmana! Maksimalno ${MAX_GOALKEEPERS} golmana.`);
    return false;
  }
  return true;
}

function showError(message) {
  document.getElementById(
    "errorMsg"
  ).innerHTML = `<div class="error-msg">${message}</div>`;
}

function separatePlayers() {
  return {
    goalkeepers: players.filter((p) => p.isGk),
    fieldPlayers: players.filter((p) => !p.isGk),
  };
}

function sortPlayersBySkill(players) {
  return [...players].sort(
    (a, b) => SKILL_VALUES[b.skill] - SKILL_VALUES[a.skill]
  );
}

function distributePlayersToTeams(fieldPlayers, goalkeepers, playersPerTeam) {
  const teams = {
    team1: [],
    team2: [],
    team1Score: 0,
    team2Score: 0,
  };

  distributeGoalkeepers(teams, goalkeepers);
  distributeFieldPlayers(teams, fieldPlayers, playersPerTeam);

  return {
    team1: teams.team1,
    team2: teams.team2,
  };
}

function distributeGoalkeepers(teams, goalkeepers) {
  if (goalkeepers.length === 2) {
    teams.team1.push(goalkeepers[0]);
    teams.team2.push(goalkeepers[1]);
  }
}

function distributeFieldPlayers(teams, fieldPlayers, playersPerTeam) {
  fieldPlayers.forEach((player) => {
    const playerScore = SKILL_VALUES[player.skill];
    if (
      teams.team1Score <= teams.team2Score &&
      teams.team1.length < playersPerTeam
    ) {
      teams.team1.push(player);
      teams.team1Score += playerScore;
    } else if (teams.team2.length < playersPerTeam) {
      teams.team2.push(player);
      teams.team2Score += playerScore;
    }
  });
}

function renderTeams(team1, team2) {
  const container = document.getElementById("teamsContainer");
  container.innerHTML = `
    ${renderTeam(team1, "team1", "Tim 1")}
    ${renderTeam(team2, "team2", "Tim 2")}
  `;
}

function renderTeam(team, className, teamName) {
  return `
    <div class="team ${className}">
      <div class="team-header">${teamName}</div>
      ${team.map((player) => createTeamPlayerItem(player)).join("")}
    </div>
  `;
}

function createTeamPlayerItem(player) {
  return `
    <div class="team-player">
      <div class="player-info">
        <span class="player-name">${player.name}</span>
        <span class="skill-badge skill-${
          player.skill
        }">${player.skill.toUpperCase()}</span>
        ${player.isGk ? '<span class="goalkeeper-badge">GK</span>' : ""}
      </div>
    </div>
  `;
}
