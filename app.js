const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

app.get('/players/', async (request, response) => {
  let playersList = await db.all(`select * from cricket_team;`)
  const ans = playersList => {
    return {
      playerId: playersList.player_id,
      playerName: playersList.player_name,
      jerseyNumber: playersList.jersey_number,
      role: playersList.role,
    }
  }

  response.send(playersList.map(eachPlayer => ans(eachPlayer)))
})

app.post('/players/', async (request, response) => {
  let playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const query = `insert into cricket_team (player_name,jersey_number,role) values ('${playerName}',${jerseyNumber},'${role}');`
  let result = await db.run(query)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  let {playerId} = request.params
  const res = await db.get(
    `select * from cricket_team where player_id = ${playerId} ;`,
  )
  response.send({
    playerId: res.player_id,
    playerName: res.player_name,
    jerseyNumber: res.jersey_number,
    role: res.role,
  })
})

app.put('/players/:playerId/', async (request, response) => {
  let {playerId} = request.params
  let playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const query = `update cricket_team
            set
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}'
            where player_id = ${playerId}
              ;`
  let result = await db.run(query)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  let {playerId} = request.params
  let query = `delete from cricket_team where player_id = ${playerId} `
  let result = db.run(query)
  response.send('Player Removed')
})

module.exports = app
