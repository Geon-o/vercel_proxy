export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const token = process.env.NOTION_TOKEN;
    const { databaseId, category } = req.body;

    if (!databaseId) {
        return res.status(400).json({ error: 'Missing database_id' });
    }

    const notionRes = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            filter: {
                property: 'category',
                multi_select: {
                    contains: category
                }
            }
        })
    });

    const data = await notionRes.json();
    res.status(200).json(data);
}