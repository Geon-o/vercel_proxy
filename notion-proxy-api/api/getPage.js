const normalizeId = (id) => {
  if (!id || id.includes('-')) return id;
  if (id.length !== 32) return id;
  return `${id.substring(0, 8)}-${id.substring(8, 12)}-${id.substring(12, 16)}-${id.substring(16, 20)}-${id.substring(20, 32)}`;
};

module.exports = async (req, res) => {
  const { NotionAPI } = await import('notion-client');
  const { pageId } = req.query;

  if (!pageId) {
    return res.status(400).json({ error: 'pageId is required' });
  }

  const notion = new NotionAPI({
    authToken: process.env.NOTION_TOKEN_V2,
  });

  try {
    const formattedPageId = normalizeId(pageId);
    const recordMap = await notion.getPage(formattedPageId);
    res.status(200).json(recordMap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Notion page', details: error.message });
  }
};