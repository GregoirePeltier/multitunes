const express = require('express');
const app = express();

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

const port = process.env.PORT || 6000;
app.listen(port, () => {
    console.log(`Media streamer listening on port ${port}`);
});
