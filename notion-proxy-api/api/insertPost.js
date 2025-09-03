import {markdownToBlocks} from '@tryfabric/martian';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const {postData} = req.body;
    const token = process.env.NOTION_TOKEN;
    const databaseId = process.env.RECENT_POST_DATABASE_ID;

    if (!databaseId) {
        return res.status(400).json({error: 'Missing database_id'});
    }

    if (!postData) {
        return res.status(400).json({error: 'Missing markdown content'});
    }

    function setTags(tags) {
        const tagList = [];
        for (let i = 0; i < tags.length; i++) {
            tagList.push({
                name: tags[i].name
            })
        }

        return tagList;
    }

    const tags = setTags(postData.tags);

    const properties = {
        content: {
            title: [
                {
                    text: {
                        content: postData.title
                    }
                }
            ]
        },
        summary: {
            rich_text: [
                {
                    text: {
                        content: postData.summary
                    }
                }
            ]
        },
        tag: {
            multi_select: tags
        },
        imageUrl: {
            rich_text: [
                {
                    text: {
                        content: postData.imageUrl,
                        link: {
                            url: postData.imageUrl
                        }
                    }
                }
            ]
        }
    }

    try {
        const notionRes = await fetch(`https://api.notion.com/v1/pages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parent: {database_id: databaseId},
                properties: properties,
                children: markdownToBlocks(postData.content),
            }),
        });

        const data = await notionRes.json();
        res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}