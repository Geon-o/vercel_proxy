
import { markdownToBlocks } from '@tryfabric/martian';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { postData, pageId } = req.body;
    const token = process.env.NOTION_TOKEN;

    if (!postData || !pageId) {
        return res.status(400).json({ error: 'Missing postData or pageId' });
    }

    const {title, summary, tags, content } = postData;

    // 1. Update Page Properties
    try {
        const tagList = tags.map(tag => ({ name: tag.name }));

        const properties = {
            content: { title: [{ text: { content: title } }] },
            summary: { rich_text: [{ text: { content: summary } }] },
            tag: { multi_select: tagList }
        };

        await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ properties }),
        });

    } catch (error) {
        return res.status(500).json({ step: 'properties', error: error.message });
    }

    // 2. Delete all existing blocks
    try {
        const blocksResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2022-06-28'
            }
        });
        const blocksData = await blocksResponse.json();

        const deletePromises = blocksData.results.map(block =>
            fetch(`https://api.notion.com/v1/blocks/${block.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Notion-Version': '2022-06-28'
                }
            })
        );
        await Promise.all(deletePromises);

    } catch (error) {
        return res.status(500).json({ step: 'delete-blocks', error: error.message });
    }

    // 3. Append new blocks
    try {
        const newBlocks = markdownToBlocks(content);
        const notionRes = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ children: newBlocks }),
        });
        
        const data = await notionRes.json();
        res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ step: 'append-blocks', error: error.message });
    }
}
