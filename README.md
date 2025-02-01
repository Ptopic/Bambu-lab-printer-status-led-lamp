### Led lamp API for bambu lab printer

Show bambu lab a1 mini 3d printer status on a status bar made of leds

- Sending print job
- Current job progress in %
- Errors
- Warnings
- Finished

### Build image for portainer

```
docker build -t bambu-wled-api .
```

### Push the Docker image to Docker Hub

```
docker login
```

```
docker tag bambu-wled-api <your-dockerhub-username>/bambu-wled-api:latest
```

```
docker push <your-dockerhub-username>/bambu-wled-api:latest
```

### Deploy to portainer

Place docker compose file in portainer and change image url to your deployed image url and also change env variables
