fetch('http://localhost:8000/comment/0053fc9b-36fa-4f65-8ff7-d419d2a5a899',
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
