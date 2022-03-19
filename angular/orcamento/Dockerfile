FROM node:14.11-alpine AS builder
RUN apk --no-cache add curl
RUN apk --no-cache add zip

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
ARG BUILD_CONFIG
RUN npm run build-$BUILD_CONFIG
RUN zip -r build.zip dist

ARG FILE_NAME
ARG URL_TEAMS
RUN curl -F "arquivo=@build.zip" -F "nome=$FILE_NAME" http://api-focus.athiewohnrath.com.br/upload-build/build

RUN rm -rf build.zip
RUN curl -H "Content-Type:application/json" -d "{'text':'http://api-focus.athiewohnrath.com.br/upload-build/$FILE_NAME.zip'}" -X POST "$URL_TEAMS"

#FROM nginx:stable-alpine AS runtime
#COPY ./default.conf /etc/nginx/conf.d/default.conf
#COPY --from=builder /app/dist/athiewohnrath /usr/share/nginx/html
#
#CMD ["nginx", "-g", "daemon off;"]
