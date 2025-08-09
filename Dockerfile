
# base stage
FROM python:3.11-slim AS python-base
RUN apt-get update && apt-get install -y build-essential wget git curl ffmpeg libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libjpeg62-turbo libgl1 && rm -rf /var/lib/apt/lists/*
# install rembg and dependencies
RUN pip install --no-cache-dir rembg==2.0.34 pillow numpy

# node stage
FROM node:20-bullseye-slim
# copy rembg from python image
COPY --from=python-base /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY --from=python-base /usr/local/bin/rembg /usr/local/bin/rembg
# system deps
RUN apt-get update && apt-get install -y libgl1 libjpeg62-turbo ffmpeg && rm -rf /var/lib/apt/lists/*
# set workdir
WORKDIR /app

# copy server
COPY server/package.json server/
COPY server/ .
RUN npm install --production

# copy client and build
COPY client/package.json client/
COPY client/ .
RUN npm install
RUN npm run build
# move client build to server public (server serves ../client/dist)
RUN mkdir -p /app/../client/dist
RUN cp -r /app/dist /app/../client/dist

EXPOSE 4000
CMD ["node", "server.js"]
