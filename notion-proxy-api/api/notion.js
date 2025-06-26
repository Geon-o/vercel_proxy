export default async function handler(req, res) {
    const token = process.env.NOTION_TOKEN;
    const databaseId = process.env.NOTION_DB_ID;

    const notionRes = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });

    const data = await notionRes.json();
    res.status(200).json(data);
}