FROM node:18-alpine as build-dep

RUN apk update && apk upgrade

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build
RUN npm run pkg

FROM alpine

WORKDIR /app
COPY --from=build-dep /app/bmkg-cuaca-gempa .

CMD ["./bmkg-cuaca-gempa"]