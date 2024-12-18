FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# QPDF'yi yükle
RUN apt update && apt install -y qpdf

COPY . .

EXPOSE 3000

CMD ["npm", "start"]