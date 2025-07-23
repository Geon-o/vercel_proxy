
import { Client } from "@notionhq/client";
const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { pageId } = req.query

    if (!pageId) {
        return res.status(400).json({ error: 'Missing pageId' })
    }

    try {
        const page = await notion.pages.retrieve({ page_id: pageId })
        const blocks = await notion.blocks.children.list({ block_id: pageId })

        return res.status(200).json({ page, blocks })
    } catch (err) {
        console.error('Notion API Error:', err)
        return res.status(500).json({ error: 'Failed to fetch Notion page' })
    }
}
