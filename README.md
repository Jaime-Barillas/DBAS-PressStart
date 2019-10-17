# Setting Up the Press Start DBMS Project

**There is a Word doc version of these steps with pictures on [OneDrive](https://dconline-my.sharepoint.com/:w:/g/personal/shaun_mccrum_dcmail_ca/Ec2rjjfEH89Cv8KqNja1CrgBIh7BSZR3M53RvSb0ehbFPg?e=BpsV6S).**
It is more detailed.

The first thing you should do is ensure that any **old versions of Node are
un-installed** before you proceed.

## Installing Node.js

1. Download Node from its [website](https://nodejs.org/en/). You want the LTS
   version (10.16.3).
2. Run the installer.
3. Spam the "Next" button, leave all the default options as they are, hit the
   "Install" button.
4. Double check that Node installed properly by opening a CMD Prompt and typing
   `node -v`. You should get output of the form `v10.16.3`.

## Setting Up the Project

1. Clone this project locally to your computer.
2. Open the containing directory within the CMD Prompt.
3. Run `npm install`.

## Launching and Stopping the Web Server

1. Run `node bin/www` in the CMD Prompt.
2. Open a web browser and browse to `localhost/`.
3. Use <CTRL-C> in the CMD Prompt to stop the server.

# Notes For Jaime

For development on docker, initially use:  
`docker run -it --name dbas -w /app -v "$(pwd)":/app -p 80:80 node:10.16.3-alpine /bin/sh`

For subsequent runs, use:  
`docker container start -i dbas`

If you plan on building an image, make sure to edit the dockerfile and change
stuff as appropriate. Then use:  
`docker image build -t dbaspressstart:<version-num>`

To create and run a container:  
`docker run --name dbas --detach -p 80:<port> pressstart:<version-num>`

Note: If the dockerfile has a CMD rule that starts node or npm, <CTRL-C>-ing
out of an interactive container gets iffy, use `docker container stop dbas`
instead.