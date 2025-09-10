fetch('http://localhost:8000/spawn-chrome/b3c6110a-5ddc-4ed4-8ea4-f8b3ab04fcce',
    {
        method: 'POST',
        body: JSON.stringify({
            link: 'https://www.google.com/maps/place/Bosna+Sporyum+Hal%C4%B1+Saha/@38.0150306,32.525959,15z/data=!4m6!3m5!1s0x14d08d7ea9c07c43:0xfddcdb673535a6fc!8m2!3d38.0135948!4d32.528215!16s%2Fg%2F11dxlbj0ny?entry=ttu&g_ep=EgoyMDI1MDkwNy4wIKXMDSoASAFQAw%3D%3D',
            profile: 'Default'
        }),
        headers:{
            "Content-Type": "application/json"
        }
    }).then(
        res => res.json().then(
            console.log
        )
    ).catch(
        console.error
    )

