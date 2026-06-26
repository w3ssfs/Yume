const ANILIST_URL = 'https://graphql.anilist.co';

async function query(gql, variables = {}) {
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: gql, variables }),
  });
  if (!res.ok) throw new Error(`AniList error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

const SCHEDULE_QUERY = `
query ($from: Int, $to: Int, $page: Int) {
  Page(page: $page, perPage: 50) {
    pageInfo { hasNextPage }
    airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME) {
      airingAt
      episode
      media {
        id
        idMal
        title { romaji english }
        coverImage { large medium }
        type
        status
        episodes
        genres
        averageScore
        description
        startDate { year }
        studios(isMain: true) { nodes { name } }
      }
    }
  }
}
`;

export async function getWeeklySchedule() {
  const now  = Math.floor(Date.now() / 1000);
  const week = now + 7 * 24 * 60 * 60;

  let allSchedules = [];
  let page = 1;
  let hasNextPage = true;

  // Pagina até buscar tudo
  while (hasNextPage) {
    const data = await query(SCHEDULE_QUERY, { from: now - 86400, to: week, page });
    const { airingSchedules, pageInfo } = data.Page;
    allSchedules = allSchedules.concat(airingSchedules);
    hasNextPage = pageInfo.hasNextPage;
    page++;
    if (page > 10) break; // safety
  }

  return allSchedules;
}