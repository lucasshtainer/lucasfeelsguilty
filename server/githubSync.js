const DEFAULT_REPO = 'lucasshtainer/lucasfeelsguilty';
const DEFAULT_BRANCH = 'main';
const FILE_PATH = 'public/letters.json';

export async function syncLettersToGitHub(payload) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return;

  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;
  const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH;
  const [owner, name] = repo.split('/');

  const metaRes = await fetch(
    `https://api.github.com/repos/${owner}/${name}/contents/${FILE_PATH}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  );

  let sha;
  if (metaRes.ok) {
    const meta = await metaRes.json();
    sha = meta.sha;
  } else if (metaRes.status !== 404) {
    throw new Error(`GitHub lookup failed (${metaRes.status})`);
  }

  const commitRes = await fetch(
    `https://api.github.com/repos/${owner}/${name}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message: 'Update stories from admin',
        content: Buffer.from(payload, 'utf8').toString('base64'),
        branch,
        ...(sha ? { sha } : {})
      })
    }
  );

  if (!commitRes.ok) {
    const body = await commitRes.json().catch(() => ({}));
    throw new Error(body.message || `GitHub save failed (${commitRes.status})`);
  }
}
