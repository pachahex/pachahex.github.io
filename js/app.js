const USERNAME = 'pachahex';
const LANG_COLORS = {
    JavaScript: '#f1e05a', Python: '#3572A5', HTML: '#e34c26', CSS: '#563d7c',
    TypeScript: '#2b7489', Java: '#b07219', 'C++': '#f34b7d', C: '#555555',
    'C#': '#178600', Ruby: '#701516', Go: '#00ADD8', PHP: '#4F5D95',
    Swift: '#ffac45', Kotlin: '#A97BFF', Rust: '#dea584', Shell: '#89e051',
    Dart: '#00B4AB', Vue: '#41b883', SCSS: '#c6538c', Jupyter: '#DA5B0B',
    Lua: '#000080', R: '#198CE7', Scala: '#c22d40', Perl: '#0298c3',
    Haskell: '#5e5086', Elixir: '#6e4a7e', Clojure: '#db5855'
};

let allRepos = [];
let collabRepos = [];
let currentTab = 'my-repos';

async function fetchProfile() {
    try {
        const res = await fetch(`https://api.github.com/users/${USERNAME}`);
        const user = await res.json();
        document.getElementById('bio').textContent = user.bio || 'Desarrollador en GitHub';
        document.getElementById('repo-count').textContent = user.public_repos || 0;
        document.getElementById('followers-count').textContent = user.followers || 0;
        document.getElementById('following-count').textContent = user.following || 0;
        if (user.avatar_url) {
            document.getElementById('avatar').src = user.avatar_url;
        }
        if (user.name) {
            document.getElementById('username').textContent = user.name;
        }
    } catch (e) {
        document.getElementById('bio').textContent = 'Desarrollador en GitHub';
    }
}

async function fetchRepos(page = 1, accumulated = []) {
    try {
        const res = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&page=${page}&sort=updated`);
        const repos = await res.json();
        if (!Array.isArray(repos)) return accumulated;
        accumulated = accumulated.concat(repos);
        if (repos.length === 100) return fetchRepos(page + 1, accumulated);
        return accumulated;
    } catch (e) {
        return accumulated;
    }
}

async function fetchCollabRepos() {
    const collabMap = new Map();
    try {
        // Fetch recent public events to find repos where user contributed
        for (let page = 1; page <= 3; page++) {
            const res = await fetch(`https://api.github.com/users/${USERNAME}/events/public?per_page=100&page=${page}`);
            const events = await res.json();
            if (!Array.isArray(events) || events.length === 0) break;

            const contributionTypes = [
                'PushEvent', 'PullRequestEvent', 'PullRequestReviewEvent',
                'IssuesEvent', 'IssueCommentEvent', 'CommitCommentEvent',
                'CreateEvent'
            ];

            for (const event of events) {
                if (contributionTypes.includes(event.type) && event.repo) {
                    const repoFullName = event.repo.name;
                    const owner = repoFullName.split('/')[0];
                    if (owner.toLowerCase() !== USERNAME.toLowerCase() && !collabMap.has(repoFullName)) {
                        collabMap.set(repoFullName, event.repo);
                    }
                }
            }
        }

        // Fetch full repo details for each collaborated repo
        const repoDetails = [];
        for (const [fullName] of collabMap) {
            try {
                const res = await fetch(`https://api.github.com/repos/${fullName}`);
                if (res.ok) {
                    const repo = await res.json();
                    if (!repo.private) {
                        repoDetails.push(repo);
                    }
                }
            } catch (e) {
                // Skip repos that can't be fetched
            }
        }
        return repoDetails;
    } catch (e) {
        return [];
    }
}

function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);
    const intervals = [
        { label: 'año', seconds: 31536000 },
        { label: 'mes', seconds: 2592000 },
        { label: 'día', seconds: 86400 },
        { label: 'hora', seconds: 3600 },
        { label: 'minuto', seconds: 60 }
    ];
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            const plural = count > 1 ? (interval.label === 'mes' ? 'es' : 's') : '';
            return `hace ${count} ${interval.label}${plural}`;
        }
    }
    return 'justo ahora';
}

