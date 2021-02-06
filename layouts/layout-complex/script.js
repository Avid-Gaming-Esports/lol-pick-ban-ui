function convertTimer(timer) {
    if (timer.toString().length === 1) {
        return '0' + timer;
    } 
    if (timer > 60) {
        return '';
    }
    console.log(timer.toString())
    return timer;
}

PB.on('statusChange', newStatus => {
    console.log(newStatus)
});

PB.on('newState', newState => {
    console.log(newState);
    const state = newState.state;
    const config = state.config.frontend;

    let activeTeam = 'blue';
    if (state.redTeam.isActive) {
        activeTeam = 'red';
    }

    // Update timers
    if (activeTeam === 'blue') {
        document.getElementById('red_timer').innerText = '';
        document.getElementById('blue_timer').innerText = ':' + convertTimer(state.timer);
    } else {
        document.getElementById('blue_timer').innerText = '';
        document.getElementById('red_timer').innerText = ':' + convertTimer(state.timer);
    }

    // Update team names
    document.getElementById('blue_name').innerText = config.blueTeam.name;
    document.getElementById('red_name').innerText = config.redTeam.name;

    // Update score
    document.getElementById('score').innerText = config.blueTeam.score + ' - ' + config.redTeam.score;

    // Update phase
    document.getElementById('phase').innerText = state.state;

    // Update picks
    const updatePicks = team => {
        const teamData = team === 'blue' ? state.blueTeam : state.redTeam;
        const teamName = team === 'blue' ? config.blueTeam.short : config.redTeam.short;
        console.log(teamData);

        teamData.picks.forEach((pick, index) => {
            const splash = document.getElementById(`picks_${team}_splash_${index}`);
            const text = document.getElementById(`picks_${team}_text_${index}`);
            const ss1 = document.getElementById(`ss1_${team}_${index}`);
            const ss2 = document.getElementById(`ss2_${team}_${index}`);
            console.log(pick, index);

            if (pick.champion.id === 0) {
                // Not picked yet, hide
                splash.classList.add('hidden');
                ss1.classList.add('hidden');
                ss2.classList.add('hidden')
            } else {
                // We have a pick to show
                splash.src = PB.toAbsoluteUrl(pick.champion.splashCenteredImg);
                splash.classList.remove('hidden');
                ss1.src = PB.toAbsoluteUrl(pick.spell1.icon);
                ss2.src = PB.toAbsoluteUrl(pick.spell2.icon);
                ss1.classList.remove('hidden');
                ss2.classList.remove('hidden');
            }

            text.innerText = teamName + " " + pick.displayName;
        });

        teamData.bans.forEach((ban, index) => {
            const splash = document.getElementById(`bans_${team}_splash_${index}`);
            console.log(ban)

            if (ban.champion.id === 0) {
                // Not banned yet, hide
                splash.classList.add('hidden');
            } else {
                // We have a ban to show
                splash.src = PB.toAbsoluteUrl(ban.champion.splashCenteredImg);
                splash.classList.remove('hidden');
            }

            console.log(splash, ban);
        });
    };
    updatePicks('blue');
    updatePicks('red');
});

PB.on('heartbeat', newHb => {
    Window.CONFIG = newHb.config;
});

PB.on('champSelectStarted', () => {
});
PB.on('champSelectEnded', () => {
});

PB.start();

function parseHTML(html) {
    const t = document.createElement('template');
    t.innerHTML = html;
    return t.content.cloneNode(true);
}

// dynamically inject picks
function inject(team) {
    const pickTemplate = `
<div class="pick">
    <div class="splash">
        <img src="" id="picks_${team}_splash_%id%" class="hidden">
        <div class="ss_${team}">
            <img src="" id="ss1_${team}_%id%" class="hidden icon1">
            <img src="" id="ss2_${team}_%id%" class="hidden icon2">
        </div>
    </div>
    <div class="text" id="picks_${team}_text_%id%"></div>
</div>`;

    const banTemplate = `
<div class="ban">
    <div class="splash">
        <img src="" id="bans_${team}_splash_%id%" class="hidden">
    </div>
</div>`;

    for (let i = 0; i < 5; i++) {
        const adaptedPickTemplate = pickTemplate.replace(/%id%/g, i);
        document.getElementById('picks_' + team).appendChild(parseHTML(adaptedPickTemplate));

        const adaptedBanTemplate = banTemplate.replace(/%id%/g, i);
        document.getElementById('bans_' + team).appendChild(parseHTML(adaptedBanTemplate));
    }
}
inject('blue');
inject('red');
