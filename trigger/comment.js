
fetch('http://localhost:8000/comment/b3c6110a-5ddc-4ed4-8ea4-f8b3ab04fcce',
    {
        method: 'POST',
        body: JSON.stringify({
            comment: 'this is a test command'
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(
        res => res.json().then(
            console.log
        )
    ).catch(
        console.error
    )
