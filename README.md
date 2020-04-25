# Egg Stonks

This is a web based multiplayer game based off of a board game.  It is currently hosted at http://egg-stonks.com

This is a for-fun shelter-in-place project inspired by the work of some other dedicated [fans](https://reddit.com/user/SirToastyToes) of [NorthernLion](https://twitch.tv/northernlion) who built a Table Top Simulator board.

## Structure

The application is spit into two distinct parts:

1. A web server written in Go that handles gamestate and synchronizization between clients.
2. A web client written in Typescript that communicates with the server and allows players to create and advance the game.

## Buildings and Running

For running a emulated production build I suggest using the docker image at the root of the directory.  You can build the image and run it while exposing port 8080 to run a local version.  The image building will be slightly slow the first time as it downloads and caches builder images for go and javascript as well as all deps.

```bash
docker build -t egg-stonks:latest .
docker run -p "8080:8080" egg-stonks:latest
```

Then open `localhost:8080` in a web browser. (Chrome and Firefox tested)

### Development
For development builds I prefer to run the application locally.  First set the webapp to rebuild on changes:

```bash
cd app && npx webpack --watch
```

Second run the webserver
```bash
DEBUG=true go run .
```

Note: The `DEBUG` environment variable increases logging output and uses a pretty printer instead of a JSON log writer.


## TODO list:

* Add a graph showing player value over each turn on Game Over screen (this data is already sent to the client).
* Support taking Loans
* Build out persistence to afford the ability to resume a game on server crash
  * Allow horizontal scaling by moving game server logic behind websocket gateways.
* Remove player when connection drops before a game starts.
* Add visual indicators to values when they move
  * Flash green or red when commodity prices move
  * Flash green or red when Player holding increases or decreases in value
  * Flash player holding when they buy or sell.
* Collapse multiple purchase logs of a single commodity into a single line to avoid spamming during buy phase
* Reduce json parse load by not sending full snapshots on all user actions.
* Have rolls apply automatically after the full roll mask is revealed.
* Add [annotations](https://apexcharts.com/docs/annotations/) to the graphs when splits and unlistings happen.
