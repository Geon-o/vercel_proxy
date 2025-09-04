module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { pageId } = req.body;

    if (!pageId) {
        return res.status(400).json({ error: 'pageId is required' });
    }

    try {
        const notionResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
                "Notion-Version": "2022-06-28",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "archived": true
            }),
        });

        if (!notionResponse.ok) {
            const errorData = await notionResponse.json();
            return res.status(notionResponse.status).json({
                error: "Failed to delete Notion page",
                details: errorData,
            });
        }

        const data = await notionResponse.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
            details: error.message,
        });
    }
};