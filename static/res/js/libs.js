// static/res/js/libs.js

// Function to fetch user profile and email from GitHub
export function fetchUserProfile(token) {
  return fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })
    .then((response) => response.json())
    .then(async (profile) => {
      console.log('GitHub API Response:', profile); // Log the full response
      const emails = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }).then((response) => response.json());

      console.log('User emails:', emails);

      const primaryEmail = emails.find((email) => email.primary)?.email;

      return {
        name: profile.name,   // User's full name
        email: primaryEmail,  // User's primary email
        login: profile.login, // GitHub username
      };
    })
    .catch((error) => {
      console.error('Error fetching user profile:', error.message);
      throw error;
    });
}

// Function to fetch user's public repositories
export function fetchRepos(token) {
  return fetch('https://api.github.com/user/repos', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })
    .then((response) => response.json())
    .then((repos) => {
      return repos; // Return the list of repositories
    })
    .catch((error) => {
      console.error('Error fetching repositories:', error.message);
      throw error;
    });
}

export async function populateRepoDropdown(token) {
	const repos = await fetchRepos(token);
  const dropdown = document.getElementById('repo-dropdown');

  repos.forEach((repo) => {
    const option = document.createElement('option');
    option.value = repo.name; // Use the repository name
    option.textContent = repo.name; // Display the repository name
    dropdown.appendChild(option);
  });
}


