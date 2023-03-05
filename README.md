# Licence-Informatique-LeMans.Tk V2 Data Retriever
[Site Web à destination de toute personne se trouvant en licence informatique à l'université du Mans.](https://github.com/Aytixel/licence-informatique-lemans)

La partie **"Data Retriever"** est celle qui s'occupe de récupérer les emplois du temps et les traiter.

## How to run it ?
To start the server you have to use this command:
 - ***deno run --allow-net --allow-env --allow-read src/app.ts***

To start the server with docker you have to:
 - ***docker run -d -v $PWD:/app -w /app --restart always --name licence-info-v2-data-retriever denoland/deno:latest run --allow-net --allow-env --allow-read src/app.ts***