function renderRepoCard(repo, isCollab = false) {
    const ownerRow = isCollab ? `
        <div class="repo-owner-row">
            <img class="repo-owner-avatar" src="${repo.owner.avatar_url}" alt="${repo.owner.login}">
            <span class="repo-owner-name">${repo.owner.login}</span>
        </div>
    ` : '';

    const collabBadge = isCollab ? '<span class="collab-badge">Colaborador</span>' : '';

    return `
        <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-card ${isCollab ? 'collab-card' : ''}">
            ${ownerRow}
            <div class="repo-name">
                <svg viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5zm-8 11h8v1.5h-8a1 1 0 110-1.5z"/></svg>
                ${repo.name}
            </div>
            <p class="repo-description">${repo.description || 'Sin descripción'}</p>
            <div class="repo-meta">
                ${repo.language ? `
                    <span class="meta-item">
                        <span class="lang-dot" style="background-color: ${LANG_COLORS[repo.language] || '#8b8b8b'}"></span>
                        ${repo.language}
                    </span>
                ` : ''}
                ${repo.stargazers_count > 0 ? `
                    <span class="meta-item">
                        <svg viewBox="0 0 16 16"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>
                        ${repo.stargazers_count}
                    </span>
                ` : ''}
                ${repo.forks_count > 0 ? `
                    <span class="meta-item">
                        <svg viewBox="0 0 16 16"><path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/></svg>
                        ${repo.forks_count}
                    </span>
                ` : ''}
                ${repo.fork ? '<span class="fork-badge">Fork</span>' : ''}
                ${collabBadge}
                <span class="meta-item">
                    <svg viewBox="0 0 16 16"><path d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zm.5 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 00.37.65l2.5 1.5a.75.75 0 10.76-1.3L8.5 7.94V4.75z"/></svg>
                    ${timeAgo(repo.updated_at)}
                </span>
            </div>
        </a>
    `;
}

function renderRepos(repos, isCollab = false) {
    const grid = document.getElementById('repos-grid');
    if (repos.length === 0) {
        const msg = isCollab
            ? 'No se encontraron colaboraciones públicas recientes 🤝'
            : 'No se encontraron repositorios 😕';
        grid.innerHTML = `<div class="no-results">${msg}</div>`;
        return;
    }
    grid.innerHTML = repos.map(repo => renderRepoCard(repo, isCollab)).join('');
}

function sortRepos(repos, criteria) {
    const sorted = [...repos];
    switch (criteria) {
        case 'stars':
            return sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'created':
            return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        case 'updated':
        default:
            return sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }
}

function filterAndRender() {
    const query = document.getElementById('search').value.toLowerCase();
    const sortBy = document.getElementById('sort').value;
    const isCollab = currentTab === 'collabs';
    const source = isCollab ? collabRepos : allRepos;

    let filtered = source.filter(repo =>
        repo.name.toLowerCase().includes(query) ||
        (repo.description && repo.description.toLowerCase().includes(query)) ||
        (repo.language && repo.language.toLowerCase().includes(query)) ||
        (isCollab && repo.owner && repo.owner.login.toLowerCase().includes(query))
    );
    filtered = sortRepos(filtered, sortBy);
    renderRepos(filtered, isCollab);
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const searchBox = document.getElementById('search');
    searchBox.value = '';
    searchBox.placeholder = tab === 'collabs'
        ? '🔍 Buscar colaboración...'
        : '🔍 Buscar repositorio...';

    filterAndRender();
}

document.getElementById('search').addEventListener('input', filterAndRender);
document.getElementById('sort').addEventListener('change', filterAndRender);

async function init() {
    fetchProfile();

    // Fetch own repos
    allRepos = await fetchRepos();
    document.getElementById('my-repos-count').textContent = allRepos.length;
    filterAndRender();

    // Fetch collaborated repos in background
    const grid = document.getElementById('repos-grid');
    collabRepos = await fetchCollabRepos();
    document.getElementById('collab-count').textContent = collabRepos.length;
    document.getElementById('collabs-count').textContent = collabRepos.length;

    // Re-render if user is on collabs tab
    if (currentTab === 'collabs') {
        filterAndRender();
    }
}

init();
