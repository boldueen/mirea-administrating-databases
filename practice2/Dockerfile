FROM ubuntu:latest

RUN apt update -y \
    && apt upgrade -y \
    && apt install nano apache2 curl -y

RUN echo 'hello, world!' > index.html

WORKDIR /usr/local/apache2/htdocs/

RUN cp /index.html .

EXPOSE 80

CMD apachectl -D FOREGROUND