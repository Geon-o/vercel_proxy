module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { saveData } = req.body;

    if (!saveData) {
        return res.status(400).json({ error: 'Missing saveData' });
    }

    const databaseId = saveData.parentId === null ? process.env.CATEGORY_LIST_DATABASE_ID : process.env.SUBCATEGORY_LIST_DATABASE_ID;

    const categorySaveJsonData = {
        "parent": {
            "database_id": databaseId
        },
        "properties": {
            "title": {
                "title": [
                    {
                        "text": {
                            "content": saveData.name
                        }
                    }
                ]
            },
            "path": {
                "rich_text": [
                    {
                        "text": {
                            "content": saveData.path
                        }
                    }
                ]
            }
        }
    }

    const subCategorySaveJsonData = {
        "parent": {
            "database_id": databaseId
        },
        "properties": {
            "FK": {
                "select": {
                    "name": saveData.parentId
                }
            },
            "title": {
                "title": [{
                    "text" : {
                        "content" : saveData.name
                    }
                }]
            },
            "path": {
                "rich_text": [
                    {
                        "text": {
                            "content": saveData.path
                        }
                    }
                ]
            }
        }
    }

    const saveJsonData = saveData.parentId === null ? categorySaveJsonData : subCategorySaveJsonData;

    try {
        const notionResponse = await fetch("https://api.notion.com/v1/pages", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.NOTION_TOKEN}`, // 통합 토큰
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28", // 최신 Notion API 버전
            },
            body: JSON.stringify(saveJsonData),
        });

        if (!notionResponse.ok) {
            const errorData = await notionResponse.json();
            return res.status(notionResponse.status).json({
                error: "Failed to create Notion page",
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