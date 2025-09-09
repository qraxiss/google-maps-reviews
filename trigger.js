fetch('http://localhost:8000/comment', {
    method: 'POST'
}).then(
    res => res.json
).then(console.log).catch(console.error)