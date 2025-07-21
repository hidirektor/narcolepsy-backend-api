FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# QPDF'yi yükle
RUN apt update && apt install -y qpdf

COPY . .

EXPOSE 2805

CMD ["npm", "start"]