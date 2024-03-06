FROM node:12-buster-slim

WORKDIR /world

RUN apt update -y
RUN apt install -y netcat python2.7 make g++ && apt-get clean

RUN ln -s /usr/bin/python2.7 /usr/bin/python

RUN npm install screeps
RUN npm install screepsmod-mongo screepsmod-auth screepsmod-admin-utils screepsmod-map-tool

COPY scripts/startup.sh startup.sh

CMD ["bash", "/screeps/startup.sh"]
