module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { editData, pageId } = req.body;

    if (!editData) {
        return res.status(400).json({ error: 'Missing saveData' });
    }

    const categoryEditJsonData = {
        "properties": {
            "title": {
                "title": [
                    {
                        "text": {
                            "content": editData.name
                        }
                    }
                ]
            },
            "path": {
                "rich_text": [
                    {
                        "text": {
                            "content": editData.path
                        }
                    }
                ]
            }
        }
    }

    const subCategoryEditJsonData = {
        "properties": {
            "FK": {
                "select": {
                    "name": editData.parentName
                }
            },
            "title": {
                "title": [{
                    "text" : {
                        "content" : editData.name
                    }
                }]
            },
            "path": {
                "rich_text": [
                    {
                        "text": {
                            "content": editData.path
                        }
                    }
                ]
            }
        }
    }

    const editJsonData = editData.parentName === null ? categoryEditJsonData : subCategoryEditJsonData;

    try {
        const notionResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
                "Notion-Version": "2022-06-28",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(editJsonData),
        });

        if (!notionResponse.ok) {
            const errorData = await notionResponse.json();
            return res.status(notionResponse.status).json({
                error: "Failed to update Notion page",
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