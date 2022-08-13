export function getList() {
    return fetch('https://serenehate.backendless.app/api/data/cwp_users?where=team!=99&sortBy=%60points%60%20desc')
      .then(data => data.json())
  }


export function getUser(tagid) {
return fetch(`https://serenehate.backendless.app/api/data/cwp_users?where=tagid%3D'${tagid}'`)
    .then(data => data.json())
}

export function addUser(name, team, tagid) {
    return fetch('https://serenehate.backendless.app/api/data/cwp_users', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: name,
            team: parseInt(team),
            tagid
        })
    })
    .then(data => data.json())
}

export function updateUser(objectId, points) {
    return fetch('https://serenehate.backendless.app/api/data/cwp_users', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            objectId: objectId,
            points: points
        })
    })
    .then(data => data.json())
}